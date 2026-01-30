import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Insights() {
  const analyze = useMutation({
    mutationFn: async () => {
      const res = await base44.functions.invoke('analyzeMarketAI');
      return res.data;
    }
  });

  const data = analyze.data;

  return (
    <div className="p-6 md:p-10 space-y-6">
      <div className="flex items-end gap-3">
        <div>
          <h1 className="text-3xl font-bold text-purple-200">AI Market Insights</h1>
          <p className="text-purple-400/70">Sentiment, predictions, and suggested actions for QTC.</p>
        </div>
        <Button className="ml-auto" onClick={() => analyze.mutate()} disabled={analyze.isPending}>
          {analyze.isPending ? 'Analyzing…' : 'Run Analysis'}
        </Button>
      </div>

      {data && (
        <Card className="bg-slate-950/60 border-purple-900/40">
          <CardHeader>
            <CardTitle className="text-purple-200">Latest Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="text-purple-300/80">Overall Sentiment: <span className="font-semibold">{data.insights?.sentiment_overall}</span></div>
            <div className="grid md:grid-cols-3 gap-3">
              <div className="bg-slate-900/60 p-3 rounded">News Sentiment: {Number(data.insights?.news_sentiment_score ?? 0).toFixed(2)}</div>
              <div className="bg-slate-900/60 p-3 rounded">Social Sentiment: {Number(data.insights?.social_sentiment_score ?? 0).toFixed(2)}</div>
              <div className="bg-slate-900/60 p-3 rounded">Predicted 24h Move: {Number(data.insights?.predicted_price_change_24h_pct ?? 0).toFixed(2)}%</div>
            </div>
            {Array.isArray(data.insights?.key_drivers) && data.insights.key_drivers.length > 0 && (
              <div>
                <div className="text-purple-300/80 mb-1">Key Drivers</div>
                <ul className="list-disc ml-5 text-purple-200">
                  {data.insights.key_drivers.map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </div>
            )}
            {Array.isArray(data.insights?.suggested_actions) && data.insights.suggested_actions.length > 0 && (
              <div>
                <div className="text-purple-300/80 mb-1">Suggested Actions</div>
                <ul className="list-disc ml-5 text-purple-200">
                  {data.insights.suggested_actions.map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!data && (
        <Card className="bg-slate-950/60 border-purple-900/40">
          <CardContent className="p-6 text-purple-300/80 text-sm">Run an analysis to generate insights.</CardContent>
        </Card>
      )}
    </div>
  );
}