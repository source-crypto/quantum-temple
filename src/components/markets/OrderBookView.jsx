import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function OrderBookView() {
  const [selectedMarket, setSelectedMarket] = useState(null);

  const { data: markets } = useQuery({
    queryKey: ['markets'],
    queryFn: () => base44.entities.Market.list('-created_date', 20),
    initialData: [],
  });

  const { data: orderbooks } = useQuery({
    queryKey: ['orderbooks', selectedMarket],
    queryFn: async () => {
      if (!selectedMarket) return [];
      return base44.entities.OrderBook.filter({ market_id: selectedMarket }, '-timestamp', 1);
    },
    enabled: !!selectedMarket,
    refetchInterval: 15000,
    refetchIntervalInBackground: true,
    initialData: [],
  });

  const currentOrderbook = orderbooks.length > 0 ? orderbooks[0] : null;

  // Calculate orderbook metrics
  const calculateMetrics = () => {
    if (!currentOrderbook) return { spread: 0, bidVolume: 0, askVolume: 0 };

    const bids = currentOrderbook.bids || [];
    const asks = currentOrderbook.asks || [];

    const bestBid = bids.length > 0 ? Math.max(...bids.map(b => b.price)) : 0;
    const bestAsk = asks.length > 0 ? Math.min(...asks.map(a => a.price)) : 0;

    return {
      spread: bestAsk - bestBid,
      bidVolume: bids.reduce((sum, b) => sum + (b.size || 0), 0),
      askVolume: asks.reduce((sum, a) => sum + (a.size || 0), 0),
      bestBid,
      bestAsk
    };
  };

  const metrics = calculateMetrics();

  // Prepare depth chart data
  const prepareDepthData = () => {
    if (!currentOrderbook) return [];

    const bids = (currentOrderbook.bids || []).slice(0, 20);
    const asks = (currentOrderbook.asks || []).slice(0, 20);

    let bidCumulative = 0;
    let askCumulative = 0;

    const bidData = bids.map(b => {
      bidCumulative += b.size || 0;
      return { price: b.price, volume: bidCumulative, type: 'bid' };
    });

    const askData = asks.map(a => {
      askCumulative += a.size || 0;
      return { price: a.price, volume: askCumulative, type: 'ask' };
    });

    return [...bidData.reverse(), ...askData];
  };

  const depthData = prepareDepthData();

  return (
    <div className="space-y-6">
      {/* Market Selector */}
      <Card className="bg-slate-900/60 border-purple-900/40">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <Select value={selectedMarket || ""} onValueChange={setSelectedMarket}>
              <SelectTrigger className="flex-1 bg-slate-950/50 border-purple-900/30 text-purple-100">
                <SelectValue placeholder="Select a market to view orderbook..." />
              </SelectTrigger>
              <SelectContent>
                {markets.map(market => (
                  <SelectItem key={market.market_id} value={market.market_id}>
                    {market.question}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {!selectedMarket && (
        <Card className="bg-slate-900/60 border-purple-900/40">
          <CardContent className="p-12 text-center">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-purple-400/40" />
            <p className="text-purple-400/60">Select a market to view its orderbook</p>
          </CardContent>
        </Card>
      )}

      {selectedMarket && currentOrderbook && (
        <>
          {/* Orderbook Metrics */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-green-950/40 to-emerald-950/40 border-green-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-400/70">Best Bid</span>
                </div>
                <div className="text-2xl font-bold text-green-200">
                  ${metrics.bestBid.toFixed(3)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-950/40 to-rose-950/40 border-red-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-4 h-4 text-red-400" />
                  <span className="text-xs text-red-400/70">Best Ask</span>
                </div>
                <div className="text-2xl font-bold text-red-200">
                  ${metrics.bestAsk.toFixed(3)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-950/40 to-indigo-950/40 border-purple-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-purple-400/70">Spread</span>
                </div>
                <div className="text-2xl font-bold text-purple-200">
                  ${metrics.spread.toFixed(4)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-cyan-950/40 to-blue-950/40 border-cyan-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs text-cyan-400/70">Total Volume</span>
                </div>
                <div className="text-2xl font-bold text-cyan-200">
                  {(metrics.bidVolume + metrics.askVolume).toFixed(0)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Depth Chart */}
          <Card className="bg-slate-900/60 border-purple-900/40">
            <CardHeader>
              <CardTitle className="text-purple-200 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Market Depth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={depthData}>
                  <defs>
                    <linearGradient id="colorBid" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAsk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#a855f7" opacity={0.1} />
                  <XAxis dataKey="price" stroke="#a855f7" fontSize={12} />
                  <YAxis stroke="#a855f7" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #a855f7', borderRadius: '8px' }}
                  />
                  <Area 
                    type="stepAfter" 
                    dataKey="volume" 
                    stroke="#10b981" 
                    fillOpacity={1} 
                    fill="url(#colorBid)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Order Book Tables */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Bids */}
            <Card className="bg-slate-900/60 border-green-900/40">
              <CardHeader className="border-b border-green-900/30">
                <CardTitle className="text-green-200 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Bids (Buy Orders)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-1 max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-3 gap-2 text-xs text-green-400/70 font-semibold mb-2 sticky top-0 bg-slate-900 py-2">
                    <div>Price</div>
                    <div className="text-right">Size</div>
                    <div className="text-right">Total</div>
                  </div>
                  {(currentOrderbook.bids || []).slice(0, 20).map((bid, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="grid grid-cols-3 gap-2 text-sm p-2 rounded hover:bg-green-900/20 transition-colors"
                    >
                      <div className="text-green-300 font-semibold">${bid.price?.toFixed(3)}</div>
                      <div className="text-green-200 text-right">{bid.size?.toFixed(2)}</div>
                      <div className="text-green-200/70 text-right">${(bid.price * bid.size).toFixed(2)}</div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Asks */}
            <Card className="bg-slate-900/60 border-red-900/40">
              <CardHeader className="border-b border-red-900/30">
                <CardTitle className="text-red-200 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5" />
                  Asks (Sell Orders)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-1 max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-3 gap-2 text-xs text-red-400/70 font-semibold mb-2 sticky top-0 bg-slate-900 py-2">
                    <div>Price</div>
                    <div className="text-right">Size</div>
                    <div className="text-right">Total</div>
                  </div>
                  {(currentOrderbook.asks || []).slice(0, 20).map((ask, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="grid grid-cols-3 gap-2 text-sm p-2 rounded hover:bg-red-900/20 transition-colors"
                    >
                      <div className="text-red-300 font-semibold">${ask.price?.toFixed(3)}</div>
                      <div className="text-red-200 text-right">{ask.size?.toFixed(2)}</div>
                      <div className="text-red-200/70 text-right">${(ask.price * ask.size).toFixed(2)}</div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}