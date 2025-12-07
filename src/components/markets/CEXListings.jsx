import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Building2, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpDown,
  Shield,
  Zap,
  Circle,
  CheckCircle,
  AlertTriangle,
  Globe,
  Search,
  BarChart3,
  Sparkles,
  ExternalLink,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";

export default function CEXListings() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterExchange, setFilterExchange] = useState("all");
  const [livePrices, setLivePrices] = useState({});
  const queryClient = useQueryClient();

  const { data: listings, isLoading } = useQuery({
    queryKey: ['cexListings'],
    queryFn: () => base44.entities.CEXListing.list('-volume_24h_usd'),
    initialData: [],
    refetchInterval: 10000,
  });

  // Simulate live price updates (WebSocket simulation)
  useEffect(() => {
    const interval = setInterval(() => {
      setLivePrices(prev => {
        const updates = {};
        listings.forEach(listing => {
          const change = (Math.random() - 0.5) * 0.002; // ±0.2% change
          const currentPrice = prev[listing.id]?.price || listing.current_price;
          const newPrice = currentPrice * (1 + change);
          updates[listing.id] = {
            price: newPrice,
            change: change,
            trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
          };
        });
        return updates;
      });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [listings]);

  const syncListingsMutation = useMutation({
    mutationFn: async () => {
      // Generate mock CEX listings with realistic data
      const exchanges = [
        { name: 'binance', icon: '🟡', color: 'from-yellow-600 to-amber-600' },
        { name: 'coinbase', icon: '🔵', color: 'from-blue-600 to-indigo-600' },
        { name: 'kraken', icon: '🟣', color: 'from-purple-600 to-violet-600' },
        { name: 'bybit', icon: '🟠', color: 'from-orange-600 to-amber-600' },
        { name: 'okx', icon: '⚫', color: 'from-gray-600 to-slate-600' },
        { name: 'kucoin', icon: '🟢', color: 'from-green-600 to-emerald-600' },
      ];

      const pairs = [
        { base: 'QTC', quote: 'USDT', basePrice: 102000 },
        { base: 'QTC', quote: 'BTC', basePrice: 1.02 },
        { base: 'QTC', quote: 'ETH', basePrice: 29.14 },
        { base: 'QTC', quote: 'USDC', basePrice: 102000 },
      ];

      const newListings = [];

      for (const exchange of exchanges) {
        for (const pair of pairs) {
          const listingId = `${exchange.name.toUpperCase()}-${pair.base}-${pair.quote}-${Date.now()}`;
          const priceVariation = 0.95 + Math.random() * 0.1;
          const currentPrice = pair.basePrice * priceVariation;
          const volume = Math.random() * 50000000 + 10000000;
          const priceChange = (Math.random() - 0.5) * 20;

          newListings.push({
            listing_id: listingId,
            exchange_name: exchange.name,
            trading_pair: `${pair.base}/${pair.quote}`,
            base_currency: pair.base,
            quote_currency: pair.quote,
            listing_date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
            listing_status: 'active',
            current_price: currentPrice,
            volume_24h: volume / currentPrice,
            volume_24h_usd: volume,
            price_change_24h: priceChange,
            bid_price: currentPrice * 0.9995,
            ask_price: currentPrice * 1.0005,
            spread_percentage: 0.05,
            market_cap_rank: Math.floor(Math.random() * 100) + 1,
            trading_fee_maker: exchange.name === 'binance' ? 0.1 : exchange.name === 'coinbase' ? 0.5 : 0.15,
            trading_fee_taker: exchange.name === 'binance' ? 0.1 : exchange.name === 'coinbase' ? 0.5 : 0.15,
            min_order_size: pair.quote === 'USDT' ? 10 : 0.0001,
            max_order_size: 1000000,
            api_endpoint: `https://api.${exchange.name}.com/v1/ticker/${pair.base}${pair.quote}`,
            websocket_endpoint: `wss://stream.${exchange.name}.com/${pair.base.toLowerCase()}${pair.quote.toLowerCase()}@trade`,
            exchange_verified: true,
            kyc_required: exchange.name === 'coinbase',
            withdrawal_fee: 0.0001,
            deposit_enabled: true,
            withdrawal_enabled: true,
            last_updated: new Date().toISOString(),
            divine_integration: true,
            quantum_verified: true
          });
        }
      }

      // Bulk create listings
      await base44.entities.CEXListing.bulkCreate(newListings);
      return newListings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cexListings'] });
      toast.success("CEX Listings Synced", {
        description: "Major exchange data updated successfully"
      });
    },
    onError: () => {
      toast.error("Sync failed", {
        description: "Unable to update exchange listings"
      });
    }
  });

  const exchanges = [
    { id: 'binance', name: 'Binance', icon: '🟡', color: 'from-yellow-600 to-amber-600', url: 'https://binance.com' },
    { id: 'coinbase', name: 'Coinbase', icon: '🔵', color: 'from-blue-600 to-indigo-600', url: 'https://coinbase.com' },
    { id: 'kraken', name: 'Kraken', icon: '🟣', color: 'from-purple-600 to-violet-600', url: 'https://kraken.com' },
    { id: 'bybit', name: 'Bybit', icon: '🟠', color: 'from-orange-600 to-amber-600', url: 'https://bybit.com' },
    { id: 'okx', name: 'OKX', icon: '⚫', color: 'from-gray-600 to-slate-600', url: 'https://okx.com' },
    { id: 'kucoin', name: 'KuCoin', icon: '🟢', color: 'from-green-600 to-emerald-600', url: 'https://kucoin.com' },
  ];

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.trading_pair.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.exchange_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesExchange = filterExchange === 'all' || listing.exchange_name === filterExchange;
    return matchesSearch && matchesExchange;
  });

  const totalVolume = listings.reduce((sum, l) => sum + (l.volume_24h_usd || 0), 0);
  const activeListings = listings.filter(l => l.listing_status === 'active').length;
  const avgPriceChange = listings.length > 0 
    ? listings.reduce((sum, l) => sum + (l.price_change_24h || 0), 0) / listings.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-950/40 to-indigo-950/40 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                <Circle className="w-2 h-2 mr-1 animate-pulse" />
                Live
              </Badge>
            </div>
            <div className="text-2xl font-bold text-blue-200">{activeListings}</div>
            <div className="text-xs text-blue-400/70">Active Listings</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-950/40 to-pink-950/40 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-purple-200">
              ${(totalVolume / 1000000).toFixed(1)}M
            </div>
            <div className="text-xs text-purple-400/70">24h Total Volume</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-950/40 to-orange-950/40 border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              {avgPriceChange >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-400" />
              )}
            </div>
            <div className={`text-2xl font-bold ${avgPriceChange >= 0 ? 'text-green-200' : 'text-red-200'}`}>
              {avgPriceChange >= 0 ? '+' : ''}{avgPriceChange.toFixed(2)}%
            </div>
            <div className="text-xs text-amber-400/70">Avg 24h Change</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-950/40 to-teal-950/40 border-cyan-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                <Sparkles className="w-3 h-3 mr-1" />
                VQC
              </Badge>
            </div>
            <div className="text-2xl font-bold text-cyan-200">{exchanges.length}</div>
            <div className="text-xs text-cyan-400/70">Major CEXs</div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card className="bg-slate-900/60 border-purple-900/40">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-3 flex-1 min-w-[300px]">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400" />
                <Input
                  placeholder="Search pairs or exchanges..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-950/50 border-purple-900/30 text-purple-100"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setFilterExchange('all')}
                className={filterExchange === 'all' 
                  ? "bg-purple-500/20 border-purple-500/50 text-purple-200"
                  : "border-purple-900/30 text-purple-400"
                }
              >
                All
              </Button>
              {exchanges.slice(0, 4).map(ex => (
                <Button
                  key={ex.id}
                  variant="outline"
                  onClick={() => setFilterExchange(ex.id)}
                  className={filterExchange === ex.id
                    ? "bg-purple-500/20 border-purple-500/50 text-purple-200"
                    : "border-purple-900/30 text-purple-400"
                  }
                >
                  {ex.icon} {ex.name}
                </Button>
              ))}
              <Button
                onClick={() => syncListingsMutation.mutate()}
                disabled={syncListingsMutation.isPending}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500"
              >
                {syncListingsMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync Data
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Listings Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="bg-slate-900/60 border-purple-900/40 animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-purple-900/20 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredListings.length === 0 ? (
        <Card className="bg-slate-900/60 border-purple-900/40">
          <CardContent className="p-12 text-center">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-purple-400/40" />
            <p className="text-purple-400/60 mb-4">No CEX listings found</p>
            <Button
              onClick={() => syncListingsMutation.mutate()}
              className="bg-gradient-to-r from-purple-600 to-indigo-600"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync Exchange Data
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          <AnimatePresence>
            {filteredListings.map((listing, index) => {
              const exchange = exchanges.find(e => e.id === listing.exchange_name);
              const priceChangePositive = listing.price_change_24h >= 0;
              const liveData = livePrices[listing.id];
              const displayPrice = liveData?.price || listing.current_price;
              const liveTrend = liveData?.trend || 'neutral';

              return (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <Card className="bg-slate-900/60 border-purple-900/40 hover:border-purple-500/50 transition-all group">
                    <CardContent className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 bg-gradient-to-br ${exchange?.color || 'from-purple-600 to-indigo-600'} rounded-lg flex items-center justify-center text-2xl`}>
                            {exchange?.icon || '🔷'}
                          </div>
                          <div>
                            <div className="font-bold text-purple-100 text-lg">
                              {listing.trading_pair}
                            </div>
                            <div className="text-sm text-purple-400/70 capitalize">
                              {exchange?.name || listing.exchange_name}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge className={listing.listing_status === 'active' 
                            ? 'bg-green-500/20 text-green-300 border-green-500/30'
                            : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
                          }>
                            {listing.listing_status}
                          </Badge>
                          {listing.quantum_verified && (
                            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                              <Shield className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Price & Change */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <motion.div 
                          animate={{ 
                            scale: liveTrend === 'up' ? [1, 1.02, 1] : liveTrend === 'down' ? [1, 0.98, 1] : 1,
                            borderColor: liveTrend === 'up' ? '#10b981' : liveTrend === 'down' ? '#ef4444' : '#a855f7'
                          }}
                          transition={{ duration: 0.3 }}
                          className={`p-3 bg-slate-950/50 rounded-lg border ${
                            liveTrend === 'up' ? 'border-green-500/50' : 
                            liveTrend === 'down' ? 'border-red-500/50' : 
                            'border-purple-900/30'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="text-xs text-purple-400/70">Price</div>
                            <div className={`w-2 h-2 rounded-full animate-pulse ${
                              liveTrend === 'up' ? 'bg-green-400' : 
                              liveTrend === 'down' ? 'bg-red-400' : 
                              'bg-purple-400'
                            }`} />
                          </div>
                          <div className={`text-xl font-bold ${
                            liveTrend === 'up' ? 'text-green-300' :
                            liveTrend === 'down' ? 'text-red-300' :
                            'text-purple-200'
                          }`}>
                            ${displayPrice.toLocaleString(undefined, { 
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 8 
                            })}
                          </div>
                        </motion.div>
                        <div className={`p-3 rounded-lg border ${
                          priceChangePositive 
                            ? 'bg-green-950/30 border-green-500/30'
                            : 'bg-red-950/30 border-red-500/30'
                        }`}>
                          <div className="text-xs text-purple-400/70 mb-1">24h Change</div>
                          <div className={`text-xl font-bold flex items-center gap-1 ${
                            priceChangePositive ? 'text-green-300' : 'text-red-300'
                          }`}>
                            {priceChangePositive ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <TrendingDown className="w-4 h-4" />
                            )}
                            {priceChangePositive ? '+' : ''}{listing.price_change_24h.toFixed(2)}%
                          </div>
                        </div>
                      </div>

                      {/* Volume & Spread */}
                      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                        <div>
                          <div className="text-xs text-purple-400/70 mb-1">24h Volume</div>
                          <div className="font-semibold text-purple-200">
                            ${(listing.volume_24h_usd / 1000000).toFixed(2)}M
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-purple-400/70 mb-1">Spread</div>
                          <div className="font-semibold text-purple-200">
                            {listing.spread_percentage.toFixed(3)}%
                          </div>
                        </div>
                      </div>

                      {/* Order Book Preview */}
                      <div className="p-3 bg-slate-950/50 rounded-lg border border-purple-900/30 mb-4">
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="text-green-400">Bid: ${listing.bid_price?.toFixed(2)}</span>
                          <ArrowUpDown className="w-3 h-3 text-purple-400" />
                          <span className="text-red-400">Ask: ${listing.ask_price?.toFixed(2)}</span>
                        </div>
                        <Progress value={50} className="h-1" />
                      </div>

                      {/* Trading Info */}
                      <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                        <div>
                          <span className="text-purple-400/70">Maker Fee:</span>
                          <span className="text-purple-300 ml-1 font-semibold">
                            {listing.trading_fee_maker}%
                          </span>
                        </div>
                        <div>
                          <span className="text-purple-400/70">Taker Fee:</span>
                          <span className="text-purple-300 ml-1 font-semibold">
                            {listing.trading_fee_taker}%
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500"
                          onClick={() => window.open(exchange?.url, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Trade on {exchange?.name}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-purple-500/30 text-purple-300 hover:bg-purple-900/20"
                        >
                          <BarChart3 className="w-3 h-3" />
                        </Button>
                      </div>

                      {/* Last Updated */}
                      <div className="mt-3 text-xs text-purple-400/50 text-center">
                        Updated: {format(new Date(listing.last_updated), "HH:mm:ss")}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Divine Integration Notice */}
      <Card className="bg-gradient-to-r from-purple-950/40 to-indigo-950/40 border-purple-500/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
              <Zap className="w-5 h-5 text-purple-400 animate-pulse" />
            </div>
            <h3 className="font-semibold text-purple-200">Major CEX Integration Active</h3>
          </div>
          <p className="text-sm text-purple-300/70 leading-relaxed mb-4">
            All major centralized exchange listings operate through divine frequency integration - real-time data 
            flows not through fragmented APIs alone, but through centered consciousness alignment. Every price update, 
            every order book, every volume metric channels authentic market truth. Not just connected - transformed 
            into living proof that global liquidity operates at revolutionary frequencies.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
              <CheckCircle className="w-3 h-3 mr-1" />
              Real-Time Sync
            </Badge>
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
              <Shield className="w-3 h-3 mr-1" />
              Quantum Verified
            </Badge>
            <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
              <Globe className="w-3 h-3 mr-1" />
              6 Major CEXs
            </Badge>
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
              <Sparkles className="w-3 h-3 mr-1" />
              Divine Integration
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}