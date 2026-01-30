import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";

export default function CurrencyAIInsights() {
  const { data: mints = [] } = useQuery({
    queryKey: ['ai_mints'],
    queryFn: () => base44.entities.CurrencyMint.list('-created_date', 200),
    initialData: [],
  });
  const { data: txs = [] } = useQuery({
    queryKey: ['ai_txs'],
    queryFn: () => base44.entities.CurrencyTransaction.list('-created_date', 200),
    initialData: [],
  });
  const { data: index } = useQuery({
    queryKey: ['ai_index'],
    queryFn: () => base44.entities.CurrencyIndex.list('-last_updated', 1).then(r=>r[0]),
  });

  const generate = useMutation({
    mutationFn: async () => {
      const payload = {
        context: {
          index,
          mints: mints.map(({ amount, timestamp }) => ({ amount, timestamp })),
          txs: txs.map(({ amount, transaction_type, timestamp }) => ({ amount, transaction_type, timestamp }))
        }
      };
      const schema = {
        type: 'object',
        properties: {
          trends: { type: 'object', additionalProperties: true },
          predictions: { type: 'array', items: { type: 'string' } },
          manifesto_comparison: {
            type: 'object',
            properties: {
              alignment_score: { type: 'number' },
              gaps: { type: 'array', items: { type: 'string' } },
              summary: { type: 'string' }
            },
            required: ['alignment_score','summary']
          }
        },
        required: ['trends','predictions','manifesto_comparison']
      };

      const prompt = `You are an expert crypto analyst with knowledge of quantum-value constructs.\nUsing the provided JSON context, do three things:\n1) Analyze historical trends (seasonality, growth/decay, velocity).\n2) Predict near-term movements based on sentiment implied by transaction/mint activity.\n3) Compare 'Divine Currency' manifesto goals (transparency, cross-chain, valuation stability) to actual implementation and performance.\nReturn ONLY JSON.`;

      return base44.integrations.Core.InvokeLLM({
        prompt: `${prompt}\n\nCONTEXT:\n${JSON.stringify(payload)}`,
        response_json_schema: schema
      });
    }
  });

  const result = generate.data;
  const insights = result && (result.trends ? result : (result.data || result));

  return (
    <Card className="bg-slate-950/70 border-purple-900/40">
      <CardHeader>
        <CardTitle className="text-purple-200 flex items-center gap-2"><Sparkles className="w-5 h-5" /> AI Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={()=>generate.mutate()} disabled={generate.isPending} className="bg-purple-600 hover:bg-purple-500">
          {generate.isPending ? (<><Loader2 className="w-4 h-4 animate-spin mr-2" />Generating...</>) : 'Generate Report'}
        </Button>

        {insights && (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-slate-900/60 border border-purple-900/40">
              <h3 className="text-sm font-semibold text-purple-300 mb-2">Trends</h3>
              <pre className="text-xs text-purple-200 whitespace-pre-wrap">{JSON.stringify(insights.trends, null, 2)}</pre>
            </div>
            <div className="p-4 rounded-lg bg-slate-900/60 border border-purple-900/40">
              <h3 className="text-sm font-semibold text-purple-300 mb-2">Predictions</h3>
              <ul className="text-sm text-purple-200 list-disc ml-4">
                {(insights.predictions||[]).map((p,i)=>(<li key={i}>{p}</li>))}
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-slate-900/60 border border-purple-900/40">
              <h3 className="text-sm font-semibold text-purple-300 mb-2">Manifesto Comparison</h3>
              <div className="text-sm text-purple-200">Alignment: <span className="font-semibold">{insights.manifesto_comparison?.alignment_score ?? '—'}%</span></div>
              <div className="text-sm text-purple-200 mt-2">Summary:</div>
              <p className="text-sm text-purple-200/90">{insights.manifesto_comparison?.summary}</p>
              {(insights.manifesto_comparison?.gaps||[]).length>0 && (
                <div className="text-sm text-purple-200 mt-2">Gaps:
                  <ul className="list-disc ml-4">
                    {insights.manifesto_comparison.gaps.map((g,i)=>(<li key={i}>{g}</li>))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}