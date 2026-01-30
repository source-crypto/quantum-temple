import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#a78bfa", "#60a5fa", "#34d399", "#f59e0b", "#f472b6", "#38bdf8"]; 

export default function PortfolioCharts({ items, total }) {
  const data = useMemo(() => {
    const grouped = items.reduce((acc, i) => {
      acc[i.asset_symbol] = (acc[i.asset_symbol] || 0) + (i.value_usd || 0);
      return acc;
    }, {});
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [items]);

  return (
    <div className="h-64">
      {data.length ? (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" outerRadius={90}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => v.toLocaleString(undefined,{ style:'currency', currency:'USD'})} />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-purple-400/70 text-sm">No data to visualize.</div>
      )}
      <div className="text-xs text-purple-300/70 mt-3">Total Value: {Number(total || 0).toLocaleString(undefined,{ style:'currency', currency:'USD'})}</div>
    </div>
  );
}