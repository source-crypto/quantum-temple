import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";

export default function QTCPriceWidget() {
  const { data } = useQuery({
    queryKey: ['qtcPriceWidget'],
    queryFn: async () => {
      const rows = await base44.entities.CurrencyIndex.list('-updated_date', 1);
      return rows?.[0] || null;
    },
    refetchInterval: 30000,
    refetchIntervalInBackground: true,
    initialData: null,
  });

  const price = data?.qtc_unit_price_usd ?? 0.1;
  const change = Number(data?.price_change_24h ?? 0);
  const up = change >= 0;

  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-lg border border-purple-900/30 bg-slate-950/40">
      <div>
        <div className="text-xs text-purple-400/70">QTC Price</div>
        <div className="text-lg font-semibold text-purple-100">${price.toFixed(4)}</div>
      </div>
      <Badge className={`${up ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}`}>
        {up ? '+' : ''}{change.toFixed(2)}%
      </Badge>
    </div>
  );
}