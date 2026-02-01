import React, { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, Server, Shield } from "lucide-react";

export default function QTCNodeHealth() {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["qtcNodeHealth"],
    queryFn: async () => {
      return base44.entities.BlockchainNode.filter({ blockchain: "quantum_temple" }, "-updated_date", 20);
    },
    initialData: [],
    refetchInterval: 45000,
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    const unsub = base44.entities.BlockchainNode.subscribe((evt) => {
      if (evt?.data?.blockchain === "quantum_temple") {
        queryClient.invalidateQueries({ queryKey: ["qtcNodeHealth"] });
      }
    });
    return () => unsub?.();
  }, [queryClient]);

  const nodes = Array.isArray(data) ? data : [];
  const online = nodes.filter(n => n.status === "online").length;
  const syncing = nodes.filter(n => n.status === "syncing").length;
  const offline = nodes.filter(n => n.status === "offline" || n.status === "error").length;
  const avgSync = nodes.length ? Math.round(nodes.reduce((s, n) => s + (Number(n.sync_progress) || 0), 0) / nodes.length) : 0;

  return (
    <Card className="bg-slate-900/60 border-purple-900/40">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-purple-200 text-sm">
          <span className="flex items-center gap-2"><Server className="w-4 h-4"/>QTC Node Health</span>
          <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-500/30 flex items-center gap-1"><Shield className="w-3 h-3"/>Internal</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded bg-slate-800/50">
            <div className="text-xs text-purple-400/70">Online</div>
            <div className="text-lg font-semibold text-green-300">{online}</div>
          </div>
          <div className="text-center p-2 rounded bg-slate-800/50">
            <div className="text-xs text-purple-400/70">Syncing</div>
            <div className="text-lg font-semibold text-amber-300">{syncing}</div>
          </div>
          <div className="text-center p-2 rounded bg-slate-800/50">
            <div className="text-xs text-purple-400/70">Offline</div>
            <div className="text-lg font-semibold text-red-300">{offline}</div>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-xs text-purple-400/70 mb-1">
            <span className="flex items-center gap-2"><Activity className="w-3 h-3"/>Average Sync</span>
            <span className="text-purple-200">{avgSync}%</span>
          </div>
          <Progress value={avgSync} className="h-2" />
        </div>
        {nodes.slice(0, 3).map((n) => (
          <div key={n.id} className="text-xs flex items-center justify-between text-purple-300/80">
            <span className="truncate">{n.node_id}</span>
            <span className={
              n.status === 'online' ? 'text-green-300' : n.status === 'syncing' ? 'text-amber-300' : 'text-red-300'
            }>{n.status}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}