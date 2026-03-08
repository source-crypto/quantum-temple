import React from "react";
import { Badge } from "@/components/ui/badge";

export default function PoolRow({ pool }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-6 items-center gap-3 px-3 py-2 rounded-lg bg-slate-950/40 border border-purple-900/30">
      <div className="col-span-2 md:col-span-2">
        <div className="text-purple-100 font-medium">{pool.pool_name}</div>
        <div className="text-xs text-purple-400/70">{pool.currency_pair}</div>
      </div>
      <div className="hidden md:block text-purple-200 font-medium">{pool.apy?.toFixed?.(2) ?? pool.apy}%</div>
      <div className="text-purple-200 font-medium">${(pool.tvl_usd || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
      <div className="hidden md:block text-purple-300/80">${(pool.total_volume_24h || 0).toLocaleString()}</div>
      <div className="justify-self-end md:justify-self-start">
        <Badge variant="outline" className="bg-purple-950/40 text-purple-200 border-purple-800/60">
          {pool.fee_rate != null ? `${(Number(pool.fee_rate) * 100).toFixed(2)}% fee` : '—'}
        </Badge>
      </div>
    </div>
  );
}