import React from "react";
import CrossChainBridge from "@/components/dex/CrossChainBridge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CrossChain() {
  return (
    <div className="p-6 md:p-10 space-y-6">
      <Card className="bg-slate-950/60 border-purple-900/40">
        <CardHeader>
          <CardTitle className="text-purple-200">Cross-Chain Bridge (QTC ⇄ EVM & Solana)</CardTitle>
        </CardHeader>
        <CardContent className="text-purple-300/80 text-sm">
          Phase 1 enables initiating bridge intents and tracking statuses. On-chain execution is being rolled out for Ethereum and Solana.
        </CardContent>
      </Card>
      <CrossChainBridge />
    </div>
  );
}