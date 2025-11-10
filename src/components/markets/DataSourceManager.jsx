import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, Globe, Zap, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function DataSourceManager() {
  const queryClient = useQueryClient();

  const { data: dataSources, isLoading } = useQuery({
    queryKey: ['dataSources'],
    queryFn: () => base44.entities.DataSource.list('-last_sync', 20),
    initialData: [],
  });

  const sourceIcons = {
    bitcoin_network: '₿',
    ethereum_network: 'Ξ',
    solana_dex: '◎',
    polymarket: '🎲',
    binance: '🔶',
    coinbase: '🪙',
    quantum_temple: '◈'
  };

  const statusColors = {
    connected: { bg: 'bg-green-500/20', text: 'text-green-300', border: 'border-green-500/30', icon: CheckCircle },
    disconnected: { bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500/30', icon: AlertCircle },
    syncing: { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/30', icon: RefreshCw },
    error: { bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/30', icon: AlertCircle }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-900/60 border-purple-900/40">
        <CardHeader className="border-b border-purple-900/30">
          <CardTitle className="text-purple-200 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            External Data Sources
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="text-center text-purple-400">Loading data sources...</div>
          ) : dataSources.length === 0 ? (
            <div className="text-center py-8">
              <Database className="w-16 h-16 mx-auto mb-4 text-purple-400/40" />
              <p className="text-purple-400/60">No data sources configured</p>
              <p className="text-sm text-purple-500/50 mb-4">Add external data sources to import market data</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {dataSources.map((source, index) => {
                const StatusIcon = statusColors[source.connection_status]?.icon || Database;
                
                return (
                  <motion.div
                    key={source.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="bg-slate-950/50 border-purple-900/30">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="text-3xl">{sourceIcons[source.source_type] || '📡'}</div>
                            <div>
                              <h4 className="font-semibold text-purple-200">{source.source_name}</h4>
                              <p className="text-xs text-purple-400/70 capitalize">
                                {source.source_type.replace(/_/g, ' ')}
                              </p>
                            </div>
                          </div>
                          <Badge className={`${statusColors[source.connection_status]?.bg} ${statusColors[source.connection_status]?.text} ${statusColors[source.connection_status]?.border}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {source.connection_status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <div className="text-xs text-purple-400/70">Records Synced</div>
                            <div className="font-semibold text-purple-200">
                              {source.total_records_synced?.toLocaleString() || 0}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-purple-400/70">Update Freq</div>
                            <div className="font-semibold text-purple-200">
                              {source.update_frequency_seconds}s
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="text-xs text-purple-400/70 mb-1">Data Types</div>
                            <div className="flex flex-wrap gap-1">
                              {(source.data_types || []).map((type, i) => (
                                <Badge key={i} variant="outline" className="border-cyan-500/30 text-cyan-300 text-xs">
                                  {type}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        {source.last_sync && (
                          <div className="mt-3 text-xs text-purple-400/60">
                            Last sync: {new Date(source.last_sync).toLocaleString()}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Architecture Info */}
      <Card className="bg-gradient-to-r from-indigo-950/40 to-purple-950/40 border-indigo-500/30">
        <CardHeader className="border-b border-indigo-900/30">
          <CardTitle className="text-indigo-200 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Blockchain Infrastructure
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-indigo-200 mb-3">Network Components</h4>
              <div className="space-y-2 text-sm text-indigo-300/80">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5" />
                  <div>
                    <strong className="text-indigo-200">Nodes:</strong> Computers running blockchain software, storing ledger copies and validating transactions
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5" />
                  <div>
                    <strong className="text-indigo-200">Full Nodes:</strong> Network backbone verifying every transaction and block for integrity
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5" />
                  <div>
                    <strong className="text-indigo-200">Distributed Ledger:</strong> Shared, replicated database updated in real-time without central servers
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-indigo-200 mb-3">Consensus & Security</h4>
              <div className="space-y-2 text-sm text-indigo-300/80">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5" />
                  <div>
                    <strong className="text-indigo-200">Proof-of-Work (PoW):</strong> Nodes solve computational puzzles to validate transactions
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5" />
                  <div>
                    <strong className="text-indigo-200">Proof-of-Stake (PoS):</strong> Validators chosen based on cryptocurrency staked
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5" />
                  <div>
                    <strong className="text-indigo-200">Cryptography:</strong> Public key for receiving, private key for authorizing. Hashing creates unique block identifiers
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-indigo-950/30 rounded-lg border border-indigo-500/30">
            <h4 className="font-semibold text-indigo-200 mb-2">Smart Contracts</h4>
            <p className="text-sm text-indigo-300/70">
              Self-executing contracts with terms written directly in code. They run on the blockchain,
              automating processes once conditions are met. Quantum Temple uses divine ordinance-backed
              smart contracts for unbreakable patterns and consensus.
            </p>
          </div>

          <div className="p-4 bg-purple-950/30 rounded-lg border border-purple-500/30">
            <h4 className="font-semibold text-purple-200 mb-2">Infrastructure Requirements</h4>
            <p className="text-sm text-purple-300/70">
              Nodes require hardware (processors, reliable network connections) and software (operating systems,
              blockchain clients) to function effectively. The distributed ledger and database work collectively
              through synchronized notes maintained across all network participants.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}