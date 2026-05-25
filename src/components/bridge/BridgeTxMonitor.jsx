import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const statusConfig = {
  pending:    { icon: Clock,        color: "text-yellow-400", badge: "bg-yellow-900/40 text-yellow-300 border-yellow-600/40" },
  confirming: { icon: Loader2,      color: "text-blue-400",   badge: "bg-blue-900/40 text-blue-300 border-blue-600/40" },
  completed:  { icon: CheckCircle2, color: "text-emerald-400",badge: "bg-emerald-900/40 text-emerald-300 border-emerald-600/40" },
  failed:     { icon: XCircle,      color: "text-red-400",    badge: "bg-red-900/40 text-red-300 border-red-600/40" },
};

const CHAIN_LABELS = {
  ethereum: "Ethereum", solana: "Solana", polygon: "Polygon",
  avalanche: "Avalanche", bsc: "BSC", quantum_temple: "QTC",
};

export default function BridgeTxMonitor({ user }) {
  const { data: txns = [], isLoading } = useQuery({
    queryKey: ["bridgeTxns", user?.email],
    queryFn: () => user
      ? base44.entities.CryptoBridge.filter({ user_email: user.email }, "-timestamp", 20)
      : [],
    enabled: !!user,
    refetchInterval: 10000,
  });

  const pending = txns.filter((t) => ["pending", "confirming"].includes(t.status));
  const completed = txns.filter((t) => !["pending", "confirming"].includes(t.status));

  return (
    <div className="space-y-4">
      {/* Live pending */}
      <Card className="bg-slate-900/60 border-yellow-900/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-yellow-200 flex items-center gap-2 text-base">
            <Activity className="w-4 h-4 text-yellow-400" />
            Live Pending ({pending.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-purple-400/60 text-sm py-4 text-center">Loading…</div>
          ) : pending.length === 0 ? (
            <div className="text-purple-400/50 text-sm py-4 text-center">No pending transactions</div>
          ) : (
            <div className="space-y-2">
              {pending.map((tx) => {
                const cfg = statusConfig[tx.status] || statusConfig.pending;
                const Icon = cfg.icon;
                return (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/60 border border-yellow-900/30 text-sm">
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${cfg.color} ${tx.status === "confirming" ? "animate-spin" : ""}`} />
                      <div>
                        <div className="text-purple-200 font-medium">
                          {tx.source_amount?.toLocaleString()} QTC → {CHAIN_LABELS[tx.destination_chain] || tx.destination_chain}
                        </div>
                        <div className="text-purple-400/50 text-xs font-mono">{tx.qtc_transaction_hash?.slice(0, 20)}…</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`text-xs border ${cfg.badge} mb-1`}>{tx.status}</Badge>
                      <div className="text-xs text-purple-400/50">
                        {tx.timestamp ? formatDistanceToNow(new Date(tx.timestamp), { addSuffix: true }) : ""}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* History */}
      <Card className="bg-slate-900/60 border-purple-900/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-purple-200 flex items-center gap-2 text-base">
            <Clock className="w-4 h-4 text-purple-400" />
            Transfer History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {completed.length === 0 ? (
            <div className="text-purple-400/50 text-sm py-4 text-center">No completed transfers yet</div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {completed.map((tx) => {
                const cfg = statusConfig[tx.status] || statusConfig.completed;
                const Icon = cfg.icon;
                return (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-purple-900/20 text-sm">
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${cfg.color}`} />
                      <div>
                        <div className="text-purple-200">
                          {tx.source_amount?.toLocaleString()} QTC → {tx.destination_amount?.toFixed(4)} w{CHAIN_LABELS[tx.destination_chain] || "QTC"}
                        </div>
                        <div className="text-purple-400/50 text-xs">
                          Fee: {tx.bridge_fee?.toFixed(4)} QTC
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`text-xs border ${cfg.badge} mb-1`}>{tx.status}</Badge>
                      <div className="text-xs text-purple-400/50">
                        {tx.timestamp ? formatDistanceToNow(new Date(tx.timestamp), { addSuffix: true }) : ""}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}