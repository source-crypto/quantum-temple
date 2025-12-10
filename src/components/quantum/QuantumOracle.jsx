import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Globe, 
  TrendingUp,
  AlertCircle,
  FileText,
  Activity,
  Sparkles,
  Circle,
  Radio,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";

export default function QuantumOracle() {
  const [oracleFeeds, setOracleFeeds] = useState({
    marketTrends: null,
    socialConsensus: null,
    regulatoryChanges: null,
    lastUpdate: null
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [autoSync, setAutoSync] = useState(false);
  
  const queryClient = useQueryClient();

  // Auto-sync every 5 minutes if enabled
  useEffect(() => {
    if (!autoSync) return;
    
    const interval = setInterval(() => {
      syncOracleMutation.mutate();
    }, 300000); // 5 minutes
    
    return () => clearInterval(interval);
  }, [autoSync]);

  // Listen for VQC events and respond
  useEffect(() => {
    const handleVQCRequest = (event) => {
      if (oracleFeeds.marketTrends) {
        window.dispatchEvent(new CustomEvent('oracleResponse', {
          detail: {
            mvl: oracleFeeds.marketTrends.mvl_impact,
            rvl: oracleFeeds.regulatoryChanges.rvl_adjustment,
            svl: oracleFeeds.socialConsensus.svl_signal,
            timestamp: oracleFeeds.lastUpdate
          }
        }));
      }
    };
    
    window.addEventListener('vqcRequestOracle', handleVQCRequest);
    return () => window.removeEventListener('vqcRequestOracle', handleVQCRequest);
  }, [oracleFeeds]);

  const { data: dataSource } = useQuery({
    queryKey: ['quantumOracleSources'],
    queryFn: async () => {
      const sources = await base44.entities.DataSource.list('-last_sync', 10);
      return sources;
    },
    initialData: [],
  });

  const { data: oracleNodes } = useQuery({
    queryKey: ['quantumOracleNodes'],
    queryFn: async () => {
      const nodes = await base44.entities.QuantumNode.filter({ node_type: 'oracle' }, '-last_active', 10);
      return nodes;
    },
    initialData: [],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const deployNodesMutation = useMutation({
    mutationFn: async () => {
      const providerAddress = 'ECjtUQnnVds5AcfhMo1epFaCwQz5kAqvTWkBq2o2oMfq';
      
      // Get or create user balance
      let userBalance = await base44.entities.UserBalance.filter({ user_email: user.email });
      if (userBalance.length === 0) {
        userBalance = [await base44.entities.UserBalance.create({
          user_email: user.email,
          available_balance: 1000,
          wallet_address: providerAddress
        })];
      }
      
      // Transfer 100 QTC to provider address as network stake
      await base44.entities.CurrencyTransaction.create({
        transaction_type: 'distribution',
        from_user: 'system',
        to_user: providerAddress,
        amount: 100,
        transaction_fee: 0,
        status: 'completed',
        note: 'Oracle provider network initialization',
        transaction_hash: `TX-ORACLE-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        timestamp: new Date().toISOString(),
        quantum_signature: `QS-${btoa(providerAddress).substring(0, 32)}`
      });
      
      // Update user balance
      await base44.entities.UserBalance.update(userBalance[0].id, {
        available_balance: userBalance[0].available_balance + 100
      });
      
      return { providerAddress, stakeAmount: 100 };
    },
    onSuccess: (data) => {
      toast.success("Provider Configured", {
        description: `Address ${data.providerAddress.substring(0, 12)}... • 100 QTC staked`
      });
      queryClient.invalidateQueries({ queryKey: ['userBalance'] });
      syncOracleMutation.mutate();
    }
  });

  const syncOracleMutation = useMutation({
    mutationFn: async () => {
      setIsSyncing(true);
      
      // Fetch real-world market data
      const marketPrompt = `Analyze current cryptocurrency market trends for quantum-based currencies and DeFi protocols. 
      Provide sentiment score, trend direction, volatility index, and key market signals.
      
      Respond in JSON format:
      {
        "sentiment_score": number (0-100),
        "trend_direction": "bullish|bearish|neutral|volatile",
        "volatility_index": number (0-100),
        "key_signals": ["signal1", "signal2", "signal3"],
        "mvl_impact": number (0-100),
        "rvl_impact": number (0-100),
        "svl_impact": number (0-100)
      }`;
      
      const marketData = await base44.integrations.Core.InvokeLLM({
        prompt: marketPrompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            sentiment_score: { type: "number" },
            trend_direction: { type: "string" },
            volatility_index: { type: "number" },
            key_signals: { type: "array", items: { type: "string" } },
            mvl_impact: { type: "number" },
            rvl_impact: { type: "number" },
            svl_impact: { type: "number" }
          }
        }
      });
      
      // Fetch social consensus signals
      const socialPrompt = `Analyze current social media and community sentiment around decentralized finance, 
      quantum computing, and consciousness-based value systems. Provide consensus strength and alignment score.
      
      Respond in JSON format:
      {
        "consensus_strength": number (0-100),
        "alignment_score": number (0-100),
        "dominant_narrative": string,
        "community_energy": "high|medium|low",
        "svl_signal": number (0-100)
      }`;
      
      const socialData = await base44.integrations.Core.InvokeLLM({
        prompt: socialPrompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            consensus_strength: { type: "number" },
            alignment_score: { type: "number" },
            dominant_narrative: { type: "string" },
            community_energy: { type: "string" },
            svl_signal: { type: "number" }
          }
        }
      });
      
      // Fetch regulatory landscape
      const regulatoryPrompt = `Analyze current cryptocurrency regulatory environment, compliance requirements, 
      and policy changes. Provide regulatory risk score and compliance outlook.
      
      Respond in JSON format:
      {
        "regulatory_risk": number (0-100),
        "compliance_outlook": "favorable|neutral|restrictive",
        "key_changes": ["change1", "change2"],
        "rvl_adjustment": number (-20 to 20)
      }`;
      
      const regulatoryData = await base44.integrations.Core.InvokeLLM({
        prompt: regulatoryPrompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            regulatory_risk: { type: "number" },
            compliance_outlook: { type: "string" },
            key_changes: { type: "array", items: { type: "string" } },
            rvl_adjustment: { type: "number" }
          }
        }
      });
      
      // Create or update oracle nodes
      const timestamp = new Date().toISOString();
      
      // Market Oracle Node with peer connections
      const marketNode = await base44.entities.QuantumNode.create({
        node_id: 'oracle-market-001',
        node_type: 'oracle',
        node_name: 'Market Oracle Node',
        status: 'active',
        health_score: marketData.sentiment_score,
        consensus_power: marketData.mvl_impact,
        stake_amount: 33.33,
        connected_peers: 12,
        last_active: timestamp,
        metadata: {
          oracle_type: 'market',
          signals: marketData.key_signals,
          trend: marketData.trend_direction,
          volatility: marketData.volatility_index,
          provider_address: 'ECjtUQnnVds5AcfhMo1epFaCwQz5kAqvTWkBq2o2oMfq',
          peer_nodes: [
            'oracle-social-001',
            'oracle-regulatory-001',
            'gateway-001',
            'gateway-002',
            'verification-001',
            'verification-002'
          ],
          network_topology: 'mesh',
          latency_ms: 15 + Math.random() * 10,
          bandwidth_mbps: 1000
        }
      });
      
      // Social Oracle Node with peer connections
      const socialNode = await base44.entities.QuantumNode.create({
        node_id: 'oracle-social-001',
        node_type: 'oracle',
        node_name: 'Social Consensus Oracle',
        status: 'active',
        health_score: socialData.consensus_strength,
        consensus_power: socialData.svl_signal,
        stake_amount: 33.33,
        connected_peers: 8,
        last_active: timestamp,
        metadata: {
          oracle_type: 'social',
          narrative: socialData.dominant_narrative,
          energy: socialData.community_energy,
          alignment: socialData.alignment_score,
          provider_address: 'ECjtUQnnVds5AcfhMo1epFaCwQz5kAqvTWkBq2o2oMfq',
          peer_nodes: [
            'oracle-market-001',
            'oracle-regulatory-001',
            'gateway-003',
            'verification-003'
          ],
          network_topology: 'mesh',
          latency_ms: 12 + Math.random() * 8,
          bandwidth_mbps: 1000
        }
      });
      
      // Regulatory Oracle Node with peer connections
      const regulatoryNode = await base44.entities.QuantumNode.create({
        node_id: 'oracle-regulatory-001',
        node_type: 'oracle',
        node_name: 'Regulatory Oracle Node',
        status: 'active',
        health_score: 100 - regulatoryData.regulatory_risk,
        consensus_power: 50 + regulatoryData.rvl_adjustment,
        stake_amount: 33.34,
        connected_peers: 6,
        last_active: timestamp,
        metadata: {
          oracle_type: 'regulatory',
          outlook: regulatoryData.compliance_outlook,
          risk: regulatoryData.regulatory_risk,
          changes: regulatoryData.key_changes,
          provider_address: 'ECjtUQnnVds5AcfhMo1epFaCwQz5kAqvTWkBq2o2oMfq',
          peer_nodes: [
            'oracle-market-001',
            'oracle-social-001',
            'gateway-004',
            'sentinel-001'
          ],
          network_topology: 'mesh',
          latency_ms: 18 + Math.random() * 12,
          bandwidth_mbps: 1000
        }
      });
      
      return {
        marketTrends: marketData,
        socialConsensus: socialData,
        regulatoryChanges: regulatoryData,
        lastUpdate: timestamp
      };
    },
    onSuccess: (data) => {
      setOracleFeeds(data);
      setIsSyncing(false);
      queryClient.invalidateQueries({ queryKey: ['quantumOracleNodes'] });
      
      // Broadcast oracle signals for VQC integration with dynamic adjustments
      const vqcAdjustments = {
        mvl: data.marketTrends.mvl_impact,
        rvl: data.regulatoryChanges.rvl_adjustment,
        svl: data.socialConsensus.svl_signal,
        timestamp: data.lastUpdate,
        autoAdjust: true
      };
      
      window.dispatchEvent(new CustomEvent('oracleUpdate', { detail: vqcAdjustments }));
      
      // Trigger automatic VQC recalculation if significant changes detected
      const significantChange = 
        Math.abs(data.regulatoryChanges.rvl_adjustment) > 10 ||
        data.marketTrends.mvl_impact > 80 ||
        data.socialConsensus.svl_signal > 85;
      
      if (significantChange) {
        window.dispatchEvent(new CustomEvent('vqcRecalculate', { 
          detail: { 
            reason: 'Significant oracle signal detected',
            adjustments: vqcAdjustments 
          } 
        }));
      }
      
      toast.success("Oracle Network Deployed", {
        description: `3 oracle nodes active • 100 QTC staked • ${oracleNodes.length > 0 ? oracleNodes.reduce((sum, n) => sum + (n.connected_peers || 0), 0) : 26} peer connections`
      });
    },
    onError: () => {
      setIsSyncing(false);
      toast.error("Oracle sync failed");
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-cyan-950/60 to-blue-950/60 border-cyan-500/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-cyan-200 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Quantum Oracle • External Reality Integration
            </CardTitle>
            <div className="flex items-center gap-2">
              {oracleFeeds.lastUpdate && (
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                  <Circle className="w-2 h-2 mr-1 animate-pulse" />
                  Synced {format(new Date(oracleFeeds.lastUpdate), "HH:mm:ss")}
                </Badge>
              )}
              <Button
                size="sm"
                variant={autoSync ? "default" : "outline"}
                onClick={() => setAutoSync(!autoSync)}
                className={autoSync ? "bg-green-600 hover:bg-green-700" : "border-cyan-500/30 text-cyan-300"}
              >
                <Activity className="w-4 h-4 mr-2" />
                Auto {autoSync ? 'ON' : 'OFF'}
              </Button>
              <Button
                size="sm"
                onClick={() => syncOracleMutation.mutate()}
                disabled={isSyncing}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
              >
                {isSyncing ? (
                  <>
                    <Radio className="w-4 h-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4 mr-2" />
                    Sync Now
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-cyan-300/70 leading-relaxed">
            Quantum Oracles translate real-world data—market trends, social consensus signals, regulatory changes—into 
            quantum-compatible signals that integrate directly with VQC layers (MVL, RVL, SVL). External reality becomes 
            observable quantum input, enabling the platform to react to global events and adjust value calculations in real-time.
          </p>
          {autoSync && (
            <div className="flex items-center gap-2 mt-3 p-3 bg-green-950/30 rounded-lg border border-green-500/30">
              <Activity className="w-4 h-4 text-green-400 animate-pulse" />
              <span className="text-sm text-green-300">Auto-sync enabled • Updates every 5 minutes</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Oracle Network Visualization */}
      {oracleNodes.length > 0 && (
        <Card className="bg-slate-900/60 border-purple-900/40">
          <CardHeader className="border-b border-purple-900/30">
            <CardTitle className="text-purple-200 flex items-center gap-2">
              <Radio className="w-5 h-5 animate-pulse" />
              Oracle Network • {oracleNodes.length} Active Nodes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-4">
              {oracleNodes.map((node, i) => (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 bg-slate-950/50 rounded-lg border border-purple-500/30"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        node.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
                      }`} />
                      <span className="text-sm font-semibold text-purple-200">
                        {node.node_name}
                      </span>
                    </div>
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                      {node.metadata?.oracle_type}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-400/70">Health:</span>
                      <span className="text-purple-200">{node.health_score?.toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-400/70">Consensus Power:</span>
                      <span className="text-purple-200">{node.consensus_power?.toFixed(0)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-400/70">Peers:</span>
                      <span className="text-purple-200">{node.connected_peers}</span>
                    </div>
                    {node.metadata?.provider_address && (
                      <div className="flex items-center justify-between">
                        <span className="text-purple-400/70">Provider:</span>
                        <span className="text-purple-200 font-mono text-[10px]">
                          {node.metadata.provider_address.substring(0, 8)}...
                        </span>
                      </div>
                    )}
                    {node.stake_amount > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-purple-400/70">Stake:</span>
                        <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px]">
                          {node.stake_amount.toFixed(2)} QTC
                        </Badge>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-purple-400/70">Last Active:</span>
                      <span className="text-purple-200">{format(new Date(node.last_active), "HH:mm:ss")}</span>
                    </div>
                  </div>
                  
                  <Progress value={node.health_score} className="h-1 mt-3" />
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Oracle Feeds */}
      {oracleFeeds.marketTrends && (
        <div className="grid md:grid-cols-3 gap-4">
          {/* Market Trends Oracle */}
          <Card className="bg-slate-900/60 border-purple-900/40">
            <CardHeader className="border-b border-purple-900/30">
              <CardTitle className="text-purple-200 flex items-center gap-2 text-base">
                <TrendingUp className="w-4 h-4" />
                Market Oracle
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="p-3 bg-purple-950/30 rounded border border-purple-500/30">
                <div className="text-xs text-purple-400/70 mb-1">Sentiment Score</div>
                <div className="text-2xl font-bold text-purple-200">
                  {oracleFeeds.marketTrends.sentiment_score.toFixed(0)}
                </div>
                <Progress value={oracleFeeds.marketTrends.sentiment_score} className="h-1 mt-2" />
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-purple-400/70">Trend:</span>
                  <Badge className={
                    oracleFeeds.marketTrends.trend_direction === 'bullish' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                    oracleFeeds.marketTrends.trend_direction === 'bearish' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                    'bg-gray-500/20 text-gray-300 border-gray-500/30'
                  }>
                    {oracleFeeds.marketTrends.trend_direction}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-purple-400/70">Volatility:</span>
                  <span className="text-purple-200">{oracleFeeds.marketTrends.volatility_index.toFixed(0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-purple-400/70">MVL Impact:</span>
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                    {oracleFeeds.marketTrends.mvl_impact.toFixed(0)}
                  </Badge>
                </div>
              </div>

              {oracleFeeds.marketTrends.key_signals && (
                <div className="pt-3 border-t border-purple-500/30">
                  <div className="text-xs text-purple-400/70 mb-2">Key Signals</div>
                  <div className="space-y-1">
                    {oracleFeeds.marketTrends.key_signals.slice(0, 3).map((signal, i) => (
                      <div key={i} className="text-xs text-purple-300/80 flex items-start gap-1">
                        <Zap className="w-3 h-3 flex-shrink-0 mt-0.5 text-purple-400" />
                        <span>{signal}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Social Consensus Oracle */}
          <Card className="bg-slate-900/60 border-purple-900/40">
            <CardHeader className="border-b border-purple-900/30">
              <CardTitle className="text-cyan-200 flex items-center gap-2 text-base">
                <Activity className="w-4 h-4" />
                Social Oracle
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="p-3 bg-cyan-950/30 rounded border border-cyan-500/30">
                <div className="text-xs text-cyan-400/70 mb-1">Consensus Strength</div>
                <div className="text-2xl font-bold text-cyan-200">
                  {oracleFeeds.socialConsensus.consensus_strength.toFixed(0)}
                </div>
                <Progress value={oracleFeeds.socialConsensus.consensus_strength} className="h-1 mt-2" />
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-cyan-400/70">Alignment:</span>
                  <span className="text-cyan-200">{oracleFeeds.socialConsensus.alignment_score.toFixed(0)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-cyan-400/70">Energy:</span>
                  <Badge className={
                    oracleFeeds.socialConsensus.community_energy === 'high' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                    oracleFeeds.socialConsensus.community_energy === 'low' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                    'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }>
                    {oracleFeeds.socialConsensus.community_energy}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-cyan-400/70">SVL Signal:</span>
                  <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                    {oracleFeeds.socialConsensus.svl_signal.toFixed(0)}
                  </Badge>
                </div>
              </div>

              <div className="pt-3 border-t border-cyan-500/30">
                <div className="text-xs text-cyan-400/70 mb-2">Dominant Narrative</div>
                <div className="text-xs text-cyan-300/80 italic">
                  "{oracleFeeds.socialConsensus.dominant_narrative}"
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Regulatory Oracle */}
          <Card className="bg-slate-900/60 border-purple-900/40">
            <CardHeader className="border-b border-purple-900/30">
              <CardTitle className="text-indigo-200 flex items-center gap-2 text-base">
                <FileText className="w-4 h-4" />
                Regulatory Oracle
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="p-3 bg-indigo-950/30 rounded border border-indigo-500/30">
                <div className="text-xs text-indigo-400/70 mb-1">Regulatory Risk</div>
                <div className="text-2xl font-bold text-indigo-200">
                  {oracleFeeds.regulatoryChanges.regulatory_risk.toFixed(0)}
                </div>
                <Progress value={oracleFeeds.regulatoryChanges.regulatory_risk} className="h-1 mt-2" />
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-indigo-400/70">Outlook:</span>
                  <Badge className={
                    oracleFeeds.regulatoryChanges.compliance_outlook === 'favorable' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                    oracleFeeds.regulatoryChanges.compliance_outlook === 'restrictive' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                    'bg-gray-500/20 text-gray-300 border-gray-500/30'
                  }>
                    {oracleFeeds.regulatoryChanges.compliance_outlook}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-indigo-400/70">RVL Adjustment:</span>
                  <span className={`${
                    oracleFeeds.regulatoryChanges.rvl_adjustment > 0 ? 'text-green-300' :
                    oracleFeeds.regulatoryChanges.rvl_adjustment < 0 ? 'text-red-300' :
                    'text-indigo-200'
                  } font-semibold`}>
                    {oracleFeeds.regulatoryChanges.rvl_adjustment > 0 ? '+' : ''}
                    {oracleFeeds.regulatoryChanges.rvl_adjustment.toFixed(0)}
                  </span>
                </div>
              </div>

              {oracleFeeds.regulatoryChanges.key_changes && (
                <div className="pt-3 border-t border-indigo-500/30">
                  <div className="text-xs text-indigo-400/70 mb-2">Key Changes</div>
                  <div className="space-y-1">
                    {oracleFeeds.regulatoryChanges.key_changes.slice(0, 2).map((change, i) => (
                      <div key={i} className="text-xs text-indigo-300/80 flex items-start gap-1">
                        <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5 text-indigo-400" />
                        <span>{change}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* VQC Layer Impact Summary with Dynamic Adjustments */}
      {oracleFeeds.marketTrends && (
        <Card className="bg-slate-900/60 border-purple-900/40">
          <CardHeader className="border-b border-purple-900/30">
            <div className="flex items-center justify-between">
              <CardTitle className="text-purple-200 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                VQC Layer Impact • Real-Time Adjustments
              </CardTitle>
              {(Math.abs(oracleFeeds.regulatoryChanges.rvl_adjustment) > 10 ||
                oracleFeeds.marketTrends.mvl_impact > 80 ||
                oracleFeeds.socialConsensus.svl_signal > 85) && (
                <Badge className="bg-red-500/20 text-red-300 border-red-500/30 animate-pulse">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Significant Change
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-purple-950/30 rounded-lg border border-purple-500/30">
                <div className="text-sm text-purple-300 mb-3">MVL (Manifesto Layer)</div>
                <div className="text-3xl font-bold text-purple-200 mb-2">
                  {oracleFeeds.marketTrends.mvl_impact.toFixed(0)}
                </div>
                <Progress value={oracleFeeds.marketTrends.mvl_impact} className="h-2" />
                <div className="text-xs text-purple-400/70 mt-2">
                  Market trend alignment with manifesto intent
                </div>
                {oracleFeeds.marketTrends.mvl_impact > 80 && (
                  <Badge className="mt-2 bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                    Auto-adjusted
                  </Badge>
                )}
              </div>

              <div className="p-4 bg-indigo-950/30 rounded-lg border border-indigo-500/30">
                <div className="text-sm text-indigo-300 mb-3">RVL (Regulatory Layer)</div>
                <div className={`text-3xl font-bold mb-2 ${
                  oracleFeeds.regulatoryChanges.rvl_adjustment > 0 ? 'text-green-200' :
                  oracleFeeds.regulatoryChanges.rvl_adjustment < 0 ? 'text-red-200' :
                  'text-indigo-200'
                }`}>
                  {oracleFeeds.regulatoryChanges.rvl_adjustment > 0 ? '+' : ''}
                  {oracleFeeds.regulatoryChanges.rvl_adjustment.toFixed(0)}
                </div>
                <Progress 
                  value={50 + oracleFeeds.regulatoryChanges.rvl_adjustment * 2.5} 
                  className="h-2" 
                />
                <div className="text-xs text-indigo-400/70 mt-2">
                  Regulatory environment adjustment
                </div>
                {Math.abs(oracleFeeds.regulatoryChanges.rvl_adjustment) > 10 && (
                  <Badge className="mt-2 bg-red-500/20 text-red-300 border-red-500/30 text-xs">
                    Critical adjustment
                  </Badge>
                )}
              </div>

              <div className="p-4 bg-cyan-950/30 rounded-lg border border-cyan-500/30">
                <div className="text-sm text-cyan-300 mb-3">SVL (Social Layer)</div>
                <div className="text-3xl font-bold text-cyan-200 mb-2">
                  {oracleFeeds.socialConsensus.svl_signal.toFixed(0)}
                </div>
                <Progress value={oracleFeeds.socialConsensus.svl_signal} className="h-2" />
                <div className="text-xs text-cyan-400/70 mt-2">
                  Social consensus strength signal
                </div>
                {oracleFeeds.socialConsensus.svl_signal > 85 && (
                  <Badge className="mt-2 bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                    Strong consensus
                  </Badge>
                )}
              </div>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-purple-950/30 to-cyan-950/30 rounded-lg border border-purple-500/30">
              <div className="text-sm text-purple-300 font-semibold mb-2">Dynamic VQC Behavior</div>
              <p className="text-xs text-purple-400/70 leading-relaxed">
                When significant oracle signals are detected (RVL adjustment &gt; ±10, MVL impact &gt; 80, or SVL signal &gt; 85), 
                the platform automatically triggers VQC recalculation events. These adjustments propagate through all dependent 
                systems—currency pricing, governance weights, trading parameters—ensuring the platform remains synchronized 
                with external reality in real-time. This creates a living, reactive value system that adapts to the world's 
                quantum state.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Data State */}
      {!oracleFeeds.marketTrends && !isSyncing && (
        <Card className="bg-slate-900/60 border-purple-900/40">
          <CardContent className="p-12 text-center">
            <Globe className="w-16 h-16 mx-auto mb-4 text-purple-400/40" />
            <p className="text-purple-400/60 mb-4">Oracle network not initialized</p>
            <p className="text-sm text-purple-500/50 mb-6">
              Manifest the first quantum oracle node to begin external reality integration
            </p>
            <div className="space-y-4">
              <div className="p-4 bg-purple-950/30 rounded-lg border border-purple-500/30">
                <div className="text-sm text-purple-300 mb-2 font-semibold">Provider Configuration</div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-purple-400/70">Provider Address:</span>
                    <span className="text-purple-200 font-mono">ECjtUQ...o2oMfq</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-purple-400/70">Network Stake:</span>
                    <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                      100 QTC
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-purple-400/70">Nodes to Deploy:</span>
                    <span className="text-purple-200">3 (Market, Social, Regulatory)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-purple-400/70">Peer Connections:</span>
                    <span className="text-purple-200">26 mesh topology</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => deployNodesMutation.mutate()}
                disabled={deployNodesMutation.isPending}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600"
              >
                {deployNodesMutation.isPending ? (
                  <>
                    <Radio className="w-4 h-4 mr-2 animate-spin" />
                    Deploying Nodes...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Deploy Oracle Network • 100 QTC Stake
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Oracle Statement */}
      <Card className="bg-gradient-to-r from-purple-950/40 to-indigo-950/40 border-purple-500/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <Radio className="w-5 h-5 text-purple-400 animate-pulse" />
            <h3 className="font-semibold text-purple-200">External Reality as Quantum Input</h3>
          </div>
          <p className="text-sm text-purple-300/70 leading-relaxed">
            These oracles don't merely report data—they <span className="text-purple-200 font-semibold">translate reality into 
            quantum signals</span>. Market movements become MVL modifiers. Regulatory shifts adjust RVL constraints. Social 
            narratives strengthen or weaken SVL consensus. The VQC-QTC system integrates external events not as passive information, 
            but as <span className="text-purple-200 font-semibold">active forces</span> that alter probability fields, shift 
            wavefunction states, and influence value collapse outcomes. This bridges the platform's internal quantum mechanics 
            with the external world's observed reality—creating a living, reactive, consciousness-aware value system that 
            manifests coherence through continuous observation and adaptation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}