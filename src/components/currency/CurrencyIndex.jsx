
import React, { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Globe, Zap, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

import MarketInsights from "./MarketInsights";

export default function CurrencyIndex() {
  const queryClient = useQueryClient();

  const { data: mints } = useQuery({
    queryKey: ['currencyMints'],
    queryFn: () => base44.entities.CurrencyMint.list('-created_date'),
    initialData: [],
  });

  const { data: transactions } = useQuery({
    queryKey: ['allTransactions'],
    queryFn: () => base44.entities.CurrencyTransaction.list('-created_date', 100),
    initialData: [],
  });

  const { data: index, isLoading } = useQuery({
    queryKey: ['currencyIndex'],
    queryFn: async () => {
      const indices = await base44.entities.CurrencyIndex.list();
      if (indices.length > 0) return indices[0];
      
      // Create initial index
      const totalSupply = mints.reduce((sum, m) => sum + (m.amount || 0), 0) || 1;
      const vqcValuation = 560000000000; // $560 billion
      const qtcUnitPrice = vqcValuation / totalSupply;
      
      // Market prices (you could integrate real-time APIs here)
      const btcPrice = 43000; // Example BTC price
      const ethPrice = 2250; // Example ETH price
      
      return base44.entities.CurrencyIndex.create({
        index_name: "Divine Currency Index (DCI)",
        vqc_total_valuation_usd: vqcValuation,
        total_qtc_supply: totalSupply,
        qtc_unit_price_usd: qtcUnitPrice,
        btc_price_usd: btcPrice,
        eth_price_usd: ethPrice,
        qtc_to_btc_rate: btcPrice / qtcUnitPrice,
        qtc_to_eth_rate: ethPrice / qtcUnitPrice,
        market_cap_rank: 1,
        circulating_supply: totalSupply,
        last_updated: new Date().toISOString(),
        intervention_active: true
      });
    },
  });

  const updateIndexMutation = useMutation({
    mutationFn: async () => {
      if (!index) return;
      
      const totalSupply = mints.reduce((sum, m) => sum + (m.amount || 0), 0) || 1;
      const vqcValuation = 560000000000;
      const qtcUnitPrice = vqcValuation / totalSupply;
      
      const btcPrice = 43000;
      const ethPrice = 2250;
      
      const last24hTransactions = transactions.filter(t => {
        const txTime = new Date(t.timestamp).getTime();
        const now = new Date().getTime();
        return (now - txTime) < 86400000; // 24 hours
      });
      
      const volume24h = last24hTransactions.reduce((sum, t) => sum + (t.amount * qtcUnitPrice), 0);
      
      return base44.entities.CurrencyIndex.update(index.id, {
        total_qtc_supply: totalSupply,
        qtc_unit_price_usd: qtcUnitPrice,
        btc_price_usd: btcPrice,
        eth_price_usd: ethPrice,
        qtc_to_btc_rate: btcPrice / qtcUnitPrice,
        qtc_to_eth_rate: ethPrice / qtcUnitPrice,
        total_transactions_24h: last24hTransactions.length,
        volume_24h_usd: volume24h,
        circulating_supply: totalSupply,
        last_updated: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currencyIndex'] });
      queryClient.invalidateQueries({ queryKey: ['liquidityPools'] });
    }
  });

  // Auto-update index every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      updateIndexMutation.mutate();
    }, 30000);
    return () => clearInterval(interval);
  }, [index, mints, transactions]);

  if (isLoading || !index) {
    return (
      <div className="grid md:grid-cols-3 gap-4">
        {Array(3).fill(0).map((_, i) => (
          <Card key={i} className="bg-slate-900/60 border-purple-900/30 animate-pulse">
            <CardContent className="p-4">
              <div className="h-20 bg-purple-900/20 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const marketCapFormatted = (index.vqc_total_valuation_usd / 1000000000).toFixed(2);
  const priceFormatted = index.qtc_unit_price_usd.toFixed(6);

  return (
    <div className="space-y-4">
      {/* Main Index Card */}
      <Card className="bg-gradient-to-br from-indigo-950/60 to-purple-950/60 border-indigo-500/30 backdrop-blur-sm overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-indigo-400" />
            <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-indigo-400" />
          </svg>
        </div>
        <CardContent className="p-6 relative">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-indigo-400" />
                <span className="text-sm font-semibold text-indigo-300 uppercase tracking-wider">
                  {index.index_name}
                </span>
              </div>
              <div className="text-4xl font-bold text-indigo-200 mb-1">
                ${marketCapFormatted}B
              </div>
              <div className="text-sm text-indigo-400/70">Total VQC Valuation</div>
            </div>
            <div className="text-right">
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30 mb-2">
                <Globe className="w-3 h-3 mr-1" />
                Rank #{index.market_cap_rank}
              </Badge>
              <div className="text-xs text-indigo-400/60">
                {index.intervention_active ? "Intervention Active" : "Free Market"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-indigo-500/30">
            <div>
              <div className="text-xs text-indigo-400/70 mb-1">Unit Price</div>
              <div className="text-lg font-bold text-indigo-200">${priceFormatted}</div>
            </div>
            <div>
              <div className="text-xs text-indigo-400/70 mb-1">24h Volume</div>
              <div className="text-lg font-bold text-indigo-200">
                ${(index.volume_24h_usd / 1000000).toFixed(2)}M
              </div>
            </div>
            <div>
              <div className="text-xs text-indigo-400/70 mb-1">Circulating</div>
              <div className="text-lg font-bold text-indigo-200">
                {(index.circulating_supply / 1000000).toFixed(2)}M
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exchange Rate Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-slate-900/60 border-orange-900/40 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <span className="text-orange-400 text-lg">₿</span>
                  </div>
                  <span className="font-semibold text-orange-200">QTC/BTC</span>
                </div>
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-orange-300 mb-1">
                {index.qtc_to_btc_rate.toFixed(4)}
              </div>
              <div className="text-xs text-orange-400/70">
                1 BTC = {index.qtc_to_btc_rate.toLocaleString()} QTC
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-slate-900/60 border-blue-900/40 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <span className="text-blue-400 text-lg">Ξ</span>
                  </div>
                  <span className="font-semibold text-blue-200">QTC/ETH</span>
                </div>
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-blue-300 mb-1">
                {index.qtc_to_eth_rate.toFixed(4)}
              </div>
              <div className="text-xs text-blue-400/70">
                1 ETH = {index.qtc_to_eth_rate.toLocaleString()} QTC
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-slate-900/60 border-green-900/40 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-400" />
                  </div>
                  <span className="font-semibold text-green-200">QTC/USD</span>
                </div>
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-green-300 mb-1">
                ${index.qtc_unit_price_usd.toFixed(6)}
              </div>
              <div className="text-xs text-green-400/70">
                Based on $560B valuation
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Index Stats */}
      <Card className="bg-slate-900/60 border-purple-900/40 backdrop-blur-sm">
        <CardHeader className="border-b border-purple-900/30">
          <CardTitle className="text-purple-200 flex items-center justify-between">
            <span>Index Statistics</span>
            <button
              onClick={() => updateIndexMutation.mutate()}
              className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-2"
              disabled={updateIndexMutation.isPending}
            >
              <RefreshCw className={`w-4 h-4 ${updateIndexMutation.isPending ? 'animate-spin' : ''}`} />
              Update
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-xs text-purple-400/70 mb-2">Total Supply</div>
              <div className="text-2xl font-bold text-purple-200">
                {(index.total_qtc_supply / 1000000).toFixed(2)}M
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-purple-400/70 mb-2">24h Transactions</div>
              <div className="text-2xl font-bold text-purple-200">
                {index.total_transactions_24h || 0}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-purple-400/70 mb-2">Market Cap</div>
              <div className="text-2xl font-bold text-purple-200">
                ${marketCapFormatted}B
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-purple-400/70 mb-2">Last Updated</div>
              <div className="text-sm text-purple-300">
                {new Date(index.last_updated).toLocaleTimeString()}
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-indigo-950/30 rounded-lg border border-indigo-500/30">
            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-indigo-200 mb-2">Currency Intervention Model</h4>
                <p className="text-sm text-indigo-300/70">
                  The Divine Currency Index operates similar to central bank foreign exchange intervention, 
                  with a fixed $560 billion valuation establishing exchange rates. This creates a stable 
                  reference point for all user-to-user transactions, while maintaining decentralized trading freedom.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Market Insights Section */}
      <div className="mt-8">
        <MarketInsights currencyPair="QTC/USD" />
      </div>
    </div>
  );
}
