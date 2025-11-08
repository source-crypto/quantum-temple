import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, Link as LinkIcon, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

// OPTIONAL Easy Wallet Connector - Can be added to DEX pages if desired
export default function WalletConnector({ onConnect }) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState(null);

  const walletProviders = [
    {
      id: "metamask",
      name: "MetaMask",
      icon: "🦊",
      description: "Connect with MetaMask",
      popular: true
    },
    {
      id: "walletconnect",
      name: "WalletConnect",
      icon: "🔗",
      description: "Scan with WalletConnect",
      popular: true
    },
    {
      id: "coinbase",
      name: "Coinbase Wallet",
      icon: "💙",
      description: "Connect with Coinbase",
      popular: false
    },
    {
      id: "trust",
      name: "Trust Wallet",
      icon: "🛡️",
      description: "Connect with Trust Wallet",
      popular: false
    }
  ];

  const handleConnect = async (provider) => {
    setIsConnecting(true);
    
    // Simulate wallet connection
    setTimeout(() => {
      const mockAddress = `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`;
      setConnectedWallet({
        provider: provider.name,
        address: mockAddress,
        balance: "0.00"
      });
      setIsConnecting(false);
      toast.success(`Connected to ${provider.name}!`);
      
      if (onConnect) {
        onConnect({
          provider: provider.id,
          address: mockAddress
        });
      }
    }, 1500);
  };

  const handleDisconnect = () => {
    setConnectedWallet(null);
    toast.info("Wallet disconnected");
  };

  if (connectedWallet) {
    return (
      <Card className="bg-slate-900/60 border-green-900/40">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-green-200">{connectedWallet.provider}</span>
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                    Connected
                  </Badge>
                </div>
                <div className="text-xs font-mono text-green-400/70">
                  {connectedWallet.address}
                </div>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDisconnect}
              className="border-red-500/30 text-red-300 hover:bg-red-900/20"
            >
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900/60 border-purple-900/40">
      <CardHeader className="border-b border-purple-900/30">
        <CardTitle className="flex items-center gap-2 text-purple-200">
          <Wallet className="w-5 h-5" />
          Connect Wallet (Optional)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          {walletProviders.map((provider, index) => (
            <motion.button
              key={provider.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleConnect(provider)}
              disabled={isConnecting}
              className="w-full p-4 bg-slate-950/50 rounded-lg border border-purple-900/30 hover:border-purple-500/50 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{provider.icon}</div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-purple-200 group-hover:text-purple-100">
                        {provider.name}
                      </span>
                      {provider.popular && (
                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                          Popular
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-purple-400/70">{provider.description}</div>
                  </div>
                </div>
                <LinkIcon className="w-4 h-4 text-purple-400 group-hover:text-purple-300" />
              </div>
            </motion.button>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-950/30 rounded-lg border border-blue-500/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-200 mb-1">Optional Feature</h4>
              <p className="text-sm text-blue-300/70">
                Wallet connection is optional. You can use the platform with your QTC wallet address.
                Connect external wallets for enhanced trading capabilities.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-purple-400/50">
          <ExternalLink className="w-3 h-3" />
          <span>By connecting, you agree to the Terms of Service</span>
        </div>
      </CardContent>
    </Card>
  );
}