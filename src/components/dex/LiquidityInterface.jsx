import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Droplets, Plus, Minus, Info } from "lucide-react";

export default function LiquidityInterface() {
  const [tokenAAmount, setTokenAAmount] = useState("");
  const [tokenBAmount, setTokenBAmount] = useState("");

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-slate-900/60 border-indigo-900/40">
        <CardHeader className="border-b border-indigo-900/30">
          <CardTitle className="flex items-center gap-2 text-indigo-200">
            <Droplets className="w-5 h-5" />
            Manage Liquidity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="add" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="add" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Liquidity
              </TabsTrigger>
              <TabsTrigger value="remove" className="flex items-center gap-2">
                <Minus className="w-4 h-4" />
                Remove Liquidity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="add" className="space-y-4">
              {/* Token A Input */}
              <div className="p-4 bg-slate-950/50 rounded-lg border border-indigo-900/30">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-indigo-400/70">Token A</span>
                  <span className="text-xs text-indigo-400/50">Balance: 0.00 QTC</span>
                </div>
                <div className="flex gap-3 items-center">
                  <div className="w-24 px-3 py-2 bg-slate-900/50 rounded border border-indigo-900/30 text-center">
                    <span className="font-semibold text-indigo-300">QTC</span>
                  </div>
                  <Input
                    type="number"
                    value={tokenAAmount}
                    onChange={(e) => setTokenAAmount(e.target.value)}
                    placeholder="0.0"
                    className="bg-slate-900/50 border-indigo-900/30 text-indigo-100 text-xl font-semibold"
                  />
                </div>
              </div>

              {/* Plus Icon */}
              <div className="flex justify-center">
                <div className="p-2 bg-indigo-500/20 rounded-full border border-indigo-500/30">
                  <Plus className="w-4 h-4 text-indigo-400" />
                </div>
              </div>

              {/* Token B Input */}
              <div className="p-4 bg-slate-950/50 rounded-lg border border-indigo-900/30">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-indigo-400/70">Token B</span>
                  <span className="text-xs text-indigo-400/50">Balance: 0.00 USD</span>
                </div>
                <div className="flex gap-3 items-center">
                  <div className="w-24 px-3 py-2 bg-slate-900/50 rounded border border-indigo-900/30 text-center">
                    <span className="font-semibold text-indigo-300">USD</span>
                  </div>
                  <Input
                    type="number"
                    value={tokenBAmount}
                    onChange={(e) => setTokenBAmount(e.target.value)}
                    placeholder="0.0"
                    className="bg-slate-900/50 border-indigo-900/30 text-indigo-100 text-xl font-semibold"
                  />
                </div>
              </div>

              {/* Pool Details */}
              <div className="p-4 bg-slate-950/50 rounded-lg border border-indigo-900/30 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-indigo-400/70">Pool Share</span>
                  <span className="text-indigo-300">0.00%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-indigo-400/70">LP Tokens</span>
                  <span className="text-indigo-300">0.00</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-indigo-400/70">Current APY</span>
                  <span className="text-green-300">~0.00%</span>
                </div>
              </div>

              <div className="p-4 bg-indigo-950/30 rounded-lg border border-indigo-500/30">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-indigo-200 mb-1">Earn Trading Fees</h4>
                    <p className="text-sm text-indigo-300/70">
                      Liquidity providers earn 0.3% of all trades proportional to their pool share.
                      You'll receive LP tokens representing your position.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                disabled
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 opacity-50 cursor-not-allowed font-semibold py-6"
              >
                Add Liquidity (Coming Soon)
              </Button>
            </TabsContent>

            <TabsContent value="remove" className="space-y-4">
              <div className="p-12 text-center">
                <Droplets className="w-16 h-16 mx-auto mb-4 text-indigo-400/40" />
                <p className="text-indigo-400/60 mb-2">No liquidity positions</p>
                <p className="text-sm text-indigo-500/50">Add liquidity first to see your positions here</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}