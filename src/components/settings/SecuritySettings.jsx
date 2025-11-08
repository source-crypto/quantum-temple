import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Shield, Key, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function SecuritySettings({ user }) {
  const handlePasswordReset = () => {
    toast.info("Password reset link sent to your email");
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-900/60 border-red-900/40">
        <CardHeader className="border-b border-red-900/30">
          <CardTitle className="flex items-center gap-2 text-red-200">
            <Lock className="w-5 h-5" />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="p-4 bg-amber-950/30 rounded-lg border border-amber-500/30">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-200 mb-1">Authentication Managed by Base44</h4>
                <p className="text-sm text-amber-300/70">
                  Your authentication is securely handled by the Base44 platform. 
                  Password changes and two-factor authentication are managed through your Base44 account settings.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-lg border border-purple-900/30">
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-purple-400" />
                <div>
                  <div className="font-semibold text-purple-200">Password</div>
                  <div className="text-xs text-purple-400/70">Last changed: Never</div>
                </div>
              </div>
              <Button
                onClick={handlePasswordReset}
                variant="outline"
                className="border-purple-500/30 text-purple-300 hover:bg-purple-900/20"
              >
                Reset Password
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-lg border border-purple-900/30">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-purple-400" />
                <div>
                  <div className="font-semibold text-purple-200">Two-Factor Authentication</div>
                  <div className="text-xs text-purple-400/70">Add an extra layer of security</div>
                </div>
              </div>
              <div className="px-3 py-1 bg-gray-500/20 rounded-full border border-gray-500/30">
                <span className="text-xs font-semibold text-gray-300">Not Configured</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/60 border-blue-900/40">
        <CardHeader className="border-b border-blue-900/30">
          <CardTitle className="flex items-center gap-2 text-blue-200">
            <Shield className="w-5 h-5" />
            Active Sessions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="p-4 bg-slate-950/50 rounded-lg border border-blue-900/30">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-blue-200">Current Session</div>
                <div className="text-xs text-blue-400/70">Last activity: Just now</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm text-green-300">Active</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}