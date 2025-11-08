import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Info } from "lucide-react";

// Master Optional Features Guide Component
export default function OptionalFeatures() {
  const features = [
    {
      name: "Two-Factor Authentication",
      location: "Settings > Security",
      description: "Optional extra security layer with authenticator apps",
      status: "Available",
      required: false
    },
    {
      name: "Wallet Connector",
      location: "DEX pages",
      description: "Easy connection to MetaMask, WalletConnect, etc.",
      status: "Available",
      required: false
    },
    {
      name: "Quick Add Liquidity",
      location: "DEX > Liquidity",
      description: "Simplified liquidity provision without complex configuration",
      status: "Available",
      required: false
    },
    {
      name: "Notification Preferences",
      location: "Settings > Notifications",
      description: "Customize which alerts you receive",
      status: "Active",
      required: false
    },
    {
      name: "External Wallet Management",
      location: "Settings > Wallets",
      description: "Optional BTC/ETH wallet connections for bridging",
      status: "Active",
      required: false
    }
  ];

  return (
    <Card className="bg-slate-900/60 border-purple-900/40">
      <CardHeader className="border-b border-purple-900/30">
        <CardTitle className="flex items-center gap-2 text-purple-200">
          <Sparkles className="w-5 h-5" />
          Optional Features Guide
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="p-4 bg-blue-950/30 rounded-lg border border-blue-500/30 mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-200 mb-1">Everything is Optional</h4>
              <p className="text-sm text-blue-300/70">
                All enhancement features are completely optional. The core platform works perfectly
                without any configuration. Use only what you need!
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-4 bg-slate-950/50 rounded-lg border border-purple-900/30 hover:border-purple-700/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-purple-200 mb-1">{feature.name}</h4>
                  <p className="text-xs text-purple-400/70">{feature.location}</p>
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                    {feature.status}
                  </Badge>
                  <Badge variant="outline" className="border-green-500/30 text-green-300 text-xs">
                    Optional
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-purple-300/80">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-green-950/30 rounded-lg border border-green-500/30">
          <p className="text-sm text-green-300/70 text-center">
            ✅ All features work independently • ✅ No dependencies • ✅ Easy adoption
          </p>
        </div>
      </CardContent>
    </Card>
  );
}