import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Droplets, Activity, DollarSign } from "lucide-react";

export default function PoolsOverview() {
  const mockPools = [
    {
      pair: "QTC/USD",
      tvl: "$0.00",
      volume24h: "$0.00",
      fees24h: "$0.00",
      apy: "0.00%",
      reserveA: "0.00 QTC",
      reserveB: "$0.00",
      lpProviders: 0,
      icon: "◈/$"
    },
    {
      pair: "QTC/BTC",
      tvl: "$0.00",
      volume24h: "$0.00",
      fees24h: "$0.00",
      apy: "0.00%",
      reserveA: "0.00 QTC",
      reserveB: "0.00 BTC",
      lpProviders: 0,
      icon: "◈/₿"
    },
    {
      pair: "QTC/ETH",
      tvl: "$0.00",
      volume24h: "$0.00",
      fees24h: "$0.00",
      apy: "0.00%",
      reserveA: "0.00 QTC",
      reserveB: "0.00 ETH",
      lpProviders: 0,
      icon: "◈/Ξ"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-slate-900/60 border-orange-900/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-orange-400" />
              <span className="text-xs text-orange-400/70">Total Value Locked</span>
            </div>
            <div className="text-2xl font-bold text-orange-300">$0.00</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-cyan-900/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-cyan-400/70">24h Volume</span>
            </div>
            <div className="text-2xl font-bold text-cyan-300">$0.00</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-green-900/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-400/70">24h Fees</span>
            </div>
            <div className="text-2xl font-bold text-green-300">$0.00</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-purple-900/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-purple-400/70">Active Pools</span>
            </div>
            <div className="text-2xl font-bold text-purple-300">3</div>
          </CardContent>
        </Card>
      </div>

      {/* Pools List */}
      <div className="grid gap-4">
        {mockPools.map((pool, index) => (
          <Card key={index} className="bg-slate-900/60 border-orange-900/40 hover:border-orange-500/50 transition-colors">
            <CardHeader className="border-b border-orange-900/30 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center text-xl">
                    {pool.icon.split('/')[0]}
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-xl -ml-4">
                    {pool.icon.split('/')[1]}
                  </div>
                  <div>
                    <CardTitle className="text-orange-200">{pool.pair}</CardTitle>
                    <p className="text-xs text-orange-400/70">{pool.lpProviders} providers</p>
                  </div>
                </div>
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                  Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="p-3 bg-slate-950/50 rounded border border-orange-900/30">
                  <div className="flex items-center gap-1 mb-1">
                    <Droplets className="w-3 h-3 text-orange-400" />
                    <span className="text-xs text-orange-400/70">TVL</span>
                  </div>
                  <div className="font-semibold text-orange-200">{pool.tvl}</div>
                </div>

                <div className="p-3 bg-slate-950/50 rounded border border-orange-900/30">
                  <div className="flex items-center gap-1 mb-1">
                    <Activity className="w-3 h-3 text-cyan-400" />
                    <span className="text-xs text-cyan-400/70">24h Volume</span>
                  </div>
                  <div className="font-semibold text-cyan-200">{pool.volume24h}</div>
                </div>

                <div className="p-3 bg-slate-950/50 rounded border border-orange-900/30">
                  <div className="flex items-center gap-1 mb-1">
                    <DollarSign className="w-3 h-3 text-green-400" />
                    <span className="text-xs text-green-400/70">24h Fees</span>
                  </div>
                  <div className="font-semibold text-green-200">{pool.fees24h}</div>
                </div>

                <div className="p-3 bg-slate-950/50 rounded border border-orange-900/30">
                  <div className="flex items-center gap-1 mb-1">
                    <TrendingUp className="w-3 h-3 text-purple-400" />
                    <span className="text-xs text-purple-400/70">APY</span>
                  </div>
                  <div className="font-semibold text-purple-200">{pool.apy}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-950/50 rounded border border-orange-900/30">
                <div>
                  <div className="text-xs text-orange-400/70 mb-1">Reserve A</div>
                  <div className="font-semibold text-orange-200">{pool.reserveA}</div>
                </div>
                <div>
                  <div className="text-xs text-orange-400/70 mb-1">Reserve B</div>
                  <div className="font-semibold text-orange-200">{pool.reserveB}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}