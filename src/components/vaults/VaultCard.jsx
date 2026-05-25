import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Zap, Shield, AlertTriangle, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

const riskColor = {
  low: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
  medium: "text-yellow-400 border-yellow-500/40 bg-yellow-500/10",
  high: "text-red-400 border-red-500/40 bg-red-500/10",
};

export default function VaultCard({ vault, user, userBalance }) {
  const [expanded, setExpanded] = useState(false);
  const [depositAmt, setDepositAmt] = useState("");
  const [withdrawAmt, setWithdrawAmt] = useState("");
  const qc = useQueryClient();

  const deposit = useMutation({
    mutationFn: async () => {
      const amt = parseFloat(depositAmt);
      if (!amt || amt <= 0) throw new Error("Enter a valid amount");
      if (amt > (userBalance?.available_balance || 0)) throw new Error("Insufficient balance");
      // YieldStake entity requires: farm_name, staker_email, lp_tokens_staked
      await base44.entities.YieldStake.create({
        farm_name: vault.name,
        staker_email: user.email,
        lp_tokens_staked: amt,
        stake_date: new Date().toISOString(),
        is_active: true,
        rewards_earned: 0,
        unclaimed_rewards: 0,
      });
      await base44.entities.UserBalance.filter({ user_email: user.email }).then(async (bs) => {
        if (bs[0]) await base44.entities.UserBalance.update(bs[0].id, {
          available_balance: (bs[0].available_balance || 0) - amt,
          staked_balance: (bs[0].staked_balance || 0) + amt,
        });
      });
    },
    onSuccess: () => {
      qc.invalidateQueries(["userBalance"]);
      qc.invalidateQueries(["yieldStakes"]);
      setDepositAmt("");
      toast({ title: "Deposited", description: `${depositAmt} QTC deposited into ${vault.name}` });
    },
    onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const available = userBalance?.available_balance || 0;

  return (
    <Card className="bg-slate-900/60 border-purple-900/40 hover:border-purple-600/40 transition-all">
      <CardHeader
        className="cursor-pointer select-none"
        onClick={() => setExpanded((p) => !p)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge className={`text-xs border ${riskColor[vault.risk]}`}>{vault.risk} risk</Badge>
              {vault.auto_compound && (
                <Badge className="text-xs bg-purple-900/40 text-purple-300 border border-purple-600/40">
                  <RefreshCw className="w-3 h-3 mr-1" /> Auto-compound
                </Badge>
              )}
            </div>
            <CardTitle className="text-purple-100 text-base">{vault.name}</CardTitle>
            <p className="text-xs text-purple-400/60 mt-1">{vault.strategy}</p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-2xl font-bold text-emerald-300">{vault.current_apy.toFixed(1)}%</div>
            <div className="text-xs text-emerald-500/70">APY</div>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-purple-400 mt-1" /> : <ChevronDown className="w-4 h-4 text-purple-400 mt-1" />}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mt-3">
          <div>
            <div className="text-xs text-purple-400/60">TVL</div>
            <div className="text-sm font-semibold text-purple-200">{(vault.tvl / 1000).toFixed(0)}K QTC</div>
          </div>
          <div>
            <div className="text-xs text-purple-400/60">Oracle Node</div>
            <div className="text-sm font-semibold text-purple-200">{vault.oracle_node}</div>
          </div>
          <div>
            <div className="text-xs text-purple-400/60">Capacity</div>
            <Progress value={vault.capacity_pct} className="h-1.5 mt-1.5 bg-slate-800" />
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0 space-y-4 border-t border-purple-900/30 mt-2">
          {/* Performance bars */}
          <div className="space-y-1.5">
            {vault.history.map((h) => (
              <div key={h.period} className="flex items-center justify-between text-xs">
                <span className="text-purple-400/70 w-12">{h.period}</span>
                <Progress value={Math.min(h.return_pct * 5, 100)} className="h-1 flex-1 mx-3 bg-slate-800" />
                <span className="text-emerald-400 w-14 text-right">+{h.return_pct.toFixed(2)}%</span>
              </div>
            ))}
          </div>

          {/* Deposit / Withdraw */}
          {user && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-purple-400/60 mb-1">Deposit QTC <span className="text-purple-500/50">(avail: {available.toLocaleString()})</span></div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={depositAmt}
                    onChange={(e) => setDepositAmt(e.target.value)}
                    className="h-8 text-sm bg-slate-800 border-purple-800/50 text-purple-100"
                  />
                  <Button size="sm" className="bg-emerald-700 hover:bg-emerald-600 shrink-0" onClick={() => deposit.mutate()} disabled={deposit.isPending}>
                    <Zap className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <div>
                <div className="text-xs text-purple-400/60 mb-1">Withdraw QTC</div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={withdrawAmt}
                    onChange={(e) => setWithdrawAmt(e.target.value)}
                    className="h-8 text-sm bg-slate-800 border-purple-800/50 text-purple-100"
                  />
                  <Button size="sm" variant="outline" className="border-red-800/50 text-red-400 hover:bg-red-900/20 shrink-0">
                    <Shield className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="text-xs text-purple-400/50 italic">{vault.description}</div>
        </CardContent>
      )}
    </Card>
  );
}