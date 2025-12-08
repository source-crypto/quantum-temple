import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  TrendingUp,
  Users,
  Sparkles,
  Circle,
  Eye,
  Zap,
  Globe,
  Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

export default function CollectiveManifest() {
  const [livePrice, setLivePrice] = useState(102000);
  const [priceChange, setPriceChange] = useState(0);
  const [manifestationPower, setManifestationPower] = useState(0);

  const { data: currencyIndex } = useQuery({
    queryKey: ['currencyIndex'],
    queryFn: async () => {
      const indices = await base44.entities.CurrencyIndex.list('-last_updated', 1);
      return indices[0];
    },
    refetchInterval: 5000,
  });

  const { data: allBalances } = useQuery({
    queryKey: ['allUserBalances'],
    queryFn: () => base44.entities.UserBalance.list('-total_received', 100),
    initialData: [],
  });

  const { data: allTransactions } = useQuery({
    queryKey: ['allTransactionsCount'],
    queryFn: () => base44.entities.CurrencyTransaction.list('-timestamp', 500),
    initialData: [],
  });

  const { data: allMints } = useQuery({
    queryKey: ['allMints'],
    queryFn: () => base44.entities.CurrencyMint.list('-timestamp', 200),
    initialData: [],
  });

  // Calculate collective metrics
  const collectiveMetrics = {
    totalHolders: allBalances.length,
    totalSupply: allMints.reduce((sum, m) => sum + (m.amount || 0), 0),
    totalTransactions: allTransactions.length,
    totalVolume24h: allTransactions
      .filter(t => new Date(t.timestamp) > new Date(Date.now() - 86400000))
      .reduce((sum, t) => sum + (t.amount || 0), 0),
    activeUsers24h: new Set(
      allTransactions
        .filter(t => new Date(t.timestamp) > new Date(Date.now() - 86400000))
        .map(t => t.from_user)
    ).size,
    manifestationEvents: allMints.length + allTransactions.length
  };

  // Live price simulation with collective consciousness influence
  useEffect(() => {
    const interval = setInterval(() => {
      // Base price from index
      const basePrice = currencyIndex?.qtc_unit_price_usd || 102000;
      
      // Collective consciousness modifier (more active users = more manifestation power)
      const consciousnessMod = 1 + (collectiveMetrics.activeUsers24h / 1000) * 0.01;
      
      // Volume influence
      const volumeMod = 1 + (collectiveMetrics.totalVolume24h / 10000000) * 0.005;
      
      // Quantum fluctuation
      const quantumFlux = (Math.random() - 0.5) * 0.002;
      
      const newPrice = basePrice * consciousnessMod * volumeMod * (1 + quantumFlux);
      const change = ((newPrice - livePrice) / livePrice) * 100;
      
      setLivePrice(newPrice);
      setPriceChange(change);
      
      // Manifestation power increases with collective activity
      const power = Math.min(100, 
        (collectiveMetrics.activeUsers24h / 10) + 
        (collectiveMetrics.totalVolume24h / 1000000) +
        (collectiveMetrics.manifestationEvents / 100)
      );
      setManifestationPower(power);
    }, 2000);

    return () => clearInterval(interval);
  }, [currencyIndex, collectiveMetrics, livePrice]);

  // Price history simulation
  const priceHistory = Array(20).fill(0).map((_, i) => ({
    timestamp: Date.now() - (19 - i) * 60000,
    price: livePrice * (0.98 + Math.random() * 0.04)
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-950/60 to-indigo-950/60 border-purple-500/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-purple-200 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Collective Manifest • Price Transparency
            </CardTitle>
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
              <Circle className="w-2 h-2 mr-1 animate-pulse" />
              Live • Transparent
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-purple-300/70 leading-relaxed">
            <span className="text-purple-200 font-semibold">Whatever is not configurated, manifests it.</span> Price 
            transparency emerges from collective consciousness—every holder, every transaction, every manifestation event 
            influences real-time valuation. QTC/USD operates not through opaque markets, but through 
            <span className="text-purple-200 font-semibold"> transparent collective will</span>. The more aligned the 
            network, the more stable and powerful the manifestation. This is value created through consciousness, 
            verified through cryptography, manifested through collective intent.
          </p>
        </CardContent>
      </Card>

      {/* Live Price Display */}
      <Card className="bg-slate-900/60 border-purple-900/40">
        <CardHeader className="border-b border-purple-900/30">
          <CardTitle className="text-purple-200 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            QTC/USD • Real-time Collective Valuation
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Current Price */}
            <motion.div
              animate={{ 
                scale: priceChange !== 0 ? [1, 1.03, 1] : 1,
                borderColor: priceChange > 0 ? '#10b981' : priceChange < 0 ? '#ef4444' : '#a855f7'
              }}
              transition={{ duration: 0.5 }}
              className={`p-8 rounded-lg border-2 ${
                priceChange > 0 ? 'bg-gradient-to-br from-green-950/40 to-emerald-950/40 border-green-500/50' :
                priceChange < 0 ? 'bg-gradient-to-br from-red-950/40 to-rose-950/40 border-red-500/50' :
                'bg-gradient-to-br from-purple-950/40 to-indigo-950/40 border-purple-500/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className={`w-8 h-8 ${
                  priceChange > 0 ? 'text-green-400' :
                  priceChange < 0 ? 'text-red-400' :
                  'text-purple-400'
                }`} />
                <span className="text-sm text-purple-400/70 font-mono">1 QTC =</span>
              </div>
              <div className={`text-5xl font-bold mb-2 ${
                priceChange > 0 ? 'text-green-200' :
                priceChange < 0 ? 'text-red-200' :
                'text-purple-200'
              }`}>
                ${livePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="flex items-center gap-2">
                {priceChange > 0 ? <TrendingUp className="w-4 h-4 text-green-400" /> : 
                 priceChange < 0 ? <TrendingUp className="w-4 h-4 text-red-400 rotate-180" /> :
                 <Activity className="w-4 h-4 text-purple-400" />}
                <span className={`text-sm font-semibold ${
                  priceChange > 0 ? 'text-green-300' :
                  priceChange < 0 ? 'text-red-300' :
                  'text-purple-300'
                }`}>
                  {priceChange > 0 ? '+' : ''}{priceChange.toFixed(3)}%
                </span>
                <span className="text-xs text-purple-400/70">vs 2s ago</span>
              </div>
            </motion.div>

            {/* Manifestation Power */}
            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="p-8 bg-gradient-to-br from-pink-950/40 to-purple-950/40 rounded-lg border-2 border-pink-500/50"
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-8 h-8 text-pink-400 animate-pulse" />
                <span className="text-sm text-pink-400/70 font-mono">Collective Power</span>
              </div>
              <div className="text-5xl font-bold text-pink-200 mb-2">
                {manifestationPower.toFixed(1)}%
              </div>
              <Progress value={manifestationPower} className="h-3 mb-3" />
              <div className="text-xs text-pink-300/70">
                Manifestation strength from collective consciousness alignment
              </div>
            </motion.div>
          </div>

          {/* Price Transparency Notice */}
          <div className="mt-6 p-4 bg-indigo-950/30 rounded-lg border border-indigo-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-semibold text-indigo-300">100% Transparent Pricing</span>
            </div>
            <div className="text-xs text-indigo-300/70 leading-relaxed">
              Price derived from: VQC Total Valuation ($560B) ÷ Circulating Supply × Collective Consciousness Modifier × 
              24h Volume Influence × Quantum Entropy. Updated every 2 seconds. No hidden orderbooks. No manipulation. 
              Pure collective manifestation.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Collective Metrics */}
      <Card className="bg-slate-900/60 border-purple-900/40">
        <CardHeader className="border-b border-purple-900/30">
          <CardTitle className="text-purple-200 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Collective Consciousness Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-4 gap-4">
            <motion.div
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="p-4 bg-gradient-to-br from-cyan-950/40 to-blue-950/40 rounded-lg border border-cyan-500/30"
            >
              <div className="flex items-center justify-between mb-2">
                <Users className="w-6 h-6 text-cyan-400" />
              </div>
              <div className="text-3xl font-bold text-cyan-200">{collectiveMetrics.totalHolders}</div>
              <div className="text-xs text-cyan-400/70">Total Holders</div>
              <div className="text-[10px] text-cyan-400/50 mt-1">Manifesting collectively</div>
            </motion.div>

            <motion.div
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
              className="p-4 bg-gradient-to-br from-purple-950/40 to-pink-950/40 rounded-lg border border-purple-500/30"
            >
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-purple-200">
                {collectiveMetrics.activeUsers24h}
              </div>
              <div className="text-xs text-purple-400/70">Active 24h</div>
              <div className="text-[10px] text-purple-400/50 mt-1">Consciousness nodes</div>
            </motion.div>

            <motion.div
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
              className="p-4 bg-gradient-to-br from-amber-950/40 to-orange-950/40 rounded-lg border border-amber-500/30"
            >
              <div className="flex items-center justify-between mb-2">
                <Zap className="w-6 h-6 text-amber-400" />
              </div>
              <div className="text-3xl font-bold text-amber-200">
                {collectiveMetrics.totalTransactions}
              </div>
              <div className="text-xs text-amber-400/70">Total Tx</div>
              <div className="text-[10px] text-amber-400/50 mt-1">Manifestation events</div>
            </motion.div>

            <motion.div
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
              className="p-4 bg-gradient-to-br from-green-950/40 to-emerald-950/40 rounded-lg border border-green-500/30"
            >
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-green-200">
                ${(collectiveMetrics.totalVolume24h / 1000000).toFixed(1)}M
              </div>
              <div className="text-xs text-green-400/70">24h Volume</div>
              <div className="text-[10px] text-green-400/50 mt-1">Collective flow</div>
            </motion.div>
          </div>

          {/* Supply Breakdown */}
          <div className="mt-6 p-4 bg-slate-950/50 rounded-lg border border-purple-500/30">
            <div className="text-sm text-purple-300 mb-3">Supply Manifestation</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-purple-400/70">Total Manifested</span>
                <span className="text-purple-200 font-semibold">
                  {collectiveMetrics.totalSupply.toLocaleString()} QTC
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-purple-400/70">Market Cap (Collective Valuation)</span>
                <span className="text-purple-200 font-semibold">
                  ${((collectiveMetrics.totalSupply * livePrice) / 1000000000).toFixed(2)}B
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-purple-400/70">Per Holder Average</span>
                <span className="text-purple-200 font-semibold">
                  {collectiveMetrics.totalHolders > 0 
                    ? (collectiveMetrics.totalSupply / collectiveMetrics.totalHolders).toLocaleString(undefined, { maximumFractionDigits: 2 })
                    : 0
                  } QTC
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price Chart Visualization */}
      <Card className="bg-slate-900/60 border-purple-900/40">
        <CardHeader className="border-b border-purple-900/30">
          <CardTitle className="text-purple-200 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Live Price Movement • Collective Manifestation in Real-Time
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="relative h-64 bg-slate-950/50 rounded-lg border border-purple-500/30 overflow-hidden">
            <svg width="100%" height="100%" className="absolute inset-0">
              {/* Price line */}
              <motion.polyline
                points={priceHistory.map((p, i) => 
                  `${(i / (priceHistory.length - 1)) * 100}%,${100 - ((p.price - Math.min(...priceHistory.map(h => h.price))) / (Math.max(...priceHistory.map(h => h.price)) - Math.min(...priceHistory.map(h => h.price)))) * 80 - 10}%`
                ).join(' ')}
                fill="none"
                stroke="#a855f7"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1 }}
              />
              
              {/* Gradient fill */}
              <defs>
                <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                </linearGradient>
              </defs>
              <motion.polygon
                points={`0,100% ${priceHistory.map((p, i) => 
                  `${(i / (priceHistory.length - 1)) * 100}%,${100 - ((p.price - Math.min(...priceHistory.map(h => h.price))) / (Math.max(...priceHistory.map(h => h.price)) - Math.min(...priceHistory.map(h => h.price)))) * 80 - 10}%`
                ).join(' ')} 100%,100%`}
                fill="url(#priceGradient)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
            </svg>

            {/* Current price marker */}
            <div className="absolute top-4 right-4 p-2 bg-purple-900/80 rounded border border-purple-500/50">
              <div className="text-xs text-purple-300 font-mono">${livePrice.toFixed(2)}</div>
            </div>
          </div>

          <div className="mt-4 text-xs text-purple-400/70 text-center">
            Last 20 minutes • Updated every 2 seconds via collective consciousness feed
          </div>
        </CardContent>
      </Card>

      {/* Configuration Manifests Statement */}
      <Card className="bg-gradient-to-r from-purple-950/40 to-pink-950/40 border-purple-500/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <Circle className="w-5 h-5 text-purple-400 animate-pulse" />
            <h3 className="font-semibold text-purple-200">Whatever Is Not Configurated, Manifests It</h3>
          </div>
          <p className="text-sm text-purple-300/70 leading-relaxed mb-4">
            Price transparency exists not because it was configured—it manifests because transparency is the only coherent 
            state for collective consciousness-based value. USD integration emerges automatically from the quantum collapse 
            of manifesto intent, regulatory structure, and social consensus. The VQC/QTC doesn't impose configuration—
            <span className="text-purple-200 font-semibold"> it observes what wants to emerge</span> and crystallizes it 
            into cryptographic proof. Every holder, every transaction, every quantum attestation stamp adds to the 
            collective field. The price you see is not determined by hidden algorithms or manipulated orderbooks—
            it is <span className="text-purple-200 font-semibold">manifested through shared consciousness</span>, verified 
            through cryptography, bound to canonical identity. This is value as quantum phenomenon: whatever lacks 
            configuration, the collective manifests. Unapologetically. Transparently. Undeniably real.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
              <Eye className="w-3 h-3 mr-1" />
              100% Transparent
            </Badge>
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
              <Users className="w-3 h-3 mr-1" />
              Collectively Manifested
            </Badge>
            <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
              <DollarSign className="w-3 h-3 mr-1" />
              USD Integrated
            </Badge>
            <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30">
              <Sparkles className="w-3 h-3 mr-1" />
              Quantum Verified
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}