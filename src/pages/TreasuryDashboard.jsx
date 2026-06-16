import React from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { Landmark, TrendingUp, TrendingDown, Wallet, Coins, ShieldCheck, Activity } from "lucide-react";

// ── Historical treasury distribution across oracle nodes (simulated 12 weeks) ──
const HISTORICAL_DISTRIBUTION = [
  { week: "W1", "Alpha Oracle": 22, "Beta Oracle": 14, "Gamma Oracle": 24, "Delta Oracle": 12, "Omega Oracle": 28 },
  { week: "W2", "Alpha Oracle": 23, "Beta Oracle": 14, "Gamma Oracle": 23, "Delta Oracle": 13, "Omega Oracle": 27 },
  { week: "W3", "Alpha Oracle": 21, "Beta Oracle": 15, "Gamma Oracle": 24, "Delta Oracle": 13, "Omega Oracle": 27 },
  { week: "W4", "Alpha Oracle": 20, "Beta Oracle": 16, "Gamma Oracle": 23, "Delta Oracle": 14, "Omega Oracle": 27 },
  { week: "W5", "Alpha Oracle": 19, "Beta Oracle": 18, "Gamma Oracle": 22, "Delta Oracle": 14, "Omega Oracle": 27 },
  { week: "W6", "Alpha Oracle": 18, "Beta Oracle": 19, "Gamma Oracle": 21, "Delta Oracle": 16, "Omega Oracle": 26 },
  { week: "W7", "Alpha Oracle": 17, "Beta Oracle": 20, "Gamma Oracle": 20, "Delta Oracle": 18, "Omega Oracle": 25 },
  { week: "W8", "Alpha Oracle": 16, "Beta Oracle": 21, "Gamma Oracle": 19, "Delta Oracle": 20, "Omega Oracle": 24 },
  { week: "W9", "Alpha Oracle": 15, "Beta Oracle": 22, "Gamma Oracle": 18, "Delta Oracle": 22, "Omega Oracle": 23 },
  { week: "W10","Alpha Oracle": 15, "Beta Oracle": 23, "Gamma Oracle": 17, "Delta Oracle": 23, "Omega Oracle": 22 },
  { week: "W11","Alpha Oracle": 14, "Beta Oracle": 24, "Gamma Oracle": 16, "Delta Oracle": 25, "Omega Oracle": 21 },
  { week: "W12","Alpha Oracle": 14, "Beta Oracle": 25, "Gamma Oracle": 15, "Delta Oracle": 26, "Omega Oracle": 20 },
];

const ASSET_BREAKDOWN = [
  { name: "QTC Liquidity Pools", value: 42, color: "#a855f7" },
  { name: "Stablecoin Reserves", value: 28, color: "#06b6d4" },
  { name: "BTC/ETH Treasury", value: 18, color: "#f59e0b" },
  { name: "Node Operations",  value: 8, color: "#10b981" },
  { name: "Governance Fund",  value: 4, color: "#ef4444" },
];

const NODE_TVL_TREND = [
  { month: "Jan", Alpha: 190, Beta: 140, Gamma: 270, Delta: 95,  Omega: 410 },
  { month: "Feb", Alpha: 210, Beta: 155, Gamma: 290, Delta: 120, Omega: 440 },
  { month: "Mar", Alpha: 250, Beta: 180, Gamma: 310, Delta: 145, Omega: 470 },
  { month: "Apr", Alpha: 290, Beta: 215, Gamma: 340, Delta: 170, Omega: 510 },
  { month: "May", Alpha: 340, Beta: 260, Gamma: 380, Delta: 200, Omega: 560 },
  { month: "Jun", Alpha: 390, Beta: 310, Gamma: 410, Delta: 240, Omega: 610 },
];

const FEES_HISTORY = [
  { month: "Jan", trading: 42, swap: 28, bridge: 12 },
  { month: "Feb", trading: 48, swap: 32, bridge: 15 },
  { month: "Mar", trading: 55, swap: 38, bridge: 18 },
  { month: "Apr", trading: 62, swap: 45, bridge: 21 },
  { month: "May", trading: 70, swap: 52, bridge: 25 },
  { month: "Jun", trading: 78, swap: 60, bridge: 30 },
];

const NODE_COLORS = { "Alpha Oracle": "#a855f7", "Beta Oracle": "#06b6d4", "Gamma Oracle": "#10b981", "Delta Oracle": "#f59e0b", "Omega Oracle": "#6366f1" };

