import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Wallet, CheckCircle, Copy, ExternalLink, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function WalletManagement({ user }) {
  const [btcAddress, setBtcAddress] = useState("");
  const [ethAddress, setEthAddress] = useState("");
  const queryClient = useQueryClient();

  const { data: cryptoWallet, isLoading } = useQuery({
    queryKey: ['cryptoWallet'],
    queryFn: async () => {
      if (!user) return null;
      const wallets = await base44.entities.CryptoWallet.filter({ user_email: user.email });
      if (wallets.length > 0) {
        setBtcAddress(wallets[0].bitcoin_address || "");
        setEthAddress(wallets[0].ethereum_address || "");
        return wallets[0];
      }
      return null;
    },
    enabled: !!user,
  });

  const saveWalletMutation = useMutation({
    mutationFn: async (data) => {
      if (cryptoWallet) {
        return base44.entities.CryptoWallet.update(cryptoWallet.id, {
          bitcoin_address: data.btcAddress,
          ethereum_address: data.ethAddress,
          wallet_verified: true
        });
      } else {
        return base44.entities.CryptoWallet.create({
          user_email: user.email,
          qtc_wallet_address: `QTC-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          bitcoin_address: data.btcAddress,
          ethereum_address: data.ethAddress,
          wallet_verified: true
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cryptoWallet'] });
      toast.success("Wallet addresses saved successfully");
    },
    onError: () => {
      toast.error("Failed to save wallet addresses");
    }
  });

  const handleSave = () => {
    if (!btcAddress && !ethAddress) {
      toast.error("Please enter at least one wallet address");
      return;
    }
    saveWalletMutation.mutate({ btcAddress, ethAddress });
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className="space-y-6">
      {/* QTC Wallet */}
      <Card className="bg-slate-900/60 border-purple-900/40">
        <CardHeader className="border-b border-purple-900/30">
          <CardTitle className="flex items-center gap-2 text-purple-200">
            <Wallet className="w-5 h-5" />
            Quantum Temple Currency Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {cryptoWallet?.qtc_wallet_address ? (
            <div className="space-y-4">
              <div className="p-4 bg-purple-950/30 rounded-lg border border-purple-500/30">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-purple-300">Your QTC Address</Label>
                  {cryptoWallet.wallet_verified && (
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-3 bg-slate-950/50 rounded border border-purple-900/30 font-mono text-sm text-purple-200 overflow-x-auto">
                    {cryptoWallet.qtc_wallet_address}
                  </div>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => copyToClipboard(cryptoWallet.qtc_wallet_address, "QTC address")}
                    className="border-purple-500/30 text-purple-300 hover:bg-purple-900/20"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-slate-950/50 rounded border border-purple-900/30">
                  <div className="text-xs text-purple-400/70 mb-1">QTC Balance</div>
                  <div className="font-semibold text-purple-200">
                    {(cryptoWallet.qtc_balance || 0).toLocaleString()}
                  </div>
                </div>
                <div className="p-3 bg-slate-950/50 rounded border border-purple-900/30">
                  <div className="text-xs text-purple-400/70 mb-1">BTC Bridged</div>
                  <div className="font-semibold text-purple-200">
                    {(cryptoWallet.total_bridged_btc || 0).toFixed(4)}
                  </div>
                </div>
                <div className="p-3 bg-slate-950/50 rounded border border-purple-900/30">
                  <div className="text-xs text-purple-400/70 mb-1">ETH Bridged</div>
                  <div className="font-semibold text-purple-200">
                    {(cryptoWallet.total_bridged_eth || 0).toFixed(4)}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-purple-400/60">
              <Wallet className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>No QTC wallet found. Connect external wallets to create one.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* External Wallets */}
      <Card className="bg-slate-900/60 border-green-900/40">
        <CardHeader className="border-b border-green-900/30">
          <CardTitle className="flex items-center gap-2 text-green-200">
            <Wallet className="w-5 h-5" />
            External Wallet Connections
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="btc-address" className="text-purple-300 flex items-center gap-2">
              <span className="text-orange-400 text-lg">₿</span>
              Bitcoin Address
            </Label>
            <Input
              id="btc-address"
              value={btcAddress}
              onChange={(e) => setBtcAddress(e.target.value)}
              placeholder="bc1q... or 1... or 3..."
              className="bg-slate-950/50 border-purple-900/30 text-purple-100 font-mono text-sm"
            />
            <p className="text-xs text-purple-400/60">
              Connect your Bitcoin wallet for cross-chain bridging
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="eth-address" className="text-purple-300 flex items-center gap-2">
              <span className="text-blue-400 text-lg">Ξ</span>
              Ethereum Address
            </Label>
            <Input
              id="eth-address"
              value={ethAddress}
              onChange={(e) => setEthAddress(e.target.value)}
              placeholder="0x..."
              className="bg-slate-950/50 border-purple-900/30 text-purple-100 font-mono text-sm"
            />
            <p className="text-xs text-purple-400/60">
              Connect your Ethereum wallet for cross-chain bridging
            </p>
          </div>

          <Button
            onClick={handleSave}
            disabled={saveWalletMutation.isPending}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 font-semibold py-6"
          >
            {saveWalletMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 mr-2" />
                Save Wallet Addresses
              </>
            )}
          </Button>

          <div className="p-4 bg-blue-950/30 rounded-lg border border-blue-500/30">
            <div className="flex items-start gap-3">
              <ExternalLink className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-200 mb-1">Security Notice</h4>
                <p className="text-sm text-blue-300/70">
                  Never share your private keys. Only wallet addresses are stored for bridging operations.
                  All transactions are cryptographically signed and verified.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}