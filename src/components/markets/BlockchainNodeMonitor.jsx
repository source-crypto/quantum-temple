import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Zap, Users, Activity, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

export default function BlockchainNodeMonitor() {
  const { data: nodes, isLoading } = useQuery({
    queryKey: ['blockchainNodes'],
    queryFn: () => base44.entities.BlockchainNode.list('-last_block_time', 20),
    initialData: [],
  });

  const blockchainIcons = {
    bitcoin: '₿',
    ethereum: 'Ξ',
    solana: '◎',
    quantum_temple: '◈'
  };

  const statusConfig = {
    online: { color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30', icon: CheckCircle },
    offline: { color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30', icon: XCircle },
    syncing: { color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30', icon: RefreshCw },
    error: { color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30', icon: AlertTriangle }
  };

  const consensusLabels = {
    proof_of_work: 'PoW',
    proof_of_stake: 'PoS',
    proof_of_authority: 'PoA',
    quantum_verification: 'QV'
  };

  // Calculate network statistics
  const stats = {
    totalNodes: nodes.length,
    onlineNodes: nodes.filter(n => n.status === 'online').length,
    totalPeers: nodes.reduce((sum, n) => sum + (n.connected_peers || 0), 0),
    avgBlockHeight: nodes.reduce((sum, n) => sum + (n.block_height || 0), 0) / nodes.length || 0
  };

  return (
    <div className="space-y-6">
      {/* Network Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-cyan-950/40 to-blue-950/40 border-cyan-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-cyan-400/70">Total Nodes</span>
            </div>
            <div className="text-2xl font-bold text-cyan-200">{stats.totalNodes}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-950/40 to-emerald-950/40 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-400/70">Online</span>
            </div>
            <div className="text-2xl font-bold text-green-200">{stats.onlineNodes}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-950/40 to-indigo-950/40 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-purple-400/70">Connected Peers</span>
            </div>
            <div className="text-2xl font-bold text-purple-200">{stats.totalPeers}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-950/40 to-orange-950/40 border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-amber-400/70">Avg Block Height</span>
            </div>
            <div className="text-2xl font-bold text-amber-200">{Math.round(stats.avgBlockHeight).toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Node List */}
      <Card className="bg-slate-900/60 border-purple-900/40">
        <CardHeader className="border-b border-purple-900/30">
          <CardTitle className="text-purple-200 flex items-center gap-2">
            <Database className="w-5 h-5" />
            Blockchain Nodes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="text-center text-purple-400">Loading nodes...</div>
          ) : nodes.length === 0 ? (
            <div className="text-center py-8">
              <Database className="w-16 h-16 mx-auto mb-4 text-purple-400/40" />
              <p className="text-purple-400/60">No blockchain nodes configured</p>
            </div>
          ) : (
            <div className="space-y-3">
              {nodes.map((node, index) => {
                const StatusIcon = statusConfig[node.status]?.icon || Database;
                
                return (
                  <motion.div
                    key={node.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 bg-slate-950/50 rounded-lg border border-purple-900/30"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{blockchainIcons[node.blockchain] || '⛓️'}</div>
                        <div>
                          <div className="font-semibold text-purple-200">{node.node_id}</div>
                          <div className="text-xs text-purple-400/70 capitalize">
                            {node.blockchain} • {node.node_type.replace(/_/g, ' ')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${statusConfig[node.status]?.bg} ${statusConfig[node.status]?.color} ${statusConfig[node.status]?.border}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {node.status}
                        </Badge>
                        {node.is_validator && (
                          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                            Validator
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-xs text-purple-400/70 mb-1">Block Height</div>
                        <div className="font-semibold text-purple-200">
                          {node.block_height?.toLocaleString() || 0}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-purple-400/70 mb-1">Connected Peers</div>
                        <div className="font-semibold text-cyan-300">{node.connected_peers || 0}</div>
                      </div>
                      <div>
                        <div className="text-xs text-purple-400/70 mb-1">Consensus</div>
                        <Badge variant="outline" className="border-purple-500/30 text-purple-300 text-xs">
                          {consensusLabels[node.consensus_mechanism] || node.consensus_mechanism}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-xs text-purple-400/70 mb-1">Uptime</div>
                        <div className="font-semibold text-green-300">{node.uptime_hours || 0}h</div>
                      </div>
                    </div>

                    {node.sync_progress < 100 && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-blue-400/70 mb-1">
                          <span>Sync Progress</span>
                          <span>{node.sync_progress}%</span>
                        </div>
                        <Progress value={node.sync_progress} className="h-2" />
                      </div>
                    )}

                    {node.stake_amount > 0 && (
                      <div className="mt-3 p-2 bg-purple-950/30 rounded border border-purple-500/30 text-xs">
                        <span className="text-purple-400/70">Staked Amount: </span>
                        <span className="font-semibold text-purple-300">{node.stake_amount.toLocaleString()}</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}