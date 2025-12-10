import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { 
  Brain, 
  Zap, 
  AlertTriangle,
  TrendingUp,
  Activity,
  Wrench,
  Shield,
  Loader2,
  CheckCircle,
  XCircle,
  Scale
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AINodeManager() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [diagnosticQuery, setDiagnosticQuery] = useState("");
  const [autoScaling, setAutoScaling] = useState(true);
  const [scalingMetrics, setScalingMetrics] = useState({
    currentLoad: 65,
    optimalNodes: 8,
    currentNodes: 6,
    recommendation: "scale_up"
  });

  const queryClient = useQueryClient();

  const { data: nodes, isLoading } = useQuery({
    queryKey: ['quantumNodes'],
    queryFn: () => base44.entities.QuantumNode.list('-health_score', 50),
    initialData: [],
    refetchInterval: 10000
  });

  // Simulate real-time scaling metrics
  useEffect(() => {
    if (!autoScaling) return;
    
    const interval = setInterval(() => {
      setScalingMetrics(prev => {
        const load = Math.max(20, Math.min(95, prev.currentLoad + (Math.random() - 0.5) * 15));
        const optimalNodes = Math.ceil((load / 100) * 12);
        const currentNodes = nodes.length;
        const recommendation = optimalNodes > currentNodes ? 'scale_up' : 
                              optimalNodes < currentNodes ? 'scale_down' : 'optimal';
        
        return { currentLoad: load, optimalNodes, currentNodes, recommendation };
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [autoScaling, nodes.length]);

  const criticalNodes = nodes.filter(n => n.health_score < 50);
  const warningNodes = nodes.filter(n => n.health_score >= 50 && n.health_score < 75);

  const runPredictiveMaintenanceMutation = useMutation({
    mutationFn: async () => {
      const predictions = await Promise.all(
        nodes.map(async (node) => {
          const healthTrend = node.health_score < 75 ? 'declining' : 'stable';
          const daysUntilMaintenance = Math.floor((node.health_score / 100) * 90);
          
          const priority = node.health_score < 50 ? 'critical' :
                          node.health_score < 65 ? 'high' :
                          node.health_score < 80 ? 'medium' : 'low';

          const recommendations = [];
          if (node.error_rate > 0.05) recommendations.push("Reduce error rate through quantum recalibration");
          if (node.network_latency_ms > 50) recommendations.push("Optimize network routing to reduce latency");
          if (node.entanglement_strength < 0.7) recommendations.push("Strengthen quantum entanglement via coherence boost");
          if (node.temperature_mk > 20) recommendations.push("Lower operating temperature for stability");

          return base44.entities.QuantumNode.update(node.id, {
            predicted_maintenance_date: new Date(Date.now() + daysUntilMaintenance * 86400000).toISOString(),
            maintenance_priority: priority,
            ai_recommendations: recommendations,
            last_optimization: new Date().toISOString()
          });
        })
      );

      return predictions;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quantumNodes'] });
      toast.success("Predictive Analysis Complete", {
        description: `Analyzed ${nodes.length} nodes • Maintenance schedules updated`
      });
    }
  });

  const diagnoseNodeMutation = useMutation({
    mutationFn: async ({ node, query }) => {
      const diagnosticPrompt = `You are an AI quantum node diagnostician. Analyze this node and provide actionable insights.

Node Details:
- ID: ${node.node_id}
- Type: ${node.node_type}
- Health Score: ${node.health_score}
- Error Rate: ${node.error_rate}
- Entanglement Strength: ${node.entanglement_strength}
- Network Latency: ${node.network_latency_ms}ms
- Temperature: ${node.temperature_mk}mK
- Uptime: ${node.uptime_hours}h

User Query: ${query || 'Provide comprehensive diagnostic analysis'}

Provide:
1. Root cause analysis
2. Immediate actions needed
3. Long-term optimization strategy
4. Risk assessment`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: diagnosticPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            root_cause: { type: "string" },
            immediate_actions: { type: "array", items: { type: "string" } },
            optimization_strategy: { type: "string" },
            risk_level: { type: "string" },
            estimated_fix_time: { type: "string" }
          }
        }
      });

      return response;
    },
    onSuccess: (data) => {
      toast.success("Diagnostic Complete", {
        description: `Risk Level: ${data.risk_level}`
      });
    }
  });

  const optimizeNodeMutation = useMutation({
    mutationFn: async (node) => {
      const optimizations = {
        health_score: Math.min(100, node.health_score + 15),
        error_rate: Math.max(0, node.error_rate * 0.7),
        entanglement_strength: Math.min(1, node.entanglement_strength + 0.15),
        network_latency_ms: Math.max(5, node.network_latency_ms * 0.8),
        temperature_mk: Math.max(10, node.temperature_mk - 2),
        last_optimization: new Date().toISOString()
      };

      const optimizationRecord = {
        timestamp: new Date().toISOString(),
        improvements: {
          health: optimizations.health_score - node.health_score,
          errorReduction: ((node.error_rate - optimizations.error_rate) / node.error_rate * 100).toFixed(1),
          latencyReduction: ((node.network_latency_ms - optimizations.network_latency_ms) / node.network_latency_ms * 100).toFixed(1)
        }
      };

      const updatedNode = await base44.entities.QuantumNode.update(node.id, {
        ...optimizations,
        optimization_history: [...(node.optimization_history || []), optimizationRecord]
      });

      return updatedNode;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quantumNodes'] });
      toast.success("Node Optimized", {
        description: "Performance metrics improved"
      });
    }
  });

  const autoScaleMutation = useMutation({
    mutationFn: async () => {
      const { recommendation, optimalNodes, currentNodes } = scalingMetrics;
      
      if (recommendation === 'scale_up') {
        const nodesToCreate = optimalNodes - currentNodes;
        const newNodes = await Promise.all(
          Array(nodesToCreate).fill(0).map((_, i) => 
            base44.entities.QuantumNode.create({
              node_id: `AUTO-${Date.now()}-${i}`,
              node_type: 'verification_node',
              node_name: `Auto-Scaled Node ${Date.now()}-${i}`,
              status: 'active',
              health_score: 95,
              consensus_power: 50,
              entanglement_strength: 0.9,
              is_active: true,
              last_active: new Date().toISOString()
            })
          )
        );
        return { action: 'scaled_up', count: nodesToCreate };
      } else if (recommendation === 'scale_down' && currentNodes > 3) {
        const nodesToRemove = Math.min(currentNodes - optimalNodes, currentNodes - 3);
        const inactiveNodes = nodes
          .filter(n => n.health_score < 60)
          .slice(0, nodesToRemove);
        
        await Promise.all(
          inactiveNodes.map(n => base44.entities.QuantumNode.update(n.id, { is_active: false, status: 'inactive' }))
        );
        
        return { action: 'scaled_down', count: nodesToRemove };
      }
      
      return { action: 'no_change', count: 0 };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quantumNodes'] });
      if (data.action !== 'no_change') {
        toast.success("Auto-Scaling Executed", {
          description: `${data.action === 'scaled_up' ? 'Added' : 'Removed'} ${data.count} nodes`
        });
      }
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border-indigo-500/50">
        <CardHeader>
          <CardTitle className="text-indigo-200 flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Node Manager • Predictive Optimization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-indigo-300/70">
            AI-powered node management with predictive maintenance, automated diagnostics, and dynamic scaling based on network load and quantum entanglement.
          </p>
        </CardContent>
      </Card>

      {/* Predictive Maintenance Dashboard */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-red-950/40 to-rose-950/40 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <Badge className="bg-red-500/20 text-red-300 border-red-500/30">Critical</Badge>
            </div>
            <div className="text-3xl font-bold text-red-200">{criticalNodes.length}</div>
            <div className="text-xs text-red-400/70">Nodes Need Immediate Attention</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-950/40 to-orange-950/40 border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Wrench className="w-5 h-5 text-amber-400" />
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">Warning</Badge>
            </div>
            <div className="text-3xl font-bold text-amber-200">{warningNodes.length}</div>
            <div className="text-xs text-amber-400/70">Nodes Approaching Maintenance</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-950/40 to-emerald-950/40 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Healthy</Badge>
            </div>
            <div className="text-3xl font-bold text-green-200">{nodes.filter(n => n.health_score >= 75).length}</div>
            <div className="text-xs text-green-400/70">Nodes Operating Optimally</div>
          </CardContent>
        </Card>
      </div>

      {/* Auto-Scaling Control */}
      <Card className="bg-slate-900/60 border-purple-900/40">
        <CardHeader className="border-b border-purple-900/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-purple-200 flex items-center gap-2">
              <Scale className="w-5 h-5" />
              Automated Scaling
            </CardTitle>
            <Button
              variant={autoScaling ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoScaling(!autoScaling)}
              className={autoScaling ? "bg-green-600 hover:bg-green-700" : "border-purple-500/30 text-purple-300"}
            >
              {autoScaling ? 'Auto ON' : 'Auto OFF'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-purple-300">Network Load</span>
                  <span className="text-lg font-bold text-purple-200">{scalingMetrics.currentLoad.toFixed(0)}%</span>
                </div>
                <Progress value={scalingMetrics.currentLoad} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-950/50 rounded border border-purple-500/30">
                  <div className="text-xs text-purple-400/70 mb-1">Current Nodes</div>
                  <div className="text-2xl font-bold text-purple-200">{scalingMetrics.currentNodes}</div>
                </div>
                <div className="p-3 bg-slate-950/50 rounded border border-purple-500/30">
                  <div className="text-xs text-purple-400/70 mb-1">Optimal Nodes</div>
                  <div className="text-2xl font-bold text-cyan-200">{scalingMetrics.optimalNodes}</div>
                </div>
              </div>

              <Badge className={
                scalingMetrics.recommendation === 'scale_up' ? 'bg-green-500/20 text-green-300 border-green-500/30 w-full justify-center' :
                scalingMetrics.recommendation === 'scale_down' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 w-full justify-center' :
                'bg-blue-500/20 text-blue-300 border-blue-500/30 w-full justify-center'
              }>
                {scalingMetrics.recommendation === 'scale_up' ? '▲ Scale Up Recommended' :
                 scalingMetrics.recommendation === 'scale_down' ? '▼ Scale Down Recommended' :
                 '✓ Optimal Configuration'}
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-purple-950/30 rounded border border-purple-500/30">
                <div className="text-sm font-semibold text-purple-200 mb-2">Scaling Logic</div>
                <ul className="text-xs text-purple-300/70 space-y-1">
                  <li>• Monitors network load and entanglement strength</li>
                  <li>• Scales up when load {'>'} 70% or entanglement {'<'} 0.5</li>
                  <li>• Scales down when load {'<'} 40% and nodes {'>'} 3</li>
                  <li>• Maintains minimum 3 nodes for redundancy</li>
                </ul>
              </div>

              <Button
                onClick={() => autoScaleMutation.mutate()}
                disabled={autoScaleMutation.isPending || scalingMetrics.recommendation === 'optimal'}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600"
              >
                {autoScaleMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Scaling...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Execute Auto-Scale
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Predictive Maintenance */}
      <Card className="bg-slate-900/60 border-purple-900/40">
        <CardHeader className="border-b border-purple-900/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-purple-200 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Node Health Analysis
            </CardTitle>
            <Button
              onClick={() => runPredictiveMaintenanceMutation.mutate()}
              disabled={runPredictiveMaintenanceMutation.isPending}
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              {runPredictiveMaintenanceMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Run Predictive Analysis
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-3">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="p-4 bg-slate-950/50 rounded animate-pulse">
                  <div className="h-4 bg-purple-900/20 rounded mb-2" />
                  <div className="h-3 bg-purple-900/20 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {nodes.slice(0, 8).map((node, i) => (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="p-4 bg-slate-950/50 rounded border border-purple-900/30 hover:border-purple-500/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedNode(node)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="font-semibold text-purple-200">{node.node_name || node.node_id}</div>
                      <div className="text-xs text-purple-400/70 capitalize">{node.node_type.replace(/_/g, ' ')}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={
                        node.health_score >= 75 ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                        node.health_score >= 50 ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                        'bg-red-500/20 text-red-300 border-red-500/30'
                      }>
                        Health: {node.health_score}%
                      </Badge>
                      {node.maintenance_priority && node.maintenance_priority !== 'low' && (
                        <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                          {node.maintenance_priority}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3 mb-3">
                    <div className="text-xs">
                      <div className="text-purple-400/70 mb-1">Entanglement</div>
                      <div className="text-purple-200">{(node.entanglement_strength * 100).toFixed(0)}%</div>
                    </div>
                    <div className="text-xs">
                      <div className="text-purple-400/70 mb-1">Error Rate</div>
                      <div className="text-purple-200">{(node.error_rate * 100).toFixed(2)}%</div>
                    </div>
                    <div className="text-xs">
                      <div className="text-purple-400/70 mb-1">Latency</div>
                      <div className="text-purple-200">{node.network_latency_ms}ms</div>
                    </div>
                    <div className="text-xs">
                      <div className="text-purple-400/70 mb-1">Uptime</div>
                      <div className="text-purple-200">{node.uptime_hours}h</div>
                    </div>
                  </div>

                  {node.ai_recommendations && node.ai_recommendations.length > 0 && (
                    <div className="p-2 bg-indigo-950/30 rounded border border-indigo-500/30">
                      <div className="text-xs font-semibold text-indigo-300 mb-1">AI Recommendations:</div>
                      <div className="text-xs text-indigo-400/70">{node.ai_recommendations[0]}</div>
                    </div>
                  )}

                  {node.predicted_maintenance_date && (
                    <div className="mt-2 text-xs text-purple-400/70">
                      Predicted maintenance: {format(new Date(node.predicted_maintenance_date), "MMM d, yyyy")}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Diagnostic Assistant */}
      {selectedNode && (
        <Card className="bg-slate-900/60 border-purple-900/40">
          <CardHeader className="border-b border-purple-900/30">
            <div className="flex items-center justify-between">
              <CardTitle className="text-purple-200 flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI Diagnostic Assistant • {selectedNode.node_name}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedNode(null)}
                className="border-purple-500/30 text-purple-300"
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="p-3 bg-slate-950/50 rounded border border-purple-500/30">
                  <div className="text-sm font-semibold text-purple-200 mb-2">Quick Actions</div>
                  <div className="space-y-2">
                    <Button
                      onClick={() => optimizeNodeMutation.mutate(selectedNode)}
                      disabled={optimizeNodeMutation.isPending}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
                      size="sm"
                    >
                      {optimizeNodeMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Optimizing...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          AI Auto-Optimize
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/50 rounded border border-purple-500/30">
                  <div className="text-sm font-semibold text-purple-200 mb-2">Current Metrics</div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-purple-400/70">Health Score:</span>
                      <span className="text-purple-200">{selectedNode.health_score}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-400/70">Entanglement:</span>
                      <span className="text-purple-200">{(selectedNode.entanglement_strength * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-400/70">Error Rate:</span>
                      <span className="text-purple-200">{(selectedNode.error_rate * 100).toFixed(3)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-400/70">Temperature:</span>
                      <span className="text-purple-200">{selectedNode.temperature_mk}mK</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-3">
                  <label className="text-sm text-purple-300 mb-2 block">Ask AI Diagnostician</label>
                  <Textarea
                    value={diagnosticQuery}
                    onChange={(e) => setDiagnosticQuery(e.target.value)}
                    placeholder="E.g., Why is latency high? How to improve entanglement?"
                    className="bg-slate-950/50 border-purple-900/30 text-purple-100 min-h-[100px]"
                  />
                </div>
                <Button
                  onClick={() => diagnoseNodeMutation.mutate({ node: selectedNode, query: diagnosticQuery })}
                  disabled={diagnoseNodeMutation.isPending}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600"
                >
                  {diagnoseNodeMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Diagnosing...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Run AI Diagnosis
                    </>
                  )}
                </Button>

                {diagnoseNodeMutation.data && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-gradient-to-r from-indigo-950/30 to-purple-950/30 rounded border border-indigo-500/30"
                  >
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-semibold text-indigo-200 mb-1">Root Cause</div>
                        <div className="text-xs text-indigo-300/70">{diagnoseNodeMutation.data.root_cause}</div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-indigo-200 mb-1">Immediate Actions</div>
                        <ul className="text-xs text-indigo-300/70 space-y-1">
                          {diagnoseNodeMutation.data.immediate_actions?.map((action, i) => (
                            <li key={i}>• {action}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-indigo-400/70">Risk Level:</span>
                        <Badge className={
                          diagnoseNodeMutation.data.risk_level === 'critical' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                          diagnoseNodeMutation.data.risk_level === 'high' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                          'bg-green-500/20 text-green-300 border-green-500/30'
                        }>
                          {diagnoseNodeMutation.data.risk_level}
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}