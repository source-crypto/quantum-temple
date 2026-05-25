import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp } from "lucide-react";

const data = [
  { day: "May 18", alpha: 14.1, beta: 18.2, gamma: 10.8, delta: 21.5, omega: 9.4 },
  { day: "May 19", alpha: 14.3, beta: 18.6, gamma: 11.0, delta: 22.1, omega: 9.5 },
  { day: "May 20", alpha: 14.0, beta: 17.9, gamma: 11.1, delta: 21.8, omega: 9.5 },
  { day: "May 21", alpha: 14.5, beta: 19.1, gamma: 11.2, delta: 23.0, omega: 9.6 },
  { day: "May 22", alpha: 14.2, beta: 18.8, gamma: 11.0, delta: 22.4, omega: 9.5 },
  { day: "May 23", alpha: 14.4, beta: 19.3, gamma: 11.3, delta: 22.9, omega: 9.6 },
  { day: "May 24", alpha: 14.6, beta: 19.7, gamma: 11.4, delta: 23.5, omega: 9.7 },
  { day: "May 25", alpha: 14.8, beta: 20.1, gamma: 11.5, delta: 24.1, omega: 9.8 },
];

const LINES = [
  { key: "alpha", color: "#a855f7", name: "Alpha Vault" },
  { key: "beta",  color: "#06b6d4", name: "Beta Vault" },
  { key: "gamma", color: "#10b981", name: "Gamma Vault" },
  { key: "delta", color: "#f59e0b", name: "Delta Vault" },
  { key: "omega", color: "#6366f1", name: "Omega Vault" },
];

export default function VaultPerformanceChart() {
  return (
    <Card className="bg-slate-900/60 border-purple-900/40">
      <CardHeader>
        <CardTitle className="text-purple-200 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          Vault APY History (8 days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data}>
            <defs>
              {LINES.map((l) => (
                <linearGradient key={l.key} id={`g_${l.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={l.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={l.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#a855f720" />
            <XAxis dataKey="day" stroke="#a855f7" fontSize={11} />
            <YAxis stroke="#a855f7" fontSize={11} unit="%" domain={[8, 26]} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1e1b4b", border: "1px solid #a855f7", borderRadius: "8px", fontSize: 12 }}
              formatter={(v) => `${v.toFixed(1)}%`}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: "#c4b5fd" }} />
            {LINES.map((l) => (
              <Area key={l.key} type="monotone" dataKey={l.key} name={l.name} stroke={l.color} fill={`url(#g_${l.key})`} strokeWidth={1.5} dot={false} />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}