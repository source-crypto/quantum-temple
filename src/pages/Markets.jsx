import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { TrendingUp, BarChart3, Zap, ShoppingCart, Database } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import MarketsList from "../components/markets/MarketsList";
import OrderBookView from "../components/markets/OrderBookView";
import MyPositions from "../components/markets/MyPositions";
import MarketAnalytics from "../components/markets/MarketAnalytics";

export default function Markets() {
  const [activeTab, setActiveTab] = useState("markets");

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const tabs = [
    { id: "markets", label: "All Markets", icon: TrendingUp, color: "from-cyan-600 to-blue-600" },
    { id: "orderbook", label: "Order Books", icon: BarChart3, color: "from-purple-600 to-indigo-600" },
    { id: "positions", label: "My Positions", icon: ShoppingCart, color: "from-green-600 to-emerald-600" },
    { id: "analytics", label: "Analytics", icon: Database, color: "from-amber-600 to-orange-600" },
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
              <p className="text-purple-400/70">Prediction markets, orderbooks & live trading data</p>
            </div>
          </div>

          {/* Feature Badges */}
          <div className="flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-900/30 to-blue-900/30 rounded-full border border-cyan-500/30">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-semibold text-cyan-300">Real-Time Data</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-full border border-purple-500/30">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-semibold text-purple-300">Live Orderbooks</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-full border border-green-500/30">
              <ShoppingCart className="w-4 h-4 text-green-400" />
              <span className="text-sm font-semibold text-green-300">Prediction Markets</span>
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
            <motion.div
              key="markets"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <MarketsList />
            </motion.div>
          )}

          {activeTab === "orderbook" && (
            <motion.div
              key="orderbook"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <OrderBookView />
            </motion.div>
          )}

          {activeTab === "positions" && (
            <motion.div
              key="positions"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <MyPositions user={user} />
            </motion.div>
          )}

          {activeTab === "analytics" && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <MarketAnalytics />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}