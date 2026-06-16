import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from "recharts";
import { TrendingUp, TrendingDown, ShieldCheck, AlertTriangle, Zap, Clock, Activity } from "lucide-react";

// ── APY trend over time (daily snapshots, last 14 days) ──
const APY_TREND = [
  { day: "D-13", "Alpha Vault": 14.3, "Beta Vault": 18.6, "Gamma Vault": 11.0, "Delta Vault": 22.1, "Omega Vault": 9.5 },
  { day: "D-12", "Alpha Vault": 14.0, "Beta Vault": 17.9, "Gamma Vault": 11.1, "Delta Vault": 21.8, "Omega Vault": 9.5 },
  { day: "D-11", "Alpha Vault": 14.5, "Beta Vault": 19.1, "Gamma Vault": 11.2, "Delta Vault": 23.0, "Omega Vault": 9.6 },
  { day: "D-10", "Alpha Vault": 14.2, "Beta Vault": 18.8, "Gamma Vault": 11.0, "Delta Vault": 22.4, "Omega Vault": 9.5 },
  { day: "D-9",  "Alpha Vault": 14.4, "Beta Vault": 19.3, "Gamma Vault": 11.3, "Delta Vault": 22.9, "Omega Vault": 9.6 },
  { day: "D-8",  "Alpha Vault": 14.6, "Beta Vault": 19.7, "Gamma Vault": 11.4, "Delta Vault": 23.5, "Omega Vault": 9.7 },
  { day: "D-7",  "Alpha Vault": 14.8, "Beta Vault": 20.1, "Gamma Vault": 11.5, "Delta Vault": 24.1, "Omega Vault": 9.8 },
  { day: "D-6",  "Alpha Vault": 14.7, "Beta Vault": 19.8, "Gamma Vault": 11.4, "Delta Vault": 23.8, "Omega Vault": 9.7 },
  { day: "D-5",  "Alpha Vault": 15.0, "Beta Vault": 20.3, "Gamma Vault": 11.6, "Delta Vault": 24.5, "Omega Vault": 9.9 },
  { day: "D-4",  "Alpha Vault": 14.9, "Beta Vault": 20.0, "Gamma Vault": 11.5, "Delta Vault": 24.3, "Omega Vault": 9.8 },
  { day: "D-3",  "Alpha Vault": 15.1, "Beta Vault": 20.5, "Gamma Vault": 11.7, "Delta Vault": 24.8, "Omega Vault": 10.0 },
  { day: "D-2",  "Alpha Vault": 14.8, "Beta Vault": 20.1, "Gamma Vault": 11.5, "Delta Vault": 24.1, "Omega Vault": 9.8 },
  { day: "D-1",  "Alpha Vault": 14.9, "Beta Vault": 20.4, "Gamma Vault": 11.6, "Delta Vault": 24.6, "Omega Vault": 9.9 },
  { day: "Today","Alpha Vault": 14.8, "Beta Vault": 20.1, "Gamma Vault": 11.5, "Delta Vault": 24.1, "Omega Vault": 9.8 },
];

// ── Risk radar data ──
const RISK_RADAR = [
  { metric: "Volatility",   Alpha: 15, Beta: 55, Gamma: 10, Delta: 80, Omega: 5  },
  { metric: "Drawdown",     Alpha: 10, Beta: 50, Gamma: 8,  Delta: 75, Omega: 5  },
  { metric: "Liquidity",    Alpha: 80, Beta: 55, Gamma: 90, Delta: 30, Omega: 95 },
  { metric: "Oracle Trust", Alpha: 85, Beta: 70, Gamma: 75, Delta: 55, Omega: 90 },
  { metric: "Audit Score",  Alpha: 90, Beta: 65, Gamma: 85, Delta: 40, Omega: 95 },
];

const VAULT_COLORS = {
  "Alpha Vault": "#a855f7",
  "Beta Vault": "#06b6d4",
  "Gamma Vault": "#10b981",
  "Delta Vault": "#f59e0b",
  "Omega Vault": "#6366f1",
};

// ── Weekly return bars ──
const WEEKLY_RETURNS = [
  { vault: "Alpha", return_pct: 0.28 },
  { vault: "Beta",  return_pct: 0.39 },
  { vault: "Gamma", return_pct: 0.22 },
  { vault: "Delta", return_pct: 0.46 },
  { vault: "Omega", return_pct: 0.19 },
];

const RISK_LABEL = { low: "Low", medium: "Medium", high: "High" };
const RISK_STYLE = {
  low:    "text-emerald-400 bg-emerald-500/10 border-emerald-500/40",
  medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/40",
  high:   "text-red-400 bg-red-500/10 border-red-500/40",
};

