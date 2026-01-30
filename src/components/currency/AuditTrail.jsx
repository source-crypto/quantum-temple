import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";

const SevBadge = ({ sev }) => {
  const map = {
    info: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    warning: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    error: "bg-red-500/20 text-red-300 border-red-500/30",
  };
  return <Badge className={map[sev] || map.info}>{sev}</Badge>;
};

export default function AuditTrail() {
  const { data: logs } = useQuery({
    queryKey: ["applogs"],
    queryFn: () => base44.entities.AppLog.list("-timestamp", 20),
    initialData: [],
    refetchInterval: 30000,
  });

  return (
    <Card className="bg-slate-900/60 border-purple-900/40">
      <CardHeader className="border-b border-purple-900/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-purple-200 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Audit Trail
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-60 p-4">
          {logs.length === 0 ? (
            <div className="text-center text-purple-400/60 text-sm">No audit entries</div>
          ) : (
            <div className="space-y-3">
              {logs.map((l) => (
                <div key={l.id} className="p-3 bg-slate-950/50 rounded-lg border border-purple-900/30">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm text-purple-200 font-medium">{l.type}</div>
                    <SevBadge sev={l.severity || "info"} />
                  </div>
                  <div className="text-xs text-purple-300 mb-1">{l.message}</div>
                  <div className="text-[11px] text-purple-400/70 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {l.timestamp ? format(new Date(l.timestamp), "MMM d, HH:mm:ss") : ""}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}