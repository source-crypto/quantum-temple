import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity } from "lucide-react";

function formatNumber(n) {
  if (n == null) return "—";
  if (typeof n !== "number") return String(n);
  if (Math.abs(n) >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + "B";
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(2) + "K";
  return n.toLocaleString();
}

export default function MetricsCorrelation({ selectedPrinciple }) {
  const { data: indices = [], isLoading: idxLoading } = useQuery({
    queryKey: ["currency-index-latest"],
    queryFn: () => base44.entities.CurrencyIndex.list("-updated_date", 1),
    initialData: [],
  });

  const { data: snapshots = [], isLoading: snapLoading } = useQuery({
    queryKey: ["blockchain-snapshots-latest"],
    queryFn: () => base44.entities.BlockchainMetricSnapshot.list("-updated_date", 30),
    initialData: [],
  });

  const latestIndex = indices[0];

  const latestByChain = useMemo(() => {
    const by = {};
    for (const s of snapshots) {
      const chain = s.chain || "unknown";
      const ts = new Date(s.timestamp || s.updated_date || 0).getTime();
      if (!by[chain] || ts > by[chain]._ts) {
        by[chain] = { ...s, _ts: ts };
      }
    }
    return by;
  }, [snapshots]);

  const chains = Object.keys(latestByChain);

  const indexPairs = [
    { label: "QTC Price (USD)", key: "qtc_unit_price_usd" },
    { label: "24h Volume", key: "volume_24h_usd" },
    { label: "24h Price Change", key: "price_change_24h" },
    { label: "Circulating Supply", key: "circulating_supply" },
    { label: "Total QTC Supply", key: "total_qtc_supply" },
    { label: "Market Rank", key: "market_cap_rank" },
  ];

  return (
    <Card className="bg-slate-900/60 border-purple-900/40">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-purple-100 flex items-center gap-2">
          <Activity className="w-5 h-5" /> Live Metrics & Principle Correlation
        </CardTitle>
        {selectedPrinciple && (
          <Badge className="bg-purple-600/30 text-purple-100 border-purple-700/40">
            Focusing: {selectedPrinciple}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* CurrencyIndex snapshot */}
        <div>
          <div className="text-sm text-purple-300/80 mb-2">Currency Index (latest)</div>
          {idxLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full bg-purple-950/40" />
              ))}
            </div>
          ) : latestIndex ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {indexPairs.map(({ label, key }) => (
                <div key={key} className="p-3 rounded-lg border border-purple-900/40 bg-slate-950/40">
                  <div className="text-xs text-purple-400/70">{label}</div>
                  <div className="text-purple-100 font-semibold">{formatNumber(latestIndex[key])}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-purple-400">No index data yet.</div>
          )}
        </div>

        {/* Blockchain metric snapshots by chain */}
        <div>
          <div className="text-sm text-purple-300/80 mb-2">Blockchain Snapshots (latest per chain)</div>
          {snapLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full bg-purple-950/40" />
              ))}
            </div>
          ) : chains.length ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {chains.map((c) => {
                const s = latestByChain[c];
                const metrics = s?.metrics || {};
                const entries = Object.entries(metrics).slice(0, 6);
                return (
                  <Card key={c} className="bg-slate-950/40 border-purple-900/40">
                    <CardHeader>
                      <CardTitle className="text-purple-100 text-base capitalize">{c}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-2">
                      {entries.length ? (
                        entries.map(([k, v]) => (
                          <div key={k} className="p-2 rounded border border-purple-900/30">
                            <div className="text-[10px] text-purple-400/70 truncate" title={k}>{k}</div>
                            <div className="text-sm text-purple-100" title={String(v)}>
                              {typeof v === "number" ? formatNumber(v) : String(v)}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-purple-400/70">No metrics provided.</div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-purple-400">No blockchain snapshots yet.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}