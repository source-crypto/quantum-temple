import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Globe, AlertTriangle, ExternalLink, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

function sentimentBadge(score) {
  if (score >= 0.15) return { label: "Positive", className: "bg-green-500/20 text-green-300 border-green-500/30" };
  if (score <= -0.15) return { label: "Negative", className: "bg-red-500/20 text-red-300 border-red-500/30" };
  return { label: "Neutral", className: "bg-slate-500/20 text-slate-300 border-slate-500/30" };
}

export default function MarketNewsFeed() {
  const {
    data,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["qtc_market_news"],
    queryFn: async () => {
      const prompt = `You are a market news aggregator and analyst. Aggregate the most recent (last 12-24h) impactful headlines from reputable sources about: Quantum Temple Currency (QTC), Divine Currency Index (DCI), and broader crypto/DeFi markets (BTC, ETH, stablecoins, DEXs, regulation, exploits, ETFs).

Return 8-12 concise items with:
- title (short, crisp)
- source (e.g., CoinDesk, Bloomberg Crypto, The Block, Reuters)
- url (direct link)
- published_at (ISO timestamp)
- summary (1-2 sentences, objective)
- sentiment_score (-1 to 1)
- impact_score (0-100) = likelihood to move QTC price or DCI stability
- categories (array)
- tags (array of keywords)
- highlights (boolean) = true if impact_score >= 70 or directly about QTC/DCI

Be conservative with sentiment and impact. Prefer primary sources.`;

      const schema = {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                source: { type: "string" },
                url: { type: "string" },
                published_at: { type: "string" },
                summary: { type: "string" },
                sentiment_score: { type: "number" },
                impact_score: { type: "number" },
                categories: { type: "array", items: { type: "string" } },
                tags: { type: "array", items: { type: "string" } },
                highlights: { type: "boolean" }
              },
              required: ["title", "source", "url", "published_at", "summary", "sentiment_score", "impact_score", "highlights"]
            }
          }
        }
      };

      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: schema,
      });

      return res?.items || [];
    },
    refetchInterval: 120000, // 2 minutes
    refetchIntervalInBackground: true,
    initialData: [],
  });

  const items = Array.isArray(data) ? data : [];

  return (
    <Card className="bg-slate-900/60 border-purple-900/30 backdrop-blur-sm h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-purple-200 flex items-center gap-2">
          <Globe className="w-4 h-4" /> QTC & Crypto Market News
        </CardTitle>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="gap-2">
          {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 && (
          <div className="text-sm text-purple-300/70">No recent news found. Try refreshing shortly.</div>
        )}
        {items.map((n, idx) => {
          const s = sentimentBadge(Number(n.sentiment_score || 0));
          const impact = Math.max(0, Math.min(100, Number(n.impact_score || 0)));
          const isHighlight = !!n.highlights || impact >= 70;
          return (
            <div key={idx} className={`p-3 rounded-lg border ${isHighlight ? 'border-amber-500/30 bg-amber-950/20' : 'border-purple-900/30 bg-purple-950/10'}`}>
              <div className="flex items-start justify-between gap-3">
                <a href={n.url} target="_blank" rel="noreferrer" className="font-semibold text-indigo-200 hover:text-indigo-100">
                  {n.title}
                </a>
                <a href={n.url} target="_blank" rel="noreferrer" className="text-indigo-300/70 hover:text-indigo-200">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              <div className="mt-1 text-xs text-purple-400/70 flex flex-wrap items-center gap-2">
                <span>{n.source || 'Source'}</span>
                <span>•</span>
                <span>{n.published_at ? formatDistanceToNow(new Date(n.published_at), { addSuffix: true }) : ''}</span>
                <span>•</span>
                <Badge className={`${s.className}`}>{s.label}</Badge>
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">Impact {impact}</Badge>
                {isHighlight && (
                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 inline-flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> High Impact
                  </Badge>
                )}
              </div>
              {n.summary && (
                <p className="mt-2 text-sm text-purple-200/80">{n.summary}</p>
              )}
              {Array.isArray(n.tags) && n.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {n.tags.slice(0, 6).map((t, i) => (
                    <Badge key={i} variant="outline" className="text-xs text-purple-300 border-purple-800/60">
                      #{t}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}