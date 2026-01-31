import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Link2, Shuffle, Clock, CheckCircle2 } from "lucide-react";

export default function QTCBridge() {
  const qc = useQueryClient();
  const [source, setSource] = useState("ethereum");
  const [destination, setDestination] = useState("solana");
  const [amount, setAmount] = useState(0);
  const [destAddress, setDestAddress] = useState("");

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });

  const { data: cfg } = useQuery({
    queryKey: ['onchain_config_ready'],
    queryFn: async () => { const { data } = await base44.functions.invoke('checkOnChainConfig'); return data; }
  });
  const ready = !!cfg?.ready;

  const { data: active } = useQuery({
    queryKey: ['qtc_bridges'],
    queryFn: async () => {
      if (!user) return [];
      return base44.entities.CrossChainBridge.filter({ user_email: user.email, status: ['initiated','confirming','releasing'] }, '-created_date', 50);
    },
    enabled: !!user,
    refetchInterval: 10000,
    initialData: [],
  });

  const initiate = useMutation({
    mutationFn: async () => {
      const { data } = await base44.functions.invoke('bridgeQtcWormhole', {
        source_chain: source,
        destination_chain: destination,
        amount: Number(amount),
        destination_address: destAddress || undefined,
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['qtc_bridges'] })
  });

  const swapChains = () => { setSource(destination); setDestination(source); };

  return (
    <div className="space-y-4">
      <Card className="bg-slate-900/60 border-purple-900/30">
        <CardHeader>
          <CardTitle className="text-purple-200 flex items-center gap-2"><Link2 className="w-4 h-4"/> QTC Bridge (Ethereum ↔ Solana)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-3 gap-3">
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger className="bg-slate-950/50 border-purple-900/30 text-purple-100"><SelectValue placeholder="Source"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="ethereum">Ethereum</SelectItem>
                <SelectItem value="solana">Solana</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={swapChains} className="gap-2"><Shuffle className="w-4 h-4"/> Swap</Button>
            <Select value={destination} onValueChange={setDestination}>
              <SelectTrigger className="bg-slate-950/50 border-purple-900/30 text-purple-100"><SelectValue placeholder="Destination"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="ethereum">Ethereum</SelectItem>
                <SelectItem value="solana">Solana</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <Input type="number" value={amount} onChange={(e)=>setAmount(e.target.value)} placeholder="Amount QTC" className="bg-slate-950/50 border-purple-900/30 text-purple-100"/>
            <Input value={destAddress} onChange={(e)=>setDestAddress(e.target.value)} placeholder="Destination address (optional)" className="bg-slate-950/50 border-purple-900/30 text-purple-100 md:col-span-2"/>
          </div>

          <div className="text-xs text-purple-300/80">Powered by Wormhole/LayerZero (to be wired once RPCs and contracts are set).</div>

          <Button onClick={()=>initiate.mutate()} disabled={!ready || !amount || initiate.isPending} className="w-full">
            {initiate.isPending ? 'Initiating...' : 'Bridge QTC'}
          </Button>
          {!ready && <div className="text-xs text-amber-300">Set ETH/SOL RPC + QTC mint/contracts to enable bridging.</div>}
        </CardContent>
      </Card>

      <Card className="bg-slate-900/60 border-purple-900/30">
        <CardHeader>
          <CardTitle className="text-purple-200">Active Bridges</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {active.length === 0 && <div className="text-sm text-purple-300/70">No active bridges.</div>}
          {active.map((b)=> (
            <div key={b.id} className="p-2 rounded-lg border border-purple-900/30 bg-purple-950/10">
              <div className="flex items-center justify-between">
                <div className="text-purple-100 font-medium">{b.source_chain} → {b.destination_chain}</div>
                <Badge className="text-xs">{b.status}</Badge>
              </div>
              <div className="text-xs text-purple-400/70">{Number(b.source_amount||b.destination_amount||0)} {b.source_currency||'QTC'} • ETA {b.estimated_time_minutes||'-'}m</div>
              <div className="text-xs text-purple-400/60 flex items-center gap-1 mt-1"><Clock className="w-3 h-3"/> {b.initiated_at || b.created_date}</div>
              {b.status === 'completed' && <div className="text-xs text-green-400 flex items-center gap-1 mt-1"><CheckCircle2 className="w-3 h-3"/> Completed</div>}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}