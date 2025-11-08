import React, { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Brain, AlertTriangle, Target, BarChart3, Zap, RefreshCw, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function MarketInsights({ currencyPair = "QTC/USD" }) {
  const queryClient = useQueryClient();

  const { data: insights, isLoading } = useQuery({
    queryKey: ['marketInsights', currencyPair],
    queryFn: async () => {
      return base44.entities.MarketInsight.filter({ currency_pair: currencyPair }, '-created_date', 1);
    },
    initialData: [],
  });

  const { data: allTransactions } = useQuery({
    queryKey: ['allTransactions'],
    queryFn: () => base44.entities.CurrencyTransaction.list('-created_date', 100),
    initialData: [],
  });

  const { data: bridges } = useQuery({
    queryKey: ['cryptoBridges'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.CryptoBridge.list('-created_date', 50);
    },
    initialData: [],
  });

  const { data: index } = useQuery({
    queryKey: ['currencyIndex'],
    queryFn: async () => {
      const indices = await base44.entities.CurrencyIndex.list();
      return indices[0];
    },
  });

  const generateInsightMutation = useMutation({
    mutationFn: async () => {
      const currentPrice = index?.qtc_unit_price_usd || 1;
      
      // Analyze transaction patterns
      const recentTransactions = allTransactions.slice(0, 50);
      const totalVolume = recentTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
      const avgTransactionSize = totalVolume / (recentTransactions.length || 1);
      
      // Analyze bridge activity
      const recentBridges = bridges.slice(0, 20);
      const bridgeVolume = recentBridges.reduce((sum, b) => sum + (b.destination_amount || 0), 0);
      
      // Use AI to analyze and predict
      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a cryptocurrency market analyst for Quantum Temple Currency (QTC) with $560 billion backing.

Current Market Data:
- Current Price: $${currentPrice.toFixed(6)} USD
- 24h Transaction Count: ${recentTransactions.length}
- 24h Volume: ${totalVolume.toLocaleString()} QTC
- Average Transaction: ${avgTransactionSize.toFixed(2)} QTC
- Cross-chain Bridge Activity: ${bridgeVolume.toLocaleString()} QTC
- Market Cap: $560 Billion (fixed backing)

Analyze the trading patterns and provide:
1. 24-hour price prediction
2. 7-day price prediction
3. Overall trend direction (bullish/bearish/neutral/volatile)
4. Volume trend (increasing/decreasing/stable)
5. Risk assessment (low/medium/high/extreme)
6. Key market indicators
7. Trading recommendation
8. Detailed analysis summary

Format your response as JSON with these exact fields:
{
  "predicted_price_24h": number,
  "predicted_price_7d": number,
  "trend_direction": "bullish|bearish|neutral|volatile",
  "volume_trend": "increasing|decreasing|stable",
  "risk_level": "low|medium|high|extreme",
  "key_indicators": ["indicator1", "indicator2", "indicator3"],
  "recommendation": "short recommendation text",
  "analysis_summary": "detailed analysis"
}`,
        response_json_schema: {
          type: "object",
          properties: {
            predicted_price_24h: { type: "number" },
            predicted_price_7d: { type: "number" },
            trend_direction: { type: "string" },
            volume_trend: { type: "string" },
            risk_level: { type: "string" },
            key_indicators: { type: "array", items: { type: "string" } },
            recommendation: { type: "string" },
            analysis_summary: { type: "string" }
          }
        }
      });

      // Calculate confidence based on data quality
      const dataQuality = Math.min(recentTransactions.length / 50, 1);
      const confidence = 0.7 + (dataQuality * 0.3);

      return base44.entities.MarketInsight.create({
        insight_type: "price_prediction",
        currency_pair: currencyPair,
        current_price: currentPrice,
        predicted_price_24h: analysis.predicted_price_24h,
        predicted_price_7d: analysis.predicted_price_7d,
        confidence_level: confidence,
        trend_direction: analysis.trend_direction,
        volume_trend: analysis.volume_trend,
        key_indicators: analysis.key_indicators,
        recommendation: analysis.recommendation,
        risk_level: analysis.risk_level,
        analysis_summary: analysis.analysis_summary,
        timestamp: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketInsights'] });
      toast.success("Market analysis complete", {
        description: "AI has generated new insights"
      });
    },
    onError: () => {
      toast.error("Analysis failed", {
        description: "Unable to generate market insights"
      });
    }
  });

  const latestInsight = insights.length > 0 ? insights[0] : null;

  const trendColors = {
    bullish: { color: "text-green-400", bg: "bg-green-500/20", border: "border-green-500/30", icon: TrendingUp },
    bearish: { color: "text-red-400", bg: "bg-red-500/20", border: "border-red-500/30", icon: TrendingDown },
    neutral: { color: "text-blue-400", bg: "bg-blue-500/20", border: "border-blue-500/30", icon: Target },
    volatile: { color: "text-amber-400", bg: "bg-amber-500/20", border: "border-amber-500/30", icon: Zap }
  };

  const riskColors = {
    low: { color: "text-green-400", bg: "bg-green-500/20", border: "border-green-500/30" },
    medium: { color: "text-yellow-400", bg: "bg-yellow-500/20", border: "border-yellow-500/30" },
    high: { color: "text-orange-400", bg: "bg-orange-500/20", border: "border-orange-500/30" },
    extreme: { color: "text-red-400", bg: "bg-red-500/20", border: "border-red-500/30" }
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-900/60 border-purple-900/40">
        <CardContent className="p-12 text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-purple-400 animate-spin" />
          <p className="text-purple-400/60">Analyzing market patterns...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-br from-indigo-950/60 to-purple-950/60 border-indigo-500/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-indigo-200">AI Market Insights</h3>
                <p className="text-sm text-indigo-400/70">Powered by quantum consciousness analysis</p>
              </div>
            </div>
            <Button
              onClick={() => generateInsightMutation.mutate()}
              disabled={generateInsightMutation.isPending}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"
            >
              {generateInsightMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Generate New Insight
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {latestInsight ? (
        <>
          {/* Price Predictions */}
          <div className="grid md:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-slate-900/60 border-green-900/40">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-green-400" />
                      <span className="font-semibold text-green-200">24h Prediction</span>
                    </div>
                    <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                      {(latestInsight.confidence_level * 100).toFixed(0)}% Confidence
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold text-green-300 mb-2">
                    ${latestInsight.predicted_price_24h?.toFixed(6)}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-purple-400/70">Current: ${latestInsight.current_price.toFixed(6)}</span>
                    <span className={`font-semibold ${
                      latestInsight.predicted_price_24h > latestInsight.current_price ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {latestInsight.predicted_price_24h > latestInsight.current_price ? '+' : ''}
                      {(((latestInsight.predicted_price_24h - latestInsight.current_price) / latestInsight.current_price) * 100).toFixed(2)}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="bg-slate-900/60 border-blue-900/40">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                    <span className="font-semibold text-blue-200">7-Day Prediction</span>
                  </div>
                  <div className="text-3xl font-bold text-blue-300 mb-2">
                    ${latestInsight.predicted_price_7d?.toFixed(6)}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-purple-400/70">Current: ${latestInsight.current_price.toFixed(6)}</span>
                    <span className={`font-semibold ${
                      latestInsight.predicted_price_7d > latestInsight.current_price ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {latestInsight.predicted_price_7d > latestInsight.current_price ? '+' : ''}
                      {(((latestInsight.predicted_price_7d - latestInsight.current_price) / latestInsight.current_price) * 100).toFixed(2)}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Trend & Risk Analysis */}
          <div className="grid md:grid-cols-3 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className={`bg-slate-900/60 ${trendColors[latestInsight.trend_direction].border}`}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    {React.createElement(trendColors[latestInsight.trend_direction].icon, {
                      className: `w-6 h-6 ${trendColors[latestInsight.trend_direction].color}`
                    })}
                    <span className="font-semibold text-purple-200">Trend</span>
                  </div>
                  <div className={`text-2xl font-bold capitalize ${trendColors[latestInsight.trend_direction].color}`}>
                    {latestInsight.trend_direction}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="bg-slate-900/60 border-purple-900/40">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <TrendingUp className="w-6 h-6 text-purple-400" />
                    <span className="font-semibold text-purple-200">Volume</span>
                  </div>
                  <div className="text-2xl font-bold capitalize text-purple-300">
                    {latestInsight.volume_trend}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className={`bg-slate-900/60 ${riskColors[latestInsight.risk_level].border}`}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertTriangle className={`w-6 h-6 ${riskColors[latestInsight.risk_level].color}`} />
                    <span className="font-semibold text-purple-200">Risk</span>
                  </div>
                  <div className={`text-2xl font-bold capitalize ${riskColors[latestInsight.risk_level].color}`}>
                    {latestInsight.risk_level}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Key Indicators */}
          <Card className="bg-slate-900/60 border-purple-900/40">
            <CardHeader className="border-b border-purple-900/30">
              <CardTitle className="text-purple-200">Key Market Indicators</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {latestInsight.key_indicators?.map((indicator, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className="flex items-center gap-2 p-3 bg-slate-950/50 rounded-lg border border-purple-900/30"
                  >
                    <div className="w-2 h-2 bg-indigo-400 rounded-full" />
                    <span className="text-sm text-purple-300">{indicator}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendation */}
          <Card className="bg-gradient-to-br from-green-950/40 to-emerald-950/40 border-green-500/30">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-green-200 mb-2">AI Recommendation</h3>
                  <p className="text-green-300/80">{latestInsight.recommendation}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Analysis */}
          <Card className="bg-slate-900/60 border-purple-900/40">
            <CardHeader className="border-b border-purple-900/30">
              <CardTitle className="text-purple-200">Detailed Analysis</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-purple-300/80 leading-relaxed whitespace-pre-wrap">
                {latestInsight.analysis_summary}
              </p>
              <div className="mt-4 pt-4 border-t border-purple-900/30 flex items-center justify-between text-sm">
                <span className="text-purple-400/60">
                  Generated: {new Date(latestInsight.timestamp).toLocaleString()}
                </span>
                <Badge variant="outline" className="border-purple-500/30 text-purple-300">
                  {currencyPair}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="bg-slate-900/60 border-purple-900/40">
          <CardContent className="p-12 text-center">
            <Brain className="w-16 h-16 mx-auto mb-4 text-purple-400/40" />
            <p className="text-purple-400/60 mb-4">No market insights available yet</p>
            <Button
              onClick={() => generateInsightMutation.mutate()}
              disabled={generateInsightMutation.isPending}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"
            >
              {generateInsightMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Generate First Insight
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}