import React, { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";

export default function QTCMetricsTicker() {
  const qc = useQueryClient();

  const { data: qtcPrice } = useQuery({
    queryKey: ['qtc_price_latest'],
    queryFn: async () => {
      const list = await base44.entities.MarketPrice.filter({ symbol: 'QTC' }, '-timestamp', 1);
      return list?.[0] || null;
    },
    initialData: null,
  });

  const { data: idx } = useQuery({
    queryKey: ['currency_index_latest'],
    queryFn: async () => (await base44.entities.CurrencyIndex.list('-updated_date', 1))[0] || null,
    initialData: null,
  });

  useEffect(() => {
    const unsubPrice = base44.entities.MarketPrice.subscribe((e) => {
      if (e.data?.symbol === 'QTC') {
        qc.invalidateQueries({ queryKey: ['qtc_price_latest'] });
      }
    });
    const unsubIndex = base44.entities.CurrencyIndex.subscribe(() => {
      qc.invalidateQueries({ queryKey: ['currency_index_latest'] });
    });
    return () => { unsubPrice?.(); unsubIndex?.(); };
  }, [qc]);

  const price = qtcPrice?.price_usd ?? idx?.qtc_unit_price_usd ?? null;
  const tx24 = idx?.total_transactions_24h ?? null;
  const vol24 = idx?.volume_24h_usd ?? null;
  const ch24 = idx?.price_change_24h ?? null;

  return (
    <div className="flex flex-wrap gap-2">
      <Badge className="bg-indigo-500/20 text-indigo-200 border-indigo-500/30">QTC ${price != null ? Number(price).toFixed(4) : '-'}</Badge>
      <Badge className="bg-amber-500/20 text-amber-200 border-amber-500/30">24h Δ {ch24 != null ? `${Number(ch24).toFixed(2)}%` : '-'}</Badge>
      <Badge className="bg-cyan-500/20 text-cyan-200 border-cyan-500/30">Tx 24h {tx24 != null ? tx24.toLocaleString() : '-'}</Badge>
      <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-500/30">Vol 24h ${vol24 != null ? Number(vol24).toLocaleString() : '-'}</Badge>
    </div>
  );
}