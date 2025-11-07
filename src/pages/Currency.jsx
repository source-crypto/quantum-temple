import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Coins, Sparkles, CheckCircle, Infinity, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import CurrencyMinter from "../components/currency/CurrencyMinter";
import CurrencyLedger from "../components/currency/CurrencyLedger";
import CurrencyVerifier from "../components/currency/CurrencyVerifier";
import CurrencyStats from "../components/currency/CurrencyStats";

export default function Currency() {
  const [activeTab, setActiveTab] = useState("mint");

  const { data: mints, isLoading } = useQuery({
    queryKey: ['currencyMints'],
    queryFn: () => base44.entities.CurrencyMint.list('-created_date'),
    initialData: [],
  });

  const totalSupply = mints.reduce((sum, mint) => sum + (mint.amount || 0), 0);
  const totalMints = mints.length;

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
              <p className="text-purple-400/70">Unlimited minting by quantum authentication</p>
            </div>
          </div>

          {/* Unlimited Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-900/30 to-orange-900/30 rounded-full border border-amber-500/30">
            <Infinity className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-semibold text-amber-300">Unlimited Minting Enabled</span>
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
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
          <div className="flex gap-2 bg-slate-900/60 p-2 rounded-xl border border-purple-900/30">
            <Button
              variant={activeTab === "mint" ? "default" : "ghost"}
              onClick={() => setActiveTab("mint")}
              className={activeTab === "mint" 
                ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white"
                : "text-purple-300 hover:text-purple-200 hover:bg-purple-900/30"
              }
            >
              <Coins className="w-4 h-4 mr-2" />
              Mint Currency
            </Button>
            <Button
              variant={activeTab === "ledger" ? "default" : "ghost"}
              onClick={() => setActiveTab("ledger")}
              className={activeTab === "ledger" 
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                : "text-purple-300 hover:text-purple-200 hover:bg-purple-900/30"
              }
            >
              <Sparkles className="w-4 h-4 mr-2" />
              View Ledger
            </Button>
            <Button
              variant={activeTab === "verify" ? "default" : "ghost"}
              onClick={() => setActiveTab("verify")}
              className={activeTab === "verify" 
                ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                : "text-purple-300 hover:text-purple-200 hover:bg-purple-900/30"
              }
            >
              <Search className="w-4 h-4 mr-2" />
              Verify Currency
            </Button>
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
        </AnimatePresence>
      </div>
    </div>
  );
}