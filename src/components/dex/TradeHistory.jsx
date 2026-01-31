import React, { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock3 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function TradeHistory() {
  const qc = useQueryClient();
  const { data: trades } = useQuery({
    queryKey: ["recent_trades"],
    queryFn: async () => {
      try {
        return await base44.entities.CurrencyTransaction.filter({ transaction_type: "trade" }, "-timestamp", 50);
      } catch (e) {
        return [];
      }
    },
    refetchInterval: 15000,
    refetchIntervalInBackground: true,
    initialData: [],
  });

  useEffect(() => {
    const unsub = base44.entities.CurrencyTransaction.subscribe((event) => {
      if (event.type === 'create' && event.data?.transaction_type === 'trade') {
        qc.invalidateQueries({ queryKey: ["recent_trades"] });
      }
    });
    return () => unsub?.();
  }, [qc]);

  return (
    <Card className="bg-slate-900/60 border-purple-900/30">
      <CardHeader>
        <CardTitle className="text-purple-200 flex items-center gap-2">
          <Clock3 className="w-4 h-4" /> Recent Trades
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 max-h-[420px] overflow-y-auto">
        {trades.length === 0 && (
          <div className="text-sm text-purple-300/70">No recent trades.</div>
        )}
        {trades.map((t, i) => (
          <div key={i} className="flex items-center justify-between p-2 rounded-lg border border-purple-900/40 bg-purple-950/10">
            <div className="text-sm text-purple-200">
              {t.note || t.status || "trade"}
              <div className="text-xs text-purple-400/70">{t.timestamp ? formatDistanceToNow(new Date(t.timestamp), { addSuffix: true }) : ""}</div>
            </div>
            <div className="flex items-center gap-2">
              {typeof t.amount === 'number' && (
                <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">{Number(t.amount).toFixed(3)}</Badge>
              )}
              {typeof t.transaction_fee === 'number' && t.transaction_fee > 0 && (
                <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">Fee {Number(t.transaction_fee).toFixed(3)}</Badge>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}