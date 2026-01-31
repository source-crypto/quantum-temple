import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import WalletConnector from "./WalletConnector";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function SingleAssetStaking() {
  const { data: config } = useQuery({
    queryKey: ['onchain_config_ready'],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('checkOnChainConfig');
      return data;
    }
  });

  const ready = !!config?.ready;

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="md:col-span-2 space-y-4">
        <Card className="bg-slate-900/60 border-purple-900/30">
          <CardHeader>
            <CardTitle className="text-purple-200">QTC Single-Asset Staking (Auto-Compound)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-purple-300/80">Stake QTC to earn protocol rewards with auto-compounding. On-chain actions enable once RPC and addresses are configured.</div>
            <div className="grid grid-cols-2 gap-3">
              <Button disabled={!ready}>Stake QTC</Button>
              <Button variant="outline" disabled={!ready}>Unstake</Button>
            </div>
            {!ready && <div className="text-xs text-amber-300">Connect RPC and contract addresses to enable staking.</div>}
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-1 space-y-4">
        <WalletConnector />
      </div>
    </div>
  );
}