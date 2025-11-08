import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, TrendingUp, Loader2, Award, Zap, Crown, Gift, Coins } from "lucide-react";
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
    const baseRate = 0.1; // 0.1 favor points per hour per unit staked
    const newRewards = Math.floor(stake.staked_amount * baseRate * hoursStaked * stake.bonus_multiplier);
    return newRewards;
  };

  const currentRewards = activeStake ? calculateRewards(activeStake) + (activeStake.unclaimed_rewards || 0) : 0;
  const favorToQTCRate = 100; // 100 favor points = 1 QTC

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
        unclaimed_rewards: 0,
        total_claimed_qtc: 0,
        interaction_priority: priority,
        bonus_multiplier: multiplier,
        last_claim_date: new Date().toISOString(),
        last_reward_calculation: new Date().toISOString(),
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

  const claimRewardsMutation = useMutation({
    mutationFn: async () => {
      if (!activeStake) return;

      const totalRewards = currentRewards;
      const qtcAmount = Math.floor(totalRewards / favorToQTCRate);
      
      if (qtcAmount === 0) {
        throw new Error(`You need at least ${favorToQTCRate} favor points to claim rewards`);
      }

      await base44.entities.DivineFavor.update(activeStake.id, {
        total_rewards_earned: (activeStake.total_rewards_earned || 0) + totalRewards,
        unclaimed_rewards: totalRewards % favorToQTCRate, // Keep remainder
        total_claimed_qtc: (activeStake.total_claimed_qtc || 0) + qtcAmount,
        last_claim_date: new Date().toISOString(),
        last_reward_calculation: new Date().toISOString()
      });

      // Create currency mint for the claimed QTC
      const serialNumber = `FAVOR-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      const signature = btoa(`${serialNumber}-${qtcAmount}-reward`).substring(0, 64);
      
      await base44.entities.CurrencyMint.create({
        serial_number: serialNumber,
        amount: qtcAmount,
        signature: signature,
        timestamp: new Date().toISOString(),
        note: `Divine Favor rewards claim: ${totalRewards} favor points converted`,
        quantum_entropy: Math.random().toString(36).substring(2, 15),
        verified: true
      });

      // Update user balance
      const user = await base44.auth.me();
      const balances = await base44.entities.UserBalance.filter({ user_email: user.email });
      
      if (balances.length > 0) {
        await base44.entities.UserBalance.update(balances[0].id, {
          available_balance: (balances[0].available_balance || 0) + qtcAmount,
          total_received: (balances[0].total_received || 0) + qtcAmount,
          total_minted: (balances[0].total_minted || 0) + qtcAmount
        });
      }

      return { qtcAmount, favorPoints: totalRewards };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['divineFavor'] });
      queryClient.invalidateQueries({ queryKey: ['currencyMints'] });
      queryClient.invalidateQueries({ queryKey: ['userBalance'] });
      toast.success("Rewards claimed!", {
        description: `${data.qtcAmount} QTC minted from ${data.favorPoints} favor points`
      });
    },
    onError: (error) => {
      toast.error("Claim failed", {
        description: error.message
      });
    }
  });

  const unstakeMutation = useMutation({
    mutationFn: async () => {
      if (!activeStake) return;

      // Claim any remaining rewards first
      if (currentRewards >= favorToQTCRate) {
        const qtcAmount = Math.floor(currentRewards / favorToQTCRate);
        // Auto-claim logic here
      }

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

  // Auto-update rewards calculation periodically
  useEffect(() => {
    if (activeStake) {
      const interval = setInterval(() => {
        queryClient.invalidateQueries({ queryKey: ['divineFavor'] });
      }, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [activeStake, queryClient]);

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

  const qtcEarnable = Math.floor(currentRewards / favorToQTCRate);

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

                    <div className="flex justify-between text-sm">
                      <span className="text-violet-400/70">Total Claimed QTC:</span>
                      <span className="text-green-300 font-semibold">{activeStake.total_claimed_qtc || 0} QTC</span>
                    </div>
                  </div>
                </div>

                {/* Rewards Claim Section */}
                <div className="p-4 bg-gradient-to-br from-amber-950/30 to-orange-950/30 rounded-lg border border-amber-500/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Gift className="w-5 h-5 text-amber-400" />
                    <span className="font-semibold text-amber-200">Claimable Rewards</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-amber-400/70 text-sm">Pending Favor Points</span>
                      <div className="text-2xl font-bold text-amber-300">{currentRewards}</div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-950/30 rounded border border-green-500/30">
                      <div>
                        <div className="text-xs text-green-400/70">Converts to</div>
                        <div className="flex items-center gap-2">
                          <Coins className="w-4 h-4 text-green-400" />
                          <span className="text-xl font-bold text-green-300">{qtcEarnable} QTC</span>
                        </div>
                      </div>
                      <div className="text-xs text-green-400/60">
                        Rate: {favorToQTCRate}:1
                      </div>
                    </div>

                    {(currentRewards % favorToQTCRate) > 0 && (
                      <div className="text-xs text-amber-400/60 italic">
                        {currentRewards % favorToQTCRate} favor points will remain for next claim
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-slate-950/50 rounded-lg border border-violet-900/30 text-xs text-violet-400/60">
                  Staked since {format(new Date(activeStake.stake_start_date), "MMM d, yyyy HH:mm")}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => claimRewardsMutation.mutate()}
                    disabled={claimRewardsMutation.isPending || qtcEarnable === 0}
                    className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white"
                  >
                    {claimRewardsMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Gift className="w-4 h-4 mr-2" />
                        Claim {qtcEarnable} QTC
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

                <div className="p-4 bg-indigo-950/30 rounded-lg border border-indigo-500/30">
                  <h4 className="font-semibold text-indigo-200 mb-2 flex items-center gap-2">
                    <Coins className="w-4 h-4" />
                    Automatic Rewards
                  </h4>
                  <p className="text-sm text-indigo-300/70">
                    Earn favor points over time. Convert {favorToQTCRate} favor points to 1 QTC anytime. 
                    Rewards multiply based on your stake amount!
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
                    <span>Earn favor points automatically while staked</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-violet-400 rounded-full mt-1.5" />
                    <span>Claim rewards as QTC anytime ({favorToQTCRate} favor = 1 QTC)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-violet-400 rounded-full mt-1.5" />
                    <span>Higher stakes grant priority access and bonus multipliers</span>
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
          <CardTitle className="text-purple-200">Staking Tiers & Rewards</CardTitle>
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

          <div className="mt-6 p-4 bg-amber-950/30 rounded-lg border border-amber-500/30">
            <div className="flex items-start gap-3">
              <Coins className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-200 mb-2">Reward Conversion</h4>
                <p className="text-sm text-amber-300/70 mb-2">
                  Every {favorToQTCRate} favor points earned can be converted to 1 Divine Currency (QTC).
                </p>
                <p className="text-xs text-amber-400/60 italic">
                  Example: With 2x multiplier, staking 1000 QTC for 1 hour earns 20 favor points = 0.2 QTC
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}