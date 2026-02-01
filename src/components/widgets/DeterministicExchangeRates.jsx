import React, { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftRight, DollarSign, TrendingUp } from "lucide-react";

export default function DeterministicExchangeRates() {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["deterministicExchangeRates"],
    queryFn: async () => {
      const rows = await base44.entities.CurrencyIndex.list("-updated_date", 1);
      return rows?.[0] || null;
    },
    initialData: null,
    refetchInterval: 30000,
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    const unsub = base44.entities.CurrencyIndex.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ["deterministicExchangeRates"] });
    });
    return () => unsub?.();
  }, [queryClient]);

  const idx = data;
  const usd = Number(idx?.qtc_unit_price_usd || 0);
  const btcUsd = Number(idx?.btc_price_usd || 0);
  const ethUsd = Number(idx?.eth_price_usd || 0);

  const qtcPerBtc = usd > 0 ? btcUsd / usd : 0;
  const qtcPerEth = usd > 0 ? ethUsd / usd : 0;
  const btcPerQtc = btcUsd > 0 ? usd / btcUsd : 0;
  const ethPerQtc = ethUsd > 0 ? usd / ethUsd : 0;

  return (
    <Card className="bg-slate-900/60 border-purple-900/40">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-purple-200 text-sm">
          <span className="flex items-center gap-2"><ArrowLeftRight className="w-4 h-4"/>Deterministic Exchange Rates</span>
          <Badge className="bg-indigo-500/20 text-indigo-200 border-indigo-500/30">DCI Baseline</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <div className="text-purple-300/80">1 QTC</div>
          <div className="text-purple-100 font-semibold flex items-center gap-2"><DollarSign className="w-4 h-4"/>{usd ? usd.toExponential(3) : "0"}</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-purple-300/80">QTC per BTC</div>
          <div className="text-purple-100 font-semibold">{qtcPerBtc ? qtcPerBtc.toExponential(3) : "0"}</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-purple-300/80">QTC per ETH</div>
          <div className="text-purple-100 font-semibold">{qtcPerEth ? qtcPerEth.toExponential(3) : "0"}</div>
        </div>
        <div className="grid grid-cols-2 gap-3 pt-1 text-xs text-purple-400/80">
          <div className="flex items-center justify-between"><span>BTC per QTC</span><span>{btcPerQtc ? btcPerQtc.toExponential(3) : "0"}</span></div>
          <div className="flex items-center justify-between"><span>ETH per QTC</span><span>{ethPerQtc ? ethPerQtc.toExponential(3) : "0"}</span></div>
        </div>
        <div className="pt-2 text-[10px] text-purple-400/60 flex items-center gap-2">
          <TrendingUp className="w-3 h-3"/>
          <span>Derived deterministically from current DCI • {idx?.index_name || "DCI"}</span>
        </div>
      </CardContent>
    </Card>
  );
}