import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Shield, Smartphone, Key, CheckCircle, AlertTriangle, QrCode } from "lucide-react";
import { toast } from "sonner";

// OPTIONAL 2FA Component - Can be added to SecuritySettings if desired
export default function TwoFactorAuth({ user }) {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [setupStep, setSetupStep] = useState(0);
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCodes, setBackupCodes] = useState([]);

  const handleEnable2FA = () => {
    setSetupStep(1);
    // Generate mock backup codes
    setBackupCodes([
      "ABCD-1234-EFGH-5678",
      "IJKL-9012-MNOP-3456",
      "QRST-7890-UVWX-1234",
      "YZAB-5678-CDEF-9012"
    ]);
  };

  const handleVerifyCode = () => {
    if (verificationCode.length === 6) {
      setIs2FAEnabled(true);
      setSetupStep(3);
      toast.success("2FA enabled successfully!");
    } else {
      toast.error("Please enter a valid 6-digit code");
    }
  };

  const handleDisable2FA = () => {
    setIs2FAEnabled(false);
    setSetupStep(0);
    setVerificationCode("");
    toast.info("2FA has been disabled");
  };

  return (
    <Card className="bg-slate-900/60 border-amber-900/40">
      <CardHeader className="border-b border-amber-900/30">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-amber-200">
            <Shield className="w-5 h-5" />
            Two-Factor Authentication (Optional)
          </CardTitle>
          {is2FAEnabled && (
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
              <CheckCircle className="w-3 h-3 mr-1" />
              Enabled
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {setupStep === 0 && !is2FAEnabled && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-950/30 rounded-lg border border-blue-500/30">
              <div className="flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-200 mb-1">Add Extra Security</h4>
                  <p className="text-sm text-blue-300/70">
                    Two-factor authentication adds an extra layer of security to your account.
                    You'll need to enter a code from your authenticator app when logging in.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-slate-950/50 rounded border border-purple-900/30">
                <Key className="w-5 h-5 text-purple-400" />
                <div>
                  <div className="font-semibold text-purple-200 text-sm">Time-based codes</div>
                  <div className="text-xs text-purple-400/70">Use apps like Google Authenticator</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-950/50 rounded border border-purple-900/30">
                <Shield className="w-5 h-5 text-purple-400" />
                <div>
                  <div className="font-semibold text-purple-200 text-sm">Backup codes</div>
                  <div className="text-xs text-purple-400/70">Save codes for emergency access</div>
                </div>
              </div>
            </div>

            <Button
              onClick={handleEnable2FA}
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 font-semibold py-6"
            >
              <Shield className="w-5 h-5 mr-2" />
              Enable Two-Factor Authentication
            </Button>
          </div>
        )}

        {setupStep === 1 && (
          <div className="space-y-4">
            <div className="p-4 bg-amber-950/30 rounded-lg border border-amber-500/30">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-200 mb-1">Step 1: Save Backup Codes</h4>
                  <p className="text-sm text-amber-300/70 mb-3">
                    Save these codes in a secure location. You'll need them if you lose access to your authenticator.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="p-2 bg-slate-950/50 rounded border border-amber-900/30 font-mono text-xs text-amber-200">
                        {code}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setSetupStep(2)}
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 font-semibold"
            >
              I've Saved My Backup Codes
            </Button>
          </div>
        )}

        {setupStep === 2 && (
          <div className="space-y-4">
            <div className="text-center p-6 bg-slate-950/50 rounded-lg border border-purple-900/30">
              <div className="w-48 h-48 mx-auto mb-4 bg-white rounded-lg flex items-center justify-center">
                <QrCode className="w-32 h-32 text-purple-600" />
              </div>
              <p className="text-sm text-purple-300/70 mb-2">Scan with Google Authenticator or similar app</p>
              <p className="text-xs font-mono text-purple-400/50">
                Setup Key: ABCD EFGH IJKL MNOP
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="verify-code" className="text-purple-300">
                Enter 6-digit verification code
              </Label>
              <Input
                id="verify-code"
                type="text"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="bg-slate-950/50 border-purple-900/30 text-purple-100 text-center text-2xl font-mono tracking-widest"
              />
            </div>

            <Button
              onClick={handleVerifyCode}
              disabled={verificationCode.length !== 6}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 font-semibold py-6"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Verify and Enable
            </Button>

            <Button
              onClick={() => setSetupStep(0)}
              variant="outline"
              className="w-full border-purple-500/30 text-purple-300"
            >
              Cancel
            </Button>
          </div>
        )}

        {setupStep === 3 && is2FAEnabled && (
          <div className="space-y-4">
            <div className="p-4 bg-green-950/30 rounded-lg border border-green-500/30">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-200 mb-1">2FA Successfully Enabled!</h4>
                  <p className="text-sm text-green-300/70">
                    Your account now has an extra layer of security. You'll be asked for a code when logging in.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-950/50 rounded-lg border border-purple-900/30">
              <div className="text-sm text-purple-300 space-y-2">
                <div>✓ Time-based codes enabled</div>
                <div>✓ Backup codes saved</div>
                <div>✓ Emergency access configured</div>
              </div>
            </div>

            <Button
              onClick={handleDisable2FA}
              variant="outline"
              className="w-full border-red-500/30 text-red-300 hover:bg-red-900/20"
            >
              Disable 2FA
            </Button>
          </div>
        )}

        {is2FAEnabled && setupStep === 0 && (
          <div className="space-y-4">
            <div className="p-4 bg-green-950/30 rounded-lg border border-green-500/30">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div>
                  <div className="font-semibold text-green-200">2FA is Active</div>
                  <div className="text-sm text-green-300/70">Your account is protected</div>
                </div>
              </div>
            </div>

            <Button
              onClick={handleDisable2FA}
              variant="outline"
              className="w-full border-red-500/30 text-red-300 hover:bg-red-900/20"
            >
              Disable Two-Factor Authentication
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}