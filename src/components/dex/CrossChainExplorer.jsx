import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  TrendingUp,
  ArrowRightLeft,
  Clock,
  CheckCircle,
  Loader2,
  Network,
  Fuel,
  ExternalLink
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function CrossChainExplorer() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState("all");

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: bridges, isLoading } = useQuery({
    queryKey: ['crossChainBridges', selectedNetwork],
    queryFn: async () => {
      if (!user) return [];
      const allBridges = await base44.entities.CrossChainBridge.filter(
        { user_email: user.email }, 
        '-initiated_at', 
        50
      );
      
      if (selectedNetwork === "all") return allBridges;
      return allBridges.filter(b => 
        b.source_chain === selectedNetwork || b.destination_chain === selectedNetwork
      );
    },
    enabled: !!user,
    initialData: []
  });

  const networks = [
    { id: "all", name: "All Networks" },
    { id: "ethereum", name: "Ethereum" },
    { id: "bitcoin", name: "Bitcoin" },
    { id: "solana", name: "Solana" },
    { id: "polkadot", name: "Polkadot" },
    { id: "cardano", name: "Cardano" },
    { id: "polygon", name: "Polygon" },
    { id: "arbitrum", name: "Arbitrum" },
    { id: "optimism", name: "Optimism" },
    { id: "base", name: "Base" },
    { id: "quantum_temple", name: "Quantum Temple" }
  ];

  const statusConfig = {
    initiated: { color: "bg-blue-500/20 text-blue-300 border-blue-500/30", icon: Loader2 },
    confirming: { color: "bg-amber-500/20 text-amber-300 border-amber-500/30", icon: Clock },
    completed: { color: "bg-green-500/20 text-green-300 border-green-500/30", icon: CheckCircle },
    failed: { color: "bg-red-500/20 text-red-300 border-red-500/30", icon: ExternalLink }
  };

  const filteredBridges = bridges.filter(bridge => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      bridge.bridge_id?.toLowerCase().includes(query) ||
      bridge.transaction_hash?.toLowerCase().includes(query) ||
      bridge.source_chain?.toLowerCase().includes(query) ||
      bridge.destination_chain?.toLowerCase().includes(query)
    );
  });

  const totalVolume = bridges.reduce((sum, b) => sum + (b.source_amount || 0), 0);
  const totalGasPaid = bridges.reduce((sum, b) => sum + (b.gas_fee_usd || 0), 0);
  const avgBridgeTime = bridges.length > 0 
    ? bridges.reduce((sum, b) => sum + (b.estimated_time_minutes || 0), 0) / bridges.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-950/40 to-indigo-950/40 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Network className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-purple-200">{bridges.length}</div>
            <div className="text-xs text-purple-400/70">Total Bridges</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-950/40 to-emerald-950/40 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-green-200">{totalVolume.toFixed(4)}</div>
            <div className="text-xs text-green-400/70">Total Volume</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-950/40 to-orange-950/40 border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Fuel className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-200">${totalGasPaid.toFixed(2)}</div>
            <div className="text-xs text-amber-400/70">Total Gas Paid</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-950/40 to-blue-950/40 border-cyan-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-cyan-200">{avgBridgeTime.toFixed(0)}m</div>
            <div className="text-xs text-cyan-400/70">Avg Bridge Time</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-slate-900/60 border-purple-900/40">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/60" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by ID, hash, or chain..."
                  className="pl-10 bg-slate-950/50 border-purple-900/30 text-purple-100"
                />
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {networks.map(network => (
                <Button
                  key={network.id}
                  size="sm"
                  variant={selectedNetwork === network.id ? "default" : "outline"}
                  onClick={() => setSelectedNetwork(network.id)}
                  className={selectedNetwork === network.id 
                    ? "bg-purple-600 hover:bg-purple-700" 
                    : "border-purple-500/30 text-purple-300 hover:bg-purple-900/20"
                  }
                >
                  {network.name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bridge List */}
      <Card className="bg-slate-900/60 border-purple-900/40">
        <CardHeader className="border-b border-purple-900/30">
          <CardTitle className="text-purple-200">Cross-Chain Transactions ({filteredBridges.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-3">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="p-4 bg-slate-950/50 rounded-lg animate-pulse">
                  <div className="h-4 bg-purple-900/20 rounded mb-2" />
                  <div className="h-3 bg-purple-900/20 rounded" />
                </div>
              ))}
            </div>
          ) : filteredBridges.length === 0 ? (
            <div className="text-center py-12 text-purple-400/60">
              <Network className="w-16 h-16 mx-auto mb-4 opacity-40" />
              <p>No bridge transactions found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBridges.map((bridge, index) => {
                const StatusIcon = statusConfig[bridge.status]?.icon || Clock;
                
                return (
                  <motion.div
                    key={bridge.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="p-4 bg-slate-950/50 rounded-lg border border-purple-900/30 hover:border-purple-500/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-mono text-purple-300">{bridge.bridge_id}</span>
                          <Badge className={statusConfig[bridge.status]?.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {bridge.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-purple-400/70">
                          <span className="capitalize">{bridge.source_chain}</span>
                          <ArrowRightLeft className="w-3 h-3" />
                          <span className="capitalize">{bridge.destination_chain}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-purple-200">
                          {bridge.source_amount.toFixed(6)} {bridge.source_currency}
                        </div>
                        <div className="text-xs text-purple-400/60">
                          {format(new Date(bridge.initiated_at), "MMM d, HH:mm")}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3 pt-3 border-t border-purple-900/30">
                      <div className="text-xs">
                        <div className="text-purple-400/70 mb-1">Gas Fee</div>
                        <div className="text-purple-200 font-mono">${bridge.gas_fee_usd?.toFixed(2)}</div>
                      </div>
                      <div className="text-xs">
                        <div className="text-purple-400/70 mb-1">Bridge Fee</div>
                        <div className="text-purple-200">{(bridge.bridge_fee || 0).toFixed(6)}</div>
                      </div>
                      <div className="text-xs">
                        <div className="text-purple-400/70 mb-1">Time</div>
                        <div className="text-purple-200">{bridge.estimated_time_minutes}m</div>
                      </div>
                      <div className="text-xs">
                        <div className="text-purple-400/70 mb-1">Confirms</div>
                        <div className="text-purple-200">{bridge.confirmations}/{bridge.required_confirmations}</div>
                      </div>
                    </div>
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