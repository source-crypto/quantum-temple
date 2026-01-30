import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";

function LogItem({ log }) {
  const [open, setOpen] = useState(false);
  const ts = log.timestamp || log.updated_date || log.created_date;
  const when = ts ? new Date(ts).toLocaleString() : "";
  const sev = (log.severity || "info").toLowerCase();
  const sevClass = sev === "error" ? "bg-red-500/20 text-red-200 border-red-500/30" : sev === "warning" ? "bg-amber-500/20 text-amber-200 border-amber-500/30" : "bg-emerald-500/20 text-emerald-200 border-emerald-500/30";

  return (
    <div className="rounded-lg border border-purple-900/40 bg-slate-950/40 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-purple-100 font-medium">{log.message || "Manifesto analysis"}</div>
          <div className="text-xs text-purple-400/70">{when}</div>
          {log.source && (
            <div className="text-[11px] text-purple-400/70 mt-1">source: {log.source}</div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge className={sevClass} variant="outline">{sev}</Badge>
          {(log.details || log.type) && (
            <Button size="sm" variant="outline" onClick={() => setOpen((v) => !v)} className="h-7 px-2">
              {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              <span className="ml-1 text-xs">Details</span>
            </Button>
          )}
        </div>
      </div>
      {open && (
        <pre className="mt-3 text-xs text-purple-200 bg-slate-900/60 p-3 rounded overflow-auto max-h-60 whitespace-pre-wrap">
          {JSON.stringify({ type: log.type, details: log.details }, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default function AuditContext() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["manifesto-analyst-logs"],
    queryFn: () => base44.entities.AppLog.list("-updated_date", 50),
    initialData: [],
  });

  const filtered = useMemo(() => {
    const term = "manifesto";
    return logs.filter((l) =>
      (l.source && String(l.source).toLowerCase().includes(term)) ||
      (l.message && String(l.message).toLowerCase().includes(term)) ||
      (l.type && String(l.type).toLowerCase().includes("analysis"))
    );
  }, [logs]);

  return (
    <Card className="bg-slate-900/60 border-purple-900/40">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-purple-100 flex items-center gap-2">
          <FileText className="w-5 h-5" /> Manifesto Analyst Context
        </CardTitle>
        <Badge variant="outline" className="text-purple-200 border-purple-800/60">
          {filtered.length} entries
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="text-sm text-purple-400">Loading logs…</div>
        ) : filtered.length ? (
          filtered.slice(0, 10).map((log) => <LogItem key={log.id} log={log} />)
        ) : (
          <div className="text-sm text-purple-400">No Manifesto Analyst logs found yet.</div>
        )}
      </CardContent>
    </Card>
  );
}