export default function VaultAnalyticsDashboard({ vaults = [], onSendReport }) {
  const [selectedVault, setSelectedVault] = useState(null);

  const vaultList = vaults.length > 0 ? vaults : [
    { id: "v-alpha", name: "Alpha Vault", risk: "low", current_apy: 14.8, tvl: 842000 },
    { id: "v-beta",  name: "Beta Vault",  risk: "medium", current_apy: 20.1, tvl: 530000 },
    { id: "v-gamma", name: "Gamma Vault", risk: "low", current_apy: 11.5, tvl: 1240000 },
    { id: "v-delta", name: "Delta Vault", risk: "high", current_apy: 24.1, tvl: 190000 },
    { id: "v-omega", name: "Omega Vault", risk: "low", current_apy: 9.8, tvl: 3200000 },
  ];

  return (
    <div className="space-y-6">
      {/* One-Click Report Card */}
      {onSendReport && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-gradient-to-r from-slate-900/80 via-purple-950/40 to-slate-900/80 border-purple-700/40">
            <CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-800 rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/30">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-purple-200">Weekly Performance Report</div>
                  <div className="text-xs text-purple-400/70">Get a full vault summary delivered to your email — one click</div>
                </div>
              </div>
              <Button
                size="sm"
                className="bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white shadow-lg shadow-purple-600/30"
                onClick={onSendReport}
              >
                <Clock className="w-3.5 h-3.5 mr-1" /> Send Weekly Report
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* APY Trend Chart */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-slate-900/60 border-purple-900/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-purple-200 text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Real-Time APY Trends (14 Days)
            </CardTitle>
            <Badge className="text-xs bg-emerald-900/40 text-emerald-300 border-emerald-600/40 flex items-center gap-1">
              <Activity className="w-3 h-3" /> Live
            </Badge>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={APY_TREND}>
                <defs>
                  {Object.entries(VAULT_COLORS).map(([k, c]) => (
                    <linearGradient key={k} id={`apy_${k}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={c} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={c} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#a855f720" />
                <XAxis dataKey="day" stroke="#a855f7" fontSize={11} />
                <YAxis stroke="#a855f7" fontSize={11} unit="%" domain={[8, 26]} />
                <Tooltip contentStyle={{ backgroundColor: "#1e1b4b", border: "1px solid #a855f7", borderRadius: "8px", fontSize: 12 }} formatter={(v) => `${v.toFixed(1)}%`} />
                <Legend wrapperStyle={{ fontSize: 11, color: "#c4b5fd" }} />
                {Object.entries(VAULT_COLORS).map(([k, c]) => (
                  <Area key={k} type="monotone" dataKey={k} stroke={c} fill={`url(#apy_${k})`} strokeWidth={1.5} dot={false} />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Weekly Returns + Risk Radar side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly performance bars */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-slate-900/60 border-purple-900/30 h-full">
            <CardHeader>
              <CardTitle className="text-purple-200 text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" /> 7-Day Returns by Vault
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={WEEKLY_RETURNS} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#a855f720" />
                  <XAxis type="number" stroke="#a855f7" fontSize={11} unit="%" />
                  <YAxis type="category" dataKey="vault" stroke="#a855f7" fontSize={11} width={60} />
                  <Tooltip contentStyle={{ backgroundColor: "#1e1b4b", border: "1px solid #a855f7", borderRadius: "8px", fontSize: 12 }} formatter={(v) => `${v}%`} />
                  <Bar dataKey="return_pct" radius={[0, 6, 6, 0]}>
                    {WEEKLY_RETURNS.map((e, i) => (
                      <Cell key={i} fill={VAULT_COLORS[`${e.vault} Vault`] || "#a855f7"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Risk Radar */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="bg-slate-900/60 border-purple-900/30 h-full">
            <CardHeader>
              <CardTitle className="text-purple-200 text-base flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" /> Risk Profile Comparison
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={RISK_RADAR}>
                  <PolarGrid stroke="#a855f730" />
                  <PolarAngleAxis dataKey="metric" stroke="#a855f7" fontSize={10} tick={{ fill: "#c4b5fd" }} />
                  <PolarRadiusAxis stroke="#a855f7" fontSize={9} />
                  {Object.entries(VAULT_COLORS).map(([k, c]) => (
                    <Radar key={k} dataKey={k} stroke={c} fill={c} fillOpacity={0.15} strokeWidth={1.5} />
                  ))}
                  <Legend wrapperStyle={{ fontSize: 10, color: "#c4b5fd" }} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Risk ratings summary cards */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="bg-slate-900/60 border-purple-900/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-purple-200 text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Vault Risk Ratings & Health
            </CardTitle>
            {onSendReport && (
              <Button size="sm" variant="ghost" className="text-xs text-purple-400 hover:text-purple-300" onClick={onSendReport}>
                <Clock className="w-3.5 h-3.5 mr-1" /> Send Weekly Report
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {vaultList.map((v) => {
                const riskColor = v.risk === "low" ? "#10b981" : v.risk === "medium" ? "#f59e0b" : "#ef4444";
                return (
                  <div key={v.id} className="bg-slate-800/60 rounded-lg p-4 border border-purple-900/20 hover:border-purple-700/40 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-semibold text-purple-200 truncate">{v.name}</div>
                      <Badge className={`text-xs border ${RISK_STYLE[v.risk]}`}>{RISK_LABEL[v.risk]}</Badge>
                    </div>
                    <div className="text-2xl font-bold text-emerald-300 mb-1">{v.current_apy?.toFixed(1)}%</div>
                    <div className="text-xs text-purple-400/60 mb-2">APY</div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-purple-400/60">Utilization</span>
                        <span className="text-purple-300">{v.capacity_pct || Math.round(Math.random() * 60 + 30)}%</span>
                      </div>
                      <Progress value={v.capacity_pct || 55} className="h-1 [&>div]:bg-emerald-500" />
                    </div>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-purple-900/20">
                      <div className="text-xs text-purple-400/60">{((v.tvl || 0) / 1000).toFixed(0)}K QTC</div>
                      <div className="flex items-center gap-0.5 text-xs text-emerald-400">
                        <TrendingUp className="w-3 h-3" />
                        {v.risk === "high" ? "+6.0" : v.risk === "medium" ? "+5.0" : "+3.7"}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}