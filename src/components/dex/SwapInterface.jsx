import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Repeat, ArrowDown, Settings, Info } from "lucide-react";

export default function SwapInterface() {
  const [fromToken, setFromToken] = useState("QTC");
  const [toToken, setToToken] = useState("USD");
  const [fromAmount, setFromAmount] = useState("");
  const [slippage, setSlippage] = useState("0.5");

  const tokens = [
    { symbol: "QTC", name: "Quantum Temple Currency", icon: "◈" },
    { symbol: "USD", name: "US Dollar", icon: "$" },
    { symbol: "BTC", name: "Bitcoin", icon: "₿" },
    { symbol: "ETH", name: "Ethereum", icon: "Ξ" }
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-slate-900/60 border-cyan-900/40">
        <CardHeader className="border-b border-cyan-900/30">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-cyan-200">
              <Repeat className="w-5 h-5" />
              Token Swap
            </CardTitle>
            <Button size="icon" variant="ghost" className="text-cyan-400 hover:bg-cyan-900/20">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {/* From Token */}
          <div className="p-4 bg-slate-950/50 rounded-lg border border-cyan-900/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-cyan-400/70">From</span>
              <span className="text-xs text-cyan-400/50">Balance: 0.00</span>
            </div>
            <div className="flex gap-3">
              <Select value={fromToken} onValueChange={setFromToken}>
                <SelectTrigger className="w-32 bg-slate-900/50 border-cyan-900/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tokens.map(token => (
                    <SelectItem key={token.symbol} value={token.symbol}>
                      <div className="flex items-center gap-2">
                        <span>{token.icon}</span>
                        <span>{token.symbol}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                placeholder="0.0"
                className="bg-slate-900/50 border-cyan-900/30 text-cyan-100 text-xl font-semibold"
              />
            </div>
          </div>

          {/* Swap Arrow */}
          <div className="flex justify-center">
            <button className="p-2 bg-slate-900 rounded-full border-2 border-cyan-900/30 hover:border-cyan-500/50 transition-colors">
              <ArrowDown className="w-5 h-5 text-cyan-400" />
            </button>
          </div>

          {/* To Token */}
          <div className="p-4 bg-slate-950/50 rounded-lg border border-cyan-900/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-cyan-400/70">To</span>
              <span className="text-xs text-cyan-400/50">Balance: 0.00</span>
            </div>
            <div className="flex gap-3">
              <Select value={toToken} onValueChange={setToToken}>
                <SelectTrigger className="w-32 bg-slate-900/50 border-cyan-900/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tokens.map(token => (
                    <SelectItem key={token.symbol} value={token.symbol}>
                      <div className="flex items-center gap-2">
                        <span>{token.icon}</span>
                        <span>{token.symbol}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex-1 p-3 bg-slate-900/50 rounded border border-cyan-900/30 text-cyan-300/50 text-xl font-semibold">
                0.0
              </div>
            </div>
          </div>

          {/* Swap Details */}
          <div className="p-4 bg-slate-950/50 rounded-lg border border-cyan-900/30 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-cyan-400/70">Exchange Rate</span>
              <span className="text-cyan-300">1 {fromToken} = 1.00 {toToken}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-cyan-400/70">Slippage Tolerance</span>
              <span className="text-cyan-300">{slippage}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-cyan-400/70">Fee (0.3%)</span>
              <span className="text-cyan-300">0.00 QTC</span>
            </div>
          </div>

          <div className="p-4 bg-blue-950/30 rounded-lg border border-blue-500/30">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-200 mb-1">Coming Soon</h4>
                <p className="text-sm text-blue-300/70">
                  Token swap functionality will be enabled once liquidity pools are established. 
                  The AMM engine uses the constant product formula (x * y = k) for fair pricing.
                </p>
              </div>
            </div>
          </div>

          <Button
            disabled
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 opacity-50 cursor-not-allowed font-semibold py-6"
          >
            Connect Wallet to Swap
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}