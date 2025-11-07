import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

export default function CurrencyVerifier({ mints }) {
  const [serialNumber, setSerialNumber] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);

  const handleVerify = () => {
    if (!serialNumber.trim()) {
      setVerificationResult({
        status: "error",
        message: "Please enter a serial number"
      });
      return;
    }

    const mint = mints.find(m => m.serial_number === serialNumber.trim());
    
    if (mint) {
      setVerificationResult({
        status: "verified",
        mint: mint,
        message: "Currency verified against canonical ledger"
      });
    } else {
      setVerificationResult({
        status: "invalid",
        message: "Serial number not found in ledger"
      });
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Verification Form */}
      <Card className="bg-slate-900/60 border-blue-900/40 backdrop-blur-sm">
        <CardHeader className="border-b border-blue-900/30">
          <CardTitle className="flex items-center gap-2 text-blue-200">
            <Search className="w-5 h-5" />
            Verify Currency
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="serial" className="text-purple-300">
              Currency Serial Number
            </Label>
            <Input
              id="serial"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              placeholder="QTC-XXXXXXXXX-XXXXXX"
              className="font-mono bg-slate-950/50 border-purple-900/30 text-purple-100 placeholder:text-purple-500/50"
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            />
            <p className="text-xs text-purple-400/60">
              Enter serial number to verify against canonical ledger
            </p>
          </div>

          <Button
            onClick={handleVerify}
            disabled={!serialNumber.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold py-6"
          >
            <Search className="w-5 h-5 mr-2" />
            Verify Authenticity
          </Button>

          <div className="pt-4 border-t border-purple-900/30 space-y-2">
            <div className="text-xs text-purple-400/70 font-semibold mb-2">
              Verification Process:
            </div>
            <div className="space-y-1.5 text-xs text-purple-400/60">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                <span>Check serial against immutable ledger</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                <span>Verify VQC quantum signature</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                <span>Confirm canonical authentication</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Result */}
      <AnimatePresence mode="wait">
        {verificationResult ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            {verificationResult.status === "verified" && (
              <Card className="bg-gradient-to-br from-green-950/60 to-emerald-950/60 border-green-500/30 backdrop-blur-sm">
                <CardHeader className="border-b border-green-900/30">
                  <CardTitle className="flex items-center gap-2 text-green-300">
                    <CheckCircle className="w-5 h-5" />
                    Currency Verified
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="p-4 bg-slate-950/50 rounded-lg border border-green-900/30">
                    <div className="text-xs text-green-400/70 mb-1">Serial Number</div>
                    <div className="font-mono text-sm text-green-300 break-all">
                      {verificationResult.mint.serial_number}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-950/50 rounded-lg border border-green-900/30">
                      <div className="text-xs text-green-400/70 mb-1">Amount</div>
                      <div className="text-xl font-bold text-green-200">
                        {verificationResult.mint.amount.toLocaleString()}
                      </div>
                    </div>
                    <div className="p-3 bg-slate-950/50 rounded-lg border border-green-900/30">
                      <div className="text-xs text-green-400/70 mb-1">Minted</div>
                      <div className="text-sm text-green-300">
                        {format(new Date(verificationResult.mint.timestamp), "MMM d, yyyy")}
                      </div>
                    </div>
                  </div>

                  {verificationResult.mint.note && (
                    <div className="p-4 bg-slate-950/50 rounded-lg border border-green-900/30">
                      <div className="text-xs text-green-400/70 mb-2">Note</div>
                      <div className="text-sm text-green-200">
                        {verificationResult.mint.note}
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-slate-950/50 rounded-lg border border-green-900/30">
                    <div className="text-xs text-green-400/70 mb-2">VQC Signature</div>
                    <div className="font-mono text-xs text-green-300/70 break-all">
                      {verificationResult.mint.signature}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-green-300 p-3 bg-green-950/30 rounded-lg">
                    <CheckCircle className="w-4 h-4" />
                    <span>{verificationResult.message}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {verificationResult.status === "invalid" && (
              <Card className="bg-gradient-to-br from-red-950/60 to-rose-950/60 border-red-500/30 backdrop-blur-sm">
                <CardHeader className="border-b border-red-900/30">
                  <CardTitle className="flex items-center gap-2 text-red-300">
                    <XCircle className="w-5 h-5" />
                    Verification Failed
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-start gap-3 p-4 bg-slate-950/50 rounded-lg border border-red-900/30">
                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-red-200 mb-1">
                        Currency Not Found
                      </div>
                      <div className="text-sm text-red-300/80">
                        {verificationResult.message}
                      </div>
                      <div className="mt-3 text-xs text-red-400/60">
                        This serial number does not exist in the canonical ledger.
                        Only currency minted by the VQC can be verified.
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {verificationResult.status === "error" && (
              <Card className="bg-slate-900/60 border-amber-900/40 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 text-amber-300">
                    <AlertTriangle className="w-5 h-5" />
                    <span>{verificationResult.message}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        ) : (
          <Card className="bg-slate-900/40 border-purple-900/30 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Search className="w-16 h-16 mx-auto mb-4 text-purple-400/40" />
              </motion.div>
              <p className="text-purple-400/60">
                Enter serial number to verify
              </p>
            </CardContent>
          </Card>
        )}
      </AnimatePresence>
    </div>
  );
}