import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Target, History, CircleCheck } from "lucide-react";
import { toast } from "sonner";

export default function AbundanceManifest() {
  const queryClient = useQueryClient();

  const nodesQuery = useQuery({
    queryKey: ["intentNodes"],
    queryFn: () => base44.entities.IntentNode.list("-created_date", 50),
    initialData: [],
    refetchInterval: 15000
  });

  const goalsQuery = useQuery({
    queryKey: ["abundanceGoals"],
    queryFn: () => base44.entities.AbundanceGoal.list("-created_date", 20),
    initialData: []
  });

  const eventsQuery = useQuery({
    queryKey: ["manifestationEvents"],
    queryFn: () => base44.entities.ManifestationEvent.list("-created_date", 20),
    initialData: []
  });

  const totalUnits = useMemo(() => {
    const nodes = nodesQuery.data || [];
    // Each active node contributes 1 transparency unit
    return Math.min(12, nodes.filter((n) => n.status === "active").length);
  }, [nodesQuery.data]);

  const percent = Math.round((totalUnits / 12) * 100);

  const [goalName, setGoalName] = useState("");
  const [target, setTarget] = useState(12);
  const [targetDate, setTargetDate] = useState("");
  const [strategy, setStrategy] = useState("");

  const createGoalMutation = useMutation({
    mutationFn: () => base44.entities.AbundanceGoal.create({
      goal_name: goalName || "Abundance Manifest",
      target_transparency: Math.max(1, Math.min(12, Number(target) || 12)),
      alignment_strategy: strategy || "Align oracle MVL/SVL toward active nodes",
      target_date: targetDate || undefined
    }),
    onSuccess: () => {
      toast.success("Goal saved");
      setGoalName(""); setTarget(12); setTargetDate(""); setStrategy("");
      queryClient.invalidateQueries({ queryKey: ["abundanceGoals"] });
    }
  });

  const snapshotMutation = useMutation({
    mutationFn: async () => {
      const note = `Snapshot at ${new Date().toISOString()} with ${totalUnits}/12 units`;
      return base44.entities.ManifestationEvent.create({
        event_type: totalUnits === 12 ? "completion" : "snapshot",
        total_transparency: totalUnits,
        units_added: 0,
        factors: ["intent_nodes_status", "oracle_alignment"],
        note,
        timestamp: new Date().toISOString()
      });
    },
    onSuccess: () => {
      toast.success("Manifestation snapshot logged");
      queryClient.invalidateQueries({ queryKey: ["manifestationEvents"] });
    }
  });

  return (
    <Card className="bg-slate-900/60 border-purple-900/40">
      <CardHeader className="border-b border-purple-900/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-purple-200 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Abundance Manifest
          </CardTitle>
          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">{totalUnits}/12 Units</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-4 bg-purple-950/30 rounded-lg border border-purple-500/30">
            <div className="text-sm text-purple-300 mb-2">Manifestation Progress</div>
            <div className="text-4xl font-bold text-purple-100 mb-2">{percent}%</div>
            <Progress value={percent} className="h-2" />
            <div className="text-xs text-purple-400/70 mt-2">Each active intent node contributes 1 transparency unit toward full manifestation.</div>
          </div>

          <div className="p-4 bg-indigo-950/30 rounded-lg border border-indigo-500/30">
            <div className="text-sm text-indigo-300 mb-3 flex items-center gap-2"><Target className="w-4 h-4" />Configure Abundance Goal</div>
            <div className="space-y-2">
              <div>
                <Label className="text-xs text-indigo-300">Goal Name</Label>
                <Input value={goalName} onChange={(e)=>setGoalName(e.target.value)} placeholder="e.g., 12/12 Transparency by Q2" className="bg-slate-950/50 border-indigo-900/40 h-8" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-indigo-300">Target Units</Label>
                  <Input type="number" min={1} max={12} value={target} onChange={(e)=>setTarget(e.target.value)} className="bg-slate-950/50 border-indigo-900/40 h-8" />
                </div>
                <div>
                  <Label className="text-xs text-indigo-300">Target Date</Label>
                  <Input type="date" value={targetDate} onChange={(e)=>setTargetDate(e.target.value)} className="bg-slate-950/50 border-indigo-900/40 h-8" />
                </div>
              </div>
              <div>
                <Label className="text-xs text-indigo-300">Alignment Strategy</Label>
                <Input value={strategy} onChange={(e)=>setStrategy(e.target.value)} placeholder="How to steer oracles toward this goal" className="bg-slate-950/50 border-indigo-900/40 h-8" />
              </div>
              <Button onClick={()=>createGoalMutation.mutate()} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600">Save Goal</Button>
            </div>
          </div>

          <div className="p-4 bg-emerald-950/30 rounded-lg border border-emerald-500/30">
            <div className="text-sm text-emerald-300 mb-3 flex items-center gap-2"><History className="w-4 h-4" />History & Snapshot</div>
            <Button onClick={()=>snapshotMutation.mutate()} className="w-full bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-200 border border-emerald-500/30 mb-3">Log Snapshot</Button>
            <div className="space-y-2 max-h-40 overflow-auto">
              {eventsQuery.data.length === 0 ? (
                <div className="text-xs text-emerald-300/70">No manifestation events yet</div>
              ) : (
                eventsQuery.data.map((ev) => (
                  <div key={ev.id} className="p-2 bg-slate-950/50 rounded border border-emerald-900/30 text-xs text-emerald-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CircleCheck className="w-3 h-3" />
                      <span className="capitalize">{ev.event_type}</span>
                    </div>
                    <div className="font-mono">{ev.total_transparency}/12</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-4 bg-slate-950/50 rounded-lg border border-purple-900/30">
            <div className="text-sm text-purple-300 mb-3">Intent Nodes</div>
            <div className="grid grid-cols-3 gap-2">
              {(nodesQuery.data||[]).slice(0,12).map((n) => (
                <div key={n.id} className={`p-2 rounded border text-xs flex items-center justify-between ${n.status==='active'?'border-green-500/30 bg-green-950/20 text-green-200':'border-purple-900/30 text-purple-300'}`}>
                  <span>OC {n.oc_number}</span>
                  <Badge className={n.status==='active'?"bg-green-500/20 text-green-300 border-green-500/30":"bg-purple-500/20 text-purple-300 border-purple-500/30"}>{n.status}</Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-slate-950/50 rounded-lg border border-purple-900/30">
            <div className="text-sm text-purple-300 mb-2">Active Goals</div>
            {goalsQuery.data.length === 0 ? (
              <div className="text-xs text-purple-400/70">No goals configured yet</div>
            ) : (
              <div className="space-y-3">
                {goalsQuery.data.map((g) => {
                  const pct = Math.min(100, Math.round((totalUnits / g.target_transparency) * 100));
                  return (
                    <div key={g.id} className="p-3 bg-slate-950/50 rounded border border-purple-900/30">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-purple-200 font-semibold">{g.goal_name}</div>
                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">{totalUnits}/{g.target_transparency}</Badge>
                      </div>
                      <Progress value={pct} className="h-2" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}