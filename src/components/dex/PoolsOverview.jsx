import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Droplets, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Search,
  ArrowUpDown,
  Filter
} from "lucide-react";
import { motion } from "framer-motion";

export default function PoolsOverview() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("tvl");
  const [filterType, setFilterType] = useState("all");

  const mockPools = [
    {
      pair: "QTC/USD",
      icon: "◈/$",
      providers: 245,
      tvl: 12500000,
      volume24h: 1850000,
      fees24h: 5550,
      apy: 45.5,
      reserve_a: 2500000,
      reserve_b: 2500000,
      type: "stable"
    },
    {
      pair: "QTC/BTC",
      icon: "◈/₿",
      providers: 189,
      tvl: 8900000,
      volume24h: 1230000,
      fees24h: 3690,
      apy: 38.2,
      reserve_a: 1780000,
      reserve_b: 1780000,
      type: "crypto"
    },
    {
      pair: "QTC/ETH",
      icon: "◈/Ξ",
      providers: 212,
      tvl: 10200000,
      volume24h: 1450000,
      fees24h: 4350,
      apy: 42.8,
      reserve_a: 2040000,
      reserve_b: 2040000,
      type: "crypto"
    },
    {
      pair: "BTC/ETH",
      icon: "₿/Ξ",
      providers: 156,
      tvl: 6700000,
      volume24h: 980000,
      fees24h: 2940,
      apy: 35.7,
      reserve_a: 1340000,
      reserve_b: 1340000,
      type: "crypto"
    }
  ];

  // Filter pools
  const filteredPools = mockPools.filter(pool => {
    const matchesSearch = pool.pair.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || pool.type === filterType;
    return matchesSearch && matchesType;
  });

  // Sort pools
  const sortedPools = [...filteredPools].sort((a, b) => {
    switch (sortBy) {
      case "tvl":
        return b.tvl - a.tvl;
      case "volume":
        return b.volume24h - a.volume24h;
      case "apy":
        return b.apy - a.apy;
      case "fees":
        return b.fees24h - a.fees24h;
      default:
        return 0;
    }
  });

  // Calculate totals
  const totalTVL = mockPools.reduce((sum, pool) => sum + pool.tvl, 0);
  const totalVolume = mockPools.reduce((sum, pool) => sum + pool.volume24h, 0);
  const totalFees = mockPools.reduce((sum, pool) => sum + pool.fees24h, 0);
  const activePools = mockPools.length;

  const stats = [
    {
      label: "Total Value Locked",
      value: `$${(totalTVL / 1000000).toFixed(1)}M`,
      icon: DollarSign,
      color: "text-green-400"
    },
    {
      label: "24h Volume",
      value: `$${(totalVolume / 1000000).toFixed(1)}M`,
      icon: TrendingUp,
      color: "text-blue-400"
    },
    {
      label: "24h Fees",
      value: `$${(totalFees / 1000).toFixed(1)}K`,
      icon: Droplets,
      color: "text-purple-400"
    },
    {
      label: "Active Pools",
      value: activePools,
      icon: Users,
      color: "text-amber-400"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-slate-900/60 border-purple-900/40">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  <span className="text-xs text-purple-400/70">{stat.label}</span>
                </div>
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters and Search */}
      <Card className="bg-slate-900/60 border-purple-900/40">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/50" />
              <Input
                placeholder="Search pools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-950/50 border-purple-900/30 text-purple-100"
              />
            </div>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-40 bg-slate-950/50 border-purple-900/30">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tvl">Sort by TVL</SelectItem>
                <SelectItem value="volume">Sort by Volume</SelectItem>
                <SelectItem value="apy">Sort by APY</SelectItem>
                <SelectItem value="fees">Sort by Fees</SelectItem>
              </SelectContent>
            </Select>

            {/* Filter */}
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-40 bg-slate-950/50 border-purple-900/30">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pools</SelectItem>
                <SelectItem value="stable">Stablecoins</SelectItem>
                <SelectItem value="crypto">Crypto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Pools List */}
      <div className="space-y-3">
        {sortedPools.map((pool, index) => (
          <motion.div
            key={pool.pair}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="bg-slate-900/60 border-purple-900/40 hover:border-purple-500/60 transition-all hover:shadow-lg hover:shadow-purple-500/10">
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Pool Info */}
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{pool.icon}</div>
                    <div>
                      <div className="font-semibold text-purple-100 mb-1">{pool.pair}</div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-purple-500/30 text-purple-300 text-xs">
                          <Users className="w-3 h-3 mr-1" />
                          {pool.providers} Providers
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            pool.type === "stable" 
                              ? "border-green-500/30 text-green-300" 
                              : "border-blue-500/30 text-blue-300"
                          }`}
                        >
                          {pool.type === "stable" ? "Stable" : "Volatile"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Pool Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <div className="text-xs text-purple-400/60 mb-1">TVL</div>
                      <div className="font-semibold text-green-400">
                        ${(pool.tvl / 1000000).toFixed(2)}M
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-purple-400/60 mb-1">24h Volume</div>
                      <div className="font-semibold text-blue-400">
                        ${(pool.volume24h / 1000000).toFixed(2)}M
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-purple-400/60 mb-1">24h Fees</div>
                      <div className="font-semibold text-purple-400">
                        ${pool.fees24h.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-purple-400/60 mb-1">APY</div>
                      <div className="font-bold text-amber-400 text-lg">
                        {pool.apy}%
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 w-full"
                      >
                        Add Liquidity
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Reserves */}
                <div className="mt-4 pt-4 border-t border-purple-900/30 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-purple-400/60">Reserve {pool.pair.split('/')[0]}: </span>
                    <span className="text-purple-300 font-semibold">
                      {(pool.reserve_a / 1000000).toFixed(2)}M
                    </span>
                  </div>
                  <div>
                    <span className="text-purple-400/60">Reserve {pool.pair.split('/')[1]}: </span>
                    <span className="text-purple-300 font-semibold">
                      {(pool.reserve_b / 1000000).toFixed(2)}M
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {sortedPools.length === 0 && (
        <Card className="bg-slate-900/60 border-purple-900/40">
          <CardContent className="p-12 text-center">
            <Droplets className="w-16 h-16 mx-auto mb-4 text-purple-400/40" />
            <p className="text-purple-400/60">No pools found matching your criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}