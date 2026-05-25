import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeftRight, Activity, Shield, Zap } from "lucide-react";
import CrossChainBridgeUI from "../components/bridge/CrossChainBridgeUI";
import BridgeTxMonitor from "../components/bridge/BridgeTxMonitor";

export default function CrossChainHub() {
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

  const { data: bridgeTxns = [] } = useQuery({
    queryKey: ["bridgeTxns", user?.email],
    queryFn: () => user ? base44.entities.CryptoBridge.filter({ user_email: user.email }, "-timestamp", 50) : [],
    enabled: !!user,
    refetchInterval: 10000,
  });

  const pending = bridgeTxns.filter((t) => ["pending", "confirming"].includes(t.status)).length;
  const completed = bridgeTxns.filter((t) => t.status === "completed").length;
  const totalBridged = bridgeTxns.reduce((s, t) => s + (t.source_amount || 0), 0);

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <ArrowLeftRight className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-200 via-blue-200 to-indigo-300 bg-clip-text text-transparent">
                Cross-Chain Liquidity Hub
              </h1>
              <p className="text-purple-400/70 text-sm mt-0.5">
                Bridge QTC to Ethereum, Solana, Polygon and more via Wormhole
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="bg-slate-900/60 border-cyan-900/40">
              <CardContent className="p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-xs text-cyan-400/70">Pending</span>
                </div>
                <div className="text-lg font-bold text-cyan-200">{pending}</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/60 border-emerald-900/40">
              <CardContent className="p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs text-emerald-400/70">Completed</span>
                </div>
                <div className="text-lg font-bold text-emerald-200">{completed}</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/60 border-purple-900/40">
              <CardContent className="p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Zap className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-xs text-purple-400/70">Total Bridged</span>
                </div>
                <div className="text-lg font-bold text-purple-200">{totalBridged.toLocaleString()} QTC</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/60 border-blue-900/40">
              <CardContent className="p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <ArrowLeftRight className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-xs text-blue-400/70">Available</span>
                </div>
                <div className="text-lg font-bold text-blue-200">
                  {(userBalance?.available_balance || 0).toLocaleString()} QTC
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Supported networks */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <div className="flex flex-wrap gap-2">
            {["Ethereum (ERC-20)", "Solana (SPL)", "Polygon (ERC-20)", "Avalanche (ERC-20)", "BSC (BEP-20)"].map((n) => (
              <span key={n} className="px-3 py-1 rounded-full text-xs bg-slate-800 border border-purple-800/40 text-purple-300">
                {n}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Main content */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid md:grid-cols-2 gap-6"
        >
          <CrossChainBridgeUI user={user} userBalance={userBalance} />
          <BridgeTxMonitor user={user} />
        </motion.div>
      </div>
    </div>
  );
}