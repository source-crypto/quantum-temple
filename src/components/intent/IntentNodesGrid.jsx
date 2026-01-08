import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Network, CheckCircle, PauseCircle, Sparkles } from "lucide-react";

export default function IntentNodesGrid() {
  const qc = useQueryClient();

  const { data: nodes = [], isLoading } = useQuery({
    queryKey: ["intentNodes"],
    queryFn: async () => base44.entities.IntentNode.list("-updated_date", 24),
    initialData: [],
  });

  const seedMutation = useMutation({
    mutationFn: async () => {
      const payload = Array.from({ length: 12 }).map((_, i) => ({
        oc_number: i + 1,
        oc_title: `OC-${i + 1}`,
        purpose: "Intent node aligned to Operating Circular",
        access_scope: "composite",
        status: "active",
        resonance_level: 50 + Math.floor(Math.random() * 20),
        transparency_accumulated: 0,
        last_synced: new Date().toISOString(),
      }));
      // bulkCreate supported by Base44 SDK
      return base44.entities.IntentNode.bulkCreate(payload);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["intentNodes"] }),
  });

  const toggleStatus = useMutation({
    mutationFn: async (node) => {
      const next = node.status === "active" ? "paused" : "active";
      return base44.entities.IntentNode.update(node.id, { status: next });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["intentNodes"] }),
  });

  const sorted = [...nodes].sort((a, b) => (a.oc_number || 0) - (b.oc_number || 0));

  return (
    <Card className="bg-slate-900/60 border-purple-900/40">
      <CardHeader className="border-b border-purple-900/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-purple-200 flex items-center gap-2">
            <Network className="w-5 h-5" />
            12 Intent Nodes • OC-1 → OC-12
          </CardTitle>
          {nodes.length === 0 && (
            <Button onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending} className="bg-gradient-to-r from-purple-600 to-indigo-600">
              {seedMutation.isPending ? "Seeding..." : "Auto-Create OC Nodes"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="text-purple-300/70">Loading nodes...</div>
        ) : nodes.length === 0 ? (
          <div className="text-purple-300/70">No intent nodes yet. Click "Auto-Create OC Nodes".</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted.map((n) => (
              <div key={n.id} className="p-4 rounded-lg border border-purple-500/30 bg-slate-950/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-purple-200 font-semibold">{n.oc_title}</div>
                  <Badge className={
                    n.status === "active"
                      ? "bg-green-500/20 text-green-300 border-green-500/30"
                      : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                  }>
                    {n.status}
                  </Badge>
                </div>
                <div className="text-xs text-purple-400/70 mb-3">OC #{n.oc_number} • {n.access_scope || "composite"}</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-purple-400/70">Resonance</span>
                    <span className="text-purple-200">{Math.round(n.resonance_level || 0)}%</span>
                  </div>
                  <Progress value={Math.min(100, n.resonance_level || 0)} className="h-1" />
                </div>
                <div className="flex items-center justify-between mt-3 text-xs">
                  <span className="text-purple-400/70">Transparency</span>
                  <span className="text-cyan-200 font-semibold">{(n.transparency_accumulated || 0).toFixed(0)}</span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Button size="sm" variant="outline" className="border-purple-500/30 text-purple-200" onClick={() => toggleStatus.mutate(n)}>
                    {n.status === "active" ? <PauseCircle className="w-4 h-4 mr-1" /> : <CheckCircle className="w-4 h-4 mr-1" />} {n.status === "active" ? "Pause" : "Activate"}
                  </Button>
                  {n.linked_artifact_id && (
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30"><Sparkles className="w-3 h-3 mr-1" />Linked</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}