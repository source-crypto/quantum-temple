import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, BarChart3, Brain, ArrowLeftRight, Database, ShoppingCart, Globe, Cpu, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import MarketsList from "../components/markets/MarketsList";
import AdvancedTrading from "../components/markets/AdvancedTrading";
import TechnicalChart from "../components/markets/TechnicalChart";
import AIAnalyst from "../components/markets/AIAnalyst";
import CrossChainBridge from "../components/dex/CrossChainBridge";
import OrderBookView from "../components/markets/OrderBookView";
import MyPositions from "../components/markets/MyPositions";
import DataSourceManager from "../components/markets/DataSourceManager";
import BlockchainNodeMonitor from "../components/markets/BlockchainNodeMonitor";
import MarketAnalytics from "../components/markets/MarketAnalytics";
import CEXListings from "../components/markets/CEXListings";

export default function Markets() {
  const [activeTab, setActiveTab] = useState("markets");
  const [selectedMarket, setSelectedMarket] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const tabs = [
    { id: "markets", label: "All Markets", icon: TrendingUp, color: "from-cyan-600 to-blue-600" },
    { id: "cex", label: "Major CEX Listings", icon: Building2, color: "from-yellow-600 to-orange-600" },
    { id: "trading", label: "Advanced Trading", icon: Target, color: "from-purple-600 to-indigo-600" },
    { id: "chart", label: "Technical Chart", icon: BarChart3, color: "from-amber-600 to-orange-600" },
    { id: "ai", label: "AI Analyst", icon: Brain, color: "from-pink-600 to-rose-600" },
    { id: "bridge", label: "Cross-Chain Bridge", icon: ArrowLeftRight, color: "from-violet-600 to-purple-600" },
    { id: "orderbook", label: "Order Books", icon: Database, color: "from-indigo-600 to-purple-600" },
    { id: "positions", label: "My Positions", icon: ShoppingCart, color: "from-green-600 to-emerald-600" },
    { id: "data", label: "Data Sources", icon: Globe, color: "from-teal-600 to-cyan-600" },
    { id: "nodes", label: "Network Nodes", icon: Cpu, color: "from-violet-600 to-purple-600" },
    { id: "analytics", label: "Analytics", icon: BarChart3, color: "from-red-600 to-rose-600" },
  ];

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
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
                Markets & Trading
              </h1>
              <p className="text-purple-400/70">Advanced trading, AI analysis, CEX listings & blockchain data</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
              <TrendingUp className="w-3 h-3 mr-1" />
              Real-Time Markets
            </Badge>
            <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
              <Building2 className="w-3 h-3 mr-1" />
              Major CEX Listings
            </Badge>
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
              <Target className="w-3 h-3 mr-1" />
              Advanced Orders
            </Badge>
            <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30">
              <Brain className="w-3 h-3 mr-1" />
              AI Analysis
            </Badge>
            <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30">
              <ArrowLeftRight className="w-3 h-3 mr-1" />
              Cross-Chain Bridge
            </Badge>
          </div>
        </motion.div>

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

        <AnimatePresence mode="wait">
          {activeTab === "markets" && (
            <motion.div key="markets" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <MarketsList onSelectMarket={setSelectedMarket} selectedMarket={selectedMarket} />
            </motion.div>
          )}

          {activeTab === "cex" && (
            <motion.div key="cex" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <CEXListings />
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

          {activeTab === "bridge" && (
            <motion.div key="bridge" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <CrossChainBridge />
            </motion.div>
          )}

          {activeTab === "orderbook" && (
            <motion.div key="orderbook" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <OrderBookView market={selectedMarket} />
            </motion.div>
          )}

          {activeTab === "positions" && (
            <motion.div key="positions" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <MyPositions />
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