import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function CrossChainPortal() {
  const { data } = useQuery({
    queryKey: ['onchain_config_ready'],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('checkOnChainConfig');
      return data;
    }
  });
  const ready = !!data?.ready;

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card className="bg-slate-900/60 border-purple-900/30">
        <CardHeader>
          <CardTitle className="text-purple-200">Create Proposal (Ethereum / Solana)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-purple-300/80">Submit protocol upgrades or treasury allocations. On-chain actions enable once RPC & contract addresses are set.</div>
          <div className="flex gap-3">
            <Button disabled={!ready}>New Proposal (Ethereum)</Button>
            <Button variant="outline" disabled={!ready}>New Proposal (Solana)</Button>
          </div>
          {!ready && <div className="text-xs text-amber-300">Set ETH/SOL RPC + Governor/Realm to proceed.</div>}
        </CardContent>
      </Card>

      <Card className="bg-slate-900/60 border-purple-900/30">
        <CardHeader>
          <CardTitle className="text-purple-200">Vote with Staked QTC</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-purple-300/80">Use staked QTC to vote across chains. Wallets and staking activate after config.</div>
          <div className="flex gap-3">
            <Button disabled={!ready}>Vote on Ethereum</Button>
            <Button variant="outline" disabled={!ready}>Vote on Solana</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}