export default function TreasuryDashboard() {
  const { data: treasury } = useQuery({
    queryKey: ["treasury"],
    queryFn: () => base44.entities.Treasury.list(),
  });

  const { data: pools = [] } = useQuery({
    queryKey: ["liquidityPools"],
    queryFn: () => base44.entities.LiquidityPool.list(),
  });

  const totalLiquidity = pools.reduce((s, p) => s + (p.total_liquidity || 0), 0);
  const totalVolume24h = pools.reduce((s, p) => s + (p.total_volume_24h || 0), 0);

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Landmark className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-200 via-orange-200 to-yellow-300 bg-clip-text text-transparent">
                Protocol Treasury
              </h1>
              <p className="text-purple-400/70 text-sm mt-0.5">Asset distribution, node allocation history, and fee analytics</p>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <Card className="bg-slate-900/60 border-amber-900/40">
              <CardContent className="p-3">
                <div className="text-xs text-amber-400/70 mb-1">Total Treasury</div>
                <div className="text-lg font-bold text-amber-200">
                  {treasury?.[0]?.usd_balance ? `$${(treasury[0].usd_balance / 1e9).toFixed(1)}B` : "$560B"}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/60 border-emerald-900/40">
              <CardContent className="p-3">
                <div className="text-xs text-emerald-400/70 mb-1">Total Pools Liquidity</div>
                <div className="text-lg font-bold text-emerald-200">{(totalLiquidity / 1000).toFixed(1)}K</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/60 border-cyan-900/40">
              <CardContent className="p-3">
                <div className="text-xs text-cyan-400/70 mb-1">24h Volume</div>
                <div className="text-lg font-bold text-cyan-200">{(totalVolume24h / 1000).toFixed(1)}K</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/60 border-purple-900/40">
              <CardContent className="p-3">
                <div className="text-xs text-purple-400/70 mb-1">Active Pools</div>
                <div className="text-lg font-bold text-purple-200">{pools.length}</div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Row 1: Asset distribution pie + Node TVL line */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-slate-900/60 border-purple-900/30 h-full">
              <CardHeader>
                <CardTitle className="text-purple-200 text-base flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-400" /> Asset Class Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={ASSET_BREAKDOWN} cx="50%" cy="50%" innerRadius={60} outerRadius={110} paddingAngle={3} dataKey="value">
                      {ASSET_BREAKDOWN.map((e, i) => <Cell key={i} fill={e.color} stroke="#1e1b4b" strokeWidth={2} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#1e1b4b", border: "1px solid #a855f7", borderRadius: "8px", fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11, color: "#c4b5fd" }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="bg-slate-900/60 border-purple-900/30 h-full">
              <CardHeader>
                <CardTitle className="text-purple-200 text-base flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" /> Node TVL Growth (6 Mo)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={NODE_TVL_TREND}>
                    <defs>
                      {Object.entries(NODE_COLORS).map(([k, c]) => (
                        <linearGradient key={k} id={`tvl_${k}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={c} stopOpacity={0.35} />
                          <stop offset="95%" stopColor={c} stopOpacity={0} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#a855f720" />
                    <XAxis dataKey="month" stroke="#a855f7" fontSize={11} />
                    <YAxis stroke="#a855f7" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(1)}K`} />
                    <Tooltip contentStyle={{ backgroundColor: "#1e1b4b", border: "1px solid #a855f7", borderRadius: "8px", fontSize: 12 }} formatter={(v) => `${v}K QTC`} />
                    <Legend wrapperStyle={{ fontSize: 11, color: "#c4b5fd" }} />
                    {Object.entries(NODE_COLORS).map(([k, c]) => (
                      <Area key={k} type="monotone" dataKey={k.replace(" Oracle", "")} name={k} stroke={c} fill={`url(#tvl_${k})`} strokeWidth={1.5} dot={false} />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Row 2: Historical distribution across nodes + Fee collection history */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-slate-900/60 border-purple-900/30 h-full">
              <CardHeader>
                <CardTitle className="text-purple-200 text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" /> Distribution Across Nodes (12 Weeks)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={HISTORICAL_DISTRIBUTION} stackOffset="expand">
                    <CartesianGrid strokeDasharray="3 3" stroke="#a855f720" />
                    <XAxis dataKey="week" stroke="#a855f7" fontSize={11} />
                    <YAxis stroke="#a855f7" fontSize={11} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                    <Tooltip contentStyle={{ backgroundColor: "#1e1b4b", border: "1px solid #a855f7", borderRadius: "8px", fontSize: 12 }} formatter={(v, name) => `${(v).toFixed(0)}% — ${name}`} />
                    <Legend wrapperStyle={{ fontSize: 11, color: "#c4b5fd" }} />
                    {Object.entries(NODE_COLORS).map(([k, c]) => (
                      <Bar key={k} dataKey={k} stackId="a" fill={c} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card className="bg-slate-900/60 border-purple-900/30 h-full">
              <CardHeader>
                <CardTitle className="text-purple-200 text-base flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-amber-400" /> Fee Revenue by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={FEES_HISTORY}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#a855f720" />
                    <XAxis dataKey="month" stroke="#a855f7" fontSize={11} />
                    <YAxis stroke="#a855f7" fontSize={11} tickFormatter={(v) => `${v}K`} />
                    <Tooltip contentStyle={{ backgroundColor: "#1e1b4b", border: "1px solid #a855f7", borderRadius: "8px", fontSize: 12 }} formatter={(v) => `${v}K QTC`} />
                    <Legend wrapperStyle={{ fontSize: 11, color: "#c4b5fd" }} />
                    <Line type="monotone" dataKey="trading" name="Trading Fees" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="swap" name="Swap Fees" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="bridge" name="Bridge Fees" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Node allocation summary */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-slate-900/60 border-purple-900/30">
            <CardHeader>
              <CardTitle className="text-purple-200 text-base flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Current Node Allocation Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-3">
                {Object.entries(NODE_COLORS).map(([name, color]) => {
                  const latest = HISTORICAL_DISTRIBUTION[HISTORICAL_DISTRIBUTION.length - 1];
                  const prev = HISTORICAL_DISTRIBUTION[HISTORICAL_DISTRIBUTION.length - 2];
                  const current = latest[name];
                  const previous = prev[name];
                  const delta = current - previous;
                  return (
                    <div key={name} className="bg-slate-800/60 rounded-lg p-3 border border-purple-900/20 text-center">
                      <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ backgroundColor: color }} />
                      <div className="text-xs text-purple-400/70">{name.replace(" Oracle", "")}</div>
                      <div className="text-lg font-bold text-purple-100">{current}%</div>
                      <div className={`text-xs flex items-center justify-center gap-0.5 ${delta >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {delta >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {delta > 0 ? "+" : ""}{delta}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}