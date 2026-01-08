import React, { useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, Coins, Flame, Layers } from "lucide-react";

export default function AbundanceManifestTracker() {
  const { data: mints = [] } = useQuery({
    queryKey: ["currencyMints"],
    queryFn: () => base44.entities.CurrencyMint.list("-timestamp", 200),
    initialData: [],
  });
  const { data: offerings = [] } = useQuery({
    queryKey: ["divineOfferings"],
    queryFn: () => base44.entities.DivineOffering.list("-timestamp", 200),
    initialData: [],
  });
  const { data: txs = [] } = useQuery({
    queryKey: ["currencyTx"],
    queryFn: () => base44.entities.CurrencyTransaction.list("-timestamp", 200),
    initialData: [],
  });

  const stats = useMemo(() => {
    const sum = (arr, key) => arr.reduce((s, x) => s + (Number(x[key]) || 0), 0);
    const totalMinted = sum(mints, "amount");
    const totalOffered = sum(offerings, "amount");
    const completedTx = txs.filter(t => t.status === "completed");
    const totalTransferred = sum(completedTx, "amount");
    const transparencyEvents = mints.length + offerings.length + completedTx.length;
    const transparencyScore = Math.min(100, Math.log10(1 + totalMinted + totalOffered * 0.5 + completedTx.length) * 25);

    return {
      totalMinted,
      totalOffered,
      totalTransferred,
      transparencyEvents,
      transparencyScore,
    };
  }, [mints, offerings, txs]);

  return (
    <Card className="bg-gradient-to-r from-purple-950/60 to-indigo-950/60 border-purple-500/50">
      <CardHeader>
        <CardTitle className="text-purple-200 flex items-center gap-2">
          <Layers className="w-5 h-5" />
          Abundance Manifest • Transparency Accumulation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg border border-purple-500/30 bg-slate-950/50">
            <div className="text-xs text-purple-400/70 mb-1">Total Minted</div>
            <div className="text-2xl font-bold text-purple-200">{stats.totalMinted.toFixed(2)}</div>
            <Badge className="mt-2 bg-amber-500/20 text-amber-300 border-amber-500/30 flex w-fit items-center"><Coins className="w-3 h-3 mr-1"/>QTC</Badge>
          </div>
          <div className="p-4 rounded-lg border border-purple-500/30 bg-slate-950/50">
            <div className="text-xs text-purple-400/70 mb-1">Offerings</div>
            <div className="text-2xl font-bold text-purple-200">{stats.totalOffered.toFixed(2)}</div>
            <Badge className="mt-2 bg-pink-500/20 text-pink-300 border-pink-500/30">Spiritual</Badge>
          </div>
          <div className="p-4 rounded-lg border border-purple-500/30 bg-slate-950/50">
            <div className="text-xs text-purple-400/70 mb-1">Transferred</div>
            <div className="text-2xl font-bold text-purple-200">{stats.totalTransferred.toFixed(2)}</div>
            <Badge className="mt-2 bg-cyan-500/20 text-cyan-300 border-cyan-500/30">Completed</Badge>
          </div>
          <div className="p-4 rounded-lg border border-purple-500/30 bg-slate-950/50">
            <div className="text-xs text-purple-400/70 mb-1">Transparency Score</div>
            <div className="text-2xl font-bold text-purple-200">{stats.transparencyScore.toFixed(0)}%</div>
            <Progress value={stats.transparencyScore} className="h-1 mt-2" />
          </div>
        </div>
        <div className="mt-4 text-xs text-purple-400/70 flex items-center gap-2">
          <Activity className="w-3 h-3" />
          {stats.transparencyEvents} transparent events observed (mints, offerings, completed transfers)
        </div>
      </CardContent>
    </Card>
  );
}