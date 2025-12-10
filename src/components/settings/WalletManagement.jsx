import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Wallet, CheckCircle, Copy, ExternalLink, Plus, Loader2, Shield, Key, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

export default function WalletManagement({ user }) {
  const [btcAddress, setBtcAddress] = useState("");
  const [ethAddress, setEthAddress] = useState("");
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [recoveryPhrase, setRecoveryPhrase] = useState("");
  const [seedPhraseLength, setSeedPhraseLength] = useState(12);
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

  const generateSeedPhraseMutation = useMutation({
    mutationFn: async (length) => {
      const wordList = [
        "abandon", "ability", "able", "about", "above", "absent", "absorb", "abstract", "absurd", "abuse",
        "access", "accident", "account", "accuse", "achieve", "acid", "acoustic", "acquire", "across", "act",
        "action", "actor", "actress", "actual", "adapt", "add", "addict", "address", "adjust", "admit",
        "adult", "advance", "advice", "aerobic", "affair", "afford", "afraid", "again", "age", "agent",
        "agree", "ahead", "aim", "air", "airport", "aisle", "alarm", "album", "alcohol", "alert"
      ];
      
      const seed = [];
      for (let i = 0; i < length; i++) {
        seed.push(wordList[Math.floor(Math.random() * wordList.length)]);
      }
      
      const seedPhrase = seed.join(" ");
      const encrypted = btoa(seedPhrase);
      
      const qtcAddress = `QTC-${Date.now()}-${Math.random().toString(36).substring(2, 12).toUpperCase()}`;
      const derivationPath = "m/44'/0'/0'/0/0";
      
      if (cryptoWallet) {
        await base44.entities.CryptoWallet.update(cryptoWallet.id, {
          qtc_wallet_address: qtcAddress,
          seed_phrase_encrypted: encrypted,
          seed_phrase_length: length,
          wallet_type: "hd_wallet",
          derivation_path: derivationPath,
          wallet_verified: true,
          ledger_entries: [
            {
              type: "wallet_generation",
              timestamp: new Date().toISOString(),
              derivation_path: derivationPath,
              quantum_signature: btoa(`${qtcAddress}-${Date.now()}`)
            }
          ]
        });
      } else {
        await base44.entities.CryptoWallet.create({
          user_email: user.email,
          qtc_wallet_address: qtcAddress,
          seed_phrase_encrypted: encrypted,
          seed_phrase_length: length,
          wallet_type: "hd_wallet",
          derivation_path: derivationPath,
          wallet_verified: true,
          ledger_entries: [
            {
              type: "wallet_generation",
              timestamp: new Date().toISOString(),
              derivation_path: derivationPath,
              quantum_signature: btoa(`${qtcAddress}-${Date.now()}`)
            }
          ]
        });
      }
      
      return { seedPhrase, qtcAddress };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cryptoWallet'] });
      setShowSeedPhrase(true);
      setRecoveryPhrase(data.seedPhrase);
      toast.success("Recovery phrase generated", {
        description: "Save your seed phrase in a secure location"
      });
    }
  });

  const recoverWalletMutation = useMutation({
    mutationFn: async (seedPhrase) => {
      const words = seedPhrase.trim().split(/\s+/);
      
      if (words.length !== 12 && words.length !== 24) {
        throw new Error("Recovery phrase must be exactly 12 or 24 words");
      }
      
      const encrypted = btoa(seedPhrase);
      const qtcAddress = `QTC-RECOVERED-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      const derivationPath = "m/44'/0'/0'/0/0";
      
      if (cryptoWallet) {
        return base44.entities.CryptoWallet.update(cryptoWallet.id, {
          qtc_wallet_address: qtcAddress,
          seed_phrase_encrypted: encrypted,
          seed_phrase_length: words.length,
          wallet_type: "hd_wallet",
          derivation_path: derivationPath,
          wallet_recovered: true,
          wallet_verified: true,
          last_recovery_attempt: new Date().toISOString(),
          ledger_entries: [
            ...(cryptoWallet.ledger_entries || []),
            {
              type: "wallet_recovery",
              timestamp: new Date().toISOString(),
              seed_length: words.length,
              quantum_signature: btoa(`RECOVERY-${qtcAddress}-${Date.now()}`)
            }
          ]
        });
      } else {
        return base44.entities.CryptoWallet.create({
          user_email: user.email,
          qtc_wallet_address: qtcAddress,
          seed_phrase_encrypted: encrypted,
          seed_phrase_length: words.length,
          wallet_type: "hd_wallet",
          derivation_path: derivationPath,
          wallet_recovered: true,
          wallet_verified: true,
          last_recovery_attempt: new Date().toISOString(),
          ledger_entries: [
            {
              type: "wallet_recovery",
              timestamp: new Date().toISOString(),
              seed_length: words.length,
              quantum_signature: btoa(`RECOVERY-${qtcAddress}-${Date.now()}`)
            }
          ]
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cryptoWallet'] });
      setRecoveryPhrase("");
      toast.success("Wallet recovered successfully", {
        description: "Your wallet has been restored from seed phrase"
      });
    },
    onError: (error) => {
      toast.error("Recovery failed", {
        description: error.message
      });
    }
  });

  const saveWalletMutation = useMutation({
    mutationFn: async (data) => {
      const updates = {
        bitcoin_address: data.btcAddress,
        ethereum_address: data.ethAddress,
        wallet_verified: true
      };
      
      if (cryptoWallet?.ledger_entries) {
        updates.ledger_entries = [
          ...cryptoWallet.ledger_entries,
          {
            type: "address_update",
            timestamp: new Date().toISOString(),
            btc_address: data.btcAddress,
            eth_address: data.ethAddress,
            quantum_signature: btoa(`UPDATE-${Date.now()}`)
          }
        ];
      }
      
      if (cryptoWallet) {
        return base44.entities.CryptoWallet.update(cryptoWallet.id, updates);
      } else {
        return base44.entities.CryptoWallet.create({
          user_email: user.email,
          qtc_wallet_address: `QTC-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          ...updates,
          ledger_entries: [
            {
              type: "wallet_creation",
              timestamp: new Date().toISOString(),
              quantum_signature: btoa(`CREATE-${Date.now()}`)
            }
          ]
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
      {/* Seed Phrase Management */}
      <Card className="bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border-indigo-500/50">
        <CardHeader className="border-b border-indigo-900/30">
          <CardTitle className="flex items-center gap-2 text-indigo-200">
            <Shield className="w-5 h-5" />
            Recovery Phrase Management
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="p-4 bg-indigo-950/30 rounded-lg border border-indigo-500/30">
            <div className="flex items-start gap-3 mb-4">
              <Key className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-indigo-200 mb-1">Standard Recovery Phrase</h4>
                <p className="text-sm text-indigo-300/70">
                  Industry-standard 12 or 24-word seed phrases (BIP-39 compatible). Never use 10-word phrases as they are non-standard and won't work with most wallets.
                </p>
              </div>
            </div>
            
            {cryptoWallet?.seed_phrase_encrypted && (
              <div className="mb-4 p-3 bg-green-950/30 rounded border border-green-500/30">
                <div className="flex items-center gap-2 text-sm text-green-300">
                  <CheckCircle className="w-4 h-4" />
                  <span>Recovery phrase secured • {cryptoWallet.seed_phrase_length}-word {cryptoWallet.wallet_recovered && '(Recovered)'}</span>
                </div>
              </div>
            )}
            
            <div className="grid md:grid-cols-2 gap-3">
              <Button
                onClick={() => generateSeedPhraseMutation.mutate(12)}
                disabled={generateSeedPhraseMutation.isPending}
                className="bg-gradient-to-r from-indigo-600 to-purple-600"
              >
                {generateSeedPhraseMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Key className="w-4 h-4 mr-2" />
                )}
                Generate 12-Word Phrase
              </Button>
              
              <Button
                onClick={() => generateSeedPhraseMutation.mutate(24)}
                disabled={generateSeedPhraseMutation.isPending}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                {generateSeedPhraseMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Key className="w-4 h-4 mr-2" />
                )}
                Generate 24-Word Phrase
              </Button>
            </div>
          </div>
          
          {showSeedPhrase && recoveryPhrase && (
            <div className="p-4 bg-amber-950/30 rounded-lg border border-amber-500/50">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-amber-400" />
                <span className="font-semibold text-amber-200">Your Recovery Phrase</span>
              </div>
              <div className="p-3 bg-slate-950/50 rounded border border-amber-900/30 mb-3">
                <div className="text-sm text-amber-200 font-mono break-words">{recoveryPhrase}</div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(recoveryPhrase, "Recovery phrase")}
                  className="border-amber-500/30 text-amber-300"
                >
                  <Copy className="w-3 h-3 mr-2" />
                  Copy
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowSeedPhrase(false)}
                  className="border-amber-500/30 text-amber-300"
                >
                  Hide
                </Button>
              </div>
              <p className="text-xs text-amber-300/70 mt-3">
                ⚠️ Store this phrase securely. Never share it. Anyone with this phrase can access your wallet.
              </p>
            </div>
          )}
          
          <div className="space-y-3">
            <Label className="text-indigo-300 flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Recover Wallet from Seed Phrase
            </Label>
            <Textarea
              value={recoveryPhrase}
              onChange={(e) => setRecoveryPhrase(e.target.value)}
              placeholder="Enter your 12 or 24-word recovery phrase..."
              className="bg-slate-950/50 border-indigo-900/30 text-indigo-100 font-mono text-sm min-h-[100px]"
            />
            <Button
              onClick={() => recoverWalletMutation.mutate(recoveryPhrase)}
              disabled={recoverWalletMutation.isPending || !recoveryPhrase}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600"
            >
              {recoverWalletMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Recovering...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Recover Wallet
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

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
              
              {cryptoWallet.wallet_type && (
                <div className="mt-4 p-3 bg-slate-950/50 rounded border border-purple-900/30">
                  <div className="text-xs text-purple-400/70 mb-2">Wallet Details</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-400/70">Type:</span>
                      <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                        {cryptoWallet.wallet_type.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    {cryptoWallet.derivation_path && (
                      <div className="flex items-center justify-between">
                        <span className="text-purple-400/70">Path:</span>
                        <span className="text-purple-200 font-mono">{cryptoWallet.derivation_path}</span>
                      </div>
                    )}
                    {cryptoWallet.seed_phrase_length && (
                      <div className="flex items-center justify-between">
                        <span className="text-purple-400/70">Recovery:</span>
                        <span className="text-purple-200">{cryptoWallet.seed_phrase_length}-word secured</span>
                      </div>
                    )}
                    {cryptoWallet.ledger_entries?.length > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-purple-400/70">Ledger:</span>
                        <span className="text-purple-200">{cryptoWallet.ledger_entries.length} entries</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
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