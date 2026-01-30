import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Activity, Network, Clock, BarChart3 } from "lucide-react";
import { format } from "date-fns";

function ChainRow({ title, metrics, timestamp, color }) {
  return (
    <div className="p-3 rounded-lg border bg-slate-950/40 border-slate-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${color} animate-pulse`} />
          <div className="text-sm font-medium text-purple-200">{title}</div>
        </div>
        {timestamp && (
          <div className="text-[11px] text-purple-400/70 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {format(new Date(timestamp), "MMM d, HH:mm")}
          </div>
        )}
      </div>
      {metrics ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-xs">
          {Object.entries(metrics).map(([k, v]) => (
            <div key={k} className="space-y-1">
              <div className="text-purple-400/70 capitalize">{k.replace(/_/g, " ")}</div>
              <div className="font-mono text-purple-200 break-all">{v ?? "-"}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-3"><Skeleton className="h-5 w-full" /></div>
      )}
    </div>
  );
}

export default function BlockchainMetricsPanel() {
  const { data: snapshots, isLoading } = useQuery({
    queryKey: ["blockchainMetricSnapshots"],
    queryFn: () => base44.entities.BlockchainMetricSnapshot.list("-timestamp", 50),
    initialData: [],
    refetchInterval: 30000,
  });

  const latestByChain = React.useMemo(() => {
    const by = { bitcoin: null, ethereum: null, qtc: null };
    for (const s of snapshots) {
      if (!by[s.chain]) by[s.chain] = s;
    }
    return by;
  }, [snapshots]);

  return (
    <Card className="bg-slate-900/60 border-purple-900/40">
      <CardHeader className="border-b border-purple-900/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-purple-200 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            On-Chain Metrics & Index Alignment
          </CardTitle>
          <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
            <Network className="w-3 h-3 mr-1" /> Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {isLoading && <Skeleton className="h-6 w-40" />}

        <ChainRow
          title="Bitcoin"
          metrics={latestByChain.bitcoin?.metrics}
          timestamp={latestByChain.bitcoin?.timestamp}
          color="bg-amber-400"
        />
        <ChainRow
          title="Ethereum"
          metrics={latestByChain.ethereum?.metrics}
          timestamp={latestByChain.ethereum?.timestamp}
          color="bg-emerald-400"
        />
        <ChainRow
          title="QTC (Internal Index)"
          metrics={latestByChain.qtc?.metrics}
          timestamp={latestByChain.qtc?.timestamp}
          color="bg-fuchsia-400"
        />

        <div className="text-[11px] text-purple-400/60 mt-2 flex items-center gap-2">
          <Activity className="w-3 h-3" />
          Sources: blockstream, blockchain.info, etherchain, coinbase, internal CurrencyIndex. Snapshots every 15 minutes.
        </div>
      </CardContent>
    </Card>
  );
}