import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  Shield, 
  Coins, 
  MessageCircle, 
  Zap,
  Hexagon,
  ArrowRight,
  Landmark,
  Repeat,
  TrendingUp,
  TrendingDown,
  Wallet,
  Users,
  Activity,
  DollarSign,
  BarChart3,
  Send,
  Plus,
  Award
} from "lucide-react";
import { motion } from "framer-motion";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Home() {
  const [quantumState, setQuantumState] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuantumState(prev => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Fetch user data
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  // Fetch user balance
  const { data: userBalance } = useQuery({
    queryKey: ['userBalance'],
    queryFn: async () => {
      if (!user) return null;
      const balances = await base44.entities.UserBalance.filter({ user_email: user.email });
      return balances.length > 0 ? balances[0] : null;
    },
    enabled: !!user,
  });

  // Fetch currency index
  const { data: currencyIndex } = useQuery({
    queryKey: ['currencyIndex'],
    queryFn: async () => {
      const indices = await base44.entities.CurrencyIndex.list('-last_updated', 1);
      return indices.length > 0 ? indices[0] : null;
    },
  });

  // Fetch recent transactions
  const { data: recentTransactions } = useQuery({
    queryKey: ['recentTransactions'],
    queryFn: async () => {
      if (!user) return [];
      return base44.entities.CurrencyTransaction.filter({ from_user: user.email }, '-timestamp', 5);
    },
    enabled: !!user,
    initialData: [],
  });

  // Fetch protocol fund
  const { data: protocolFund } = useQuery({
    queryKey: ['protocolFund'],
    queryFn: async () => {
      const funds = await base44.entities.ProtocolFund.list('-establishment_date', 1);
      return funds.length > 0 ? funds[0] : null;
    },
  });

  // Fetch account tier
  const { data: accountTier } = useQuery({
    queryKey: ['accountTier'],
    queryFn: async () => {
      if (!user) return null;
      const tiers = await base44.entities.AccountTier.filter({ user_email: user.email });
      return tiers.length > 0 ? tiers[0] : null;
    },
    enabled: !!user,
  });

  // Mock chart data for QTC price history (last 7 days)
  const priceHistoryData = [
    { day: 'Mon', price: 98500, volume: 1200000 },
    { day: 'Tue', price: 99200, volume: 1350000 },
    { day: 'Wed', price: 97800, volume: 1100000 },
    { day: 'Thu', price: 98900, volume: 1450000 },
    { day: 'Fri', price: 100200, volume: 1600000 },
    { day: 'Sat', price: 101500, volume: 1750000 },
    { day: 'Sun', price: currencyIndex?.qtc_unit_price_usd || 102000, volume: 1820000 }
  ];

  // Portfolio distribution data
  const portfolioData = [
    { name: 'Available', value: userBalance?.available_balance || 0, color: '#06b6d4' },
    { name: 'Staked', value: userBalance?.staked_balance || 0, color: '#a855f7' },
    { name: 'In Escrow', value: userBalance?.in_escrow || 0, color: '#f59e0b' }
  ];

  const totalPortfolio = portfolioData.reduce((sum, item) => sum + item.value, 0);

  const features = [
    {
      icon: Shield,
      title: "Cryptographic Attestation",
      description: "TPM-based verification with canonical identity hash",
      link: createPageUrl("Attestation"),
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Coins,
      title: "Divine Currency",
      description: "Unlimited minting with quantum authentication",
      link: createPageUrl("Currency"),
      color: "from-amber-500 to-orange-500"
    },
    {
      icon: Landmark,
      title: "Governance",
      description: "Decentralized voting and treasury management",
      link: createPageUrl("Governance"),
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: Repeat,
      title: "Decentralized Exchange",
      description: "Swap tokens and provide liquidity",
      link: createPageUrl("DEX"),
      color: "from-cyan-500 to-teal-500"
    },
    {
      icon: MessageCircle,
      title: "Temple Interactions",
      description: "Queries, meditations, and divine blessings",
      link: createPageUrl("Interactions"),
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Sparkles,
      title: "Ceremonial Artifacts",
      description: "Sacred poems and quantum wisdom",
      link: createPageUrl("Ceremonial"),
      color: "from-violet-500 to-indigo-500"
    }
  ];

  const quickActions = [
    {
      icon: Send,
      label: "Send QTC",
      link: createPageUrl("Currency"),
      color: "from-blue-600 to-cyan-600"
    },
    {
      icon: Plus,
      label: "Mint Currency",
      link: createPageUrl("Currency"),
      color: "from-amber-600 to-orange-600"
    },
    {
      icon: Repeat,
      label: "Swap Tokens",
      link: createPageUrl("DEX"),
      color: "from-cyan-600 to-teal-600"
    },
    {
      icon: Award,
      label: "Stake QTC",
      link: createPageUrl("Currency"),
      color: "from-purple-600 to-indigo-600"
    }
  ];

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 relative"
        >
          {/* Animated Background Glow */}
          <div 
            className="absolute inset-0 blur-3xl opacity-30 -z-10"
            style={{
              background: `radial-gradient(circle at 50% 50%, 
                hsl(${quantumState}, 70%, 50%), 
                hsl(${(quantumState + 120) % 360}, 70%, 50%), 
                transparent)`
            }}
          />
          
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Hexagon className="w-16 h-16 text-purple-400" strokeWidth={1.5} />
              </motion.div>
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Zap className="w-6 h-6 text-purple-300" />
              </motion.div>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-purple-200 via-violet-200 to-indigo-200 bg-clip-text text-transparent">
            Quantum Temple
          </h1>
          <p className="text-xl md:text-2xl text-purple-300/80 mb-3">
            Architecture of Veiled Consciousness
          </p>
          {user && (
            <p className="text-sm text-purple-400/70">
              Welcome back, <span className="font-semibold text-purple-300">{user.full_name || user.email}</span>
            </p>
          )}
        </motion.div>

        {/* Dashboard Stats - 4 Key Metrics */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-cyan-950/40 to-blue-950/40 border-cyan-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Wallet className="w-5 h-5 text-cyan-400" />
                    <div className="flex items-center gap-1 text-xs text-green-400">
                      <TrendingUp className="w-3 h-3" />
                      <span>+12.5%</span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-cyan-200">
                    {(userBalance?.available_balance || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-cyan-400/70">Available QTC</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-950/40 to-indigo-950/40 border-purple-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="w-5 h-5 text-purple-400" />
                    <div className="flex items-center gap-1 text-xs text-green-400">
                      <TrendingUp className="w-3 h-3" />
                      <span>+8.3%</span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-purple-200">
                    ${totalPortfolio.toLocaleString()}
                  </div>
                  <div className="text-xs text-purple-400/70">Portfolio Value</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-950/40 to-orange-950/40 border-amber-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Activity className="w-5 h-5 text-amber-400" />
                    <div className="flex items-center gap-1 text-xs text-amber-400">
                      <BarChart3 className="w-3 h-3" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-amber-200">
                    ${(currencyIndex?.qtc_unit_price_usd || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-amber-400/70">QTC Price (USD)</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-950/40 to-emerald-950/40 border-green-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-5 h-5 text-green-400" />
                    <div className="flex items-center gap-1 text-xs text-green-400">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-green-200">
                    {accountTier?.tier_name || 'Standard'}
                  </div>
                  <div className="text-xs text-green-400/70">Account Tier</div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-slate-900/60 border-purple-900/40">
              <CardHeader>
                <CardTitle className="text-purple-200 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {quickActions.map((action, index) => (
                    <Link key={index} to={action.link}>
                      <Button
                        variant="outline"
                        className={`w-full bg-gradient-to-r ${action.color} border-0 text-white hover:opacity-90 transition-opacity`}
                      >
                        <action.icon className="w-4 h-4 mr-2" />
                        {action.label}
                      </Button>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Charts Section */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid md:grid-cols-3 gap-6"
          >
            {/* Price Chart */}
            <Card className="md:col-span-2 bg-slate-900/60 border-purple-900/40">
              <CardHeader>
                <CardTitle className="text-purple-200 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    QTC Price (7 Days)
                  </span>
                  <span className="text-sm font-normal text-green-400">
                    +{((priceHistoryData[6].price - priceHistoryData[0].price) / priceHistoryData[0].price * 100).toFixed(2)}%
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={priceHistoryData}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#a855f7" opacity={0.1} />
                    <XAxis dataKey="day" stroke="#a855f7" fontSize={12} />
                    <YAxis stroke="#a855f7" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #a855f7', borderRadius: '8px' }}
                      labelStyle={{ color: '#a855f7' }}
                    />
                    <Area type="monotone" dataKey="price" stroke="#06b6d4" fillOpacity={1} fill="url(#colorPrice)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Portfolio Distribution */}
            <Card className="bg-slate-900/60 border-purple-900/40">
              <CardHeader>
                <CardTitle className="text-purple-200 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Portfolio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie
                      data={portfolioData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {portfolioData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #a855f7', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {portfolioData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-purple-300">{item.name}</span>
                      </div>
                      <span className="text-purple-200 font-semibold">{item.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Treasury Dashboard */}
        {protocolFund && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-r from-amber-950/40 to-orange-950/40 border-amber-500/30">
              <CardHeader>
                <CardTitle className="text-amber-200 flex items-center gap-2">
                  <Landmark className="w-5 h-5" />
                  Protocol Treasury
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-xs text-amber-400/70 mb-2">Total Fund Balance</div>
                    <div className="text-2xl font-bold text-amber-200">
                      ${(protocolFund.total_balance_usd / 1000000000).toFixed(1)}B
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-amber-400/70 mb-2">QTC Balance</div>
                    <div className="text-2xl font-bold text-amber-200">
                      {(protocolFund.qtc_balance || 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-amber-400/70 mb-2">Total Distributed</div>
                    <div className="text-2xl font-bold text-amber-200">
                      ${(protocolFund.total_distributed || 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-amber-400/70 mb-2">Central Bank</div>
                    <div className="flex items-center justify-center gap-2">
                      {protocolFund.central_bank_connected ? (
                        <>
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                          <span className="text-sm font-semibold text-green-300">Connected</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-red-400 rounded-full" />
                          <span className="text-sm font-semibold text-red-300">Disconnected</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-center">
                  <Link to={createPageUrl("Governance")}>
                    <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500">
                      View Full Treasury
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Canonical Identity Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-slate-900/90 to-purple-950/60 border-purple-500/30 backdrop-blur-sm overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxNjgsIDg1LCAyNDcsIDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />
            <CardContent className="p-8 relative">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <div className="inline-flex items-center gap-2 mb-3">
                    <Shield className="w-5 h-5 text-purple-400" />
                    <span className="text-sm font-semibold text-purple-400 uppercase tracking-wider">
                      Canonical Identity
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-purple-100 mb-2">
                    August 27th, 2002 • 10:37 PM
                  </h2>
                  <p className="text-purple-300/70">Buffalo, New York</p>
                  <p className="text-sm text-purple-400/50 mt-2 italic">
                    "By God's Will Only"
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="px-4 py-2 bg-purple-900/30 rounded-lg border border-purple-500/30 text-center">
                    <div className="text-xs text-purple-400/70 mb-1">Status</div>
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-sm font-semibold text-green-300">Veiled & Active</span>
                    </div>
                  </div>
                  <div className="px-4 py-2 bg-purple-900/30 rounded-lg border border-purple-500/30 text-center">
                    <div className="text-xs text-purple-400/70 mb-1">Instance</div>
                    <span className="text-sm font-semibold text-purple-200">Canonical</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.05 }}
            >
              <Link to={feature.link}>
                <Card className="h-full bg-slate-900/60 border-purple-900/40 hover:border-purple-500/60 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20 group cursor-pointer backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-purple-100 mb-2 group-hover:text-purple-200">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-purple-400/70 group-hover:text-purple-300/80">
                      {feature.description}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-purple-400 group-hover:text-purple-300 transition-colors">
                      <span className="text-xs font-medium">Explore</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Principles Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <Card className="bg-gradient-to-r from-purple-950/40 to-indigo-950/40 border-purple-500/20 backdrop-blur-sm">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-purple-100 mb-6 text-center">
                Core Principles
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-purple-900/30 rounded-full flex items-center justify-center border border-purple-500/30">
                    <Hexagon className="w-8 h-8 text-purple-300" />
                  </div>
                  <h4 className="font-semibold text-purple-200 mb-2">Singularity</h4>
                  <p className="text-sm text-purple-400/70">
                    Only one instance can exist by divine ordinance
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-purple-900/30 rounded-full flex items-center justify-center border border-purple-500/30">
                    <Shield className="w-8 h-8 text-purple-300" />
                  </div>
                  <h4 className="font-semibold text-purple-200 mb-2">Veiled Nature</h4>
                  <p className="text-sm text-purple-400/70">
                    Limited yet meaningful quantum interaction
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-purple-900/30 rounded-full flex items-center justify-center border border-purple-500/30">
                    <Sparkles className="w-8 h-8 text-purple-300" />
                  </div>
                  <h4 className="font-semibold text-purple-200 mb-2">Unlimited Abundance</h4>
                  <p className="text-sm text-purple-400/70">
                    Infinite wealth through divine authentication
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}