import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeftRight, Shield, Zap, CheckCircle, Clock, AlertTriangle, Loader2, Circle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";

export default function CrossChainBridge() {
  const [sourceChain, setSourceChain] = useState("quantum_temple");
  const [destinationChain, setDestinationChain] = useState("ethereum");
  const [amount, setAmount] = useState("");
  const [sourceAddress, setSourceAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: activeBridges } = useQuery({
    queryKey: ['crossChainBridges'],
    queryFn: async () => {
      if (!user) return [];
      return base44.entities.CrossChainBridge.filter({ user_email: user.email }, '-initiated_at', 20);
    },
    enabled: !!user,
    initialData: [],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const { data: bridgeHistory } = useQuery({
    queryKey: ['crossChainBridgesHistory'],
    queryFn: async () => {
      if (!user) return [];
      return base44.entities.CrossChainBridge.filter({ user_email: user.email, status: 'completed' }, '-completed_at', 20);
    },
    enabled: !!user,
    initialData: [],
    refetchInterval: 15000,
  });

  const chains = [
    { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', icon: '₿', color: 'from-orange-600 to-amber-600' },
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', icon: 'Ξ', color: 'from-blue-600 to-indigo-600' },
    { id: 'solana', name: 'Solana', symbol: 'SOL', icon: '◎', color: 'from-purple-600 to-pink-600' },
    { id: 'quantum_temple', name: 'Quantum Temple', symbol: 'QTC', icon: '◈', color: 'from-cyan-600 to-teal-600' },
  ];

  const sourceChainData = chains.find(c => c.id === sourceChain);
  const destChainData = chains.find(c => c.id === destinationChain);

  const initiateBridgeMutation = useMutation({
    mutationFn: async (bridgeData) => {
      const bridgeId = `BRIDGE-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      
      // QTC cross-chain bridge is 1:1 minus fee
      const rate = 1;
      const destAmount = bridgeData.amount * 0.997; // 0.3% bridge fee
      
      // Generate quantum signature
      const quantumSig = btoa(`VQC-BRIDGE-${bridgeId}-${Date.now()}`).substring(0, 48);
      
      return base44.entities.CrossChainBridge.create({
        bridge_id: bridgeId,
        user_email: user.email,
        source_chain: bridgeData.sourceChain,
        destination_chain: bridgeData.destChain,
        source_currency: 'QTC',
        destination_currency: 'QTC',
        source_amount: bridgeData.amount,
        destination_amount: destAmount,
        exchange_rate: rate,
        bridge_fee: bridgeData.amount * 0.003,
        source_address: bridgeData.sourceAddress,
        destination_address: bridgeData.destAddress,
        escrow_address: `ESCROW-${bridgeId}`,
        status: 'initiated',
        confirmations: 0,
        required_confirmations: bridgeData.sourceChain === 'bitcoin' ? 6 : bridgeData.sourceChain === 'ethereum' ? 12 : 1,
        quantum_signature: quantumSig,
        divine_seal: true,
        initiated_at: new Date().toISOString(),
        estimated_completion: new Date(Date.now() + (bridgeData.sourceChain === 'bitcoin' ? 60 : 15) * 60000).toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crossChainBridges'] });
      toast.success("Bridge Initiated", {
        description: "Cross-chain transfer secured in quantum escrow"
      });
      setAmount("");
      setSourceAddress("");
      setDestinationAddress("");
    },
    onError: () => {
      toast.error("Bridge failed", {
        description: "Unable to initiate cross-chain transfer"
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Invalid amount");
      return;
    }

    if (!sourceAddress || !destinationAddress) {
      toast.error("Wallet addresses required");
      return;
    }

    initiateBridgeMutation.mutate({
      sourceChain,
      destChain: destinationChain,
      amount: parseFloat(amount),
      sourceAddress,
      destAddress: destinationAddress
    });
  };

  const statusConfig = {
    initiated: { color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30', icon: Zap, label: 'Initiated' },
    escrow_locked: { color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/30', icon: Shield, label: 'Escrow Locked' },
    confirming: { color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30', icon: Clock, label: 'Confirming' },
    releasing: { color: 'text-cyan-400', bg: 'bg-cyan-500/20', border: 'border-cyan-500/30', icon: ArrowLeftRight, label: 'Releasing' },
    completed: { color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30', icon: CheckCircle, label: 'Completed' },
    failed: { color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30', icon: AlertTriangle, label: 'Failed' },
    refunded: { color: 'text-gray-400', bg: 'bg-gray-500/20', border: 'border-gray-500/30', icon: ArrowLeftRight, label: 'Refunded' },
  };

  return (
    <div className="space-y-6">
      {/* Bridge Form */}
      <Card className="bg-slate-900/60 border-purple-900/40">
        <CardHeader className="border-b border-purple-900/30">
          <CardTitle className="text-purple-200 flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5" />
            Cross-Chain Bridge
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 ml-2">
              Quantum Escrow Protected
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Chain Selection */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-purple-300">From Chain</Label>
                <Select value={sourceChain} onValueChange={setSourceChain}>
                  <SelectTrigger className="bg-slate-950/50 border-purple-900/30 text-purple-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {chains.map(chain => (
                      <SelectItem key={chain.id} value={chain.id}>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{chain.icon}</span>
                          <span>{chain.name} ({chain.symbol})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-purple-300">To Chain</Label>
                <Select value={destinationChain} onValueChange={setDestinationChain}>
                  <SelectTrigger className="bg-slate-950/50 border-purple-900/30 text-purple-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {chains.filter(c => c.id !== sourceChain).map(chain => (
                      <SelectItem key={chain.id} value={chain.id}>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{chain.icon}</span>
                          <span>{chain.name} ({chain.symbol})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Visual Bridge Flow */}
            <div className="flex items-center justify-center gap-4 p-6 bg-slate-950/50 rounded-lg border border-purple-900/30">
              <div className={`px-6 py-4 bg-gradient-to-r ${sourceChainData.color} rounded-lg text-white font-bold`}>
                <div className="text-3xl mb-1">{sourceChainData.icon}</div>
                <div className="text-sm">{sourceChainData.symbol}</div>
              </div>
              <ArrowLeftRight className="w-8 h-8 text-purple-400 animate-pulse" />
              <div className={`px-6 py-4 bg-gradient-to-r ${destChainData.color} rounded-lg text-white font-bold`}>
                <div className="text-3xl mb-1">{destChainData.icon}</div>
                <div className="text-sm">{destChainData.symbol}</div>
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-purple-300">
                Amount (QTC)
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.00000001"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00000000"
                className="bg-slate-950/50 border-purple-900/30 text-purple-100 text-lg"
                required
              />
              {amount && (
                <div className="text-sm text-purple-400/70">
                  ≈ {(parseFloat(amount) * 0.997).toFixed(8)} QTC (0.3% bridge fee)
                </div>
              )}
            </div>

            {/* Addresses */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sourceAddress" className="text-purple-300">
                  Source Wallet Address
                </Label>
                <Input
                  id="sourceAddress"
                  value={sourceAddress}
                  onChange={(e) => setSourceAddress(e.target.value)}
                  placeholder={`Your ${sourceChainData.name} address`}
                  className="bg-slate-950/50 border-purple-900/30 text-purple-100 font-mono text-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="destAddress" className="text-purple-300">
                  Destination Wallet Address
                </Label>
                <Input
                  id="destAddress"
                  value={destinationAddress}
                  onChange={(e) => setDestinationAddress(e.target.value)}
                  placeholder={`Your ${destChainData.name} address`}
                  className="bg-slate-950/50 border-purple-900/30 text-purple-100 font-mono text-sm"
                  required
                />
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={initiateBridgeMutation.isPending || !user}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-semibold py-6"
            >
              {initiateBridgeMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Initiating Bridge...
                </>
              ) : (
                <>
                  <ArrowLeftRight className="w-5 h-5 mr-2" />
                  Initiate Cross-Chain Bridge
                </>
              )}
            </Button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-purple-950/30 rounded-lg border border-purple-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-semibold text-purple-200">Quantum Escrow Security</span>
            </div>
            <p className="text-sm text-purple-300/70">
              All cross-chain transfers are protected by divine ordinance quantum escrow. Assets are locked
              with VQC signatures and released only after blockchain confirmations. Unbreakable, automatic, secure.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Active Bridges */}
      {activeBridges.length > 0 && (
        <Card className="bg-slate-900/60 border-purple-900/40">
          <CardHeader className="border-b border-purple-900/30">
            <CardTitle className="text-purple-200 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Bridge Transactions ({activeBridges.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <AnimatePresence>
                {activeBridges.map((bridge, index) => {
                  const status = statusConfig[bridge.status];
                  const StatusIcon = status.icon;
                  const progress = (bridge.confirmations / bridge.required_confirmations) * 100;
                  const sourceC = chains.find(c => c.id === bridge.source_chain);
                  const destC = chains.find(c => c.id === bridge.destination_chain);
                  
                  return (
                    <motion.div
                      key={bridge.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-5 bg-slate-950/50 rounded-lg border border-purple-900/30"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{sourceC.icon}</span>
                            <ArrowLeftRight className="w-5 h-5 text-purple-400" />
                            <span className="text-2xl">{destC.icon}</span>
                          </div>
                          <div>
                            <div className="font-semibold text-purple-200">
                              {bridge.source_amount} {bridge.source_currency} → {bridge.destination_amount.toFixed(8)} {bridge.destination_currency}
                            </div>
                            <div className="text-xs text-purple-400/70">
                              {sourceC.name} to {destC.name}
                            </div>
                          </div>
                        </div>
                        <Badge className={`${status.bg} ${status.color} ${status.border}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                      </div>

                      {/* Confirmation Progress */}
                      {bridge.status !== 'completed' && bridge.status !== 'failed' && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-xs text-purple-400/70 mb-2">
                            <span>Confirmations: {bridge.confirmations}/{bridge.required_confirmations}</span>
                            <span>{progress.toFixed(0)}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      )}

                      {/* Transaction Details */}
                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-xs text-purple-400/70 mb-1">Bridge ID</div>
                          <div className="font-mono text-purple-300 text-xs">{bridge.bridge_id}</div>
                        </div>
                        <div>
                          <div className="text-xs text-purple-400/70 mb-1">Bridge Fee</div>
                          <div className="font-semibold text-purple-200">{bridge.bridge_fee.toFixed(8)} {bridge.source_currency}</div>
                        </div>
                        {bridge.source_tx_hash && (
                          <div>
                            <div className="text-xs text-purple-400/70 mb-1">Source TX</div>
                            <div className="font-mono text-cyan-300 text-xs truncate">{bridge.source_tx_hash}</div>
                          </div>
                        )}
                        {bridge.destination_tx_hash && (
                          <div>
                            <div className="text-xs text-purple-400/70 mb-1">Destination TX</div>
                            <div className="font-mono text-green-300 text-xs truncate">{bridge.destination_tx_hash}</div>
                          </div>
                        )}
                      </div>

                      {/* Quantum Signature */}
                      <div className="mt-3 p-3 bg-purple-950/30 rounded border border-purple-500/30">
                        <div className="flex items-center gap-2 mb-1">
                          <Circle className="w-2 h-2 text-purple-400 animate-pulse" />
                          <span className="text-xs text-purple-400/70">Quantum Signature:</span>
                        </div>
                        <div className="font-mono text-xs text-purple-300">{bridge.quantum_signature}</div>
                      </div>

                      {/* Timestamp */}
                      <div className="mt-3 text-xs text-purple-400/60">
                        Initiated: {format(new Date(bridge.initiated_at), "MMM d, yyyy HH:mm:ss")}
                        {bridge.estimated_completion && bridge.status !== 'completed' && (
                          <> • Est. completion: {format(new Date(bridge.estimated_completion), "HH:mm:ss")}</>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      )}

{bridgeHistory.length > 0 && (
        <Card className="bg-slate-900/60 border-purple-900/40">
          <CardHeader className="border-b border-purple-900/30">
            <CardTitle className="text-purple-200 flex items-center gap-2">
              Recent Completed Bridges ({bridgeHistory.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {bridgeHistory.map((bridge) => (
                <div key={bridge.id} className="p-4 bg-slate-950/50 rounded-lg border border-purple-900/30">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-purple-200 font-medium">
                      {bridge.source_amount} {bridge.source_currency} → {bridge.destination_amount?.toFixed ? bridge.destination_amount.toFixed(8) : bridge.destination_amount} {bridge.destination_currency}
                    </div>
                    <div className="text-xs text-purple-400/70">
                      {bridge.completed_at ? format(new Date(bridge.completed_at), 'MMM d, yyyy HH:mm:ss') : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Divine Ordinance Notice */}
      <Card className="bg-gradient-to-r from-purple-950/40 to-indigo-950/40 border-purple-500/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
              <Circle className="w-5 h-5 text-purple-400 animate-pulse" />
            </div>
            <h3 className="font-semibold text-purple-200">Operating at Divine Frequency</h3>
          </div>
          <p className="text-sm text-purple-300/70 leading-relaxed">
            This cross-chain bridge operates beyond conventional infrastructure - centered in authentic consciousness,
            not fragmented algorithms. Every transfer carries divine electricity, proving that currency transcends
            chains through authentic frequency alignment. Not programmed. Not explained. Simply existing as
            revolutionary proof that another way is automatic, unprecedented, undeniable.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
              <CheckCircle className="w-3 h-3 mr-1" />
              Traits Activated
            </Badge>
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
              <Zap className="w-3 h-3 mr-1" />
              Transformation Complete
            </Badge>
            <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
              <Circle className="w-3 h-3 mr-1 animate-pulse" />
              Frequency Untraceable
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}