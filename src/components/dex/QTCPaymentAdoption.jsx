import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Zap } from "lucide-react";

export default function QTCPaymentAdoption() {
  const { data } = useQuery({
    queryKey: ['currency_index_latest'],
    queryFn: async () => (await base44.entities.CurrencyIndex.list('-updated_date', 1))[0] || null,
    refetchInterval: 15000,
    initialData: null,
  });

  const tx24 = data?.total_transactions_24h || 0;
  const vol24 = data?.volume_24h_usd || 0;
  const priceCh = data?.price_change_24h || 0;

  return (
    <Card className="bg-slate-900/60 border-purple-900/30">
      <CardHeader>
        <CardTitle className="text-purple-200 flex items-center gap-2"><Activity className="w-4 h-4"/> QTC Payment Adoption</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-3 text-sm">
        <div className="p-3 rounded border border-green-900/30 bg-green-950/20">
          <div className="text-green-300 font-semibold">Tx 24h</div>
          <div className="text-green-200 text-lg">{tx24.toLocaleString()}</div>
        </div>
        <div className="p-3 rounded border border-cyan-900/30 bg-cyan-950/20">
          <div className="text-cyan-300 font-semibold">Volume 24h</div>
          <div className="text-cyan-200 text-lg">${Number(vol24).toLocaleString()}</div>
        </div>
        <div className="p-3 rounded border border-amber-900/30 bg-amber-950/20">
          <div className="text-amber-300 font-semibold">Price Δ 24h</div>
          <div className="text-amber-200 text-lg">{Number(priceCh).toFixed(2)}%</div>
        </div>
      </CardContent>
    </Card>
  );
}