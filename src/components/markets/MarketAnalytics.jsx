import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, TrendingUp, Activity, BarChart3, DollarSign, Users } from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function MarketAnalytics() {
  const { data: markets } = useQuery({
    queryKey: ['markets'],
    queryFn: () => base44.entities.Market.list('-created_date', 100),
    initialData: [],
  });

  const { data: allBets } = useQuery({
    queryKey: ['allBets'],
    queryFn: () => base44.entities.MarketBet.list('-timestamp', 100),
    initialData: [],
  });

  // Calculate analytics
  const analytics = {
    totalMarkets: markets.length,
    activeMarkets: markets.filter(m => m.active && !m.closed).length,
    totalVolume: markets.reduce((sum, m) => sum + (m.volume_24h || 0), 0),
    totalLiquidity: markets.reduce((sum, m) => sum + (m.liquidity || 0), 0),
    totalBets: allBets.length,
    activeBets: allBets.filter(b => b.status === 'active').length
  };

  // Category distribution
  const categoryData = markets.reduce((acc, market) => {
    const cat = market.category || 'Uncategorized';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const categoryChartData = Object.entries(categoryData).map(([name, value], index) => ({
    name,
    value,
    color: ['#06b6d4', '#a855f7', '#f59e0b', '#10b981', '#ec4899'][index % 5]
  }));

  // Volume by market type
  const marketTypeData = [
    { type: 'Prediction', volume: markets.filter(m => m.market_type === 'prediction').reduce((s, m) => s + (m.volume_24h || 0), 0) },
    { type: 'Trading', volume: markets.filter(m => m.market_type === 'trading').reduce((s, m) => s + (m.volume_24h || 0), 0) },
    { type: 'Orderbook', volume: markets.filter(m => m.market_type === 'orderbook').reduce((s, m) => s + (m.volume_24h || 0), 0) },
    { type: 'Liquidity', volume: markets.filter(m => m.market_type === 'liquidity').reduce((s, m) => s + (m.volume_24h || 0), 0) }
  ].filter(d => d.volume > 0);

  // Top markets by volume
  const topMarkets = [...markets]
    .sort((a, b) => (b.volume_24h || 0) - (a.volume_24h || 0))
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-cyan-950/40 to-blue-950/40 border-cyan-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <Database className="w-8 h-8 text-cyan-400" />
              <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                Active
              </Badge>
            </div>
            <div className="text-3xl font-bold text-cyan-200 mb-1">
              {analytics.activeMarkets}
            </div>
            <div className="text-sm text-cyan-400/70">Active Markets</div>
            <div className="text-xs text-cyan-400/50 mt-1">
              {analytics.totalMarkets} total
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-950/40 to-indigo-950/40 border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <DollarSign className="w-8 h-8 text-purple-400" />
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12%
              </Badge>
            </div>
            <div className="text-3xl font-bold text-purple-200 mb-1">
              ${(analytics.totalVolume / 1000000).toFixed(2)}M
            </div>
            <div className="text-sm text-purple-400/70">24h Volume</div>
            <div className="text-xs text-purple-400/50 mt-1">
              ${(analytics.totalLiquidity / 1000000).toFixed(2)}M liquidity
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-950/40 to-orange-950/40 border-amber-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <Users className="w-8 h-8 text-amber-400" />
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                Live
              </Badge>
            </div>
            <div className="text-3xl font-bold text-amber-200 mb-1">
              {analytics.activeBets}
            </div>
            <div className="text-sm text-amber-400/70">Active Positions</div>
            <div className="text-xs text-amber-400/50 mt-1">
              {analytics.totalBets} total bets
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card className="bg-slate-900/60 border-purple-900/40">
          <CardHeader>
            <CardTitle className="text-purple-200 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Markets by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={(entry) => entry.name}
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #a855f7', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Volume by Market Type */}
        <Card className="bg-slate-900/60 border-purple-900/40">
          <CardHeader>
            <CardTitle className="text-purple-200 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Volume by Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={marketTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#a855f7" opacity={0.1} />
                <XAxis dataKey="type" stroke="#a855f7" fontSize={12} />
                <YAxis stroke="#a855f7" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #a855f7', borderRadius: '8px' }}
                  formatter={(value) => `$${(value / 1000).toFixed(1)}K`}
                />
                <Bar dataKey="volume" fill="#06b6d4" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Markets Table */}
      <Card className="bg-slate-900/60 border-purple-900/40">
        <CardHeader>
          <CardTitle className="text-purple-200 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Top Markets by Volume
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topMarkets.map((market, index) => (
              <motion.div
                key={market.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 bg-slate-950/50 rounded border border-purple-900/30 hover:border-purple-500/50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center font-bold text-white text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-purple-200 text-sm">{market.question}</div>
                    <div className="text-xs text-purple-400/70">{market.category || 'General'}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-cyan-300">
                    ${((market.volume_24h || 0) / 1000).toFixed(1)}K
                  </div>
                  <div className="text-xs text-cyan-400/70">24h Volume</div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}