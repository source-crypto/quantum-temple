import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Droplets, Coins, Lock, Info } from "lucide-react";

export default function YieldFarming() {
  const mockFarms = [
    {
      name: "QTC/USD Pool",
      tvl: "$0.00",
      apr: "0.00%",
      earned: "0.00 QTC",
      staked: "0.00 LP",
      multiplier: "2x"
    },
    {
      name: "QTC/BTC Pool",
      tvl: "$0.00",
      apr: "0.00%",
      earned: "0.00 QTC",
      staked: "0.00 LP",
      multiplier: "3x"
    },
    {
      name: "QTC/ETH Pool",
      tvl: "$0.00",
      apr: "0.00%",
      earned: "0.00 QTC",
      staked: "0.00 LP",
      multiplier: "2.5x"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="p-4 bg-green-950/30 rounded-lg border border-green-500/30">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-green-200 mb-1">Stake LP Tokens, Earn QTC</h4>
            <p className="text-sm text-green-300/70">
              Provide liquidity to pools, then stake your LP tokens here to earn additional QTC rewards.
              Different pools have different reward multipliers based on strategic importance.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {mockFarms.map((farm, index) => (
          <Card key={index} className="bg-slate-900/60 border-green-900/40 hover:border-green-500/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-green-200">{farm.name}</h3>
                    <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                      {farm.multiplier}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-green-400/70">
                    <div className="flex items-center gap-1">
                      <Droplets className="w-3 h-3" />
                      <span>TVL: {farm.tvl}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>APR: <span className="text-green-300 font-semibold">{farm.apr}</span></span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-green-400/70 mb-1">Earned</div>
                  <div className="text-xl font-bold text-green-300">{farm.earned}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="p-3 bg-slate-950/50 rounded border border-green-900/30">
                  <div className="text-xs text-green-400/70 mb-1">Staked</div>
                  <div className="font-semibold text-green-200">{farm.staked}</div>
                </div>
                <div className="p-3 bg-slate-950/50 rounded border border-green-900/30">
                  <div className="text-xs text-green-400/70 mb-1">Your Share</div>
                  <div className="font-semibold text-green-200">0.00%</div>
                </div>
                <div className="p-3 bg-slate-950/50 rounded border border-green-900/30">
                  <div className="text-xs text-green-400/70 mb-1">Lock Period</div>
                  <div className="font-semibold text-green-200 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    0 days
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  disabled
                  variant="outline"
                  className="border-green-500/30 text-green-300 opacity-50 cursor-not-allowed"
                >
                  Stake LP
                </Button>
                <Button
                  disabled
                  className="bg-gradient-to-r from-green-600 to-emerald-600 opacity-50 cursor-not-allowed"
                >
                  <Coins className="w-4 h-4 mr-2" />
                  Claim Rewards
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-to-br from-amber-950/40 to-orange-950/40 border-amber-500/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-200 mb-2">Maximize Your Yields</h3>
              <p className="text-sm text-amber-300/70 mb-3">
                Yield farming allows you to earn additional QTC rewards on top of trading fees. 
                Higher multiplier pools offer greater rewards but may have lock-up periods.
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                  <span className="text-amber-300/80">Stake LP tokens</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                  <span className="text-amber-300/80">Earn QTC rewards</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                  <span className="text-amber-300/80">Multiplier bonuses</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                  <span className="text-amber-300/80">Claim anytime</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}