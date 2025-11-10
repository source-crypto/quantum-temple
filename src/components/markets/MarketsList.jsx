
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Search, Filter, DollarSign, Activity, Clock, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function MarketsList({ onSelectMarket }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedMarket, setSelectedMarket] = useState(null);

  const queryClient = useQueryClient();

  const { data: markets, isLoading } = useQuery({
    queryKey: ['markets'],
    queryFn: () => base44.entities.Market.list('-created_date', 50),
    initialData: [],
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  // Filter markets based on search and category
  const filteredMarkets = markets.filter(market => {
    const matchesSearch = market.question.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || market.category === filterCategory;
    const matchesActive = market.active && !market.closed;
    return matchesSearch && matchesCategory && matchesActive;
  });

  // Get unique categories
  const categories = ["all", ...new Set(markets.map(m => m.category).filter(Boolean))];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array(5).fill(0).map((_, i) => (
          <Card key={i} className="bg-slate-900/60 border-purple-900/30 animate-pulse">
            <CardContent className="p-6">
              <div className="h-24 bg-purple-900/20 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search & Filter */}
      <Card className="bg-slate-900/60 border-purple-900/40">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search markets..."
                className="pl-10 bg-slate-950/50 border-purple-900/30 text-purple-100"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {categories.map(cat => (
                <Button
                  key={cat}
                  size="sm"
                  variant={filterCategory === cat ? "default" : "outline"}
                  onClick={() => setFilterCategory(cat)}
                  className={filterCategory === cat 
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white whitespace-nowrap"
                    : "border-purple-500/30 text-purple-300 hover:bg-purple-900/20 whitespace-nowrap"
                  }
                >
                  <Filter className="w-3 h-3 mr-1" />
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Markets Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredMarkets.map((market, index) => {
          const priceChange = Math.random() * 10 - 5; // Mock price change
          const isPositive = priceChange >= 0;

          return (
            <motion.div
              key={market.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelectMarket && onSelectMarket(market)}
            >
              <Card className="bg-slate-900/60 border-purple-900/30 hover:border-cyan-500/50 transition-all cursor-pointer">
                <CardHeader className="border-b border-purple-900/30">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {market.category && (
                          <Badge variant="outline" className="border-cyan-500/30 text-cyan-300 text-xs">
                            {market.category}
                          </Badge>
                        )}
                        {market.featured && (
                          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
                            Featured
                          </Badge>
                        )}
                        <Badge className={`${market.active ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-gray-500/20 text-gray-300 border-gray-500/30'} text-xs`}>
                          {market.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <CardTitle className="text-purple-200 text-lg">{market.question}</CardTitle>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-4">
                  {/* Current Price */}
                  <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-lg border border-purple-900/30">
                    <div>
                      <div className="text-xs text-purple-400/70 mb-1">Current Price</div>
                      <div className="text-2xl font-bold text-purple-200">
                        ${(market.current_price || 0).toFixed(3)}
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                      {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                      <span className="font-semibold">{Math.abs(priceChange).toFixed(2)}%</span>
                    </div>
                  </div>

                  {/* Market Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-slate-950/50 rounded border border-purple-900/30">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Activity className="w-3 h-3 text-cyan-400" />
                        <span className="text-xs text-cyan-400/70">Volume</span>
                      </div>
                      <div className="text-sm font-semibold text-cyan-300">
                        ${((market.volume_24h || 0) / 1000).toFixed(1)}K
                      </div>
                    </div>

                    <div className="text-center p-3 bg-slate-950/50 rounded border border-purple-900/30">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <DollarSign className="w-3 h-3 text-purple-400" />
                        <span className="text-xs text-purple-400/70">Liquidity</span>
                      </div>
                      <div className="text-sm font-semibold text-purple-300">
                        ${((market.liquidity || 0) / 1000).toFixed(1)}K
                      </div>
                    </div>

                    <div className="text-center p-3 bg-slate-950/50 rounded border border-purple-900/30">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <ShoppingCart className="w-3 h-3 text-green-400" />
                        <span className="text-xs text-green-400/70">Bets</span>
                      </div>
                      <div className="text-sm font-semibold text-green-300">
                        {market.total_bets || 0}
                      </div>
                    </div>
                  </div>

                  {/* Outcomes */}
                  {market.outcomes && market.outcomes.length > 0 && (
                    <div className="space-y-2">
                      {market.outcomes.map((outcome, i) => (
                        <Button
                          key={i}
                          className="w-full justify-between bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-500/30 text-indigo-200 hover:from-indigo-800/40 hover:to-purple-800/40"
                        >
                          <span>{outcome}</span>
                          <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                            {(Math.random() * 100).toFixed(1)}%
                          </Badge>
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* Market End Date */}
                  {market.end_date && (
                    <div className="flex items-center gap-2 text-xs text-purple-400/60">
                      <Clock className="w-3 h-3" />
                      <span>Closes: {format(new Date(market.end_date), "MMM d, yyyy HH:mm")}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 font-semibold">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Trade
                    </Button>
                    <Button 
                      variant="outline"
                      className="border-purple-500/30 text-purple-300 hover:bg-purple-900/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectMarket && onSelectMarket(market);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredMarkets.length === 0 && (
        <Card className="bg-slate-900/60 border-purple-900/40">
          <CardContent className="p-12 text-center">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 text-purple-400/40" />
            <p className="text-purple-400/60 mb-2">No markets found</p>
            <p className="text-sm text-purple-500/50">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
