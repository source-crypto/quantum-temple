import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Sparkles } from "lucide-react";
import { format } from "date-fns";

export default function IntentNodesVisualization() {
  const [nodesLive, setNodesLive] = useState([]);
  const [selected, setSelected] = useState(null);

  const nodesQuery = useQuery({
    queryKey: ["intentNodes-full"],
    queryFn: async () => {
      try { return await base44.entities.IntentNode.list("-created_date", 50); } catch { return []; }
    },
    initialData: []
  });

  useEffect(() => {
    setNodesLive(nodesQuery.data || []);
  }, [nodesQuery.data]);

  // Subscribe for real-time updates
  useEffect(() => {
    const unsubscribe = base44.entities.IntentNode.subscribe((event) => {
      setNodesLive((prev) => {
        if (event.type === "create") return [...prev, event.data];
        if (event.type === "update") return prev.map((n) => (n.id === event.id ? event.data : n));
        if (event.type === "delete") return prev.filter((n) => n.id !== event.id);
        return prev;
      });
    });
    return unsubscribe;
  }, []);

  const data12 = useMemo(() => {
    const mapped = (nodesLive||[]).slice(0,12).map((n) => ({
      name: `OC ${n.oc_number ?? '-'}`,
      oc_number: n.oc_number,
      resonance: Number(n.resonance_level ?? 0),
      transparency: Number(n.transparency_accumulated ?? 0),
      status: n.status || 'inactive',
      id: n.id
    }));
    // Highlight top 3 by transparency
    const top = [...mapped].sort((a,b) => b.transparency - a.transparency).slice(0,3).map(x=>x.oc_number).filter(Boolean);
    return mapped.map((m) => ({ ...m, top: top.includes(m.oc_number)}));
  }, [nodesLive]);

  const NodeEvents = ({ node }) => {
    const evQuery = useQuery({
      queryKey: ["manifestationEvents", node?.oc_number],
      queryFn: async () => {
        if (!node?.oc_number) return [];
        try { return await base44.entities.ManifestationEvent.filter({ node_oc_number: node.oc_number }, "-timestamp", 50); } catch { return []; }
      },
      enabled: !!node?.oc_number,
      initialData: []
    });

    const chartData = (evQuery.data||[]).slice().reverse().map((e, idx) => ({
      idx: idx+1,
      total: e.total_transparency || 0,
      units: e.units_added || e.units || 0,
      when: format(new Date(e.timestamp || e.event_date || e.created_date), 'PP p')
    }));

    return (
      <div className="space-y-3">
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#312e81" strokeDasharray="3 3" />
              <XAxis dataKey="idx" stroke="#a78bfa99" tick={{ fontSize: 11 }} />
              <YAxis stroke="#a78bfa66" width={36} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #6b21a8", color: "#ddd" }} />
              <Legend />
              <Bar dataKey="units" barSize={10} fill="#f59e0b" name="Units" />
              <Line type="monotone" dataKey="total" stroke="#a78bfa" strokeWidth={2} name="Total Transparency" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-1 max-h-40 overflow-auto text-xs text-purple-300/80">
          {(evQuery.data||[]).map((ev) => (
            <div key={ev.id} className="p-2 bg-slate-950/50 rounded border border-purple-900/30 flex items-center justify-between">
              <span>{format(new Date(ev.timestamp || ev.event_date || ev.created_date), 'PP p')}</span>
              <span className="font-mono">+{ev.units_added || ev.units || 0} • {ev.total_transparency}/12</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-slate-900/60 border-purple-900/40">
      <CardHeader className="border-b border-purple-900/30">
        <CardTitle className="text-purple-200 flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Intent Nodes • Resonance & Transparency
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data12} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#312e81" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#a78bfa88" tick={{ fontSize: 11 }} />
              <YAxis stroke="#a78bfa66" width={36} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #6b21a8", color: "#ddd" }} />
              <Legend />
              <Bar dataKey="resonance" barSize={12} fill="#22c55e" name="Resonance" />
              <Line type="monotone" dataKey="transparency" stroke="#a78bfa" strokeWidth={2} name="Transparency" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          {data12.map((n) => (
            <div
              key={n.id || n.name}
              className={`p-3 rounded border cursor-pointer transition hover:opacity-90 ${n.status==='active' ? 'border-green-500/30 bg-green-950/10' : 'border-purple-900/30 bg-slate-950/50'}`}
              onClick={() => setSelected(n)}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm text-purple-200 font-semibold">{n.name}</div>
                {n.top && <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px]">Top</Badge>}
              </div>
              <div className="text-xs text-purple-400/70 mt-1">Resonance: <span className="text-purple-200 font-mono">{n.resonance}</span></div>
              <div className="text-xs text-purple-400/70">Transparency: <span className="text-purple-200 font-mono">{n.transparency}</span></div>
              <div className="text-[11px] text-purple-400/60 mt-1">Status: <span className="capitalize">{n.status}</span></div>
            </div>
          ))}
        </div>

        <Dialog open={!!selected} onOpenChange={(o)=>!o && setSelected(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-purple-200">OC {selected?.oc_number} • Node Contributions</DialogTitle>
            </DialogHeader>
            {selected && <NodeEvents node={selected} />}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}