import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, Copy } from "lucide-react";

export default function CryptoWalletPanel() {
  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });

  const { data: wallet } = useQuery({
    queryKey: ["cryptoWallet", user?.email],
    queryFn: async () => {
      if (!user) return null;
      const rows = await base44.entities.CryptoWallet.filter({ user_email: user.email }, "-updated_date", 1);
      return rows?.[0] || null;
    },
    enabled: !!user,
    initialData: null,
    refetchInterval: 60000,
  });

  const copy = (text) => {
    if (!text) return; navigator.clipboard.writeText(text);
  };

  return (
    <Card className="bg-slate-900/60 border-purple-900/40">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-purple-200 text-sm">
          <span className="flex items-center gap-2"><Wallet className="w-4 h-4"/>Crypto Wallet</span>
          <Badge className="bg-purple-500/20 text-purple-200 border-purple-500/30">QTC</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        {!user && (
          <div className="text-purple-400/70">Sign in to view your wallet details.</div>
        )}
        {user && !wallet && (
          <div className="text-purple-400/70">No wallet found yet.</div>
        )}
        {wallet && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-purple-300/80">QTC Address</span>
              <button onClick={() => copy(wallet.qtc_wallet_address)} className="text-purple-300 hover:text-purple-100">
                <Copy className="w-3 h-3" />
              </button>
            </div>
            <div className="font-mono text-[11px] break-all text-purple-100/90">{wallet.qtc_wallet_address || "—"}</div>
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="p-2 rounded bg-slate-800/50 text-center">
                <div className="text-[10px] text-purple-400/70">BTC</div>
                <div className="text-sm font-semibold text-purple-100">{Number(wallet.btc_balance||0).toLocaleString()}</div>
              </div>
              <div className="p-2 rounded bg-slate-800/50 text-center">
                <div className="text-[10px] text-purple-400/70">ETH</div>
                <div className="text-sm font-semibold text-purple-100">{Number(wallet.eth_balance||0).toLocaleString()}</div>
              </div>
              <div className="p-2 rounded bg-slate-800/50 text-center">
                <div className="text-[10px] text-purple-400/70">QTC</div>
                <div className="text-sm font-semibold text-purple-100">{Number(wallet.qtc_balance||0).toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}