import React, { useMemo, useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ClipboardList, Activity, Gauge, CheckCircle2, AlertTriangle, Rocket, Clock } from "lucide-react";
import { toast } from "sonner";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const ENTITIES_TO_AUDIT = [
  "QuantumNode","CrossChainBridge","CryptoWallet","CEXListing","AITradingStrategy","CurrencyMint",
  "TempleInteraction","CeremonialArtifact","DivineOffering","DivineFavor","SpiritualToken","CurrencyTransaction",
  "TradeOffer","UserBalance","CryptoBridge","CrossChainLiquidity","CurrencyIndex","ExchangeRate","MarketInsight",
  "LiquidityPool","IntentNode"
];

export default function SchemaAudit() {
  const queryClient = useQueryClient();
  const [autoScan, setAutoScan] = useState(false);
  const [lastRunAt, setLastRunAt] = useState(null);

  const logsQuery = useQuery({
    queryKey: ["schemaAuditLogs"],
    queryFn: () => base44.entities.SchemaAuditLog.list("-created_date", 20),
    initialData: [],
    refetchInterval: 15000
  });

  const fullAuditMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      const results = {};
      let issues = 0;
      let warnings = 0;
      const recommendations = [];

      for (const name of ENTITIES_TO_AUDIT) {
        try {
          const schema = await base44.entities[name].schema();
          const props = schema.properties || {};
          const denormCandidates = Object.entries(props)
            .filter(([, v]) => v && (v.type === "object" || (v.type === "array" && v.items && v.items.type === "object")))
            .map(([k]) => k);
          const required = Array.isArray(schema.required) ? schema.required : [];
          const missingRequired = required.filter((r) => !props[r]);
          const likelyIndexFields = Object.keys(props).filter((k) => ["user_email","node_id","node_type","status","created_date","updated_date"].includes(k));

          results[name] = {
            normalization: {
              denormalization_candidates: denormCandidates,
              missing_required_props: missingRequired,
              likely_index_fields: likelyIndexFields
            }
          };

          if (denormCandidates.length > 0) {
            warnings += denormCandidates.length;
            recommendations.push(`${name}: Consider normalizing fields [${denormCandidates.join(", ")}] to separate entities or refs.`);
          }
          if (missingRequired.length > 0) {
            issues += missingRequired.length;
            recommendations.push(`${name}: Schema 'required' lists fields not present in properties: [${missingRequired.join(", ")}]`);
          }
        } catch (e) {
          issues += 1;
          results[name] = { error: `Schema fetch failed: ${String(e)}` };
        }
      }

      // Integrity checks
      try {
        const qn = await base44.entities.QuantumNode.list("-created_date", 200);
        const seen = new Set();
        const duplicates = [];
        qn.forEach((n) => {
          if (!n.node_id) return;
          if (seen.has(n.node_id)) duplicates.push(n.node_id);
          seen.add(n.node_id);
        });
        if (duplicates.length > 0) {
          issues += duplicates.length;
          recommendations.push(`QuantumNode: Duplicate node_id detected: [${[...new Set(duplicates)].join(", ")}] — ensure uniqueness.`);
        }
        results["QuantumNode"] = { ...(results["QuantumNode"]||{}), integrity: { duplicate_node_ids: duplicates } };
      } catch (e) {
        results["QuantumNode"] = { ...(results["QuantumNode"]||{}), integrity_error: String(e) };
      }

      for (const withEmail of ["UserBalance","CryptoWallet","CrossChainBridge","CurrencyTransaction","TradeOffer"]) {
        try {
          const sample = await base44.entities[withEmail].list("-created_date", 100);
          const invalid = sample.filter((r) => (r.user_email||r.from_user||r.to_user||"").toString().indexOf("@") === -1).length;
          if (invalid > 0) {
            warnings += invalid;
            recommendations.push(`${withEmail}: ${invalid} records with non-email identifiers — validate email formats.`);
          }
          results[withEmail] = { ...(results[withEmail]||{}), integrity: { invalid_email_like_count: invalid } };
        } catch (e) {
          results[withEmail] = { ...(results[withEmail]||{}), integrity_error: String(e) };
        }
      }

      // Profiling
      const profile = {};
      const t = async (label, fn) => { const s = performance.now(); const out = await fn(); const d = performance.now()-s; profile[label] = { ms: Math.round(d), count: Array.isArray(out)? out.length : (out?1:0) }; return out; };
      try { await t("QuantumNode.list", () => base44.entities.QuantumNode.list("-updated_date", 100)); } catch {}
      try { await t("QuantumNode.oracles", () => base44.entities.QuantumNode.filter({ node_type: "oracle" }, "-last_active", 50)); } catch {}
      try { await t("CrossChainBridge.user", async () => { const me = await base44.auth.me(); return base44.entities.CrossChainBridge.filter({ user_email: me.email }, "-initiated_at", 20); }); } catch {}
      results["profiling"] = profile;

      const log = await base44.entities.SchemaAuditLog.create({
        audit_type: "full",
        issues_count: issues,
        warnings_count: warnings,
        recommendations,
        results,
        performed_by: (await base44.auth.me()).email
      });

      return log;
    },
    onSuccess: (log) => {
      setLastRunAt(new Date().toISOString());
      queryClient.invalidateQueries({ queryKey: ["schemaAuditLogs"] });
      const critical = (log?.issues_count||0) >= 3;
      if (critical) {
        toast.error("Schema audit found critical issues", { description: `${log.issues_count} issues • ${log.warnings_count} warnings` });
      } else if ((log?.warnings_count||0) > 0) {
        toast.warning("Schema audit warnings", { description: `${log.warnings_count} warnings detected` });
      } else {
        toast.success("Schema audit clean", { description: "No issues detected" });
      }
    }
  });

  // Auto-scan every 5 minutes
  useEffect(() => {
    if (!autoScan) return;
    const id = setInterval(() => {
      if (!fullAuditMutation.isPending) fullAuditMutation.mutate();
    }, 300000);
    return () => clearInterval(id);
  }, [autoScan, fullAuditMutation.isPending]);

  const latest = logsQuery.data?.[0];
  const score = useMemo(() => {
    if (!latest) return 100;
    const base = 100;
    const penalty = Math.min(60, (latest.issues_count||0)*3 + (latest.warnings_count||0)*1);
    return Math.max(0, base - penalty);
  }, [latest]);

  const trendData = useMemo(() => {
    return (logsQuery.data||[]).slice().reverse().map((l, idx) => ({
      idx: idx+1,
      time: new Date(l.created_date || Date.now()).toLocaleTimeString(),
      issues: l.issues_count || 0,
      warnings: l.warnings_count || 0,
      score: Math.max(0, 100 - Math.min(60, (l.issues_count||0)*3 + (l.warnings_count||0)))
    }));
  }, [logsQuery.data]);

  // Build per-entity actionable insights from latest
  const entityInsights = useMemo(() => {
    if (!latest?.results) return [];
    const entries = Object.entries(latest.results)
      .filter(([k]) => k !== "profiling")
      .map(([entity, res]) => {
        const denorm = res?.normalization?.denormalization_candidates?.length || 0;
        const missing = res?.normalization?.missing_required_props?.length || 0;
        const dupNodeIds = res?.integrity?.duplicate_node_ids?.length || 0;
        const invalidEmails = res?.integrity?.invalid_email_like_count || 0;
        const score = denorm + missing + dupNodeIds + invalidEmails;
        return { entity, denorm, missing, dupNodeIds, invalidEmails, score, res };
      })
      .filter((e) => e.score > 0)
      .sort((a,b) => b.score - a.score)
      .slice(0, 6);
    return entries;
  }, [latest]);

  return (
    <Card className="bg-slate-900/60 border-purple-900/40 mb-8">
      <CardHeader className="border-b border-purple-900/30">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-purple-200 flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            Schema Integrity & Profiling Audit
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant={autoScan ? "default" : "outline"}
              onClick={() => setAutoScan((v) => !v)}
              className={autoScan ? "bg-green-600 hover:bg-green-700" : "border-purple-500/30 text-purple-300"}
              size="sm"
            >
              {autoScan ? "Auto-scan ON" : "Auto-scan OFF"}
            </Button>
            <Button onClick={() => fullAuditMutation.mutate()} disabled={fullAuditMutation.isPending} className="bg-gradient-to-r from-indigo-600 to-purple-600" size="sm">
              {fullAuditMutation.isPending ? "Running..." : "Run Full Audit"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-purple-950/30 rounded border border-purple-500/30">
            <div className="text-xs text-purple-300 mb-2 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400" />Health Score</div>
            <div className="text-3xl font-bold text-purple-100">{score}</div>
            <Progress value={score} className="h-2 mt-2" />
            <div className="text-[11px] text-purple-400/60 mt-2 flex items-center gap-2"><Clock className="w-3 h-3" />Last run: {lastRunAt ? new Date(lastRunAt).toLocaleTimeString() : (latest ? new Date(latest.created_date).toLocaleTimeString() : "-")}</div>
          </div>
          <div className="p-4 bg-amber-950/30 rounded border border-amber-500/30">
            <div className="text-xs text-amber-300 mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" />Warnings</div>
            <div className="text-3xl font-bold text-amber-100">{latest?.warnings_count || 0}</div>
          </div>
          <div className="p-4 bg-rose-950/30 rounded border border-rose-500/30">
            <div className="text-xs text-rose-300 mb-2 flex items-center gap-2"><Activity className="w-4 h-4" />Issues</div>
            <div className="text-3xl font-bold text-rose-100">{latest?.issues_count || 0}</div>
          </div>
        </div>

        <Separator className="bg-purple-900/40" />

        {/* Trend chart */}
        <div>
          <div className="text-sm text-purple-300 font-semibold mb-2 flex items-center gap-2"><Gauge className="w-4 h-4" />Audit Trends</div>
          {trendData.length > 1 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#312e81" strokeDasharray="3 3" />
                  <XAxis dataKey="idx" stroke="#a78bfa88" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#a78bfa66" width={36} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #6b21a8", color: "#ddd" }} />
                  <Legend />
                  <Line type="monotone" dataKey="issues" stroke="#fca5a5" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="warnings" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="score" stroke="#a78bfa" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-xs text-purple-400/70">Run more audits to see trends</div>
          )}
        </div>

        {/* Actionable per-entity insights */}
        <div>
          <div className="text-sm text-purple-300 font-semibold mb-2 flex items-center gap-2"><Rocket className="w-4 h-4" />Top Actionable Insights</div>
          {entityInsights.length === 0 ? (
            <div className="text-xs text-purple-400/70">No outstanding issues detected in the latest run</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {entityInsights.map((e) => (
                <div key={e.entity} className="p-3 bg-slate-950/50 rounded border border-purple-900/30 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-purple-200 font-semibold">{e.entity}</div>
                    <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px]">Score {e.score}</Badge>
                  </div>
                  <div className="text-xs text-purple-400/70">
                    {e.denorm > 0 && <div>• Normalize fields: {e.res.normalization.denormalization_candidates.slice(0,3).join(", ")}</div>}
                    {e.missing > 0 && <div>• Fix schema required props: {e.res.normalization.missing_required_props.slice(0,3).join(", ")}</div>}
                    {e.dupNodeIds > 0 && <div>• Enforce unique node_id (duplicates: {e.dupNodeIds})</div>}
                    {e.invalidEmails > 0 && <div>• Validate email-like fields ({e.invalidEmails} invalid)</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}