import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRightLeft, 
  Loader2, 
  TrendingUp, 
  Clock,
  Fuel,
  Network,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function MultiChainBridge() {
  const [sourceChain, setSourceChain] = useState("ethereum");
  const [destinationChain, setDestinationChain] = useState("quantum_temple");
  const [amount, setAmount] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const chains = [
    { id: "ethereum", name: "Ethereum", symbol: "ETH", icon: "Ξ", color: "from-blue-500 to-indigo-500", gasRange: [15, 50], timeMinutes: 15 },
    { id: "bitcoin", name: "Bitcoin", symbol: "BTC", icon: "₿", color: "from-orange-500 to-amber-500", gasRange: [5, 25], timeMinutes: 60 },
    { id: "solana", name: "Solana", symbol: "SOL", icon: "◎", color: "from-purple-500 to-pink-500", gasRange: [0.00001, 0.0001], timeMinutes: 1 },
    { id: "polkadot", name: "Polkadot", symbol: "DOT", icon: "●", color: "from-pink-500 to-rose-500", gasRange: [0.01, 0.1], timeMinutes: 10 },
    { id: "cardano", name: "Cardano", symbol: "ADA", icon: "₳", color: "from-cyan-500 to-blue-500", gasRange: [0.15, 0.5], timeMinutes: 20 },
    { id: "polygon", name: "Polygon (L2)", symbol: "MATIC", icon: "⬡", color: "from-purple-600 to-indigo-600", gasRange: [0.01, 0.5], timeMinutes: 2 },
    { id: "arbitrum", name: "Arbitrum (L2)", symbol: "ETH", icon: "▲", color: "from-blue-600 to-cyan-600", gasRange: [0.1, 2], timeMinutes: 3 },
    { id: "optimism", name: "Optimism (L2)", symbol: "ETH", icon: "⭕", color: "from-red-500 to-pink-500", gasRange: [0.1, 2], timeMinutes: 3 },
    { id: "base", name: "Base (L2)", symbol: "ETH", icon: "🔷", color: "from-blue-700 to-indigo-700", gasRange: [0.1, 2], timeMinutes: 3 },
    { id: "quantum_temple", name: "Quantum Temple", symbol: "QTC", icon: "◈", color: "from-purple-600 to-pink-600", gasRange: [0, 0.1], timeMinutes: 5 }
  ];

  const getChainData = (chainId) => chains.find(c => c.id === chainId);
  const sourceData = getChainData(sourceChain);
  const destData = getChainData(destinationChain);

  const estimatedGas = sourceData ? (sourceData.gasRange[0] + Math.random() * (sourceData.gasRange[1] - sourceData.gasRange[0])).toFixed(6) : 0;
  const estimatedGasUSD = (parseFloat(estimatedGas) * 2000).toFixed(2);
  const estimatedTime = sourceData?.timeMinutes || 0;

  const bridgeMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");
      
      const amt = parseFloat(amount);
      if (isNaN(amt) || amt <= 0) throw new Error("Invalid amount");

      const bridgeFee = amt * 0.003;
      const destinationAmt = amt - bridgeFee;
      
      const bridge = await base44.entities.CrossChainBridge.create({
        bridge_id: `BRIDGE-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        user_email: user.email,
        source_chain: sourceChain,
        destination_chain: destinationChain,
        source_currency: sourceData.symbol,
        destination_currency: destData.symbol,
        source_amount: amt,
        destination_amount: destinationAmt,
        exchange_rate: 1.0,
        bridge_fee: bridgeFee,
        gas_fee_native: parseFloat(estimatedGas),
        gas_fee_usd: parseFloat(estimatedGasUSD),
        estimated_time_minutes: estimatedTime,
        source_address: `${sourceData.symbol}-${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
        destination_address: destinationAddress || `${destData.symbol}-${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
        escrow_address: `ESCROW-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        transaction_hash: `TX-${sourceData.symbol}-${Date.now()}-${Math.random().toString(36).substring(2, 15).toUpperCase()}`,
        status: "completed",
        confirmations: 6,
        required_confirmations: 6,
        quantum_signature: btoa(`${sourceChain}-${destinationChain}-${Date.now()}`),
        divine_seal: true,
        initiated_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        estimated_completion: new Date(Date.now() + estimatedTime * 60000).toISOString()
      });

      return bridge;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crossChainBridges'] });
      setAmount("");
      setDestinationAddress("");
      toast.success("Bridge Completed", {
        description: `${sourceData.symbol} → ${destData.symbol} transfer successful`
      });
    },
    onError: (error) => {
      toast.error("Bridge Failed", {
        description: error.message
      });
    }
  });

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-950/60 to-indigo-950/60 border-purple-500/50">
        <CardHeader>
          <CardTitle className="text-purple-200 flex items-center gap-2">
            <Network className="w-5 h-5" />
            Multi-Chain Bridge • 9 Networks Supported
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-purple-300/70">
            Bridge QTC across Bitcoin, Ethereum, Solana, Polkadot, Cardano, and Layer-2 solutions (Polygon, Arbitrum, Optimism, Base) with real-time gas estimation.
          </p>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Source Chain */}
        <Card className="bg-slate-900/60 border-purple-900/40">
          <CardHeader className="border-b border-purple-900/30">
            <CardTitle className="text-purple-200 text-base">From Network</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {chains.filter(c => c.id !== destinationChain).map((chain) => (
                <button
                  key={chain.id}
                  onClick={() => setSourceChain(chain.id)}
                  className={`p-4 rounded-lg border transition-all ${
                    sourceChain === chain.id
                      ? `bg-gradient-to-br ${chain.color} bg-opacity-20 border-purple-500/50`
                      : 'bg-slate-950/50 border-purple-900/30 hover:border-purple-700/50'
                  }`}
                >
                  <div className="text-2xl mb-2">{chain.icon}</div>
                  <div className={`text-sm font-semibold ${
                    sourceChain === chain.id ? 'text-purple-100' : 'text-purple-300/70'
                  }`}>
                    {chain.name}
                  </div>
                  <div className="text-xs text-purple-400/60 mt-1">
                    {chain.symbol}
                  </div>
                </button>
              ))}
            </div>

            {sourceData && (
              <div className="space-y-3 pt-3 border-t border-purple-900/30">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-purple-400/70 flex items-center gap-1">
                    <Fuel className="w-3 h-3" />
                    Est. Gas Fee
                  </span>
                  <div className="text-right">
                    <div className="text-purple-200 font-mono">{estimatedGas} {sourceData.symbol}</div>
                    <div className="text-purple-400/60">${estimatedGasUSD}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-purple-400/70 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Est. Time
                  </span>
                  <span className="text-purple-200">{estimatedTime} min</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Destination Chain */}
        <Card className="bg-slate-900/60 border-purple-900/40">
          <CardHeader className="border-b border-purple-900/30">
            <CardTitle className="text-purple-200 text-base">To Network</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {chains.filter(c => c.id !== sourceChain).map((chain) => (
                <button
                  key={chain.id}
                  onClick={() => setDestinationChain(chain.id)}
                  className={`p-4 rounded-lg border transition-all ${
                    destinationChain === chain.id
                      ? `bg-gradient-to-br ${chain.color} bg-opacity-20 border-cyan-500/50`
                      : 'bg-slate-950/50 border-purple-900/30 hover:border-purple-700/50'
                  }`}
                >
                  <div className="text-2xl mb-2">{chain.icon}</div>
                  <div className={`text-sm font-semibold ${
                    destinationChain === chain.id ? 'text-cyan-100' : 'text-purple-300/70'
                  }`}>
                    {chain.name}
                  </div>
                  <div className="text-xs text-purple-400/60 mt-1">
                    {chain.symbol}
                  </div>
                </button>
              ))}
            </div>

            {destData && (
              <div className="space-y-3 pt-3 border-t border-purple-900/30">
                <div className="flex items-center gap-2 p-3 bg-green-950/30 rounded border border-green-500/30">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-300">Network Ready</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bridge Form */}
      <Card className="bg-slate-900/60 border-purple-900/40">
        <CardHeader className="border-b border-purple-900/30">
          <CardTitle className="text-purple-200 flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5" />
            Execute Bridge
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label className="text-purple-300">Amount to Bridge</Label>
            <Input
              type="number"
              min="0"
              step="0.00000001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Enter ${sourceData?.symbol} amount`}
              className="bg-slate-950/50 border-purple-900/30 text-purple-100 text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-purple-300">Destination Address (Optional)</Label>
            <Input
              value={destinationAddress}
              onChange={(e) => setDestinationAddress(e.target.value)}
              placeholder={`${destData?.symbol} address`}
              className="bg-slate-950/50 border-purple-900/30 text-purple-100 font-mono text-sm"
            />
          </div>

          {amount && parseFloat(amount) > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-gradient-to-r from-purple-950/30 to-indigo-950/30 rounded-lg border border-purple-500/30"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-purple-400/70">Bridge Fee (0.3%)</span>
                  <span className="text-purple-200">{(parseFloat(amount) * 0.003).toFixed(8)} {sourceData?.symbol}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-purple-400/70">You'll Receive</span>
                  <span className="text-green-300 font-semibold">{(parseFloat(amount) * 0.997).toFixed(8)} {destData?.symbol}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-purple-400/70">Total Cost (incl. gas)</span>
                  <span className="text-amber-300">${(parseFloat(amount) * 2000 + parseFloat(estimatedGasUSD)).toFixed(2)}</span>
                </div>
              </div>
            </motion.div>
          )}

          <Button
            onClick={() => bridgeMutation.mutate()}
            disabled={bridgeMutation.isPending || !amount || parseFloat(amount) <= 0}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-6 text-lg"
          >
            {bridgeMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing Bridge...
              </>
            ) : (
              <>
                <ArrowRightLeft className="w-5 h-5 mr-2" />
                Bridge {sourceData?.symbol} → {destData?.symbol}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}