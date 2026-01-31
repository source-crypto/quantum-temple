import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { base44 } from "@/api/base44Client";

export default function DataFeedsPanel() {
  const { data: prices } = useQuery({
    queryKey: ['market_prices'],
    queryFn: () => base44.entities.MarketPrice.list('-timestamp', 6),
    initialData: [],
  });
  const { data: liq } = useQuery({
    queryKey: ['dex_liquidity'],
    queryFn: () => base44.entities.DexLiquiditySnapshot.list('-timestamp', 6),
    initialData: [],
  });

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card className="bg-slate-900/60 border-purple-900/30">
        <CardHeader>
          <CardTitle className="text-purple-200">Market Prices (USD)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {prices.slice(0, 3).map((p, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded border border-purple-900/30">
              <span className="text-purple-100 font-medium">{p.symbol}</span>
              <span className="text-purple-200">${Number(p.price_usd).toLocaleString()}</span>
            </div>
          ))}
          {prices.length === 0 && <div className="text-sm text-purple-300/70">Waiting for first update...</div>}
        </CardContent>
      </Card>

      <Card className="bg-slate-900/60 border-purple-900/30">
        <CardHeader>
          <CardTitle className="text-purple-200">DEX Liquidity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {liq.slice(0, 3).map((d, i) => (
            <div key={i} className="p-2 rounded border border-purple-900/30">
              <div className="flex items-center justify-between">
                <span className="text-purple-100 font-medium">{d.pair} • {d.dex}</span>
                <span className="text-purple-200">${Number(d.price_usd || 0).toFixed(4)}</span>
              </div>
              <div className="text-xs text-purple-400/70">Liquidity ${Number(d.liquidity_usd||0).toLocaleString()} • Vol 24h ${Number(d.volume24h_usd||0).toLocaleString()}</div>
            </div>
          ))}
          {liq.length === 0 && <div className="text-sm text-purple-300/70">Waiting for first update...</div>}
        </CardContent>
      </Card>
    </div>
  );
}