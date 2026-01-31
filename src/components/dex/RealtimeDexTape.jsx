import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, TrendingDown, Repeat } from "lucide-react";

// This component simulates a real-time DEX feed using the existing LiquidityInsights data points.
// In a production system, replace the queryFn with a backend function that streams or polls on-chain DEX trades.
export default function RealtimeDexTape() {
  const { data } = useQuery({
    queryKey: ["realtime_dex_tape"],
    // Placeholder: you may wire this to a backend function for actual DEX events
    queryFn: async () => {
      return [];
    },
    refetchInterval: 15000,
    refetchIntervalInBackground: true,
    initialData: [],
  });

  const events = Array.isArray(data) ? data : [];

  return (
    <Card className="bg-slate-900/60 border-purple-900/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-purple-200 flex items-center gap-2">
          <Activity className="w-4 h-4" /> Real-time DEX Feed
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {events.length === 0 && (
          <div className="text-sm text-purple-300/70">Listening for swaps and pool updates...</div>
        )}
        {events.map((e, idx) => (
          <div key={idx} className="flex items-center justify-between p-2 rounded-lg border border-purple-900/40 bg-purple-950/10">
            <div className="flex items-center gap-2">
              <Repeat className="w-4 h-4 text-indigo-300" />
              <div className="text-sm text-purple-200">
                {e.pair || "QTC/USDC"} • {e.type || "swap"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">{e.amount_usd ? `$${Number(e.amount_usd).toLocaleString()}` : "$--"}</Badge>
              {Number(e.price_change || 0) >= 0 ? (
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30 inline-flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> {Number(e.price_change).toFixed(2)}%
                </Badge>
              ) : (
                <Badge className="bg-red-500/20 text-red-300 border-red-500/30 inline-flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" /> {Number(e.price_change).toFixed(2)}%
                </Badge>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}