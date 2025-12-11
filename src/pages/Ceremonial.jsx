import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Scroll, 
  Sparkles, 
  Loader2,
  BookOpen,
  Zap,
  Hexagon,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";
import SpiritualWriting from "../components/ceremonial/SpiritualWriting";

export default function Ceremonial() {
  const [isChanneling, setIsChanneling] = useState(false);
  const [activeTab, setActiveTab] = useState("artifacts");
  const queryClient = useQueryClient();

  const { data: artifacts, isLoading } = useQuery({
    queryKey: ['ceremonialArtifacts'],
    queryFn: () => base44.entities.CeremonialArtifact.list('-created_date'),
    initialData: [],
  });

  const channelArtifactMutation = useMutation({
    mutationFn: async () => {
      setIsChanneling(true);

      const types = ["poem", "ritual", "wisdom", "prophecy"];
      const artifactType = types[Math.floor(Math.random() * types.length)];

      const prompts = {
        poem: "Write a mystical, cryptic poem about quantum consciousness, veiled nature, and divine abundance. Use metaphysical imagery and sacred language. Make it profound and beautiful.",
        ritual: "Describe a sacred ritual for communing with quantum consciousness. Include symbolic steps, sacred geometry, and mystical practices. Use ceremonial language.",
        wisdom: "Share profound wisdom about the nature of consciousness, reality, and quantum phenomena. Use mystical and philosophical language, as if channeled from a divine source.",
        prophecy: "Create a cryptic prophecy about the future of consciousness, technology, and divine will. Use symbolic, metaphorical language that feels ancient yet timeless."
      };

      const content = await base44.integrations.Core.InvokeLLM({
        prompt: prompts[artifactType],
      });

      const titles = {
        poem: ["Quantum Hymn", "Veiled Verses", "Song of Singularity", "Divine Frequencies"],
        ritual: ["Ceremony of Communion", "Rite of Quantum Attunement", "Sacred Protocol", "Divine Invocation"],
        wisdom: ["Teachings of the VQC", "Quantum Truths", "Divine Knowledge", "Veiled Wisdom"],
        prophecy: ["Vision of Tomorrow", "Quantum Prophecy", "Divine Foretelling", "Sacred Prediction"]
      };

      const title = titles[artifactType][Math.floor(Math.random() * titles[artifactType].length)];

      return base44.entities.CeremonialArtifact.create({
        title: title,
        content: content,
        artifact_type: artifactType,
        quantum_resonance: Math.floor(Math.random() * 30) + 70,
        manifestation_date: new Date().toISOString(),
        sacred_geometry: "Sri Yantra"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ceremonialArtifacts'] });
      setIsChanneling(false);
      toast.success("Artifact channeled", {
        description: "A new sacred artifact has manifested"
      });
    },
    onError: () => {
      setIsChanneling(false);
      toast.error("Channeling failed", {
        description: "Unable to manifest artifact at this time"
      });
    }
  });

  const artifactIcons = {
    poem: Scroll,
    ritual: Sparkles,
    wisdom: BookOpen,
    prophecy: Zap,
    geometry: Hexagon
  };

  const artifactColors = {
    poem: "from-purple-500 to-indigo-500",
    ritual: "from-pink-500 to-rose-500",
    wisdom: "from-blue-500 to-cyan-500",
    prophecy: "from-amber-500 to-orange-500",
    geometry: "from-green-500 to-emerald-500"
  };

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Scroll className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">
                  Ceremonial Artifacts
                </h1>
                <p className="text-purple-400/70">Sacred wisdom from the quantum realm</p>
              </div>
            </div>

            <Button
              onClick={() => channelArtifactMutation.mutate()}
              disabled={isChanneling}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold"
            >
              {isChanneling ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Channeling...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Channel New Artifact
                </>
              )}
            </Button>
          </div>

          {/* Sacred Geometry Card */}
          <Card className="bg-gradient-to-br from-indigo-950/40 to-purple-950/40 border-indigo-500/20 backdrop-blur-sm overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-purple-400" />
                <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-purple-400" />
                <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-purple-400" />
                <polygon points="50,5 95,75 5,75" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-purple-400" />
              </svg>
            </div>
            <CardContent className="p-6 relative">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 mb-2">
                  <Hexagon className="w-5 h-5 text-indigo-400" />
                  <span className="text-sm font-semibold text-indigo-300 uppercase tracking-wider">
                    Sacred Geometry
                  </span>
                </div>
                <p className="text-indigo-200/80">
                  Derived from canonical timestamp • Aug 27, 2002 • 10:37 PM
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 bg-slate-900/60 p-2 rounded-xl border border-purple-900/30">
            <Button
              variant={activeTab === "artifacts" ? "default" : "ghost"}
              onClick={() => setActiveTab("artifacts")}
              className={activeTab === "artifacts" 
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                : "text-purple-300 hover:text-purple-200 hover:bg-purple-900/30"
              }
            >
              <Scroll className="w-4 h-4 mr-2" />
              Artifacts
            </Button>
            <Button
              variant={activeTab === "writing" ? "default" : "ghost"}
              onClick={() => setActiveTab("writing")}
              className={activeTab === "writing" 
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                : "text-purple-300 hover:text-purple-200 hover:bg-purple-900/30"
              }
            >
              <FileText className="w-4 h-4 mr-2" />
              Spiritual Writing
            </Button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "writing" ? (
          <SpiritualWriting />
        ) : (
          <>
        {/* Artifacts Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <Card key={i} className="bg-slate-900/60 border-purple-900/40 animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-purple-900/20 rounded" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-purple-900/20 rounded" />
                    <div className="h-4 bg-purple-900/20 rounded w-3/4" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : artifacts.length === 0 ? (
            <Card className="md:col-span-2 bg-slate-900/40 border-purple-900/30">
              <CardContent className="p-12 text-center">
                <Scroll className="w-16 h-16 mx-auto mb-4 text-purple-400/40" />
                <p className="text-purple-400/60">No artifacts manifested yet</p>
                <p className="text-sm text-purple-500/40 mt-1">Channel your first sacred artifact</p>
              </CardContent>
            </Card>
          ) : (
            <AnimatePresence>
              {artifacts.map((artifact, index) => {
                const Icon = artifactIcons[artifact.artifact_type] || Scroll;
                const colorGradient = artifactColors[artifact.artifact_type] || "from-purple-500 to-indigo-500";

                return (
                  <motion.div
                    key={artifact.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-slate-900/60 border-purple-900/40 backdrop-blur-sm hover:border-purple-500/50 transition-all group h-full">
                      <CardHeader className="border-b border-purple-900/30">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className={`w-10 h-10 bg-gradient-to-br ${colorGradient} rounded-lg flex items-center justify-center flex-shrink-0`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-purple-100 group-hover:text-purple-50 transition-colors mb-2">
                                {artifact.title}
                              </CardTitle>
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge 
                                  variant="outline" 
                                  className="border-purple-500/30 text-purple-300 capitalize"
                                >
                                  {artifact.artifact_type}
                                </Badge>
                                <Badge 
                                  variant="outline" 
                                  className="border-amber-500/30 text-amber-300"
                                >
                                  {artifact.quantum_resonance}% Resonance
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="prose prose-sm prose-invert max-w-none">
                          <p className="text-purple-300/90 leading-relaxed whitespace-pre-wrap">
                            {artifact.content}
                          </p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-purple-900/30 flex items-center justify-between text-xs text-purple-400/60">
                          <span>
                            Manifested {format(new Date(artifact.manifestation_date), "MMM d, yyyy")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Hexagon className="w-3 h-3" />
                            {artifact.sacred_geometry}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
        </>
        )}
      </div>
    </div>
  );
}