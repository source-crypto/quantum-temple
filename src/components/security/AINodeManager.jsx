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
  TrendingUp,
  AlertTriangle,
  Zap,
  Activity,
  CheckCircle,
  Loader2,
  Settings,
  LineChart
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AINodeManager() {
  const [diagnosticQuery, setDiagnosticQuery] = useState("");
  const [autoScaling, setAutoScaling] = useState(true);
  const [scalingMetrics, setScalingMetrics] = useState({
    currentLoad: 65,
    targetLoad: 70,
    scaleThreshold: 80,
    nodesNeeded: 0
  });

  const queryClient = useQueryClient();

  const { data: nodes } = useQuery({
    queryKey: ['quantumNodes'],
    queryFn: () => base44.entities.QuantumNode.list('-last_active', 50),
    initialData: [],
    refetchInterval: 10000
  });

  // AI Predictive Maintenance Analysis
  const predictMaintenanceMutation = useMutation({
    mutationFn: async (node) => {
      const prompt = `Analyze quantum node health metrics and predict maintenance requirements:
      
Node Details:
- Health Score: ${node.health_score}
- Entanglement Strength: ${node.entanglement_strength}
- Coherence Level: ${node.coherence_level}
- Error Rate: ${node.error_rate}
- Temperature: ${node.temperature_mk}mK
- Uptime: ${node.uptime_hours} hours
- Network Latency: ${node.network_latency_ms}ms

Provide maintenance prediction in JSON format:
{
  "maintenance_needed": boolean,
  "predicted_date": "ISO date string",
  "priority": "low|medium|high|critical",
  "issues_detected": ["issue1", "issue2"],
  "recommendations": ["rec1", "rec2", "rec3"],
  "estimated_downtime_hours": number,
  "preventive_actions": ["action1", "action2"]
}`;

      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            maintenance_needed: { type: "boolean" },
            predicted_date: { type: "string" },
            priority: { type: "string" },
            issues_detected: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            estimated_downtime_hours: { type: "number" },
            preventive_actions: { type: "array", items: { type: "string" } }
          }
        }
      });

      // Update node with AI predictions
      await base44.entities.QuantumNode.update(node.id, {
        predicted_maintenance_date: analysis.predicted_date,
        maintenance_priority: analysis.priority,
        ai_recommendations: analysis.recommendations,
        optimization_history: [
          ...(node.optimization_history || []),
          {
            timestamp: new Date().toISOString(),
            analysis: analysis,
            type: 'predictive_maintenance'
          }
        ]
      });

      return analysis;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quantumNodes'] });
      toast.success("Maintenance Prediction Updated");
    }
  });

  // AI Diagnostic Assistant
  const diagnosticMutation = useMutation({
    mutationFn: async () => {
      const nodesData = nodes.map(n => ({
        id: n.node_id,
        type: n.node_type,
        health: n.health_score,
        status: n.status
      }));

      const prompt = `As an AI quantum node diagnostic assistant, analyze this query and provide detailed troubleshooting guidance:

User Query: "${diagnosticQuery}"

Current Network State:
${JSON.stringify(nodesData, null, 2)}

Provide a comprehensive diagnostic response in JSON format:
{
  "diagnosis": "detailed explanation",
  "affected_nodes": ["node_id1", "node_id2"],
  "root_cause": "likely root cause",
  "severity": "low|medium|high|critical",
  "immediate_actions": ["action1", "action2"],
  "long_term_solutions": ["solution1", "solution2"],
  "estimated_resolution_time": "time estimate"
}`;

      const diagnostic = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            diagnosis: { type: "string" },
            affected_nodes: { type: "array", items: { type: "string" } },
            root_cause: { type: "string" },
            severity: { type: "string" },
            immediate_actions: { type: "array", items: { type: "string" } },
            long_term_solutions: { type: "array", items: { type: "string" } },
            estimated_resolution_time: { type: "string" }
          }
        }
      });

      return diagnostic;
    },
    onSuccess: () => {
      toast.success("Diagnostic Complete");
    }
  });

  // Automated Node Scaling
  const scaleNodesMutation = useMutation({
    mutationFn: async () => {
      const avgHealth = nodes.reduce((sum, n) => sum + n.health_score, 0) / nodes.length;
      const avgEntanglement = nodes.reduce((sum, n) => sum + n.entanglement_strength, 0) / nodes.length;
      const avgLoad = (avgHealth + avgEntanglement * 100) / 2;

      const prompt = `Analyze quantum network metrics and determine optimal scaling strategy:

Current Metrics:
- Total Nodes: ${nodes.length}
- Average Health: ${avgHealth.toFixed(2)}%
- Average Entanglement: ${avgEntanglement.toFixed(2)}
- Current Load: ${avgLoad.toFixed(2)}%
- Target Load: 70%
- Scale Threshold: 80%

Provide scaling recommendation in JSON format:
{
  "should_scale": boolean,
  "scale_direction": "up|down|maintain",
  "nodes_to_add": number,
  "nodes_to_remove": number,
  "reasoning": "explanation",
  "new_node_types": ["type1", "type2"],
  "expected_improvement": number
}`;

      const scaling = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            should_scale: { type: "boolean" },
            scale_direction: { type: "string" },
            nodes_to_add: { type: "number" },
            nodes_to_remove: { type: "number" },
            reasoning: { type: "string" },
            new_node_types: { type: "array", items: { type: "string" } },
            expected_improvement: { type: "number" }
          }
        }
      });

      // Execute scaling if recommended
      if (scaling.should_scale && scaling.nodes_to_add > 0) {
        for (let i = 0; i < scaling.nodes_to_add; i++) {
          const nodeType = scaling.new_node_types[i % scaling.new_node_types.length];
          await base44.entities.QuantumNode.create({
            node_id: `AUTO-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            node_type: nodeType,
            node_name: `Auto-Scaled ${nodeType} Node`,
            status: 'active',
            health_score: 100,
            entanglement_strength: 1.0,
            coherence_level: 1.0,
            last_active: new Date().toISOString(),
            metadata: {
              auto_scaled: true,
              scaling_reason: scaling.reasoning,
              created_by: 'AI_Manager'
            }
          });
        }
      }

      return scaling;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quantumNodes'] });
      if (data.should_scale) {
        toast.success(`Scaled ${data.scale_direction}`, {
          description: `Added ${data.nodes_to_add} nodes`
        });
      }
    }
  });

  // Auto-scaling monitoring
  useEffect(() => {
    if (!autoScaling || nodes.length === 0) return;

    const interval = setInterval(() => {
      const avgHealth = nodes.reduce((sum, n) => sum + n.health_score, 0) / nodes.length;
      const avgEntanglement = nodes.reduce((sum, n) => sum + n.entanglement_strength, 0) / nodes.length;
      const currentLoad = (avgHealth + avgEntanglement * 100) / 2;

      setScalingMetrics(prev => ({
        ...prev,
        currentLoad: currentLoad,
        nodesNeeded: currentLoad > prev.scaleThreshold ? Math.ceil((currentLoad - prev.targetLoad) / 20) : 0
      }));

      // Trigger auto-scale if needed
      if (currentLoad > 80 || currentLoad < 30) {
        scaleNodesMutation.mutate();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [autoScaling, nodes]);

  const criticalNodes = nodes.filter(n => n.maintenance_priority === 'critical');
  const highPriorityNodes = nodes.filter(n => n.maintenance_priority === 'high');

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
            AI-powered node management with predictive maintenance, automated diagnostics, and intelligent scaling based on network load and quantum entanglement strength.
          </p>
        </CardContent>
      </Card>

      {/* Automated Scaling Control */}
      <Card className="bg-slate-900/60 border-purple-900/40">
        <CardHeader className="border-b border-purple-900/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-purple-200 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Automated Node Scaling
            </CardTitle>
            <Button
              size="sm"
              variant={autoScaling ? "default" : "outline"}
              onClick={() => setAutoScaling(!autoScaling)}
              className={autoScaling ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {autoScaling ? "Enabled" : "Disabled"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            <div className="p-4 bg-gradient-to-br from-cyan-950/40 to-blue-950/40 rounded-lg border border-cyan-500/30">
              <div className="text-sm text-cyan-300 mb-2">Current Load</div>
              <div className="text-3xl font-bold text-cyan-200">{scalingMetrics.currentLoad.toFixed(0)}%</div>
              <Progress value={scalingMetrics.currentLoad} className="h-2 mt-2" />
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-950/40 to-pink-950/40 rounded-lg border border-purple-500/30">
              <div className="text-sm text-purple-300 mb-2">Active Nodes</div>
              <div className="text-3xl font-bold text-purple-200">{nodes.length}</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-950/40 to-emerald-950/40 rounded-lg border border-green-500/30">
              <div className="text-sm text-green-300 mb-2">Target Load</div>
              <div className="text-3xl font-bold text-green-200">{scalingMetrics.targetLoad}%</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-amber-950/40 to-orange-950/40 rounded-lg border border-amber-500/30">
              <div className="text-sm text-amber-300 mb-2">Scale Threshold</div>
              <div className="text-3xl font-bold text-amber-200">{scalingMetrics.scaleThreshold}%</div>
            </div>
          </div>

          {autoScaling && scalingMetrics.nodesNeeded > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-amber-950/30 rounded-lg border border-amber-500/30"
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-semibold text-amber-300">Scaling Action Required</span>
              </div>
              <div className="text-sm text-amber-400/70">
                Network load exceeds threshold. Recommending {scalingMetrics.nodesNeeded} additional nodes.
              </div>
            </motion.div>
          )}

          <Button
            onClick={() => scaleNodesMutation.mutate()}
            disabled={scaleNodesMutation.isPending}
            className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-purple-600"
          >
            {scaleNodesMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Network...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Trigger AI Scaling Analysis
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Predictive Maintenance Alerts */}
      <Card className="bg-slate-900/60 border-purple-900/40">
        <CardHeader className="border-b border-purple-900/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-purple-200 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Predictive Maintenance Alerts
            </CardTitle>
            <div className="flex gap-2">
              <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                {criticalNodes.length} Critical
              </Badge>
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                {highPriorityNodes.length} High
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {criticalNodes.length === 0 && highPriorityNodes.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400/40" />
              <p className="text-green-400/60">All nodes operating optimally</p>
            </div>
          ) : (
            <div className="space-y-3">
              {[...criticalNodes, ...highPriorityNodes].map((node, i) => (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 bg-slate-950/50 rounded-lg border border-purple-900/30"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-semibold text-purple-200">{node.node_name}</div>
                      <div className="text-xs text-purple-400/70 font-mono">{node.node_id}</div>
                    </div>
                    <Badge className={
                      node.maintenance_priority === 'critical' 
                        ? 'bg-red-500/20 text-red-300 border-red-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }>
                      {node.maintenance_priority}
                    </Badge>
                  </div>

                  {node.predicted_maintenance_date && (
                    <div className="text-sm text-purple-400/70 mb-2">
                      Predicted Maintenance: {format(new Date(node.predicted_maintenance_date), "MMM d, yyyy")}
                    </div>
                  )}

                  {node.ai_recommendations && node.ai_recommendations.length > 0 && (
                    <div className="mt-3 p-3 bg-indigo-950/30 rounded border border-indigo-500/30">
                      <div className="text-xs text-indigo-300 font-semibold mb-2">AI Recommendations:</div>
                      <ul className="space-y-1">
                        {node.ai_recommendations.slice(0, 3).map((rec, idx) => (
                          <li key={idx} className="text-xs text-indigo-400/70 flex items-start gap-2">
                            <span className="text-indigo-400">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button
                    size="sm"
                    onClick={() => predictMaintenanceMutation.mutate(node)}
                    disabled={predictMaintenanceMutation.isPending}
                    className="w-full mt-3 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30"
                  >
                    {predictMaintenanceMutation.isPending ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain className="w-3 h-3 mr-2" />
                        Run AI Analysis
                      </>
                    )}
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Diagnostic Assistant */}
      <Card className="bg-slate-900/60 border-purple-900/40">
        <CardHeader className="border-b border-purple-900/30">
          <CardTitle className="text-purple-200 flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Diagnostic Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="text-sm text-purple-300 mb-2 block">Describe the issue or ask a question</label>
            <Textarea
              value={diagnosticQuery}
              onChange={(e) => setDiagnosticQuery(e.target.value)}
              placeholder="e.g., 'Why is node entanglement-primary-001 showing high error rates?'"
              className="bg-slate-950/50 border-purple-900/30 text-purple-100 min-h-[100px]"
            />
          </div>

          <Button
            onClick={() => diagnosticMutation.mutate()}
            disabled={diagnosticMutation.isPending || !diagnosticQuery}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600"
          >
            {diagnosticMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Get AI Diagnosis
              </>
            )}
          </Button>

          <AnimatePresence>
            {diagnosticMutation.data && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-gradient-to-r from-indigo-950/40 to-purple-950/40 rounded-lg border border-indigo-500/30"
              >
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-semibold text-indigo-200 mb-2">Diagnosis</div>
                    <p className="text-sm text-indigo-300/70">{diagnosticMutation.data.diagnosis}</p>
                  </div>

                  <div>
                    <div className="text-sm font-semibold text-indigo-200 mb-2">Root Cause</div>
                    <p className="text-sm text-indigo-300/70">{diagnosticMutation.data.root_cause}</p>
                  </div>

                  <div>
                    <div className="text-sm font-semibold text-indigo-200 mb-2">Immediate Actions</div>
                    <ul className="space-y-1">
                      {diagnosticMutation.data.immediate_actions.map((action, i) => (
                        <li key={i} className="text-sm text-indigo-300/70 flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-green-400" />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-indigo-500/30">
                    <Badge className={
                      diagnosticMutation.data.severity === 'critical' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                      diagnosticMutation.data.severity === 'high' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                      'bg-blue-500/20 text-blue-300 border-blue-500/30'
                    }>
                      Severity: {diagnosticMutation.data.severity}
                    </Badge>
                    <span className="ml-3 text-xs text-indigo-400/70">
                      Est. Resolution: {diagnosticMutation.data.estimated_resolution_time}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}