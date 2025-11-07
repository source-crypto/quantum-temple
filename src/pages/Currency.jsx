import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Coins, Sparkles, Infinity, Search, Flame, Star, Gem, ArrowLeftRight, Store } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import CurrencyMinter from "../components/currency/CurrencyMinter";
import CurrencyLedger from "../components/currency/CurrencyLedger";
import CurrencyVerifier from "../components/currency/CurrencyVerifier";
import CurrencyStats from "../components/currency/CurrencyStats";
import TempleOffering from "../components/currency/TempleOffering";
import DivineFavorStaking from "../components/currency/DivineFavorStaking";
import SpiritualExchange from "../components/currency/SpiritualExchange";
import CurrencyTransfer from "../components/currency/CurrencyTransfer";
import GlobalMarketplace from "../components/currency/GlobalMarketplace";

export default function Currency() {
  const [activeTab, setActiveTab] = useState("mint");

  const { data: mints, isLoading } = useQuery({
    queryKey: ['currencyMints'],
    queryFn: () => base44.entities.CurrencyMint.list('-created_date'),
    initialData: [],
  });

  const totalSupply = mints.reduce((sum, mint) => sum + (mint.amount || 0), 0);
  const totalMints = mints.length;

  const tabs = [
    { id: "mint", label: "Mint", icon: Coins, color: "from-amber-600 to-orange-600" },
    { id: "ledger", label: "Ledger", icon: Sparkles, color: "from-purple-600 to-indigo-600" },
    { id: "transfer", label: "Transfer", icon: ArrowLeftRight, color: "from-cyan-600 to-blue-600" },
    { id: "marketplace", label: "Marketplace", icon: Store, color: "from-green-600 to-emerald-600" },
    { id: "verify", label: "Verify", icon: Search, color: "from-blue-600 to-cyan-600" },
    { id: "offerings", label: "Offerings", icon: Flame, color: "from-rose-600 to-pink-600" },
    { id: "staking", label: "Staking", icon: Star, color: "from-violet-600 to-purple-600" },
    { id: "exchange", label: "Spiritual", icon: Gem, color: "from-emerald-600 to-teal-600" },
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
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Coins className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-200 via-orange-200 to-amber-300 bg-clip-text text-transparent">
                Divine Currency
              </h1>
              <p className="text-purple-400/70">Global tradeable asset • Unlimited minting • Peer-to-peer transfers</p>
            </div>
          </div>

          {/* Unlimited Badge */}
          <div className="flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-900/30 to-orange-900/30 rounded-full border border-amber-500/30">
              <Infinity className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-amber-300">Unlimited Minting</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-full border border-green-500/30">
              <Store className="w-4 h-4 text-green-400" />
              <span className="text-sm font-semibold text-green-300">Global Trading Enabled</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-900/30 to-blue-900/30 rounded-full border border-cyan-500/30">
              <ArrowLeftRight className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-semibold text-cyan-300">P2P Transfers</span>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <CurrencyStats 
          totalSupply={totalSupply} 
          totalMints={totalMints}
          isLoading={isLoading}
        />

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
          {activeTab === "mint" && (
            <motion.div
              key="mint"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <CurrencyMinter />
            </motion.div>
          )}

          {activeTab === "ledger" && (
            <motion.div
              key="ledger"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <CurrencyLedger mints={mints} isLoading={isLoading} />
            </motion.div>
          )}

          {activeTab === "transfer" && (
            <motion.div
              key="transfer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <CurrencyTransfer totalSupply={totalSupply} />
            </motion.div>
          )}

          {activeTab === "marketplace" && (
            <motion.div
              key="marketplace"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <GlobalMarketplace totalSupply={totalSupply} />
            </motion.div>
          )}

          {activeTab === "verify" && (
            <motion.div
              key="verify"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <CurrencyVerifier mints={mints} />
            </motion.div>
          )}

          {activeTab === "offerings" && (
            <motion.div
              key="offerings"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <TempleOffering totalSupply={totalSupply} />
            </motion.div>
          )}

          {activeTab === "staking" && (
            <motion.div
              key="staking"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <DivineFavorStaking totalSupply={totalSupply} />
            </motion.div>
          )}

          {activeTab === "exchange" && (
            <motion.div
              key="exchange"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <SpiritualExchange totalSupply={totalSupply} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}