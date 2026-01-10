import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ListChecks, Wrench, Gauge, ClipboardList, AlertTriangle, CheckCircle2 } from "lucide-react";

const ENTITIES = [
  "QuantumNode", "CrossChainBridge", "CryptoWallet", "CEXListing", "AITradingStrategy",
  "CurrencyMint", "TempleInteraction", "CeremonialArtifact", "DivineOffering", "DivineFavor",
  "SpiritualToken", "CurrencyTransaction", "TradeOffer", "UserBalance", "CryptoBridge",
  "CrossChainLiquidity", "CurrencyIndex", "ExchangeRate", "MarketInsight", "LiquidityPool"
];

export default function SchemaAudit() {
  const [log, setLog] = React.useState([]);
  const [running, setRunning] = React.useState(false);
  const queryClient = useQueryClient();

  const append = (entry) => setLog((prev) => [{ id: crypto.randomUUID(), time: new Date().toISOString(), ...entry }, ...prev]);

  const runNormalization = async () => {
    append({ type: "info", label: "Normalization", message: "Starting normalization heuristics across entities" });
    for (const name of ENTITIES) {
      const schema = await base44.entities[name].schema();
      const props = schema.properties || {};
      // Heuristics
      const arraysOfObjects = Object.entries(props).filter(([, v]) => v.type === "array" && v.items && v.items.type === "object");
      const nestedObjects = Object.entries(props).filter(([, v]) => v.type === "object");
      if (arraysOfObjects.length > 0) {
        append({ type: "warn", entity: name, label: "Array of Objects", message: `${arraysOfObjects.length} array(s) of objects detected. Consider extracting related entity and linking by id.` });
      }
      if (nestedObjects.length > 0) {
        append({ type: "note", entity: name, label: "Nested Object", message: `${nestedObjects.length} nested object(s) detected. Verify normalization vs. document-style storage.` });
      }
      // Keys that look like foreign keys
      const fkCandidates = Object.keys(props).filter((k) => /(_id|_email|_address)$/i.test(k));
      if (fkCandidates.length > 0) {
        append({ type: "note", entity: name, label: "FK Candidates", message: `Potential relationship keys: ${fkCandidates.join(", ")}. Ensure referential consistency.` });
      }
    }
    append({ type: "ok", label: "Normalization", message: "Normalization scan complete" });
  };

  const runIntegrity = async () => {
    append({ type: "info", label: "Integrity", message: "Validating required fields, duplicates and referential hints" });
    for (const name of ENTITIES) {
      const schema = await base44.entities[name].schema();
      const required = schema.required || [];
      const sample = await base44.entities[name].list(undefined, 50);
      if (required.length > 0) {
        const missing = [];
        sample.forEach((row) => {
          required.forEach((field) => {
            if (row[field] === undefined || row[field] === null || row[field] === "") missing.push({ id: row.id, field });
          });
        });
        if (missing.length > 0) {
          append({ type: "warn", entity: name, label: "Required Fields", message: `${missing.length} record-field violations detected`, details: missing.slice(0, 5) });
        }
      }
      // Uniqueness candidates
      const uniqueHints = ["node_id","bridge_id","listing_id","strategy_id","serial_number","transaction_hash","wallet_address"];
      uniqueHints.forEach((key) => {
        if ((schema.properties || {})[key]) {
          const set = new Set();
          const dups = [];
          sample.forEach((r) => {
            const val = r[key];
            if (!val) return;
            if (set.has(val)) dups.push(val); else set.add(val);
          });
          if (dups.length > 0) append({ type: "warn", entity: name, label: "Uniqueness", message: `${key} duplicates in sample: ${[...new Set(dups)].slice(0, 3).join(", ")}` });
        }
      });
    }
    append({ type: "ok", label: "Integrity", message: "Integrity scan complete" });
  };

  const runProfiling = async () => {
    append({ type: "info", label: "Profiling", message: "Running sample query timings for common patterns" });
    const timings = [];
    // Define sample filters per entity where it makes sense
    const samples = [
      { name: "QuantumNode", op: async () => base44.entities.QuantumNode.filter({ node_type: "oracle" }, "-last_active", 20), indexHint: ["node_type", "last_active"] },
      { name: "CurrencyTransaction", op: async () => base44.entities.CurrencyTransaction.filter({ status: "completed" }, "-timestamp", 20), indexHint: ["status", "timestamp"] },
      { name: "CrossChainBridge", op: async () => base44.entities.CrossChainBridge.filter({ status: "completed" }, "-initiated_at", 20), indexHint: ["status", "initiated_at"] },
      { name: "UserBalance", op: async () => base44.entities.UserBalance.list("-updated_date", 20), indexHint: ["updated_date"] }
    ];
    for (const s of samples) {
      const t0 = performance.now();
      await s.op();
      const t1 = performance.now();
      const ms = Math.round(t1 - t0);
      timings.push({ entity: s.name, ms, indexHint: s.indexHint });
      append({ type: ms > 300 ? "warn" : "ok", entity: s.name, label: "Query Time", message: `${ms}ms`, details: ms > 300 ? { recommendation: `Consider index on ${s.indexHint.join(", ")}` } : undefined });
    }
    append({ type: "ok", label: "Profiling", message: "Query profiling complete" });
  };

  const fullAuditMutation = useMutation({
    mutationFn: async () => {
      setRunning(true);
      setLog([]);
      await runNormalization();
      await runIntegrity();
      await runProfiling();
      setRunning(false);
      return true;
    }
  });

  return (
    <Card className="bg-slate-900/60 border-purple-900/40">
      <CardHeader className="border-b border-purple-900/30 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <CardTitle className="text-purple-200 flex items-center gap-2">
          <ClipboardList className="w-5 h-5" />
          Schema Integrity & Profiling Audit
        </CardTitle>
        <div className="flex gap-2">
          <Button onClick={() => fullAuditMutation.mutate()} disabled={running} className="bg-gradient-to-r from-purple-600 to-indigo-600">
            <ListChecks className="w-4 h-4 mr-2" /> Run Full Audit
          </Button>
          <Button variant="outline" disabled={running} onClick={() => { setLog([]); }} className="border-purple-500/30 text-purple-300">Clear Log</Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="text-sm text-purple-300/70 mb-4">
          Automated checks include normalization heuristics, required-field and uniqueness integrity, and timed query profiling with index hints. All results are logged below.
        </div>

        <div className="space-y-2 max-h-[360px] overflow-auto">
          {log.length === 0 ? (
            <div className="text-purple-400/60 text-sm">No audit run yet. Click "Run Full Audit".</div>
          ) : (
            log.map((e) => (
              <div key={e.id} className="p-3 rounded border flex items-start justify-between gap-3 bg-slate-950/50 border-purple-900/30">
                <div>
                  <div className="flex items-center gap-2">
                    {e.type === "ok" && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                    {e.type === "warn" && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                    {e.type === "info" && <Gauge className="w-4 h-4 text-cyan-400" />}
                    {e.type === "note" && <Wrench className="w-4 h-4 text-purple-300" />}
                    <span className="text-xs uppercase tracking-wide text-purple-300/80">{e.label}</span>
                    {e.entity && <Badge className="ml-2 bg-purple-500/20 text-purple-300 border-purple-500/30 text-[10px]">{e.entity}</Badge>}
                  </div>
                  <div className="text-sm text-purple-200 mt-1">{e.message}</div>
                  {e.details && (
                    <pre className="mt-2 text-[10px] text-purple-300/70 whitespace-pre-wrap">{JSON.stringify(e.details, null, 2)}</pre>
                  )}
                </div>
                <div className="text-[10px] text-purple-400/60 font-mono">{new Date(e.time).toLocaleTimeString()}</div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}