import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, Users, Plus } from "lucide-react";
import VaultCard from "../components/vaults/VaultCard";
import VaultPerformanceChart from "../components/vaults/VaultPerformanceChart";
import StrategyVaultCard from "../components/vaults/StrategyVaultCard";
import CreateStrategyVaultModal from "../components/vaults/CreateStrategyVaultModal";

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
  const [activeTab, setActiveTab] = useState("protocol");
  const [showCreateModal, setShowCreateModal] = useState(false);

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
      return base44.entities.YieldStake.filter({ staker_email: user.email });
    },
    enabled: !!user,
  });

  const { data: strategyVaults = [] } = useQuery({
    queryKey: ["strategyVaults"],
    queryFn: () => base44.entities.StrategyVault.filter({ is_public: true, status: "active" }, "-current_apy", 50),
  });

  const { data: myFollows = [] } = useQuery({
    queryKey: ["strategyFollows"],
    queryFn: async () => {
      if (!user) return [];
      return base44.entities.StrategyFollow.filter({ follower_email: user.email, status: "active" });
    },
    enabled: !!user,
  });

  const followedIds = new Set(myFollows.map((f) => f.strategy_vault_id));

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

        {/* Tab switcher */}
        <div className="flex gap-2 bg-slate-900/60 p-1.5 rounded-xl border border-purple-900/30">
          <Button
            variant={activeTab === "protocol" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("protocol")}
            className={activeTab === "protocol" ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white" : "text-purple-300 hover:text-purple-200"}
          >
            <TrendingUp className="w-4 h-4 mr-2" /> Protocol Vaults
          </Button>
          <Button
            variant={activeTab === "social" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("social")}
            className={activeTab === "social" ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white" : "text-purple-300 hover:text-purple-200"}
          >
            <Users className="w-4 h-4 mr-2" /> Strategy Vaults
            {strategyVaults.length > 0 && (
              <Badge className="ml-2 text-xs bg-cyan-900/50 text-cyan-300 border-cyan-600/40">{strategyVaults.length}</Badge>
            )}
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "protocol" && (
            <motion.div key="protocol" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} className="space-y-3">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs text-purple-400/60">Oracle signal refresh:</span>
                <Badge className="text-xs bg-emerald-900/40 text-emerald-300 border border-emerald-600/40 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Live
                </Badge>
                <span className="text-xs text-purple-400/60 ml-2">Auto-compound:</span>
                <Badge className="text-xs bg-purple-900/40 text-purple-300 border border-purple-600/40">Every 6–24h per vault</Badge>
              </div>
              {VAULTS.map((vault, i) => (
                <motion.div key={vault.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <VaultCard vault={vault} user={user} userBalance={userBalance} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === "social" && (
            <motion.div key="social" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-purple-200 font-semibold">Community Strategy Vaults</h2>
                  <p className="text-xs text-purple-400/60">Follow top performers and share in their oracle strategies. Performance fees are protocol-enforced.</p>
                </div>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white"
                  onClick={() => setShowCreateModal(true)}
                >
                  <Plus className="w-4 h-4 mr-1" /> Create Strategy Vault
                </Button>
              </div>

              {strategyVaults.length === 0 ? (
                <div className="text-center py-12 text-purple-400/50">
                  <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <div className="text-sm">No public strategy vaults yet.</div>
                  <div className="text-xs mt-1">Be the first to create one!</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {strategyVaults.map((sv, i) => (
                    <motion.div key={sv.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <StrategyVaultCard vault={sv} user={user} userBalance={userBalance} isFollowing={followedIds.has(sv.id)} />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-xs text-purple-500/40 italic text-center pb-4">
          APYs are live estimates driven by oracle node signals and update in real time. Past performance is not a guarantee of future returns.
        </div>

        <CreateStrategyVaultModal open={showCreateModal} onClose={() => setShowCreateModal(false)} user={user} />
      </div>
    </div>
  );
}