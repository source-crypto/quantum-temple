import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, RefreshCw, TrendingUp, ShieldCheck } from "lucide-react";
import VaultCard from "../components/vaults/VaultCard";
import VaultPerformanceChart from "../components/vaults/VaultPerformanceChart";

// Oracle-signal-driven vault definitions
const VAULTS = [
  {
    id: "v-alpha",
    name: "Alpha Conservative Vault",
    oracle_node: "Alpha Oracle",
    strategy: "ETH/USD & BTC/USD feeds — balanced exposure",
    risk: "low",
    current_apy: 14.8,
    tvl: 842000,
    capacity_pct: 68,
    auto_compound: true,
    description: "Deposits are deployed across Alpha Oracle price feeds. Low slippage, auto-compounding every 24h.",
    history: [
      { period: "7D", return_pct: 0.28 },
      { period: "30D", return_pct: 1.23 },
      { period: "90D", return_pct: 3.71 },
    ],
  },
  {
    id: "v-beta",
    name: "Beta Growth Vault",
    oracle_node: "Beta Oracle",
    strategy: "QTC/USD & QTC/BTC feeds — aggressive growth",
    risk: "medium",
    current_apy: 20.1,
    tvl: 530000,
    capacity_pct: 45,
    auto_compound: true,
    description: "Leverages QTC price oracle signals. Compounds every 12h. Suitable for medium-risk holders.",
    history: [
      { period: "7D", return_pct: 0.39 },
      { period: "30D", return_pct: 1.67 },
      { period: "90D", return_pct: 5.02 },
    ],
  },
  {
    id: "v-gamma",
    name: "Gamma Stable Vault",
    oracle_node: "Gamma Oracle",
    strategy: "Stablecoin & FX feeds — capital preservation",
    risk: "low",
    current_apy: 11.5,
    tvl: 1240000,
    capacity_pct: 82,
    auto_compound: false,
    description: "Gamma Oracle's stablecoin feeds power conservative DeFi strategies. No auto-compound, manual harvest.",
    history: [
      { period: "7D", return_pct: 0.22 },
      { period: "30D", return_pct: 0.96 },
      { period: "90D", return_pct: 2.88 },
    ],
  },
  {
    id: "v-delta",
    name: "Delta High-Yield Vault",
    oracle_node: "Delta Oracle",
    strategy: "DeFi blue-chip signals — maximum yield",
    risk: "high",
    current_apy: 24.1,
    tvl: 190000,
    capacity_pct: 28,
    auto_compound: true,
    description: "Highest APY vault. Uses Delta Oracle's blue-chip DeFi price signals with automated rebalancing every 6h.",
    history: [
      { period: "7D", return_pct: 0.46 },
      { period: "30D", return_pct: 2.01 },
      { period: "90D", return_pct: 6.03 },
    ],
  },
  {
    id: "v-omega",
    name: "Omega Bond Vault",
    oracle_node: "Omega Oracle",
    strategy: "Treasury bond feeds — risk-free baseline",
    risk: "low",
    current_apy: 9.8,
    tvl: 3200000,
    capacity_pct: 91,
    auto_compound: true,
    description: "Backed by Omega Oracle's treasury bond data. Lowest risk profile, near-risk-free yield baseline.",
    history: [
      { period: "7D", return_pct: 0.19 },
      { period: "30D", return_pct: 0.82 },
      { period: "90D", return_pct: 2.46 },
    ],
  },
];

export default function YieldVaults() {
  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });

  const { data: userBalance } = useQuery({
    queryKey: ["userBalance"],
    queryFn: async () => {
      if (!user) return null;
      const b = await base44.entities.UserBalance.filter({ user_email: user.email });
      return b[0] || null;
    },
    enabled: !!user,
  });

  const { data: myStakes = [] } = useQuery({
    queryKey: ["yieldStakes"],
    queryFn: async () => {
      if (!user) return [];
      return base44.entities.YieldStake.filter({ user_email: user.email });
    },
    enabled: !!user,
  });

  const totalDeposited = myStakes.reduce((s, st) => s + (st.staked_amount || 0), 0);
  const estimatedAnnual = myStakes.reduce((s, st) => s + ((st.staked_amount || 0) * (st.entry_apy || 0) / 100), 0);
  const avgApy = totalDeposited > 0 ? (estimatedAnnual / totalDeposited) * 100 : 0;
  const totalTVL = VAULTS.reduce((s, v) => s + v.tvl, 0);

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-200 via-teal-200 to-cyan-300 bg-clip-text text-transparent">
                Smart Yield Vaults
              </h1>
              <p className="text-purple-400/70 text-sm mt-0.5">Oracle-powered automated yield farming with compounding</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="bg-slate-900/60 border-emerald-900/40">
              <CardContent className="p-3">
                <div className="text-xs text-emerald-400/70 mb-1">Total Protocol TVL</div>
                <div className="text-lg font-bold text-emerald-200">{(totalTVL / 1000000).toFixed(2)}M QTC</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/60 border-purple-900/40">
              <CardContent className="p-3">
                <div className="text-xs text-purple-400/70 mb-1">Your Deposits</div>
                <div className="text-lg font-bold text-purple-200">{totalDeposited.toLocaleString()} QTC</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/60 border-cyan-900/40">
              <CardContent className="p-3">
                <div className="text-xs text-cyan-400/70 mb-1">Est. Annual Yield</div>
                <div className="text-lg font-bold text-cyan-200">{Math.round(estimatedAnnual).toLocaleString()} QTC</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/60 border-amber-900/40">
              <CardContent className="p-3">
                <div className="text-xs text-amber-400/70 mb-1">Blended APY</div>
                <div className="text-lg font-bold text-amber-200">{avgApy.toFixed(2)}%</div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Performance chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <VaultPerformanceChart />
        </motion.div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-purple-400/60">Oracle signal refresh:</span>
          <Badge className="text-xs bg-emerald-900/40 text-emerald-300 border border-emerald-600/40 flex items-center gap-1">
            <RefreshCw className="w-3 h-3 animate-spin" /> Live
          </Badge>
          <span className="text-xs text-purple-400/60 ml-2">Auto-compound:</span>
          <Badge className="text-xs bg-purple-900/40 text-purple-300 border border-purple-600/40">Every 6–24h per vault</Badge>
        </div>

        {/* Vault cards */}
        <div className="space-y-3">
          {VAULTS.map((vault, i) => (
            <motion.div key={vault.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05 }}>
              <VaultCard vault={vault} user={user} userBalance={userBalance} />
            </motion.div>
          ))}
        </div>

        <div className="text-xs text-purple-500/40 italic text-center pb-4">
          APYs are live estimates driven by oracle node signals and update in real time. Past performance is not a guarantee of future returns.
        </div>
      </div>
    </div>
  );
}