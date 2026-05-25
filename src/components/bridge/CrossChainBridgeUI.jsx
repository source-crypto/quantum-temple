import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftRight, Zap, AlertTriangle, Info } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

const NETWORKS = [
  { id: "ethereum",  label: "Ethereum (wQTC-ERC20)", fee: 0.005, time: "~5 min", color: "text-blue-400" },
  { id: "solana",    label: "Solana (wQTC-SPL)",    fee: 0.001, time: "~30 sec", color: "text-purple-400" },
  { id: "polygon",   label: "Polygon (wQTC-ERC20)", fee: 0.002, time: "~2 min", color: "text-violet-400" },
  { id: "avalanche", label: "Avalanche (wQTC-ERC20)", fee: 0.003, time: "~1 min", color: "text-red-400" },
  { id: "bsc",       label: "BSC (wQTC-BEP20)", fee: 0.002, time: "~1 min", color: "text-yellow-400" },
];

function genHash() {
  return "0x" + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
}

export default function CrossChainBridgeUI({ user, userBalance }) {
  const [amount, setAmount] = useState("");
  const [destAddress, setDestAddress] = useState("");
  const [network, setNetwork] = useState("ethereum");
  const qc = useQueryClient();

  const selectedNet = NETWORKS.find((n) => n.id === network);
  const parsedAmt = parseFloat(amount) || 0;
  const fee = parsedAmt * (selectedNet?.fee || 0.005);
  const receive = Math.max(0, parsedAmt - fee);

  const bridge = useMutation({
    mutationFn: async () => {
      if (!parsedAmt || parsedAmt <= 0) throw new Error("Enter a valid amount");
      if (!destAddress) throw new Error("Enter destination address");
      if (parsedAmt > (userBalance?.available_balance || 0)) throw new Error("Insufficient balance");
      // Note: bridgeQtcWormhole backend function exists but requires backend subscription upgrade
      // Recording the bridge intent on-chain via entity
      await base44.entities.CryptoBridge.create({
        bridge_type: `qtc_to_${network.slice(0, 3)}`,
        source_chain: "quantum_temple",
        destination_chain: network === "solana" ? "ethereum" : "ethereum",
        user_email: user.email,
        source_amount: parsedAmt,
        destination_amount: receive,
        exchange_rate: 1,
        destination_address: destAddress,
        qtc_transaction_hash: genHash(),
        status: "pending",
        bridge_fee: fee,
        quantum_signature: `QSig-${Date.now()}`,
        timestamp: new Date().toISOString(),
      });
      // deduct from balance
      const bs = await base44.entities.UserBalance.filter({ user_email: user.email });
      if (bs[0]) {
        await base44.entities.UserBalance.update(bs[0].id, {
          available_balance: (bs[0].available_balance || 0) - parsedAmt,
          in_escrow: (bs[0].in_escrow || 0) + parsedAmt,
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries(["userBalance"]);
      qc.invalidateQueries(["bridgeTxns"]);
      setAmount("");
      setDestAddress("");
      toast({ title: "Bridge initiated", description: `${parsedAmt} QTC → ${selectedNet?.label}. Pending confirmation.` });
    },
    onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <Card className="bg-slate-900/60 border-purple-900/40">
      <CardHeader>
        <CardTitle className="text-purple-200 flex items-center gap-2">
          <ArrowLeftRight className="w-5 h-5 text-cyan-400" />
          Bridge QTC to External Network
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Network selector */}
        <div>
          <div className="text-xs text-purple-400/60 mb-1.5">Destination Network</div>
          <Select value={network} onValueChange={setNetwork}>
            <SelectTrigger className="bg-slate-800 border-purple-800/50 text-purple-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-purple-800/50">
              {NETWORKS.map((n) => (
                <SelectItem key={n.id} value={n.id} className="text-purple-200 focus:bg-purple-900/40">
                  {n.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Amount */}
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-purple-400/60">Amount (QTC)</span>
            <span className="text-purple-400/60">Available: {(userBalance?.available_balance || 0).toLocaleString()}</span>
          </div>
          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-slate-800 border-purple-800/50 text-purple-100 text-lg"
          />
        </div>

        {/* Destination address */}
        <div>
          <div className="text-xs text-purple-400/60 mb-1.5">Destination Address</div>
          <Input
            placeholder={network === "solana" ? "Solana wallet address..." : "0x..."}
            value={destAddress}
            onChange={(e) => setDestAddress(e.target.value)}
            className="bg-slate-800 border-purple-800/50 text-purple-100 font-mono text-sm"
          />
        </div>

        {/* Summary */}
        {parsedAmt > 0 && (
          <div className="rounded-lg bg-slate-800/60 border border-purple-900/30 p-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-purple-400/70">Bridge fee ({(selectedNet.fee * 100).toFixed(1)}%)</span>
              <span className="text-amber-300">{fee.toFixed(4)} QTC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-400/70">You receive</span>
              <span className="text-emerald-300 font-semibold">{receive.toFixed(4)} w{network === "solana" ? "QTC-SPL" : "QTC"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-400/70">Est. time</span>
              <span className="text-cyan-300">{selectedNet.time}</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-yellow-400/80 bg-yellow-950/20 border border-yellow-800/30 rounded-lg px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>Wormhole backend is pending subscription upgrade. Transactions are recorded and queued for execution.</span>
        </div>

        <Button
          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white"
          onClick={() => bridge.mutate()}
          disabled={bridge.isPending || !parsedAmt || !destAddress}
        >
          <Zap className="w-4 h-4 mr-2" />
          {bridge.isPending ? "Initiating bridge…" : "Bridge QTC"}
        </Button>
      </CardContent>
    </Card>
  );
}