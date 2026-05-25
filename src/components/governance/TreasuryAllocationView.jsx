import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Landmark, TrendingUp, DollarSign, Zap } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const COLORS = ["#a855f7", "#06b6d4", "#f59e0b", "#10b981", "#6366f1", "#f43f5e"];

const ALLOCATION = [
  { name: "Liquidity Reserves", pct: 35 },
  { name: "Dev & Ops", pct: 20 },
  { name: "Staking Rewards", pct: 18 },
  { name: "Oracle Infra", pct: 12 },
  { name: "Governance Fund", pct: 10 },
  { name: "Emergency Buffer", pct: 5 },
];

const trendData = [
  { month: "Dec", reserve: 32, staking: 16, dev: 22 },
  { month: "Jan", reserve: 33, staking: 17, dev: 21 },
  { month: "Feb", reserve: 34, staking: 17, dev: 21 },
  { month: "Mar", reserve: 34, staking: 18, dev: 20 },
  { month: "Apr", reserve: 35, staking: 18, dev: 20 },
  { month: "May", reserve: 35, staking: 18, dev: 20 },
];

export default function TreasuryAllocationView() {
  const { data: fund } = useQuery({
    queryKey: ["protocolFund"],
    queryFn: async () => {
      const funds = await base44.entities.ProtocolFund.list("-establishment_date", 1);
      return funds[0] || null;
    },
  });

  const { data: proposals = [] } = useQuery({
    queryKey: ["proposals"],
    queryFn: () => base44.entities.Proposal.list("-created_date", 100),
  });

  const pending = proposals.filter((p) => ["active", "passed"].includes(p.status) && p.requested_amount > 0);
  const pendingTotal = pending.reduce((s, p) => s + (p.requested_amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Treasury Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900/60 border-amber-900/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Landmark className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-amber-400/70">Total Balance</span>
            </div>
            <div className="text-xl font-bold text-amber-200">
              ${fund?.total_balance_usd ? (fund.total_balance_usd / 1e9).toFixed(1) + "B" : "—"}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/60 border-purple-900/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-purple-400/70">QTC Reserve</span>
            </div>
            <div className="text-xl font-bold text-purple-200">
              {fund?.qtc_balance ? fund.qtc_balance.toLocaleString() : "—"}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/60 border-cyan-900/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-cyan-400/70">Pending Requests</span>
            </div>
            <div className="text-xl font-bold text-cyan-200">{pendingTotal.toLocaleString()} QTC</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/60 border-emerald-900/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-emerald-400/70">Distributed</span>
            </div>
            <div className="text-xl font-bold text-emerald-200">
              ${fund?.total_distributed ? (fund.total_distributed / 1e6).toFixed(1) + "M" : "—"}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Allocation Pie */}
        <Card className="bg-slate-900/60 border-purple-900/40">
          <CardHeader>
            <CardTitle className="text-purple-200 text-base">Current Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={ALLOCATION} dataKey="pct" cx="50%" cy="50%" outerRadius={70} paddingAngle={2}>
                    {ALLOCATION.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e1b4b", border: "1px solid #a855f7", borderRadius: "8px", fontSize: 12 }}
                    formatter={(v) => `${v}%`}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5">
                {ALLOCATION.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-purple-300">{item.name}</span>
                    </div>
                    <span className="font-semibold text-purple-200">{item.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Allocation Trend */}
        <Card className="bg-slate-900/60 border-purple-900/40">
          <CardHeader>
            <CardTitle className="text-purple-200 text-base">Allocation Trend (6M)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#a855f7" opacity={0.1} />
                <XAxis dataKey="month" stroke="#a855f7" fontSize={11} />
                <YAxis stroke="#a855f7" fontSize={11} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e1b4b", border: "1px solid #a855f7", borderRadius: "8px", fontSize: 12 }}
                  formatter={(v) => `${v}%`}
                />
                <Area type="monotone" dataKey="reserve" name="Liquidity" stroke="#a855f7" fill="url(#gR)" />
                <Area type="monotone" dataKey="staking" name="Staking" stroke="#10b981" fill="url(#gS)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Pending treasury requests from proposals */}
      {pending.length > 0 && (
        <Card className="bg-slate-900/60 border-amber-900/40">
          <CardHeader>
            <CardTitle className="text-amber-200 text-base">Pending Treasury Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pending.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm p-3 rounded-lg bg-amber-950/20 border border-amber-800/30">
                  <span className="text-amber-200 truncate mr-4">{p.title}</span>
                  <span className="text-amber-300 font-semibold whitespace-nowrap">
                    {p.requested_amount?.toLocaleString()} {p.requested_currency}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}