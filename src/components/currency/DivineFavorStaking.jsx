import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, TrendingUp, Loader2, Award, Zap, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format, differenceInHours } from "date-fns";

export default function DivineFavorStaking({ totalSupply }) {
  const [stakeAmount, setStakeAmount] = useState("");
  const queryClient = useQueryClient();

  const { data: userStakes, isLoading } = useQuery({
    queryKey: ['divineFavor'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.DivineFavor.filter({ created_by: user.email, is_active: true });
    },
    initialData: [],
  });

  const activeStake = userStakes.length > 0 ? userStakes[0] : null;

  const calculateRewards = (stake) => {
    if (!stake) return 0;
    const hoursStaked = differenceInHours(new Date(), new Date(stake.stake_start_date));
    const baseRate = 0.1;
    return Math.floor(stake.staked_amount * baseRate * hoursStaked * stake.bonus_multiplier);
  };

  const currentRewards = activeStake ? calculateRewards(activeStake) : 0;

  const stakeMutation = useMutation({
    mutationFn: async (amount) => {
      if (activeStake) {
        throw new Error("You already have an active stake. Claim or unstake first.");
      }

      const multiplier = amount >= 10000 ? 3.0 : amount >= 5000 ? 2.0 : amount >= 1000 ? 1.5 : 1.0;
      const priority = amount >= 10000 ? "divine" : amount >= 5000 ? "exalted" : amount >= 1000 ? "blessed" : "mortal";

      return base44.entities.DivineFavor.create({
        staked_amount: amount,
        favor_level: Math.min(Math.floor(amount / 100), 100),
        stake_start_date: new Date().toISOString(),
        total_rewards_earned: 0,
        interaction_priority: priority,
        bonus_multiplier: multiplier,
        last_claim_date: new Date().toISOString(),
        is_active: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['divineFavor'] });
      setStakeAmount("");
      toast.success("Stake activated!", {
        description: "Divine favor is now accumulating"
      });
    },
    onError: (error) => {
      toast.error("Staking failed", {
        description: error.message
      });
    }
  });

  const claimMutation = useMutation({
    mutationFn: async () => {
      if (!activeStake) return;

      const rewards = calculateRewards(activeStake);
      
      await base44.entities.DivineFavor.update(activeStake.id, {
        total_rewards_earned: (activeStake.total_rewards_earned || 0) + rewards,
        last_claim_date: new Date().toISOString()
      });

      return rewards;
    },
    onSuccess: (rewards) => {
      queryClient.invalidateQueries({ queryKey: ['divineFavor'] });
      toast.success("Rewards claimed!", {
        description: `${rewards} favor points added to your total`
      });
    }
  });

  const unstakeMutation = useMutation({
    mutationFn: async () => {
      if (!activeStake) return;

      await base44.entities.DivineFavor.update(activeStake.id, {
        is_active: false
      });

      return activeStake.staked_amount;
    },
    onSuccess: (amount) => {
      queryClient.invalidateQueries({ queryKey: ['divineFavor'] });
      toast.success("Stake withdrawn!", {
        description: `${amount.toLocaleString()} currency returned to your balance`
      });
    }
  });

  const handleStake = () => {
    const amt = parseFloat(stakeAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Invalid amount");
      return;
    }
    if (amt > totalSupply) {
      toast.error("Insufficient currency");
      return;
    }

    stakeMutation.mutate(amt);
  };

  const priorityInfo = {
    mortal: { color: "text-gray-400", bg: "bg-gray-500/20", border: "border-gray-500/30", icon: Star },
    blessed: { color: "text-blue-400", bg: "bg-blue-500/20", border: "border-blue-500/30", icon: Award },
    exalted: { color: "text-purple-400", bg: "bg-purple-500/20", border: "border-purple-500/30", icon: Zap },
    divine: { color: "text-amber-400", bg: "bg-amber-500/20", border: "border-amber-500/30", icon: Crown }
  };

  const stakingTiers = [
    { min: 1, max: 999, priority: "mortal", multiplier: "1x", benefits: ["Standard interaction access"] },
    { min: 1000, max: 4999, priority: "blessed", multiplier: "1.5x", benefits: ["Priority queue", "1.5x rewards"] },
    { min: 5000, max: 9999, priority: "exalted", multiplier: "2x", benefits: ["High priority", "2x rewards", "Special insights"] },
    { min: 10000, max: Infinity, priority: "divine", multiplier: "3x", benefits: ["Highest priority", "3x rewards", "Direct VQC communion"] }
  ];

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Staking Interface */}
      <div className="space-y-6">
        <Card className="bg-slate-900/60 border-violet-900/40 backdrop-blur-sm">
          <CardHeader className="border-b border-violet-900/30">
            <CardTitle className="flex items-center gap-2 text-violet-200">
              <Star className="w-5 h-5" />
              Divine Favor Staking
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {activeStake ? (
              <>
                <div className="p-4 bg-gradient-to-br from-violet-950/40 to-purple-950/40 rounded-lg border border-violet-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-sm text-violet-400/70 mb-1">Staked Amount</div>
                      <div className="text-2xl font-bold text-violet-200">
                        {activeStake.staked_amount.toLocaleString()}
                      </div>
                    </div>
                    <Badge className={`${priorityInfo[activeStake.interaction_priority].bg} ${priorityInfo[activeStake.interaction_priority].border} ${priorityInfo[activeStake.interaction_priority].color} capitalize`}>
                      {activeStake.interaction_priority}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-violet-400/70">Favor Level</span>
                        <span className="text-violet-200 font-semibold">{activeStake.favor_level}/100</span>
                      </div>
                      <Progress value={activeStake.favor_level} className="h-2" />
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-violet-400/70">Reward Multiplier:</span>
                      <span className="text-violet-200 font-semibold">{activeStake.bonus_multiplier}x</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-violet-400/70">Total Earned:</span>
                      <span className="text-amber-300 font-semibold">{activeStake.total_rewards_earned || 0} favor</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/50 rounded-lg border border-violet-900/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-violet-400/70 text-sm">Pending Rewards</span>
                    <div className="text-2xl font-bold text-amber-300">{currentRewards}</div>
                  </div>
                  <p className="text-xs text-violet-500/60">
                    Staked since {format(new Date(activeStake.stake_start_date), "MMM d, yyyy HH:mm")}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => claimMutation.mutate()}
                    disabled={claimMutation.isPending || currentRewards === 0}
                    className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white"
                  >
                    {claimMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Claim Rewards
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => unstakeMutation.mutate()}
                    disabled={unstakeMutation.isPending}
                    variant="outline"
                    className="border-violet-500/30 text-violet-300 hover:bg-violet-900/20"
                  >
                    {unstakeMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Unstake"
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="stake-amount" className="text-purple-300">
                    Amount to Stake
                  </Label>
                  <div className="relative">
                    <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-violet-500" />
                    <Input
                      id="stake-amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      placeholder="Enter amount to stake..."
                      className="pl-10 bg-slate-950/50 border-purple-900/30 text-purple-100"
                    />
                  </div>
                  <p className="text-xs text-purple-400/60">
                    Available: {totalSupply.toLocaleString()} divine currency
                  </p>
                </div>

                <Button
                  onClick={handleStake}
                  disabled={stakeMutation.isPending || !stakeAmount}
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold py-6"
                >
                  {stakeMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Staking...
                    </>
                  ) : (
                    <>
                      <Star className="w-5 h-5 mr-2" />
                      Stake for Divine Favor
                    </>
                  )}
                </Button>

                <div className="text-xs text-purple-400/60 space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-violet-400 rounded-full mt-1.5" />
                    <span>Earn favor points over time based on stake amount</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-violet-400 rounded-full mt-1.5" />
                    <span>Higher stakes grant priority access to temple interactions</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-violet-400 rounded-full mt-1.5" />
                    <span>Unstake anytime to return currency to your balance</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Staking Tiers */}
      <Card className="bg-slate-900/60 border-purple-900/40 backdrop-blur-sm">
        <CardHeader className="border-b border-purple-900/30">
          <CardTitle className="text-purple-200">Staking Tiers</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {stakingTiers.map((tier, index) => {
            const info = priorityInfo[tier.priority];
            const Icon = info.icon;
            
            return (
              <motion.div
                key={tier.priority}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${info.border} ${info.bg} ${
                  activeStake?.interaction_priority === tier.priority ? 'ring-2 ring-violet-400' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${info.bg} border ${info.border} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${info.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-semibold capitalize ${info.color}`}>{tier.priority}</h3>
                      <Badge variant="outline" className={`${info.border} ${info.color} text-xs`}>
                        {tier.multiplier}
                      </Badge>
                    </div>
                    <div className="text-sm text-purple-400/70 mb-2">
                      Stake: {tier.min.toLocaleString()} - {tier.max === Infinity ? '∞' : tier.max.toLocaleString()}
                    </div>
                    <div className="space-y-1">
                      {tier.benefits.map((benefit, i) => (
                        <div key={i} className="text-xs text-purple-300/80 flex items-center gap-2">
                          <div className={`w-1 h-1 rounded-full ${info.color}`} />
                          {benefit}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}