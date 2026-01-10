import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Target, Sparkles, Plus, History, Settings2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

const TOTAL_UNITS = 12;

export default function AbundanceManifest() {
  const queryClient = useQueryClient();

  const { data: intents } = useQuery({
    queryKey: ["intentNodes"],
    queryFn: async () => {
      try { return await base44.entities.IntentNode.list(); } catch { return []; }
    },
    initialData: []
  });

  const { data: goals } = useQuery({
    queryKey: ["abundanceGoals"],
    queryFn: () => base44.entities.AbundanceGoal.list("-created_date", 20),
    initialData: []
  });

  const { data: events } = useQuery({
    queryKey: ["manifestationEvents"],
    queryFn: () => base44.entities.ManifestationEvent.list("-event_date", 50),
    initialData: []
  });

  const createGoalMutation = useMutation({
    mutationFn: (payload) => base44.entities.AbundanceGoal.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["abundanceGoals"] })
  });

  const createEventMutation = useMutation({
    mutationFn: (payload) => base44.entities.ManifestationEvent.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["manifestationEvents"] })
  });

  const [goalForm, setGoalForm] = React.useState({ goal_name: "", target_units: 12, description: "", deadline: "" });
  const [eventForm, setEventForm] = React.useState({ title: "", units: 0, notes: "" });

  const units = Math.min(TOTAL_UNITS, intents.length || 0);
  const percent = Math.round((units / TOTAL_UNITS) * 100);

  const chartData = (events || []).map((e) => ({
    date: format(new Date(e.event_date || e.created_date), "MMM d"),
    units: e.units || 0,
    level: e.abundance_level || Math.round((e.units || 0) / TOTAL_UNITS * 100)
  })).reverse();

  return (
    <Card className="bg-slate-900/60 border-purple-900/40">
      <CardHeader className="border-b border-purple-900/30">
        <CardTitle className="text-purple-200 flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Abundance Manifest • Transparency Alignment
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Status */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-to-br from-purple-950/40 to-indigo-950/40 rounded border border-purple-500/30">
            <div className="text-sm text-purple-300 mb-1">Transparency Units</div>
            <div className="text-3xl font-bold text-purple-100">{units}/{TOTAL_UNITS}</div>
            <Progress value={percent} className="mt-2 h-2" />
            <div className="text-xs text-purple-400/70 mt-2">Current manifestation progress</div>
          </div>
          <div className="p-4 bg-gradient-to-br from-cyan-950/40 to-blue-950/40 rounded border border-cyan-500/30">
            <div className="text-sm text-cyan-300 mb-1">Active Goals</div>
            <div className="text-3xl font-bold text-cyan-100">{(goals || []).filter(g => g.status !== "archived").length}</div>
            <div className="text-xs text-cyan-400/70 mt-2">Configured abundance outcomes</div>
          </div>
          <div className="p-4 bg-gradient-to-br from-amber-950/40 to-orange-950/40 rounded border border-amber-500/30">
            <div className="text-sm text-amber-300 mb-1">History Events</div>
            <div className="text-3xl font-bold text-amber-100">{(events || []).length}</div>
            <div className="text-xs text-amber-400/70 mt-2">Manifestation milestones recorded</div>
          </div>
        </div>

        {/* Goals Config */}
        <div className="p-4 rounded border border-purple-900/30 bg-slate-950/50">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-purple-300" />
            <div className="text-sm text-purple-200 font-semibold">Configure Abundance Goal</div>
          </div>
          <div className="grid md:grid-cols-4 gap-3">
            <Input placeholder="Goal name" value={goalForm.goal_name} onChange={(e) => setGoalForm({ ...goalForm, goal_name: e.target.value })} />
            <Input type="number" placeholder="Target units (<=12)" value={goalForm.target_units} onChange={(e) => setGoalForm({ ...goalForm, target_units: Number(e.target.value) })} />
            <Input type="datetime-local" value={goalForm.deadline} onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })} />
            <Button onClick={() => createGoalMutation.mutate({ ...goalForm })} className="bg-purple-600"> <Plus className="w-4 h-4 mr-2" /> Save Goal</Button>
          </div>
          <Textarea placeholder="Goal description / oracle alignment guidance" className="mt-3" value={goalForm.description} onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })} />

          {/* Goals list */}
          <div className="mt-4 grid md:grid-cols-2 gap-3">
            {(goals || []).map((g) => (
              <div key={g.id} className="p-3 rounded border border-purple-900/30 bg-slate-950/40">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-purple-200">{g.goal_name}</div>
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-[10px]">{g.status}</Badge>
                </div>
                <div className="text-xs text-purple-400/70 mt-1">Target: {g.target_units} units • Due {g.deadline ? format(new Date(g.deadline), "MMM d, yyyy") : "—"}</div>
                <Progress value={Math.min(100, Math.round((units / (g.target_units || TOTAL_UNITS)) * 100))} className="mt-2 h-1.5" />
              </div>
            ))}
          </div>
        </div>

        {/* History & Visualization */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 p-4 rounded border border-purple-900/30 bg-slate-950/50">
            <div className="flex items-center gap-2 mb-3">
              <History className="w-4 h-4 text-purple-300" />
              <div className="text-sm text-purple-200 font-semibold">Manifestation Timeline</div>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="abg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#a78bfa" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#a78bfa88" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#a78bfa66" width={36} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #6b21a8", color: "#ddd" }} />
                  <Area type="monotone" dataKey="level" stroke="#a78bfa" fill="url(#abg)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-4 rounded border border-purple-900/30 bg-slate-950/50">
            <div className="flex items-center gap-2 mb-3">
              <Settings2 className="w-4 h-4 text-purple-300" />
              <div className="text-sm text-purple-200 font-semibold">Record Manifestation Event</div>
            </div>
            <Input placeholder="Event title" className="mb-2" value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} />
            <Input type="number" placeholder="Units (0-12)" className="mb-2" value={eventForm.units} onChange={(e) => setEventForm({ ...eventForm, units: Number(e.target.value) })} />
            <Textarea placeholder="Notes / contributing factors" className="mb-2" value={eventForm.notes} onChange={(e) => setEventForm({ ...eventForm, notes: e.target.value })} />
            <Button className="w-full bg-purple-600" onClick={() => createEventMutation.mutate({ ...eventForm, event_date: new Date().toISOString(), abundance_level: Math.round((eventForm.units || 0)/TOTAL_UNITS*100) })}>
              Log Event
            </Button>

            {/* Recent events */}
            <div className="mt-4 space-y-2">
              {(events || []).slice(0,5).map((ev) => (
                <div key={ev.id} className="p-2 rounded border border-purple-900/30 bg-slate-950/40">
                  <div className="text-sm text-purple-200 font-semibold">{ev.title}</div>
                  <div className="text-xs text-purple-400/70">{format(new Date(ev.event_date || ev.created_date), "PPpp")} • {ev.units} units</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}