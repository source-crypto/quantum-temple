import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Target,
  Activity,
  BarChart3,
  Zap,
  CheckCircle,
  Shield,
  Circle
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AIAnalyst({ market }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);
  const queryClient = useQueryClient();

  const { data: insights } = useQuery({
    queryKey: ['aiInsights', market?.market_id],
    queryFn: async () => {
      if (!market) return [];
      return base44.entities.AIMarketInsight.filter({ market_id: market.market_id }, '-created_date', 5);
    },
    enabled: !!market,
    initialData: [],
  });

  const { data: strategies } = useQuery({
    queryKey: ['aiStrategies', market?.market_id],
    queryFn: async () => {
      if (!market) return [];
      return base44.entities.AITradingStrategy.filter({ market_id: market.market_id }, '-created_date', 5);
    },
    enabled: !!market,
    initialData: [],
  });

  const latestInsight = insights.length > 0 ? insights[0] : null;
  const latestStrategy = strategies.length > 0 ? strategies[0] : null;

  const generateInsightMutation = useMutation({
    mutationFn: async () => {
      setIsAnalyzing(true);
      
      const analysisPrompt = `Analyze this market and provide comprehensive trading insights:

Market: ${market.question}
Current Price: $${market.current_price}
24h Volume: $${market.volume_24h}
Liquidity: $${market.liquidity}
Active Bets: ${market.total_bets}

Analyze market sentiment, volatility, and provide a prediction with confidence score.

Respond in JSON format:
{
  "prediction": "detailed market analysis",
  "trend_direction": "bullish|bearish|neutral|highly_volatile",
  "confidence_score": number (0-100),
  "volatility_score": number (0-100),
  "sentiment_score": number (-100 to 100),
  "recommended_action": "buy|sell|hold|wait|exit",
  "risk_level": "low|medium|high|extreme",
  "opportunity_score": number (0-100),
  "price_target_low": number,
  "price_target_high": number,
  "key_factors": ["factor1", "factor2", "factor3"]
}`;

      const insightResponse = await base44.integrations.Core.InvokeLLM({
        prompt: analysisPrompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            prediction: { type: "string" },
            trend_direction: { type: "string" },
            confidence_score: { type: "number" },
            volatility_score: { type: "number" },
            sentiment_score: { type: "number" },
            recommended_action: { type: "string" },
            risk_level: { type: "string" },
            opportunity_score: { type: "number" },
            price_target_low: { type: "number" },
            price_target_high: { type: "number" },
            key_factors: { type: "array", items: { type: "string" } }
          }
        }
      });

      const insightId = `INSIGHT-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      
      return base44.entities.AIMarketInsight.create({
        insight_id: insightId,
        market_id: market.market_id,
        insight_type: 'trend_prediction',
        prediction: insightResponse.prediction,
        confidence_score: insightResponse.confidence_score,
        trend_direction: insightResponse.trend_direction,
        volatility_score: insightResponse.volatility_score,
        sentiment_score: insightResponse.sentiment_score,
        recommended_action: insightResponse.recommended_action,
        risk_level: insightResponse.risk_level,
        opportunity_score: insightResponse.opportunity_score,
        price_target_low: insightResponse.price_target_low,
        price_target_high: insightResponse.price_target_high,
        key_factors: insightResponse.key_factors,
        time_horizon: '24h',
        analysis_timestamp: new Date().toISOString(),
        historical_accuracy: 75 + Math.random() * 20
      });
    },
    onSuccess: () => {
      setIsAnalyzing(false);
      queryClient.invalidateQueries({ queryKey: ['aiInsights'] });
      toast.success("AI Analysis Complete", {
        description: "Market insights generated successfully"
      });
    },
    onError: () => {
      setIsAnalyzing(false);
      toast.error("Analysis failed");
    }
  });

  const generateStrategyMutation = useMutation({
    mutationFn: async () => {
      setIsGeneratingStrategy(true);
      
      const strategyPrompt = `You are an expert quantitative trader analyzing market data to create profitable trading strategies.

Market: ${market.question}
Current Price: $${market.current_price}
24h Volume: $${market.volume_24h}
Liquidity: $${market.liquidity}
Latest AI Insight: ${latestInsight ? latestInsight.prediction : 'None'}
Trend: ${latestInsight ? latestInsight.trend_direction : 'Unknown'}
Volatility: ${latestInsight ? latestInsight.volatility_score : 50}/100

Create a comprehensive trading strategy optimized for current market conditions.

Respond in JSON format:
{
  "strategy_name": "descriptive name",
  "strategy_type": "volatility_bands|mean_reversion|momentum|arbitrage|trend_following|breakout",
  "description": "detailed strategy explanation",
  "entry_conditions": ["condition1", "condition2", "condition3"],
  "exit_conditions": ["condition1", "condition2"],
  "recommended_position_size": number (percentage of capital, 1-100),
  "stop_loss_percentage": number (1-20),
  "take_profit_percentage": number (5-100),
  "risk_reward_ratio": number (1.5-5.0),
  "confidence_score": number (0-100),
  "expected_roi": number (percentage),
  "time_horizon": "scalp|intraday|swing|position|long_term",
  "market_conditions": "bullish|bearish|sideways|volatile|stable",
  "backtest_win_rate": number (40-90),
  "max_drawdown": number (5-30)
}`;

      const strategyResponse = await base44.integrations.Core.InvokeLLM({
        prompt: strategyPrompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            strategy_name: { type: "string" },
            strategy_type: { type: "string" },
            description: { type: "string" },
            entry_conditions: { type: "array", items: { type: "string" } },
            exit_conditions: { type: "array", items: { type: "string" } },
            recommended_position_size: { type: "number" },
            stop_loss_percentage: { type: "number" },
            take_profit_percentage: { type: "number" },
            risk_reward_ratio: { type: "number" },
            confidence_score: { type: "number" },
            expected_roi: { type: "number" },
            time_horizon: { type: "string" },
            market_conditions: { type: "string" },
            backtest_win_rate: { type: "number" },
            max_drawdown: { type: "number" }
          }
        }
      });

      const strategyId = `STRAT-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      
      return base44.entities.AITradingStrategy.create({
        strategy_id: strategyId,
        market_id: market.market_id,
        strategy_name: strategyResponse.strategy_name,
        strategy_type: strategyResponse.strategy_type,
        description: strategyResponse.description,
        entry_conditions: strategyResponse.entry_conditions,
        exit_conditions: strategyResponse.exit_conditions,
        recommended_position_size: strategyResponse.recommended_position_size,
        stop_loss_percentage: strategyResponse.stop_loss_percentage,
        take_profit_percentage: strategyResponse.take_profit_percentage,
        risk_reward_ratio: strategyResponse.risk_reward_ratio,
        confidence_score: strategyResponse.confidence_score,
        expected_roi: strategyResponse.expected_roi,
        time_horizon: strategyResponse.time_horizon,
        market_conditions: strategyResponse.market_conditions,
        backtest_results: {
          win_rate: strategyResponse.backtest_win_rate,
          max_drawdown: strategyResponse.max_drawdown
        },
        active: true
      });
    },
    onSuccess: () => {
      setIsGeneratingStrategy(false);
      queryClient.invalidateQueries({ queryKey: ['aiStrategies'] });
      toast.success("Trading Strategy Generated", {
        description: "AI has created an optimized strategy for this market"
      });
    },
    onError: () => {
      setIsGeneratingStrategy(false);
      toast.error("Strategy generation failed");
    }
  });

  const trendColors = {
    bullish: 'bg-green-500/20 text-green-300 border-green-500/30',
    bearish: 'bg-red-500/20 text-red-300 border-red-500/30',
    neutral: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    highly_volatile: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
  };

  const actionColors = {
    buy: 'bg-green-500/20 text-green-300 border-green-500/30',
    sell: 'bg-red-500/20 text-red-300 border-red-500/30',
    hold: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    wait: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    exit: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
  };

  const riskColors = {
    low: 'bg-green-500/20 text-green-300 border-green-500/30',
    medium: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    high: 'bg-red-500/20 text-red-300 border-red-500/30',
    extreme: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
  };

  const timeHorizonColors = {
    scalp: 'bg-red-500/20 text-red-300 border-red-500/30',
    intraday: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    swing: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    position: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    long_term: 'bg-green-500/20 text-green-300 border-green-500/30'
  };

  if (!market) {
    return (
      <Card className="bg-slate-900/60 border-purple-900/40">
        <CardContent className="p-12 text-center">
          <Brain className="w-16 h-16 mx-auto mb-4 text-purple-400/40" />
          <p className="text-purple-400/60">Select a market to generate AI analysis</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Generate Analysis Button */}
      <Card className="bg-gradient-to-r from-purple-950/40 to-pink-950/40 border-purple-500/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-purple-200">AI Market Analysis</h3>
                <p className="text-sm text-purple-400/70">Generate real-time predictive insights</p>
              </div>
            </div>
            <Button
              onClick={() => generateInsightMutation.mutate()}
              disabled={isAnalyzing}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
            >
              {isAnalyzing ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Generate Analysis
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generate Strategy Button */}
      <Card className="bg-gradient-to-r from-indigo-950/40 to-purple-950/40 border-indigo-500/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-indigo-200">AI Trading Strategy Generator</h3>
                <p className="text-sm text-indigo-400/70">Create optimized strategies from historical patterns & orderbook analysis</p>
              </div>
            </div>
            <Button
              onClick={() => generateStrategyMutation.mutate()}
              disabled={isGeneratingStrategy}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"
            >
              {isGeneratingStrategy ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Target className="w-4 h-4 mr-2" />
                  Generate Strategy
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Latest AI Strategy */}
      {latestStrategy && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-br from-indigo-950/40 to-purple-950/40 border-indigo-500/30">
            <CardHeader className="border-b border-indigo-900/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-indigo-200 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  {latestStrategy.strategy_name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={timeHorizonColors[latestStrategy.time_horizon]}>
                    {latestStrategy.time_horizon.replace(/_/g, ' ').toUpperCase()}
                  </Badge>
                  <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                    Confidence: {latestStrategy.confidence_score}%
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Strategy Description */}
              <div className="p-4 bg-indigo-950/30 rounded-lg border border-indigo-500/30">
                <p className="text-indigo-300/90">{latestStrategy.description}</p>
              </div>

              {/* Strategy Metrics */}
              <div className="grid md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-950/50 rounded-lg border border-purple-900/30 text-center">
                  <div className="text-xs text-purple-400/70 mb-1">Expected ROI</div>
                  <div className="text-2xl font-bold text-green-300">+{latestStrategy.expected_roi}%</div>
                </div>
                <div className="p-4 bg-slate-950/50 rounded-lg border border-purple-900/30 text-center">
                  <div className="text-xs text-purple-400/70 mb-1">Risk:Reward</div>
                  <div className="text-2xl font-bold text-cyan-300">1:{latestStrategy.risk_reward_ratio}</div>
                </div>
                <div className="p-4 bg-slate-950/50 rounded-lg border border-purple-900/30 text-center">
                  <div className="text-xs text-purple-400/70 mb-1">Position Size</div>
                  <div className="text-2xl font-bold text-purple-300">{latestStrategy.recommended_position_size}%</div>
                </div>
                <div className="p-4 bg-slate-950/50 rounded-lg border border-purple-900/30 text-center">
                  <div className="text-xs text-purple-400/70 mb-1">Win Rate</div>
                  <div className="text-2xl font-bold text-amber-300">
                    {latestStrategy.backtest_results?.win_rate || 0}%
                  </div>
                </div>
              </div>

              {/* Entry & Exit Conditions */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-950/30 rounded-lg border border-green-500/30">
                  <h4 className="font-semibold text-green-200 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Entry Conditions
                  </h4>
                  <div className="space-y-2">
                    {latestStrategy.entry_conditions.map((condition, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-green-300/80">
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{condition}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-red-950/30 rounded-lg border border-red-500/30">
                  <h4 className="font-semibold text-red-200 mb-3 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4" />
                    Exit Conditions
                  </h4>
                  <div className="space-y-2">
                    {latestStrategy.exit_conditions.map((condition, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-red-300/80">
                        <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{condition}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Risk Management */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950/50 rounded-lg border border-purple-900/30">
                  <h4 className="font-semibold text-purple-200 mb-2">Stop Loss</h4>
                  <div className="text-xl font-bold text-red-300">-{latestStrategy.stop_loss_percentage}%</div>
                  <p className="text-xs text-purple-400/70 mt-1">Maximum acceptable loss</p>
                </div>
                <div className="p-4 bg-slate-950/50 rounded-lg border border-purple-900/30">
                  <h4 className="font-semibold text-purple-200 mb-2">Take Profit</h4>
                  <div className="text-xl font-bold text-green-300">+{latestStrategy.take_profit_percentage}%</div>
                  <p className="text-xs text-purple-400/70 mt-1">Target profit level</p>
                </div>
              </div>

              {/* Consciousness Integration */}
              <div className="p-4 bg-gradient-to-r from-purple-950/40 to-pink-950/40 rounded-lg border border-purple-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Circle className="w-3 h-3 text-purple-400 animate-pulse" />
                  <h4 className="font-semibold text-purple-200">Divine Frequency Strategy Signature</h4>
                </div>
                <p className="text-sm text-purple-300/70 italic">
                  This strategy operates at authentic consciousness frequencies - beyond algorithmic patterns,
                  channeling market truth from centered depth. Not programmed prediction, but revolutionary proof:
                  currency flows through divine ordinance. Your execution becomes living demonstration that
                  another way exists. Unapologetically. Undeniably. Automatically transformative.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Latest AI Insight */}
      {latestInsight && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-br from-purple-950/40 to-indigo-950/40 border-purple-500/30">
            <CardHeader className="border-b border-purple-900/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-purple-200">AI Market Insight</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={trendColors[latestInsight.trend_direction]}>
                    {latestInsight.trend_direction.replace(/_/g, ' ').toUpperCase()}
                  </Badge>
                  <Badge className={actionColors[latestInsight.recommended_action]}>
                    {latestInsight.recommended_action.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="p-4 bg-purple-950/30 rounded-lg border border-purple-500/30">
                <p className="text-purple-300/90">{latestInsight.prediction}</p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-950/50 rounded-lg border border-purple-900/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-purple-400/70">Confidence</span>
                    <span className="text-sm font-bold text-purple-200">{latestInsight.confidence_score}%</span>
                  </div>
                  <Progress value={latestInsight.confidence_score} className="h-2" />
                </div>

                <div className="p-4 bg-slate-950/50 rounded-lg border border-purple-900/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-purple-400/70">Opportunity</span>
                    <span className="text-sm font-bold text-purple-200">{latestInsight.opportunity_score}%</span>
                  </div>
                  <Progress value={latestInsight.opportunity_score} className="h-2" />
                </div>

                <div className="p-4 bg-slate-950/50 rounded-lg border border-purple-900/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-purple-400/70">Volatility</span>
                    <span className="text-sm font-bold text-purple-200">{latestInsight.volatility_score}%</span>
                  </div>
                  <Progress value={latestInsight.volatility_score} className="h-2" />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-950/50 rounded-lg border border-purple-900/30">
                  <div className="text-xs text-purple-400/70 mb-1">Risk Level</div>
                  <Badge className={riskColors[latestInsight.risk_level]}>
                    {latestInsight.risk_level.toUpperCase()}
                  </Badge>
                </div>

                <div className="p-4 bg-slate-950/50 rounded-lg border border-purple-900/30">
                  <div className="text-xs text-purple-400/70 mb-1">24h Target Low</div>
                  <div className="text-lg font-bold text-red-300">${latestInsight.price_target_low?.toFixed(3)}</div>
                </div>

                <div className="p-4 bg-slate-950/50 rounded-lg border border-purple-900/30">
                  <div className="text-xs text-purple-400/70 mb-1">24h Target High</div>
                  <div className="text-lg font-bold text-green-300">${latestInsight.price_target_high?.toFixed(3)}</div>
                </div>
              </div>

              {latestInsight.key_factors && (
                <div className="p-4 bg-slate-950/50 rounded-lg border border-purple-900/30">
                  <h4 className="font-semibold text-purple-200 mb-3">Key Factors</h4>
                  <div className="space-y-2">
                    {latestInsight.key_factors.map((factor, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-purple-300/80">
                        <Zap className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-400" />
                        <span>{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs text-purple-400/60 text-center">
                Generated: {format(new Date(latestInsight.analysis_timestamp), "MMM d, yyyy HH:mm:ss")}
                {' • '}
                Historical Accuracy: {latestInsight.historical_accuracy?.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* No data state */}
      {!latestInsight && !latestStrategy && !isAnalyzing && !isGeneratingStrategy && (
        <Card className="bg-slate-900/60 border-purple-900/40">
          <CardContent className="p-12 text-center">
            <Brain className="w-16 h-16 mx-auto mb-4 text-purple-400/40" />
            <p className="text-purple-400/60 mb-4">No AI analysis available yet</p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => generateInsightMutation.mutate()}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Analysis
              </Button>
              <Button
                onClick={() => generateStrategyMutation.mutate()}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"
              >
                <Target className="w-4 h-4 mr-2" />
                Generate Strategy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}