import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Lock, 
  Unlock,
  Clock,
  DollarSign,
  Award,
  Info,
  Calendar,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { format, addDays, differenceInDays } from "date-fns";

export default function YieldFarming() {
  const [userAddress, setUserAddress] = useState("user@example.com");

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  // Mock farm data with detailed stats
  const farms = [
    {
      name: "QTC/USD Pool",
      icon: "◈/$",
      totalValueLocked: 8500000,
      apr: 45.5,
      multiplier: "2.5x",
      lockPeriod: 30, // days
      earlyWithdrawalPenalty: 10, // percent
      userStaked: 5000,
      userStartDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      userRewardsEarned: 127.50,
      userPendingRewards: 42.30,
      isLocked: true,
      color: "from-green-500 to-emerald-600"
    },
    {
      name: "QTC/BTC Pool",
      icon: "◈/₿",
      totalValueLocked: 6200000,
      apr: 38.2,
      multiplier: "2.0x",
      lockPeriod: 60,
      earlyWithdrawalPenalty: 15,
      userStaked: 0,
      userStartDate: null,
      userRewardsEarned: 0,
      userPendingRewards: 0,
      isLocked: false,
      color: "from-orange-500 to-amber-600"
    },
    {
      name: "QTC/ETH Pool",
      icon: "◈/Ξ",
      totalValueLocked: 7100000,
      apr: 42.8,
      multiplier: "2.2x",
      lockPeriod: 90,
      earlyWithdrawalPenalty: 20,
      userStaked: 10000,
      userStartDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
      userRewardsEarned: 485.75,
      userPendingRewards: 128.90,
      isLocked: true,
      color: "from-blue-500 to-cyan-600"
    }
  ];

  // Calculate detailed farm stats
  const calculateFarmStats = (farm) => {
    if (!farm.userStaked || !farm.userStartDate) return null;

    const daysStaked = differenceInDays(new Date(), farm.userStartDate);
    const lockEndDate = addDays(farm.userStartDate, farm.lockPeriod);
    const daysRemaining = Math.max(0, differenceInDays(lockEndDate, new Date()));
    const lockProgress = Math.min(100, (daysStaked / farm.lockPeriod) * 100);
    
    const dailyRewards = (farm.userStaked * (farm.apr / 100)) / 365;
    const projectedMonthly = dailyRewards * 30;
    const projectedYearly = dailyRewards * 365;

    const isLocked = daysRemaining > 0;
    const canWithdraw = !isLocked || daysRemaining === 0;

    return {
      daysStaked,
      daysRemaining,
      lockEndDate,
      lockProgress,
      dailyRewards: dailyRewards.toFixed(2),
      projectedMonthly: projectedMonthly.toFixed(2),
      projectedYearly: projectedYearly.toFixed(2),
      isLocked,
      canWithdraw
    };
  };

  // Calculate total user stats
  const userTotalStaked = farms.reduce((sum, farm) => sum + farm.userStaked, 0);
  const userTotalEarned = farms.reduce((sum, farm) => sum + farm.userRewardsEarned, 0);
  const userTotalPending = farms.reduce((sum, farm) => sum + farm.userPendingRewards, 0);

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <Card className="bg-gradient-to-r from-indigo-950/40 to-purple-950/40 border-indigo-500/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Info className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-semibold text-indigo-200 mb-2">Yield Farming with Lock-Up Periods</h3>
              <p className="text-sm text-indigo-300/70 mb-3">
                Stake your LP tokens to earn additional QTC rewards with multiplier bonuses.
                Longer lock-up periods offer higher APR and reward multipliers. Early withdrawal
                incurs penalties, so choose your lock period wisely.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  Up to 2.5x Multiplier
                </Badge>
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                  <Lock className="w-3 h-3 mr-1" />
                  30-90 Day Lock Periods
                </Badge>
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Daily Reward Distribution
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900/60 border-green-900/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              <span className="text-xs text-green-400/70">Total Staked</span>
            </div>
            <div className="text-2xl font-bold text-green-400">
              ${userTotalStaked.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-blue-900/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-5 h-5 text-blue-400" />
              <span className="text-xs text-blue-400/70">Total Earned</span>
            </div>
            <div className="text-2xl font-bold text-blue-400">
              ${userTotalEarned.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-amber-900/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              <span className="text-xs text-amber-400/70">Pending Rewards</span>
            </div>
            <div className="text-2xl font-bold text-amber-400">
              ${userTotalPending.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Farming Pools */}
      <div className="space-y-4">
        {farms.map((farm, index) => {
          const stats = calculateFarmStats(farm);

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-slate-900/60 border-purple-900/40 hover:border-purple-500/60 transition-all">
                <CardHeader className="border-b border-purple-900/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${farm.color} rounded-lg flex items-center justify-center text-2xl`}>
                        {farm.icon}
                      </div>
                      <div>
                        <CardTitle className="text-purple-100 mb-1">{farm.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                            APR: {farm.apr}%
                          </Badge>
                          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                            {farm.multiplier} Multiplier
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-purple-400/60 mb-1">Total Value Locked</div>
                      <div className="text-lg font-bold text-purple-200">
                        ${(farm.totalValueLocked / 1000000).toFixed(2)}M
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-4">
                  {/* Lock Period Info */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-slate-950/50 rounded-lg border border-purple-900/30">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-purple-400/60 mb-1">
                        <Clock className="w-3 h-3" />
                        Lock Period
                      </div>
                      <div className="font-semibold text-purple-200">{farm.lockPeriod} days</div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-xs text-purple-400/60 mb-1">
                        <Lock className="w-3 h-3" />
                        Early Withdrawal Penalty
                      </div>
                      <div className="font-semibold text-red-400">{farm.earlyWithdrawalPenalty}%</div>
                    </div>
                  </div>

                  {/* User Position */}
                  {farm.userStaked > 0 && stats ? (
                    <div className="space-y-4">
                      {/* Lock Progress */}
                      <div className="p-4 bg-gradient-to-br from-blue-950/30 to-indigo-950/30 rounded-lg border border-blue-500/30">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-semibold text-blue-200">Lock Period Progress</span>
                          <span className="text-xs text-blue-400">
                            {stats.daysStaked} / {farm.lockPeriod} days
                          </span>
                        </div>
                        <Progress value={stats.lockProgress} className="h-2 mb-2" />
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-blue-400/70">
                            {stats.daysRemaining > 0 
                              ? `${stats.daysRemaining} days remaining` 
                              : "Lock period complete"
                            }
                          </span>
                          <span className="text-blue-300 font-semibold">
                            {stats.lockProgress.toFixed(1)}%
                          </span>
                        </div>
                        {stats.lockEndDate && (
                          <div className="flex items-center gap-2 mt-2 p-2 bg-blue-950/30 rounded text-xs text-blue-300">
                            <Calendar className="w-3 h-3" />
                            <span>Unlock Date: {format(stats.lockEndDate, "MMM d, yyyy")}</span>
                          </div>
                        )}
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="p-3 bg-slate-950/50 rounded border border-purple-900/30">
                          <div className="text-xs text-purple-400/60 mb-1">Staked</div>
                          <div className="font-bold text-purple-200">${farm.userStaked.toLocaleString()}</div>
                        </div>
                        <div className="p-3 bg-slate-950/50 rounded border border-green-900/30">
                          <div className="text-xs text-green-400/60 mb-1">Total Earned</div>
                          <div className="font-bold text-green-300">${farm.userRewardsEarned.toFixed(2)}</div>
                        </div>
                        <div className="p-3 bg-slate-950/50 rounded border border-amber-900/30">
                          <div className="text-xs text-amber-400/60 mb-1">Pending</div>
                          <div className="font-bold text-amber-300">${farm.userPendingRewards.toFixed(2)}</div>
                        </div>
                        <div className="p-3 bg-slate-950/50 rounded border border-blue-900/30">
                          <div className="text-xs text-blue-400/60 mb-1">Daily Rewards</div>
                          <div className="font-bold text-blue-300">${stats.dailyRewards}</div>
                        </div>
                      </div>

                      {/* Projections */}
                      <div className="p-4 bg-green-950/30 rounded-lg border border-green-500/30">
                        <div className="text-sm font-semibold text-green-200 mb-3">Earnings Projection</div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="text-xs text-green-400/70 mb-1">30-Day Projection</div>
                            <div className="text-lg font-bold text-green-300">${stats.projectedMonthly}</div>
                          </div>
                          <div>
                            <div className="text-xs text-green-400/70 mb-1">365-Day Projection</div>
                            <div className="text-lg font-bold text-green-300">${stats.projectedYearly}</div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <Button
                          disabled={farm.userPendingRewards === 0}
                          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
                        >
                          <Award className="w-4 h-4 mr-2" />
                          Claim Rewards
                        </Button>
                        <Button
                          variant={stats.canWithdraw ? "outline" : "destructive"}
                          className="flex-1"
                          disabled={!stats.canWithdraw}
                        >
                          {stats.isLocked ? (
                            <>
                              <Lock className="w-4 h-4 mr-2" />
                              Locked ({stats.daysRemaining}d)
                            </>
                          ) : (
                            <>
                              <Unlock className="w-4 h-4 mr-2" />
                              Withdraw
                            </>
                          )}
                        </Button>
                      </div>

                      {stats.isLocked && (
                        <div className="p-3 bg-red-950/30 rounded border border-red-500/30 text-xs text-red-300">
                          <span className="font-semibold">Early withdrawal penalty: {farm.earlyWithdrawalPenalty}%</span>
                          {" "}• Wait {stats.daysRemaining} more days to withdraw without penalty
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-purple-400/60 mb-4">No active position</div>
                      <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Stake LP Tokens
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}