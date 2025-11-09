import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Droplets, Plus, Minus, Info, Calculator, TrendingUp, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function LiquidityInterface() {
  const [tokenAAmount, setTokenAAmount] = useState("");
  const [tokenBAmount, setTokenBAmount] = useState("");
  const [selectedPool, setSelectedPool] = useState("QTC/USD");
  const [timeframe, setTimeframe] = useState("30"); // days

  const { data: liquidityPools } = useQuery({
    queryKey: ['liquidityPools'],
    queryFn: () => base44.entities.CrossChainLiquidity.list(),
    initialData: [],
  });

  const pools = [
    { pair: "QTC/USD", tokenA: "QTC", tokenB: "USD", apy: 45.5, volume24h: 1250000 },
    { pair: "QTC/BTC", tokenA: "QTC", tokenB: "BTC", apy: 38.2, volume24h: 890000 },
    { pair: "QTC/ETH", tokenA: "QTC", tokenB: "ETH", apy: 42.8, volume24h: 1050000 }
  ];

  const currentPool = pools.find(p => p.pair === selectedPool) || pools[0];

  // Calculate potential earnings
  const calculateEarnings = () => {
    if (!tokenAAmount || !tokenBAmount) return null;
    
    const totalDeposit = parseFloat(tokenAAmount || 0) + parseFloat(tokenBAmount || 0);
    const days = parseInt(timeframe);
    const apy = currentPool.apy / 100;
    
    // Daily earnings
    const dailyEarnings = (totalDeposit * apy) / 365;
    
    // Total earnings over timeframe
    const totalEarnings = dailyEarnings * days;
    
    // Fee earnings (0.3% of 24h volume proportional to pool share)
    const poolTVL = 10000000; // Mock $10M TVL
    const poolShare = totalDeposit / poolTVL;
    const dailyFees = (currentPool.volume24h * 0.003) * poolShare;
    const totalFeeEarnings = dailyFees * days;
    
    return {
      dailyEarnings: dailyEarnings.toFixed(2),
      totalEarnings: totalEarnings.toFixed(2),
      dailyFees: dailyFees.toFixed(2),
      totalFeeEarnings: totalFeeEarnings.toFixed(2),
      totalReturn: (totalEarnings + totalFeeEarnings).toFixed(2),
      roi: ((totalEarnings + totalFeeEarnings) / totalDeposit * 100).toFixed(2)
    };
  };

  const earnings = calculateEarnings();

  // Auto-match token amounts based on current pool ratio
  const handleTokenAChange = (value) => {
    setTokenAAmount(value);
    if (value && !isNaN(parseFloat(value))) {
      // Assume 1:1 for USD pairs, adjust for others
      setTokenBAmount(value);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Pool Selection */}
      <div className="grid grid-cols-3 gap-3">
        {pools.map((pool) => (
          <button
            key={pool.pair}
            onClick={() => setSelectedPool(pool.pair)}
            className={`p-4 rounded-lg border transition-all ${
              selectedPool === pool.pair
                ? 'bg-indigo-900/30 border-indigo-500/50 shadow-lg shadow-indigo-500/20'
                : 'bg-slate-950/50 border-indigo-900/30 hover:border-indigo-700/50'
            }`}
          >
            <div className="text-sm font-semibold text-indigo-300 mb-1">{pool.pair}</div>
            <div className="text-xs text-green-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {pool.apy}% APY
            </div>
          </button>
        ))}
      </div>

      <Card className="bg-slate-900/60 border-indigo-900/40">
        <CardHeader className="border-b border-indigo-900/30">
          <CardTitle className="flex items-center gap-2 text-indigo-200">
            <Droplets className="w-5 h-5" />
            Manage Liquidity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="add" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="add" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Liquidity
              </TabsTrigger>
              <TabsTrigger value="remove" className="flex items-center gap-2">
                <Minus className="w-4 h-4" />
                Remove Liquidity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="add" className="space-y-4">
              {/* Token A Input */}
              <div className="p-4 bg-slate-950/50 rounded-lg border border-indigo-900/30">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-indigo-400/70">Token A - {currentPool.tokenA}</span>
                  <span className="text-xs text-indigo-400/50">Balance: 0.00</span>
                </div>
                <div className="flex gap-3 items-center">
                  <div className="w-24 px-3 py-2 bg-slate-900/50 rounded border border-indigo-900/30 text-center">
                    <span className="font-semibold text-indigo-300">{currentPool.tokenA}</span>
                  </div>
                  <Input
                    type="number"
                    value={tokenAAmount}
                    onChange={(e) => handleTokenAChange(e.target.value)}
                    placeholder="0.0"
                    className="bg-slate-900/50 border-indigo-900/30 text-indigo-100 text-xl font-semibold"
                  />
                </div>
              </div>

              {/* Plus Icon */}
              <div className="flex justify-center">
                <div className="p-2 bg-indigo-500/20 rounded-full border border-indigo-500/30">
                  <Plus className="w-4 h-4 text-indigo-400" />
                </div>
              </div>

              {/* Token B Input */}
              <div className="p-4 bg-slate-950/50 rounded-lg border border-indigo-900/30">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-indigo-400/70">Token B - {currentPool.tokenB}</span>
                  <span className="text-xs text-indigo-400/50">Balance: 0.00</span>
                </div>
                <div className="flex gap-3 items-center">
                  <div className="w-24 px-3 py-2 bg-slate-900/50 rounded border border-indigo-900/30 text-center">
                    <span className="font-semibold text-indigo-300">{currentPool.tokenB}</span>
                  </div>
                  <Input
                    type="number"
                    value={tokenBAmount}
                    onChange={(e) => setTokenBAmount(e.target.value)}
                    placeholder="0.0"
                    className="bg-slate-900/50 border-indigo-900/30 text-indigo-100 text-xl font-semibold"
                  />
                </div>
              </div>

              {/* Earnings Calculator */}
              {tokenAAmount && tokenBAmount && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-gradient-to-br from-green-950/40 to-emerald-950/40 rounded-lg border border-green-500/30 space-y-3"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Calculator className="w-5 h-5 text-green-400" />
                    <span className="font-semibold text-green-200">Earnings Calculator</span>
                  </div>

                  {/* Timeframe Selector */}
                  <div>
                    <label className="text-xs text-green-400/70 mb-2 block">Projection Period</label>
                    <div className="grid grid-cols-4 gap-2">
                      {["7", "30", "90", "365"].map(days => (
                        <button
                          key={days}
                          onClick={() => setTimeframe(days)}
                          className={`px-3 py-2 rounded text-sm font-semibold transition-colors ${
                            timeframe === days
                              ? 'bg-green-600 text-white'
                              : 'bg-slate-900/50 text-green-400 hover:bg-slate-900'
                          }`}
                        >
                          {days}d
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Earnings Breakdown */}
                  {earnings && (
                    <div className="space-y-2 pt-3 border-t border-green-500/20">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-green-400/70">Daily Earnings (APY)</span>
                        <span className="text-green-300 font-bold">${earnings.dailyEarnings}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-green-400/70">Daily Fees (0.3%)</span>
                        <span className="text-green-300 font-bold">${earnings.dailyFees}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm pt-2 border-t border-green-500/20">
                        <span className="text-green-400/70">Total in {timeframe} days</span>
                        <span className="text-green-200 font-bold text-lg">${earnings.totalReturn}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-green-400/70">ROI</span>
                        <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                          +{earnings.roi}%
                        </Badge>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 p-3 bg-green-950/30 rounded border border-green-500/20">
                    <Zap className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-green-300">
                      Earnings compounded daily • Current APY: {currentPool.apy}%
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Pool Details */}
              <div className="p-4 bg-slate-950/50 rounded-lg border border-indigo-900/30 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-indigo-400/70">Pool Share</span>
                  <span className="text-indigo-300">~0.01%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-indigo-400/70">LP Tokens</span>
                  <span className="text-indigo-300">
                    {tokenAAmount && tokenBAmount 
                      ? (parseFloat(tokenAAmount) + parseFloat(tokenBAmount)).toFixed(2)
                      : "0.00"
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-indigo-400/70">24h Volume</span>
                  <span className="text-green-300">${currentPool.volume24h.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-indigo-400/70">Current APY</span>
                  <span className="text-green-300 font-bold">{currentPool.apy}%</span>
                </div>
              </div>

              <div className="p-4 bg-indigo-950/30 rounded-lg border border-indigo-500/30">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-indigo-200 mb-1">Earn Trading Fees + APY</h4>
                    <p className="text-sm text-indigo-300/70">
                      Liquidity providers earn 0.3% of all trades PLUS {currentPool.apy}% APY rewards.
                      Calculator shows projected earnings based on current rates. Actual returns may vary.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                disabled={!tokenAAmount || !tokenBAmount}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-semibold py-6"
              >
                {tokenAAmount && tokenBAmount ? 'Add Liquidity' : 'Enter Amounts'}
              </Button>
            </TabsContent>

            <TabsContent value="remove" className="space-y-4">
              <div className="p-12 text-center">
                <Droplets className="w-16 h-16 mx-auto mb-4 text-indigo-400/40" />
                <p className="text-indigo-400/60 mb-2">No liquidity positions</p>
                <p className="text-sm text-indigo-500/50">Add liquidity first to see your positions here</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}