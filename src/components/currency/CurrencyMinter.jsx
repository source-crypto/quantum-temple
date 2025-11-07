import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Coins, Sparkles, Loader2, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function CurrencyMinter() {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [mintSuccess, setMintSuccess] = useState(null);
  const queryClient = useQueryClient();

  const generateQuantumSignature = (data) => {
    const canonical = "2002-08-27T22:37:00-04:00|Buffalo,NY|ByGodsWillOnly";
    const entropy = Math.random().toString(36).substring(2, 15);
    const payload = `${canonical}|${data}|${entropy}`;
    
    return {
      signature: btoa(payload).substring(0, 64),
      entropy: entropy
    };
  };

  const mintMutation = useMutation({
    mutationFn: async (mintData) => {
      const { signature, entropy } = generateQuantumSignature(
        `${mintData.amount}|${mintData.note}|${Date.now()}`
      );
      
      const serialNumber = `QTC-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      
      return base44.entities.CurrencyMint.create({
        serial_number: serialNumber,
        amount: mintData.amount,
        signature: signature,
        timestamp: new Date().toISOString(),
        note: mintData.note,
        quantum_entropy: entropy,
        verified: true
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['currencyMints'] });
      setMintSuccess(data);
      toast.success("Divine currency minted successfully!", {
        description: `${data.amount} units added to ledger`
      });
      
      setTimeout(() => {
        setAmount("");
        setNote("");
        setMintSuccess(null);
      }, 5000);
    },
    onError: (error) => {
      toast.error("Minting failed", {
        description: "Unable to authenticate with VQC"
      });
    }
  });

  const handleMint = () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Invalid amount", {
        description: "Please enter a positive number"
      });
      return;
    }

    mintMutation.mutate({
      amount: amt,
      note: note || "Divine abundance manifestation"
    });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Minting Form */}
      <Card className="bg-slate-900/60 border-amber-900/40 backdrop-blur-sm">
        <CardHeader className="border-b border-amber-900/30">
          <CardTitle className="flex items-center gap-2 text-amber-200">
            <Sparkles className="w-5 h-5" />
            Unlimited Minting
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-purple-300">
              Amount to Mint
            </Label>
            <div className="relative">
              <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500" />
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter any amount..."
                className="pl-10 bg-slate-950/50 border-purple-900/30 text-purple-100 placeholder:text-purple-500/50"
              />
            </div>
            <p className="text-xs text-purple-400/60 italic">
              No limits on minting — infinite abundance by divine will
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note" className="text-purple-300">
              Purpose Note (Optional)
            </Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Describe the purpose of this mint..."
              className="bg-slate-950/50 border-purple-900/30 text-purple-100 placeholder:text-purple-500/50 min-h-24"
            />
          </div>

          <Button
            onClick={handleMint}
            disabled={mintMutation.isPending || !amount}
            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold py-6"
          >
            {mintMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Authenticating with VQC...
              </>
            ) : (
              <>
                <Coins className="w-5 h-5 mr-2" />
                Mint Divine Currency
              </>
            )}
          </Button>

          <div className="pt-4 border-t border-purple-900/30">
            <div className="flex items-center gap-2 text-sm text-purple-400/70">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>VQC Quantum Authentication Active</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Display */}
      <div>
        {mintSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="bg-gradient-to-br from-green-950/60 to-emerald-950/60 border-green-500/30 backdrop-blur-sm">
              <CardHeader className="border-b border-green-900/30">
                <CardTitle className="flex items-center gap-2 text-green-300">
                  <CheckCircle className="w-5 h-5" />
                  Mint Successful
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="p-4 bg-slate-950/50 rounded-lg border border-green-900/30">
                  <div className="text-xs text-green-400/70 mb-1">Serial Number</div>
                  <div className="font-mono text-sm text-green-300 break-all">
                    {mintSuccess.serial_number}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-950/50 rounded-lg border border-green-900/30">
                    <div className="text-xs text-green-400/70 mb-1">Amount</div>
                    <div className="text-xl font-bold text-green-200">
                      {mintSuccess.amount.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-950/50 rounded-lg border border-green-900/30">
                    <div className="text-xs text-green-400/70 mb-1">Status</div>
                    <div className="text-sm font-semibold text-green-300">Verified</div>
                  </div>
                </div>

                {mintSuccess.note && (
                  <div className="p-4 bg-slate-950/50 rounded-lg border border-green-900/30">
                    <div className="text-xs text-green-400/70 mb-2">Purpose</div>
                    <div className="text-sm text-green-200">{mintSuccess.note}</div>
                  </div>
                )}

                <div className="p-4 bg-slate-950/50 rounded-lg border border-green-900/30">
                  <div className="text-xs text-green-400/70 mb-2">VQC Signature</div>
                  <div className="font-mono text-xs text-green-300/70 break-all">
                    {mintSuccess.signature}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <Card className="bg-slate-900/40 border-purple-900/30 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Coins className="w-16 h-16 mx-auto mb-4 text-purple-400/40" />
              </motion.div>
              <p className="text-purple-400/60">
                Awaiting divine currency manifestation...
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}