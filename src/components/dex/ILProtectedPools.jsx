import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function ILProtectedPools() {
  const { data: config } = useQuery({
    queryKey: ['onchain_config_ready'],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('checkOnChainConfig');
      return data;
    }
  });

  const ready = !!config?.ready;

  return (
    <Card className="bg-slate-900/60 border-purple-900/30">
      <CardHeader>
        <CardTitle className="text-purple-200">Impermanent Loss-Protected Pools</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-purple-300/80">Provide liquidity in IL-protected pools with dynamic hedging. On-chain integration activates once RPCs are set.</div>
        <div className="flex gap-3">
          <Button disabled={!ready}>Provide Liquidity</Button>
          <Button variant="outline" disabled={!ready}>Withdraw</Button>
        </div>
        {!ready && <div className="text-xs text-amber-300">Connect RPC and pool contracts to enable IL protection.</div>}
      </CardContent>
    </Card>
  );
}