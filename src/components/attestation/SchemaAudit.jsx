import React, { useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ClipboardList, Activity, Gauge, CheckCircle2, AlertTriangle, Rocket } from "lucide-react";
import { toast } from "sonner";

const ENTITIES_TO_AUDIT = [
  "QuantumNode","CrossChainBridge","CryptoWallet","CEXListing","AITradingStrategy","CurrencyMint",
  "TempleInteraction","CeremonialArtifact","DivineOffering","DivineFavor","SpiritualToken","CurrencyTransaction",
  "TradeOffer","UserBalance","CryptoBridge","CrossChainLiquidity","CurrencyIndex","ExchangeRate","MarketInsight",
  "LiquidityPool","IntentNode"
];

export default function SchemaAudit() {
  const queryClient = useQueryClient();

  const logsQuery = useQuery({
    queryKey: ["schemaAuditLogs"],
    queryFn: () => base44.entities.SchemaAuditLog.list("-created_date", 10),
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

      // Schema normalization checks
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

      // Integrity checks (lightweight, privacy-safe)
      // Duplicates on natural keys and email format sanity
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
          recommendations.push(`QuantumNode: Duplicate node_id detected: [${duplicates.join(", ")}] — ensure uniqueness.`);
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

      // Query profiling
      const profile = {};
      const t = async (label, fn) => { const s = performance.now(); const out = await fn(); const d = performance.now()-s; profile[label] = { ms: Math.round(d), count: Array.isArray(out)? out.length : (out?1:0) }; return out; };

      try { await t("QuantumNode.list", () => base44.entities.QuantumNode.list("-updated_date", 100)); } catch {}
      try { await t("QuantumNode.oracles", () => base44.entities.QuantumNode.filter({ node_type: "oracle" }, "-last_active", 50)); } catch {}
      try { await t("CrossChainBridge.user", async () => { const me = await base44.auth.me(); return base44.entities.CrossChainBridge.filter({ user_email: me.email }, "-initiated_at", 20); }); } catch {}
      results["profiling"] = profile;

      Object.entries(profile).forEach(([label, p]) => {
        if (p.ms > 300) { warnings += 1; recommendations.push(`Slow query (${p.ms}ms): ${label} — consider indexing common filters/sorts.`); }
      });

      // Save log
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
    onSuccess: () => {
      toast.success("Schema audit completed", { description: "Results logged transparently" });
      queryClient.invalidateQueries({ queryKey: ["schemaAuditLogs"] });
    }
  });

  const latest = logsQuery.data?.[0];
  const score = useMemo(() => {
    if (!latest) return 100;
    const base = 100;
    const penalty = Math.min(60, (latest.issues_count||0)*3 + (latest.warnings_count||0)*1);
    return Math.max(0, base - penalty);
  }, [latest]);

  return (
    <Card className="bg-slate-900/60 border-purple-900/40 mb-8">
      <CardHeader className="border-b border-purple-900/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-purple-200 flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            Schema Integrity & Profiling Audit
          </CardTitle>
          <Button onClick={() => fullAuditMutation.mutate()} disabled={fullAuditMutation.isPending} className="bg-gradient-to-r from-indigo-600 to-purple-600">
            {fullAuditMutation.isPending ? "Running..." : "Run Full Audit"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-purple-950/30 rounded border border-purple-500/30">
            <div className="text-xs text-purple-300 mb-2 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400" />Health Score</div>
            <div className="text-3xl font-bold text-purple-100">{score}</div>
            <Progress value={score} className="h-2 mt-2" />
          </div>
          <div className="p-4 bg-amber-950/30 rounded border border-amber-500/30">
            <div className="text-xs text-amber-300 mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" />Warnings</div>
            <div className="text-3xl font-bold text-amber-100">{latest?.warnings_count || 0}</div>
          </div>
          <div className="p-4 bg-rose-950/30 rounded border border-rose-500/30">
            <div className="text-xs text-rose-300 mb-2 flex items-center gap-2"><ActivitySquare className="w-4 h-4" />Issues</div>
            <div className="text-3xl font-bold text-rose-100">{latest?.issues_count || 0}</div>
          </div>
        </div>

        <Separator className="bg-purple-900/40" />

        <div>
          <div className="text-sm text-purple-300 font-semibold mb-2 flex items-center gap-2"><Gauge className="w-4 h-4" />Latest Profiling</div>
          {latest?.results?.profiling ? (
            <div className="grid md:grid-cols-3 gap-3">
              {Object.entries(latest.results.profiling).map(([k, v]) => (
                <div key={k} className="p-3 bg-slate-950/50 rounded border border-purple-900/30 text-xs text-purple-300/80 flex items-center justify-between">
                  <span>{k}</span>
                  <Badge className={v.ms>300?"bg-amber-500/20 text-amber-300 border-amber-500/30":"bg-purple-500/20 text-purple-300 border-purple-500/30"}>{v.ms}ms</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-purple-400/70">No profiling data yet</div>
          )}
        </div>

        <div>
          <div className="text-sm text-purple-300 font-semibold mb-2 flex items-center gap-2"><Rocket className="w-4 h-4" />Recommendations</div>
          {latest?.recommendations?.length ? (
            <ul className="list-disc pl-5 space-y-1 text-sm text-purple-300/80">
              {latest.recommendations.slice(0,8).map((r, i) => (<li key={i}>{r}</li>))}
            </ul>
          ) : (
            <div className="text-xs text-purple-400/70">No recommendations yet</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}