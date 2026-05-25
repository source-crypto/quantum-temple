import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Users, TrendingUp, RefreshCw, Zap, ChevronDown, ChevronUp, Star } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

const riskColor = {
  low: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
  medium: "text-yellow-400 border-yellow-500/40 bg-yellow-500/10",
  high: "text-red-400 border-red-500/40 bg-red-500/10",
};

export default function StrategyVaultCard({ vault, user, userBalance, isFollowing }) {
  const [expanded, setExpanded] = useState(false);
  const [amount, setAmount] = useState("");
  const qc = useQueryClient();

  const follow = useMutation({
    mutationFn: async () => {
      const amt = parseFloat(amount);
      if (!amt || amt <= 0) throw new Error("Enter a valid amount");
      if (amt > (userBalance?.available_balance || 0)) throw new Error("Insufficient balance");

      const fee = amt * ((vault.performance_fee_pct || 10) / 100);
      const net = amt - fee;

      await base44.entities.StrategyFollow.create({
        strategy_vault_id: vault.id,
        follower_email: user.email,
        deposited_amount: net,
        fee_paid_total: fee,
        entry_apy: vault.current_apy,
        status: "active",
        followed_at: new Date().toISOString(),
      });

      // Record as YieldStake using correct required fields
      await base44.entities.YieldStake.create({
        farm_name: vault.name,
        staker_email: user.email,
        lp_tokens_staked: net,
        stake_date: new Date().toISOString(),
        is_active: true,
        rewards_earned: 0,
        unclaimed_rewards: 0,
      });

      const bs = await base44.entities.UserBalance.filter({ user_email: user.email });
      if (bs[0]) {
        await base44.entities.UserBalance.update(bs[0].id, {
          available_balance: (bs[0].available_balance || 0) - amt,
          staked_balance: (bs[0].staked_balance || 0) + net,
        });
      }

      await base44.entities.StrategyVault.update(vault.id, {
        followers_count: (vault.followers_count || 0) + 1,
        total_tvl: (vault.total_tvl || 0) + net,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries(["strategyVaults"]);
      qc.invalidateQueries(["strategyFollows"]);
      qc.invalidateQueries(["userBalance"]);
      setAmount("");
      toast({ title: "Following strategy!", description: `Deposited into ${vault.name}. ${vault.performance_fee_pct}% performance fee applied.` });
    },
    onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const isOwner = user?.email === vault.creator_email;
  const allocations = vault.oracle_allocations || [];

  return (
    <Card className="bg-slate-900/60 border-cyan-900/40 hover:border-cyan-600/40 transition-all">
      <CardHeader className="cursor-pointer select-none pb-3" onClick={() => setExpanded((p) => !p)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge className={`text-xs border ${riskColor[vault.risk_level]}`}>{vault.risk_level} risk</Badge>
              {vault.auto_compound && (
                <Badge className="text-xs bg-purple-900/40 text-purple-300 border border-purple-600/40">
                  <RefreshCw className="w-3 h-3 mr-1" /> Auto
                </Badge>
              )}
              {isOwner && <Badge className="text-xs bg-amber-900/40 text-amber-300 border border-amber-600/40"><Star className="w-3 h-3 mr-1" />Your Vault</Badge>}
              {isFollowing && !isOwner && <Badge className="text-xs bg-emerald-900/40 text-emerald-300 border border-emerald-600/40">Following</Badge>}
            </div>
            <div className="text-purple-100 font-semibold text-base truncate">{vault.name}</div>
            <div className="text-xs text-cyan-400/70 mt-0.5">by {vault.creator_display || vault.creator_email}</div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-2xl font-bold text-emerald-300">{(vault.current_apy || 0).toFixed(1)}%</div>
            <div className="text-xs text-emerald-500/70">APY</div>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-purple-400 mt-1" /> : <ChevronDown className="w-4 h-4 text-purple-400 mt-1" />}
        </div>

        <div className="grid grid-cols-3 gap-3 mt-2">
          <div>
            <div className="text-xs text-purple-400/60">Followers</div>
            <div className="text-sm font-semibold text-purple-200 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-cyan-400" />{vault.followers_count || 0}
            </div>
          </div>
          <div>
            <div className="text-xs text-purple-400/60">TVL</div>
            <div className="text-sm font-semibold text-purple-200">{((vault.total_tvl || 0) / 1000).toFixed(1)}K QTC</div>
          </div>
          <div>
            <div className="text-xs text-purple-400/60">Perf. Fee</div>
            <div className="text-sm font-semibold text-amber-300">{vault.performance_fee_pct || 10}%</div>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0 border-t border-cyan-900/30 space-y-4">
          {vault.description && (
            <p className="text-xs text-purple-400/70 italic">{vault.description}</p>
          )}

          {/* Oracle allocations */}
          {allocations.length > 0 && (
            <div>
              <div className="text-xs text-purple-400/60 mb-2">Oracle Allocations</div>
              <div className="space-y-1.5">
                {allocations.map((a, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="text-purple-300 w-28 shrink-0">{a.oracle_node}</span>
                    <Progress value={Number(a.weight_pct)} className="flex-1 h-1.5 bg-slate-800" />
                    <span className="text-cyan-400 w-10 text-right">{a.weight_pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Follow / deposit */}
          {user && !isOwner && (
            <div>
              <div className="text-xs text-purple-400/60 mb-1">
                Follow & Deposit QTC <span className="text-purple-500/50">(avail: {(userBalance?.available_balance || 0).toLocaleString()})</span>
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-8 text-sm bg-slate-800 border-cyan-800/50 text-purple-100"
                />
                <Button size="sm" className="bg-cyan-700 hover:bg-cyan-600 shrink-0" onClick={() => follow.mutate()} disabled={follow.isPending}>
                  <Zap className="w-3.5 h-3.5 mr-1" /> Follow
                </Button>
              </div>
              {amount && (
                <div className="text-xs text-amber-400/80 mt-1">
                  {vault.performance_fee_pct}% fee = {(parseFloat(amount || 0) * (vault.performance_fee_pct / 100)).toFixed(2)} QTC
                </div>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}