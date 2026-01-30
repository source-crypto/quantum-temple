import React from "react";
import CrossChainBridge from "@/components/dex/CrossChainBridge";
import DappLauncher from "@/components/crosschain/DappLauncher";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CrossChain() {
  return (
    <div className="p-6 md:p-10 space-y-6">
      <Card className="bg-slate-950/60 border-purple-900/40">
        <CardHeader>
          <CardTitle className="text-purple-200">Cross-Chain Interoperability (Bridge + dApps)</CardTitle>
        </CardHeader>
        <CardContent className="text-purple-300/80 text-sm">
          Bridge QTC across chains and use it directly in popular dApps on Ethereum and Solana (DeFi, NFT, tools). Interactions open in-app when possible, or in a new tab if embedding is blocked.
        </CardContent>
      </Card>
      <CrossChainBridge />

      <DappLauncher />
    </div>
  );
}