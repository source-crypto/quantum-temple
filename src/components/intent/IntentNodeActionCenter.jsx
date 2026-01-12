import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Activity, Pause, Archive, Play, TrendingUp, Zap } from "lucide-react";

export default function IntentNodeActionCenter() {
  const qc = useQueryClient();
  const [nodes, setNodes] = useState([]);
  const [resBoost, setResBoost] = useState({});
  const [transAdd, setTransAdd] = useState({});
  const [ruleDraft, setRuleDraft] = useState({});

  const nodesQuery = useQuery({
    queryKey: ["intentNodes-action-center"],
    queryFn: () => base44.entities.IntentNode.list("-updated_date", 50),
    initialData: []
  });

  useEffect(() => setNodes(nodesQuery.data || []), [nodesQuery.data]);

  useEffect(() => {
    const unsub = base44.entities.IntentNode.subscribe((ev) => {
      setNodes((prev) => {
        if (ev.type === "create") return [ev.data, ...prev];
        if (ev.type === "update") return prev.map((n) => (n.id === ev.id ? ev.data : n));
        if (ev.type === "delete") return prev.filter((n) => n.id !== ev.id);
        return prev;
      });
    });
    return unsub;
  }, []);

  const rulesQuery = useQuery({
    queryKey: ["nodeAlertRules"],
    queryFn: async () => {
      try { return await base44.entities.NodeAlertRule.list("-created_date", 200); } catch { return []; }
    },
    initialData: []
  });

  // Alert evaluation
  useEffect(() => {
    const rules = rulesQuery.data || [];
    if (!rules.length) return;
    nodes.forEach((n) => {
      const rForNode = rules.filter((r) => r.enabled && (r.node_id === n.id || r.oc_number === n.oc_number));
      rForNode.forEach((r) => {
        if (r.threshold_type === "resonance_below" && Number(n.resonance_level||0) < Number(r.threshold_value)) {
          toast.warning(`Low resonance on OC ${n.oc_number}`, { description: `Resonance ${n.resonance_level} < ${r.threshold_value}` });
        }
        if (r.threshold_type === "transparency_below" && Number(n.transparency_accumulated||0) < Number(r.threshold_value)) {
          toast.warning(`Low transparency on OC ${n.oc_number}`, { description: `Transparency ${n.transparency_accumulated} < ${r.threshold_value}` });
        }
      });
    });
  }, [nodes, rulesQuery.data]);

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.IntentNode.update(id, { status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["intentNodes-action-center"] }); toast.success("Node status updated"); }
  });

  const boostResonance = useMutation({
    mutationFn: async ({ node, amount }) => {
      const newVal = Number(node.resonance_level || 0) + Number(amount || 0);
      return base44.entities.IntentNode.update(node.id, { resonance_level: newVal });
    },
    onSuccess: () => { toast.success("Resonance boosted"); }
  });

  const addTransparency = useMutation({
    mutationFn: async ({ node, amount }) => {
      const newVal = Number(node.transparency_accumulated || 0) + Number(amount || 0);
      await base44.entities.IntentNode.update(node.id, { transparency_accumulated: newVal });
      await base44.entities.ManifestationEvent.create({
        event_type: "increment",
        node_oc_number: node.oc_number,
        units_added: Number(amount||0),
        total_transparency: newVal,
        note: `Manual accumulation for OC ${node.oc_number}`,
        timestamp: new Date().toISOString()
      });
      return true;
    },
    onSuccess: () => { toast.success("Transparency added"); qc.invalidateQueries({ queryKey: ["manifestationEvents"] }); }
  });

  const createRule = useMutation({
    mutationFn: async ({ node, draft }) => {
      return base44.entities.NodeAlertRule.create({
        node_id: node.id,
        oc_number: node.oc_number,
        threshold_type: draft.type,
        threshold_value: Number(draft.value || 0),
        enabled: true,
        note: draft.note || ""
      });
    },
    onSuccess: () => { toast.success("Alert rule created"); qc.invalidateQueries({ queryKey: ["nodeAlertRules"] }); }
  });

  const health = (n) => {
    const r = Number(n.resonance_level || 0);
    const t = Number(n.transparency_accumulated || 0);
    const s = (r * 0.6) + Math.min(100, t) * 0.4;
    return Math.max(0, Math.min(100, Math.round(s)));
  };

  return (
    <Card className="bg-slate-900/60 border-purple-900/40">
      <CardHeader className="border-b border-purple-900/30">
        <CardTitle className="text-purple-200 flex items-center gap-2"><TrendingUp className="w-5 h-5" /> Intent Node Action Center</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="grid md:grid-cols-3 gap-3">
          {(nodes||[]).map((n) => (
            <div key={n.id} className="p-3 rounded border border-purple-900/30 bg-slate-950/50">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-purple-200 font-semibold">OC {n.oc_number || "-"}</div>
                <Badge className={n.status === 'active' ? 'bg-green-500/20 text-green-300 border-green-500/30' : n.status === 'paused' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-purple-500/20 text-purple-300 border-purple-500/30'}>
                  {n.status || 'inactive'}
                </Badge>
              </div>
              <div className="space-y-2 text-xs text-purple-300/80">
                <div className="flex items-center justify-between"><span>Resonance</span><span className="font-mono">{Number(n.resonance_level||0)}</span></div>
                <div className="flex items-center justify-between"><span>Transparency</span><span className="font-mono">{Number(n.transparency_accumulated||0)}</span></div>
                <Progress value={health(n)} className="h-1" />
              </div>

              <div className="mt-3 flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={()=>updateStatus.mutate({ id: n.id, status: 'active' })}><Play className="w-4 h-4 mr-1" />Activate</Button>
                <Button size="sm" variant="outline" onClick={()=>updateStatus.mutate({ id: n.id, status: 'paused' })}><Pause className="w-4 h-4 mr-1" />Pause</Button>
                <Button size="sm" variant="outline" onClick={()=>updateStatus.mutate({ id: n.id, status: 'archived' })}><Archive className="w-4 h-4 mr-1" />Archive</Button>
              </div>

              <div className="mt-3 p-2 rounded border border-purple-900/30">
                <div className="text-[11px] text-purple-400/70 mb-1">Targeted Actions</div>
                <div className="flex items-center gap-2 mb-2">
                  <Input placeholder="Resonance +" value={resBoost[n.id]||""} onChange={(e)=>setResBoost({...resBoost, [n.id]: e.target.value})} className="h-8" />
                  <Button size="sm" onClick={()=>boostResonance.mutate({ node: n, amount: Number(resBoost[n.id]||0) })}><Zap className="w-4 h-4 mr-1" />Boost</Button>
                </div>
                <div className="flex items-center gap-2">
                  <Input placeholder="Transparency +" value={transAdd[n.id]||""} onChange={(e)=>setTransAdd({...transAdd, [n.id]: e.target.value})} className="h-8" />
                  <Button size="sm" onClick={()=>addTransparency.mutate({ node: n, amount: Number(transAdd[n.id]||0) })}><Activity className="w-4 h-4 mr-1" />Accumulate</Button>
                </div>
              </div>

              <div className="mt-3 p-2 rounded border border-purple-900/30">
                <div className="text-[11px] text-purple-400/70 mb-2">Alert Rule</div>
                <div className="flex items-center gap-2 mb-2">
                  <Select value={(ruleDraft[n.id]?.type)||"resonance_below"} onValueChange={(v)=>setRuleDraft({...ruleDraft, [n.id]: { ...(ruleDraft[n.id]||{}), type: v }})}>
                    <SelectTrigger className="h-8 w-40"><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="resonance_below">Resonance below</SelectItem>
                      <SelectItem value="transparency_below">Transparency below</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input placeholder="Value" className="h-8 w-24" value={(ruleDraft[n.id]?.value)||""} onChange={(e)=>setRuleDraft({...ruleDraft, [n.id]: { ...(ruleDraft[n.id]||{}), value: e.target.value }})} />
                  <Button size="sm" onClick={()=>createRule.mutate({ node: n, draft: ruleDraft[n.id]||{ type: 'resonance_below', value: 0 } })}>Create</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}