import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Zap, ShieldCheck, TrendingUp, AlertTriangle, Info } from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const NODES = [
  { id: "alpha", label: "Alpha Oracle", baseApy: 14.2, risk: 0.15, reliability: 0.97, coverage: "ETH/USD, BTC/USD" },
  { id: "beta",  label: "Beta Oracle",  baseApy: 18.6, risk: 0.30, reliability: 0.92, coverage: "QTC/USD, QTC/BTC" },
  { id: "gamma", label: "Gamma Oracle", baseApy: 11.0, risk: 0.08, reliability: 0.99, coverage: "Stables + FX" },
  { id: "delta", label: "Delta Oracle", baseApy: 22.4, risk: 0.45, reliability: 0.88, coverage: "DeFi Blue Chips" },
  { id: "omega", label: "Omega Oracle", baseApy: 9.5,  risk: 0.05, reliability: 0.995, coverage: "Treasury Bonds" },
];

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

export default function StakeSimulator({ totalQTC = 10000 }) {
  const [alloc, setAlloc] = useState(
    Object.fromEntries(NODES.map((n, i) => [n.id, i === 0 ? 100 : 0]))
  );

  const handleSlider = (id, val) => {
    setAlloc((prev) => ({ ...prev, [id]: val[0] }));
  };

  const used = Object.values(alloc).reduce((a, b) => a + b, 0);

  const results = useMemo(() => {
    return NODES.map((n) => {
      const pct = alloc[n.id] / 100;
      const staked = totalQTC * pct;
      const rewards = staked * (n.baseApy / 100);
      const riskExposure = staked * n.risk;
      return { ...n, staked, rewards, riskExposure, pct };
    });
  }, [alloc, totalQTC]);

  const totalRewards = results.reduce((s, r) => s + r.rewards, 0);
  const totalRisk = results.reduce((s, r) => s + r.riskExposure, 0);
  const blendedApy = totalQTC > 0 ? (totalRewards / totalQTC) * 100 : 0;
  const weightedReliability = results.reduce((s, r) => s + r.reliability * r.pct, 0);

  const radarData = NODES.map((n) => ({
    node: n.label.replace(" Oracle", ""),
    allocation: alloc[n.id],
    apy: n.baseApy,
    safety: Math.round((1 - n.risk) * 100),
  }));

  const barData = results.filter((r) => r.staked > 0).map((r) => ({
    name: r.label.replace(" Oracle", ""),
    rewards: Math.round(r.rewards),
    risk: Math.round(r.riskExposure),
  }));

  const riskRating = blendedApy > 18 ? "High" : blendedApy > 13 ? "Medium" : "Low";
  const riskColor = { High: "text-red-400", Medium: "text-yellow-400", Low: "text-emerald-400" }[riskRating];

  return (
    <div className="space-y-6">
      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-950/40 to-indigo-950/40 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-purple-400/70">Blended APY</span>
            </div>
            <div className="text-2xl font-bold text-purple-200">{blendedApy.toFixed(2)}%</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-950/40 to-green-950/40 border-emerald-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-emerald-400/70">Est. Annual Rewards</span>
            </div>
            <div className="text-2xl font-bold text-emerald-200">{Math.round(totalRewards).toLocaleString()} QTC</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-950/40 to-orange-950/40 border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-amber-400/70">Risk Exposure</span>
            </div>
            <div className="text-2xl font-bold text-amber-200">{Math.round(totalRisk).toLocaleString()} QTC</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-cyan-950/40 to-blue-950/40 border-cyan-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-cyan-400/70">Reliability Score</span>
            </div>
            <div className="text-2xl font-bold text-cyan-200">{(weightedReliability * 100).toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Risk badge */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-purple-400/70">Overall risk profile:</span>
        <Badge className={`${riskColor} bg-slate-900 border border-current`}>{riskRating} Risk</Badge>
        {used !== 100 && (
          <span className="text-xs text-yellow-400 ml-auto flex items-center gap-1">
            <Info className="w-3.5 h-3.5" /> Allocation = {used}% (target 100%)
          </span>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Sliders */}
        <Card className="bg-slate-900/60 border-purple-900/40">
          <CardHeader>
            <CardTitle className="text-purple-200 text-base">Adjust Oracle Node Allocation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {NODES.map((n) => (
              <div key={n.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <span className="text-sm font-medium text-purple-200">{n.label}</span>
                    <span className="ml-2 text-xs text-purple-400/60">{n.coverage}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-purple-100">{alloc[n.id]}%</span>
                    <span className="ml-2 text-xs text-emerald-400">{n.baseApy}% APY</span>
                  </div>
                </div>
                <Slider
                  min={0}
                  max={100}
                  step={5}
                  value={[alloc[n.id]]}
                  onValueChange={(val) => handleSlider(n.id, val)}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-purple-500/50 mt-1">
                  <span>Risk: {Math.round(n.risk * 100)}%</span>
                  <span>Reliability: {Math.round(n.reliability * 100)}%</span>
                  <span>Est: {Math.round(totalQTC * (alloc[n.id] / 100) * (n.baseApy / 100))} QTC/yr</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="space-y-4">
          <Card className="bg-slate-900/60 border-purple-900/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-purple-200 text-base">Node Profile Radar</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#a855f740" />
                  <PolarAngleAxis dataKey="node" tick={{ fill: "#c4b5fd", fontSize: 11 }} />
                  <Radar name="Allocation" dataKey="allocation" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} />
                  <Radar name="APY" dataKey="apy" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} />
                  <Radar name="Safety" dataKey="safety" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
                  <Tooltip contentStyle={{ backgroundColor: "#1e1b4b", border: "1px solid #a855f7", borderRadius: "8px", fontSize: 11 }} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {barData.length > 0 && (
            <Card className="bg-slate-900/60 border-purple-900/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-purple-200 text-base">Rewards vs Risk per Node</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={barData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#a855f720" />
                    <XAxis dataKey="name" stroke="#a855f7" fontSize={11} />
                    <YAxis stroke="#a855f7" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1e1b4b", border: "1px solid #a855f7", borderRadius: "8px", fontSize: 11 }}
                      formatter={(v) => `${v.toLocaleString()} QTC`}
                    />
                    <Bar dataKey="rewards" name="Est. Rewards" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="risk" name="Risk Exposure" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}