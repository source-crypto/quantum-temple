import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Link2, Sparkles } from "lucide-react";

export default function SpiritualWritingIntegration() {
  const qc = useQueryClient();
  const { data: artifacts = [] } = useQuery({
    queryKey: ["spiritualArtifacts"],
    queryFn: async () => {
      const list = await base44.entities.CeremonialArtifact.list("-manifestation_date", 50);
      return (list || []).filter(a => ["wisdom", "poem", "prophecy"].includes(a.artifact_type));
    },
    initialData: [],
  });

  const { data: nodes = [] } = useQuery({
    queryKey: ["intentNodes"],
    queryFn: async () => base44.entities.IntentNode.list("oc_number", 24),
    initialData: [],
  });

  const [selectedId, setSelectedId] = useState(null);
  const selected = useMemo(() => artifacts.find(a => a.id === selectedId) || artifacts[0], [artifacts, selectedId]);

  const linkMutation = useMutation({
    mutationFn: async ({ nodeId, artifact }) => {
      const resonance = Math.min(100, (artifact.quantum_resonance || 50));
      return base44.entities.IntentNode.update(nodeId, {
        linked_artifact_id: artifact.id,
        resonance_level: resonance,
        transparency_accumulated: (Date.now() % 97) + (artifact.quantum_resonance || 0),
        last_synced: new Date().toISOString(),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["intentNodes"] }),
  });

  return (
    <Card className="bg-slate-900/60 border-purple-900/40">
      <CardHeader className="border-b border-purple-900/30">
        <CardTitle className="text-purple-200 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Spiritual Writing • Visualize & Link to Intent Nodes
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {artifacts.length === 0 ? (
          <div className="text-purple-300/70">No spiritual writings yet. Create a Ceremonial Artifact of type wisdom or poem.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="text-sm text-purple-300">Selected Writing</div>
              <Select value={selected?.id} onValueChange={(v) => setSelectedId(v)}>
                <SelectTrigger className="bg-slate-950/50 border-purple-900/30 text-purple-100">
                  <SelectValue placeholder="Choose writing" />
                </SelectTrigger>
                <SelectContent>
                  {artifacts.map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="p-3 rounded border border-purple-500/30 bg-slate-950/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-purple-200">{selected?.title}</div>
                  {selected?.quantum_resonance && (
                    <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">Resonance {selected.quantum_resonance.toFixed(0)}</Badge>
                  )}
                </div>
                <ScrollArea className="h-40 pr-2 text-sm text-purple-300/80 whitespace-pre-line">{selected?.content}</ScrollArea>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-sm text-purple-300">Link to Intent Node (OC)</div>
              <div className="p-3 rounded border border-purple-500/30 bg-slate-950/50 space-y-3">
                <Select onValueChange={(nodeId) => linkMutation.mutate({ nodeId, artifact: selected })}>
                  <SelectTrigger className="bg-slate-950/50 border-purple-900/30 text-purple-100">
                    <SelectValue placeholder="Select OC Node" />
                  </SelectTrigger>
                  <SelectContent>
                    {nodes.sort((a,b)=> (a.oc_number||0)-(b.oc_number||0)).map(n => (
                      <SelectItem key={n.id} value={n.id}>
                        OC-{n.oc_number}: {n.oc_title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="text-xs text-purple-400/70 flex items-center gap-2">
                  <Link2 className="w-3 h-3" /> Linking updates node resonance and transparency metrics from the writing.
                </div>
                {linkMutation.isPending && (
                  <div className="text-xs text-purple-300/70 flex items-center gap-2"><Sparkles className="w-3 h-3"/> Linking...</div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}