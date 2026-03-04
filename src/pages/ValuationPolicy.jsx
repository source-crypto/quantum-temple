import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info, BookOpen, Target, Activity, Calculator } from "lucide-react";

export default function ValuationPolicy() {
  const { data: index } = useQuery({
    queryKey: ["CurrencyIndexLatest"],
    queryFn: async () => {
      const rows = await base44.entities.CurrencyIndex.list('-last_updated', 1);
      return rows?.[0] || null;
    },
    refetchInterval: 15000
  });

  return (
    <div className="min-h-screen p-6 md:p-12 text-slate-100">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Valuation & Intervention Policy</h1>
            <p className="text-slate-400">Methodology for qtc_unit_price_usd, vqc_total_valuation_usd and the intervention_active policy.</p>
          </div>
        </div>

        <Card className="bg-slate-900/60 border-purple-900/30">
          <CardHeader>
            <CardTitle className="text-slate-200">Current Index Snapshot</CardTitle>
            <CardDescription className="text-slate-400">Live values pulled from CurrencyIndex</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 rounded border border-purple-900/30 bg-slate-950/40">
              <div className="text-slate-400">QTC Unit Price (USD)</div>
              <div className="text-xl font-semibold text-purple-200">{index?.qtc_unit_price_usd ?? '—'}</div>
            </div>
            <div className="p-3 rounded border border-purple-900/30 bg-slate-950/40">
              <div className="text-slate-400">Total Valuation (USD)</div>
              <div className="text-xl font-semibold text-purple-200">{index?.vqc_total_valuation_usd?.toLocaleString?.() ?? index?.vqc_total_valuation_usd ?? '—'}</div>
            </div>
            <div className="p-3 rounded border border-purple-900/30 bg-slate-950/40">
              <div className="text-slate-400">Intervention</div>
              <div className="mt-1">
                <Badge className={index?.intervention_active ? 'bg-amber-900/50 text-amber-200' : 'bg-emerald-900/50 text-emerald-200'}>
                  {index?.intervention_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-purple-900/30">
          <CardHeader>
            <CardTitle className="text-slate-200 flex items-center gap-2"><Calculator className="w-5 h-5"/> How qtc_unit_price_usd is determined</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed text-slate-300">
            <p>
              In the absence of on-chain market activity, qtc_unit_price_usd is policy-derived using a transparent baseline formula,
              anchored to documented reserves and supply disclosures:
            </p>
            <ol className="list-decimal ml-5 space-y-1">
              <li><span className="font-semibold">Baseline Anchor:</span> Set by Treasury reserve ratio where available (usd_balance / total_qtc_supply),
              otherwise a published policy baseline recorded in CurrencyIndex.</li>
              <li><span className="font-semibold">Oracle Merge (when active):</span> If organic liquidity exists (e.g., AMM pools), median on-chain quotes
              are blended with the baseline using conservative weights.</li>
              <li><span className="font-semibold">Guardrails:</span> Daily change caps and circuit-breakers prevent abrupt unsolicited moves without governance approval.</li>
            </ol>
            <Alert className="bg-blue-950/30 border-blue-500/30">
              <AlertTitle className="text-blue-200 flex items-center gap-2"><Info className="w-4 h-4"/> No market activity case</AlertTitle>
              <AlertDescription className="text-blue-300/80">
                When trades = 0 and volumes = 0, the policy reverts to the Baseline Anchor exclusively and publishes methodology here.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-purple-900/30">
          <CardHeader>
            <CardTitle className="text-slate-200 flex items-center gap-2"><Activity className="w-5 h-5"/> How vqc_total_valuation_usd is computed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed text-slate-300">
            <p>
              vqc_total_valuation_usd represents the aggregate notional valuation of the VQC system and is reported as:
            </p>
            <ul className="list-disc ml-5 space-y-1">
              <li><span className="font-semibold">Scope:</span> Includes reserve references and circulating QTC at the policy price.</li>
              <li><span className="font-semibold">Method:</span> <code>circulating_supply × qtc_unit_price_usd</code> plus any explicitly declared reserve adjustments (if any).</li>
              <li><span className="font-semibold">Disclosure:</span> All assumptions are published here and reflected in CurrencyIndex timestamps.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-purple-900/30">
          <CardHeader>
            <CardTitle className="text-slate-200 flex items-center gap-2"><Target className="w-5 h-5"/> Intervention Policy: rules, triggers, objectives</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed text-slate-300">
            <ul className="list-disc ml-5 space-y-2">
              <li><span className="font-semibold">Objectives:</span> Preserve orderly pricing, protect users from illiquid spikes, and maintain predictable purchasing power.</li>
              <li><span className="font-semibold">Triggers:</span> (a) price deviates beyond published bands; (b) on-chain liquidity below threshold; (c) oracle inconsistency; (d) security events.</li>
              <li><span className="font-semibold">Actions:</span> adjust policy baseline, provide/withdraw liquidity, or pause price updates pending governance review.</li>
              <li><span className="font-semibold">Governance & Disclosure:</span> All activations are timestamped in CurrencyIndex.intervention_active with rationale archived in AppLog.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}