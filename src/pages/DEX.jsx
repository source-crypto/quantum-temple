import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Repeat, Droplets, TrendingUp, BarChart3, ArrowLeftRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import SwapInterface from "../components/dex/SwapInterface";
import LiquidityInterface from "../components/dex/LiquidityInterface";
import YieldFarming from "../components/dex/YieldFarming";
import PoolsOverview from "../components/dex/PoolsOverview";
import CrossChainBridge from "../components/dex/CrossChainBridge";

export default function DEX() {
  const [activeTab, setActiveTab] = useState("swap");

  const tabs = [
    { id: "swap", label: "Swap", icon: Repeat, color: "from-cyan-600 to-blue-600" },
    { id: "bridge", label: "Cross-Chain Bridge", icon: ArrowLeftRight, color: "from-purple-600 to-pink-600" },
    { id: "liquidity", label: "Liquidity", icon: Droplets, color: "from-indigo-600 to-purple-600" },
    { id: "farm", label: "Yield Farming", icon: TrendingUp, color: "from-green-600 to-emerald-600" },
    { id: "pools", label: "Pools", icon: BarChart3, color: "from-orange-600 to-amber-600" },
  ];

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Repeat className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-200 via-blue-200 to-indigo-300 bg-clip-text text-transparent">
                Decentralized Exchange
              </h1>
              <p className="text-purple-400/70">Trade, provide liquidity, and earn yields</p>
            </div>
          </div>

          {/* Feature Badges */}
          <div className="flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-900/30 to-blue-900/30 rounded-full border border-cyan-500/30">
              <Repeat className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-semibold text-cyan-300">Instant Swaps</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-full border border-indigo-500/30">
              <Droplets className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-semibold text-indigo-300">0.3% LP Fees</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-full border border-green-500/30">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-sm font-semibold text-green-300">Yield Farming</span>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex gap-2 bg-slate-900/60 p-2 rounded-xl border border-purple-900/30 overflow-x-auto">
            {tabs.map(tab => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap ${activeTab === tab.id 
                  ? `bg-gradient-to-r ${tab.color} text-white`
                  : "text-purple-300 hover:text-purple-200 hover:bg-purple-900/30"
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "swap" && (
            <motion.div
              key="swap"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <SwapInterface />
            </motion.div>
          )}

          {activeTab === "bridge" && (
            <motion.div
              key="bridge"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <CrossChainBridge />
            </motion.div>
          )}

          {activeTab === "multichain" && (
            <motion.div
              key="multichain"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <MultiChainBridge />
            </motion.div>
          )}

          {activeTab === "explorer" && (
            <motion.div
              key="explorer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <CrossChainExplorer />
            </motion.div>
          )}

          {activeTab === "liquidity" && (
            <motion.div
              key="liquidity"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <LiquidityInterface />
            </motion.div>
          )}

          {activeTab === "farm" && (
            <motion.div
              key="farm"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <YieldFarming />
            </motion.div>
          )}

          {activeTab === "pools" && (
            <motion.div
              key="pools"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <PoolsOverview />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}