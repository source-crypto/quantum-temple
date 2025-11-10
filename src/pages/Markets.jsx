import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { TrendingUp, BarChart3, Zap, ShoppingCart, Database, Brain, Target, Globe, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import MarketsList from "../components/markets/MarketsList";
import OrderBookView from "../components/markets/OrderBookView";
import MyPositions from "../components/markets/MyPositions";
import MarketAnalytics from "../components/markets/MarketAnalytics";
import AdvancedTrading from "../components/markets/AdvancedTrading";
import AIAnalyst from "../components/markets/AIAnalyst";
import TechnicalChart from "../components/markets/TechnicalChart";
import DataSourceManager from "../components/markets/DataSourceManager";
import BlockchainNodeMonitor from "../components/markets/BlockchainNodeMonitor";

export default function Markets() {
  const [activeTab, setActiveTab] = useState("markets");
  const [selectedMarket, setSelectedMarket] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const tabs = [
    { id: "markets", label: "All Markets", icon: TrendingUp, color: "from-cyan-600 to-blue-600" },
    { id: "trading", label: "Advanced Trading", icon: Target, color: "from-purple-600 to-indigo-600" },
    { id: "chart", label: "Technical Chart", icon: BarChart3, color: "from-amber-600 to-orange-600" },
    { id: "ai", label: "AI Analyst", icon: Brain, color: "from-pink-600 to-rose-600" },
    { id: "orderbook", label: "Order Books", icon: Database, color: "from-indigo-600 to-purple-600" },
    { id: "positions", label: "My Positions", icon: ShoppingCart, color: "from-green-600 to-emerald-600" },
    { id: "data", label: "Data Sources", icon: Globe, color: "from-teal-600 to-cyan-600" },
    { id: "nodes", label: "Network Nodes", icon: Cpu, color: "from-violet-600 to-purple-600" },
    { id: "analytics", label: "Analytics", icon: BarChart3, color: "from-red-600 to-rose-600" },
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
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-200 via-blue-200 to-indigo-300 bg-clip-text text-transparent">
                Quantum Markets
              </h1>
              <p className="text-purple-400/70">Advanced trading, AI analysis & blockchain infrastructure</p>
            </div>
          </div>

          {/* Feature Badges */}
          <div className="flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-900/30 to-blue-900/30 rounded-full border border-cyan-500/30">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-semibold text-cyan-300">Real-Time Data</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-full border border-purple-500/30">
              <Brain className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-semibold text-purple-300">AI-Powered Insights</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-full border border-green-500/30">
              <Target className="w-4 h-4 text-green-400" />
              <span className="text-sm font-semibold text-green-300">Advanced Orders</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-900/30 to-orange-900/30 rounded-full border border-amber-500/30">
              <Globe className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-amber-300">Multi-Chain Support</span>
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
          {activeTab === "markets" && (
            <motion.div key="markets" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <MarketsList onSelectMarket={setSelectedMarket} />
            </motion.div>
          )}

          {activeTab === "trading" && (
            <motion.div key="trading" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <AdvancedTrading market={selectedMarket} />
            </motion.div>
          )}

          {activeTab === "chart" && (
            <motion.div key="chart" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <TechnicalChart market={selectedMarket} />
            </motion.div>
          )}

          {activeTab === "ai" && (
            <motion.div key="ai" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <AIAnalyst market={selectedMarket} />
            </motion.div>
          )}

          {activeTab === "orderbook" && (
            <motion.div key="orderbook" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <OrderBookView />
            </motion.div>
          )}

          {activeTab === "positions" && (
            <motion.div key="positions" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <MyPositions user={user} />
            </motion.div>
          )}

          {activeTab === "data" && (
            <motion.div key="data" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <DataSourceManager />
            </motion.div>
          )}

          {activeTab === "nodes" && (
            <motion.div key="nodes" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <BlockchainNodeMonitor />
            </motion.div>
          )}

          {activeTab === "analytics" && (
            <motion.div key="analytics" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <MarketAnalytics />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}