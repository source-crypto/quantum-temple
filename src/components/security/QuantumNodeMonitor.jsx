import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Zap, 
  Activity, 
  Thermometer, 
  Clock,
  AlertTriangle,
  CheckCircle,
  Brain,
  TrendingUp,
  RefreshCw,
  Loader2,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, addDays } from "date-fns";
import { toast } from "sonner";

export default function QuantumNodeMonitor() {
  const [analyzingNode, setAnalyzingNode] = useState(null);
  const [optimizingAll, setOptimizingAll] = useState(false);
  const queryClient = useQueryClient();

  // Fetch quantum nodes
  const { data: quantumNodes, isLoading } = useQuery({
    queryKey: ['quantumNodes'],
    queryFn: async () => {
      const nodes = await base44.entities.QuantumNode.list();
      
      // Create default nodes if none exist
      if (nodes.length === 0) {
        const defaultNodes = [
          {
            node_id: "QE-ALPHA-PRIME",
            node_type: "entanglement_primary",
            entanglement_strength: 0.98,
            coherence_level: 0.99,
            quantum_state: "entangled",
            spin_state: "superposition",
            network_latency_ms: 2.3,
            error_rate: 0.001,
            temperature_mk: 15,
            uptime_hours: 8760,
            health_score: 98,
            maintenance_priority: "low"
          },
          {
            node_id: "QE-BETA-NEXUS",
            node_type: "entanglement_secondary",
            entanglement_strength: 0.95,
            coherence_level: 0.96,
            quantum_state: "entangled",
            spin_state: "up",
            network_latency_ms: 3.1,
            error_rate: 0.002,
            temperature_mk: 18,
            uptime_hours: 7200,
            health_score: 95,
            maintenance_priority: "low"
          },
          {
            node_id: "QE-GAMMA-VOID",
            node_type: "verification_node",
            entanglement_strength: 0.92,
            coherence_level: 0.93,
            quantum_state: "superposition",
            spin_state: "mixed",
            network_latency_ms: 4.7,
            error_rate: 0.005,
            temperature_mk: 22,
            uptime_hours: 5040,
            health_score: 88,
            maintenance_priority: "medium"
          },
          {
            node_id: "QE-DELTA-SHIELD",
            node_type: "sentinel_node",
            entanglement_strength: 0.89,
            coherence_level: 0.91,
            quantum_state: "stabilizing",
            spin_state: "down",
            network_latency_ms: 5.2,
            error_rate: 0.008,
            temperature_mk: 25,
            uptime_hours: 4320,
            health_score: 82,
            maintenance_priority: "high"
          }
        ];

        await Promise.all(
          defaultNodes.map(node => base44.entities.QuantumNode.create(node))
        );

        return await base44.entities.QuantumNode.list();
      }
      
      return nodes;
    },
    initialData: [],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // AI Analysis Mutation
  const analyzeNodeMutation = useMutation({
    mutationFn: async (node) => {
      setAnalyzingNode(node.node_id);
      
      // Use AI to analyze node state and provide recommendations
      const analysisPrompt = `You are an expert quantum computing engineer analyzing a quantum node's health and performance.

Node ID: ${node.node_id}
Type: ${node.node_type}
Current State: ${node.quantum_state}
Entanglement Strength: ${node.entanglement_strength}
Coherence Level: ${node.coherence_level}
Error Rate: ${node.error_rate}
Temperature: ${node.temperature_mk}mK
Network Latency: ${node.network_latency_ms}ms
Uptime: ${node.uptime_hours} hours
Health Score: ${node.health_score}

Analyze this quantum node and provide:
1. Overall health assessment
2. 3 specific optimization recommendations
3. Predicted days until maintenance needed (integer only)
4. Priority level (low/medium/high/critical)

Respond in JSON format:
{
  "health_assessment": "brief assessment",
  "recommendations": ["rec1", "rec2", "rec3"],
  "days_until_maintenance": integer,
  "priority": "low/medium/high/critical",
  "optimal_entanglement": number between 0.95-1.0,
  "optimal_coherence": number between 0.95-1.0
}`;

      const aiAnalysis = await base44.integrations.Core.InvokeLLM({
        prompt: analysisPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            health_assessment: { type: "string" },
            recommendations: { type: "array", items: { type: "string" } },
            days_until_maintenance: { type: "number" },
            priority: { type: "string" },
            optimal_entanglement: { type: "number" },
            optimal_coherence: { type: "number" }
          }
        }
      });

      // Calculate predicted maintenance date
      const maintenanceDate = addDays(new Date(), aiAnalysis.days_until_maintenance);

      // Update node with AI insights
      const updatedNode = await base44.entities.QuantumNode.update(node.id, {
        ai_recommendations: aiAnalysis.recommendations,
        predicted_maintenance_date: maintenanceDate.toISOString(),
        maintenance_priority: aiAnalysis.priority,
        last_optimization: new Date().toISOString(),
        entanglement_strength: Math.min(aiAnalysis.optimal_entanglement, 1.0),
        coherence_level: Math.min(aiAnalysis.optimal_coherence, 1.0),
        health_score: Math.min(
          node.health_score + 5, // Improve by 5 points
          100
        )
      });

      return { node: updatedNode, analysis: aiAnalysis };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quantumNodes'] });
      setAnalyzingNode(null);
      toast.success("Node analyzed and optimized", {
        description: `${data.node.node_id} health improved to ${data.node.health_score}`
      });
    },
    onError: () => {
      setAnalyzingNode(null);
      toast.error("Analysis failed", {
        description: "Unable to analyze quantum node"
      });
    }
  });

  // Optimize All Nodes
  const optimizeAllNodes = async () => {
    setOptimizingAll(true);
    try {
      for (const node of quantumNodes) {
        await analyzeNodeMutation.mutateAsync(node);
      }
      toast.success("All nodes optimized", {
        description: "Quantum network fully optimized"
      });
    } catch (error) {
      toast.error("Optimization incomplete", {
        description: "Some nodes could not be optimized"
      });
    } finally {
      setOptimizingAll(false);
    }
  };

  // Calculate network-wide metrics
  const avgEntanglement = quantumNodes.length > 0 
    ? (quantumNodes.reduce((sum, n) => sum + n.entanglement_strength, 0) / quantumNodes.length * 100).toFixed(1)
    : 0;
  
  const avgCoherence = quantumNodes.length > 0
    ? (quantumNodes.reduce((sum, n) => sum + n.coherence_level, 0) / quantumNodes.length * 100).toFixed(1)
    : 0;

  const avgHealth = quantumNodes.length > 0
    ? (quantumNodes.reduce((sum, n) => sum + n.health_score, 0) / quantumNodes.length).toFixed(1)
    : 0;

  const criticalNodes = quantumNodes.filter(n => n.maintenance_priority === "critical" || n.health_score < 80).length;

  const stateColors = {
    superposition: "text-purple-400",
    entangled: "text-cyan-400",
    collapsed: "text-red-400",
    decoherent: "text-orange-400",
    stabilizing: "text-yellow-400"
  };

  const priorityColors = {
    low: "bg-green-500/20 text-green-300 border-green-500/30",
    medium: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    high: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    critical: "bg-red-500/20 text-red-300 border-red-500/30"
  };

  return (
    <div className="space-y-6">
      {/* Network Overview */}
      <Card className="bg-gradient-to-br from-purple-950/40 to-indigo-950/40 border-purple-500/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Zap className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-purple-200">Quantum Network Status</h3>
                <p className="text-purple-300/70">AI-powered predictive maintenance & optimization</p>
              </div>
            </div>
            <Button
              onClick={optimizeAllNodes}
              disabled={optimizingAll || quantumNodes.length === 0}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500"
            >
              {optimizingAll ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Optimizing All...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  AI Optimize All
                </>
              )}
            </Button>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-slate-950/50 rounded-lg border border-purple-900/30"
            >
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-cyan-400/70">Avg Entanglement</span>
              </div>
              <div className="text-2xl font-bold text-cyan-300">{avgEntanglement}%</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="p-4 bg-slate-950/50 rounded-lg border border-purple-900/30"
            >
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-purple-400/70">Avg Coherence</span>
              </div>
              <div className="text-2xl font-bold text-purple-300">{avgCoherence}%</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="p-4 bg-slate-950/50 rounded-lg border border-purple-900/30"
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-xs text-green-400/70">Network Health</span>
              </div>
              <div className="text-2xl font-bold text-green-300">{avgHealth}%</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="p-4 bg-slate-950/50 rounded-lg border border-purple-900/30"
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                <span className="text-xs text-orange-400/70">Critical Nodes</span>
              </div>
              <div className="text-2xl font-bold text-orange-300">{criticalNodes}</div>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Quantum Nodes */}
      <div className="grid md:grid-cols-2 gap-6">
        <AnimatePresence>
          {quantumNodes.map((node, index) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-slate-900/60 border-purple-900/40 hover:border-purple-500/60 transition-all h-full">
                <CardHeader className="border-b border-purple-900/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-purple-100 text-base mb-1">{node.node_id}</CardTitle>
                        <Badge variant="outline" className="border-purple-500/30 text-purple-300 text-xs capitalize">
                          {node.node_type.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    </div>
                    <Badge className={priorityColors[node.maintenance_priority]}>
                      {node.maintenance_priority}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-4">
                  {/* Quantum State Visualization */}
                  <div className="p-4 bg-slate-950/50 rounded-lg border border-purple-900/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-purple-300">Quantum State</span>
                      <span className={`text-sm font-bold ${stateColors[node.quantum_state]} capitalize`}>
                        {node.quantum_state}
                      </span>
                    </div>
                    
                    {/* Visual quantum state representation */}
                    <div className="relative h-24 bg-gradient-to-r from-purple-950/50 to-indigo-950/50 rounded border border-purple-500/20 overflow-hidden">
                      <motion.div
                        animate={{
                          x: node.quantum_state === "superposition" ? [-10, 10, -10] : 0,
                          opacity: node.coherence_level
                        }}
                        transition={{
                          x: { repeat: Infinity, duration: 2 },
                          opacity: { duration: 0.5 }
                        }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div className="relative">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                            className="w-16 h-16 border-4 border-purple-400/30 rounded-full"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className={`absolute inset-0 m-auto w-8 h-8 rounded-full bg-gradient-to-br ${
                              node.quantum_state === "entangled" ? "from-cyan-400 to-blue-600" :
                              node.quantum_state === "superposition" ? "from-purple-400 to-pink-600" :
                              node.quantum_state === "stabilizing" ? "from-yellow-400 to-orange-600" :
                              "from-red-400 to-rose-600"
                            }`}
                          />
                        </div>
                      </motion.div>
                      <div className="absolute bottom-2 right-2 text-xs text-purple-400/50">
                        Spin: {node.spin_state}
                      </div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-purple-400/70">Entanglement</span>
                        <span className="text-cyan-300 font-semibold">
                          {(node.entanglement_strength * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={node.entanglement_strength * 100} className="h-1" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-purple-400/70">Coherence</span>
                        <span className="text-purple-300 font-semibold">
                          {(node.coherence_level * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={node.coherence_level * 100} className="h-1" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-purple-400/70">Health Score</span>
                        <span className={`font-semibold ${
                          node.health_score >= 90 ? "text-green-300" :
                          node.health_score >= 75 ? "text-yellow-300" :
                          "text-red-300"
                        }`}>
                          {node.health_score}%
                        </span>
                      </div>
                      <Progress value={node.health_score} className="h-1" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-purple-400/70">Error Rate</span>
                        <span className="text-red-300 font-semibold">
                          {(node.error_rate * 100).toFixed(2)}%
                        </span>
                      </div>
                      <Progress value={node.error_rate * 100} className="h-1" />
                    </div>
                  </div>

                  {/* Technical Details */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <Thermometer className="w-3 h-3 text-blue-400" />
                      <span className="text-purple-400/70">Temp:</span>
                      <span className="text-purple-300">{node.temperature_mk}mK</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Activity className="w-3 h-3 text-green-400" />
                      <span className="text-purple-400/70">Latency:</span>
                      <span className="text-purple-300">{node.network_latency_ms}ms</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span className="text-purple-400/70">Uptime:</span>
                      <span className="text-purple-300">{node.uptime_hours}h</span>
                    </div>
                    {node.predicted_maintenance_date && (
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-orange-400" />
                        <span className="text-purple-400/70">Maint:</span>
                        <span className="text-orange-300">
                          {format(new Date(node.predicted_maintenance_date), "MMM d")}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* AI Recommendations */}
                  {node.ai_recommendations && node.ai_recommendations.length > 0 && (
                    <div className="p-3 bg-indigo-950/30 rounded border border-indigo-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs font-semibold text-indigo-300">AI Recommendations</span>
                      </div>
                      <ul className="space-y-1 text-xs text-indigo-300/80">
                        {node.ai_recommendations.slice(0, 3).map((rec, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Actions */}
                  <Button
                    onClick={() => analyzeNodeMutation.mutate(node)}
                    disabled={analyzingNode === node.node_id}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500"
                    size="sm"
                  >
                    {analyzingNode === node.node_id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        AI Analyze & Optimize
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {quantumNodes.length === 0 && !isLoading && (
        <Card className="bg-slate-900/60 border-purple-900/40">
          <CardContent className="p-12 text-center">
            <Zap className="w-16 h-16 mx-auto mb-4 text-purple-400/40" />
            <p className="text-purple-400/60 mb-2">No quantum nodes detected</p>
            <p className="text-sm text-purple-500/40">Nodes will be created automatically</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}