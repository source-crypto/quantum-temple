import React from "react";
import CrossChainBridge from "@/components/dex/CrossChainBridge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WalletConnector from "@/components/dex/WalletConnector";
import DAppPortal from "@/components/crosschain/DAppPortal";

export default function CrossChain() {
  return (
    <div className="p-6 md:p-10 space-y-6">
      <Card className="bg-slate-950/60 border-purple-900/40">
        <CardHeader>
          <CardTitle className="text-purple-200">Cross-Chain Bridge (QTC ⇄ EVM & Solana)</CardTitle>
        </CardHeader>
        <CardContent className="text-purple-300/80 text-sm">
          Phase 1 enables initiating bridge intents and tracking statuses. Use the portal below to interact with popular dApps on Ethereum and Solana using bridged QTC.
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <WalletConnector />
          <CrossChainBridge />
        </div>
        <div className="lg:col-span-2">
          <DAppPortal />
        </div>
      </div>
    </div>
  );
}