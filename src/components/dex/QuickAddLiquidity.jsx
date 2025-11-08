import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Droplets, Plus, Loader2, CheckCircle, Info } from "lucide-react";
import { toast } from "sonner";

// OPTIONAL Quick Add Liquidity Component - Simplified liquidity provision
export default function QuickAddLiquidity() {
  const [selectedPool, setSelectedPool] = useState("QTC/USD");
  const [amount, setAmount] = useState("");
  const queryClient = useQueryClient();

  const pools = [
    { pair: "QTC/USD", tokenA: "QTC", tokenB: "USD", icon: "◈/$" },
    { pair: "QTC/BTC", tokenA: "QTC", tokenB: "BTC", icon: "◈/₿" },
    { pair: "QTC/ETH", tokenA: "QTC", tokenB: "ETH", icon: "◈/Ξ" }
  ];

  const addLiquidityMutation = useMutation({
    mutationFn: async (data) => {
      // This is a simplified demonstration
      // In production, this would interact with actual liquidity pool contracts
      
      const pool = pools.find(p => p.pair === data.pool);
      const user = await base44.auth.me();
      
      // Check if pool exists in database
      let liquidityPool = await base44.entities.LiquidityPool.filter({ 
        pool_name: `${pool.tokenA}/${pool.tokenB} Pool` 
      });

      if (liquidityPool.length === 0) {
        // Create pool if doesn't exist
        liquidityPool = await base44.entities.LiquidityPool.create({
          pool_name: `${pool.tokenA}/${pool.tokenB} Pool`,
          token_a: pool.tokenA,
          token_b: pool.tokenB,
          reserve_a: data.amount,
          reserve_b: data.amount, // Simplified: equal amounts
          total_liquidity: data.amount * 2,
          created_at: new Date().toISOString()
        });
      } else {
        liquidityPool = liquidityPool[0];
      }

      // Create liquidity position
      const position = await base44.entities.LiquidityPosition.create({
        pool_name: pool.pair,
        provider_email: user.email,
        token_a_deposited: data.amount,
        token_b_deposited: data.amount,
        liquidity_tokens: data.amount * 2,
        share_percentage: 0.1, // This would be calculated based on pool
        deposit_date: new Date().toISOString()
      });

      return position;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liquidityPools'] });
      queryClient.invalidateQueries({ queryKey: ['liquidityPositions'] });
      setAmount("");
      toast.success("Liquidity added successfully!");
    },
    onError: (error) => {
      toast.error("Failed to add liquidity", {
        description: error.message
      });
    }
  });

  const handleAddLiquidity = () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    addLiquidityMutation.mutate({
      pool: selectedPool,
      amount: amt
    });
  };

  return (
    <Card className="bg-slate-900/60 border-indigo-900/40">
      <CardHeader className="border-b border-indigo-900/30">
        <CardTitle className="flex items-center gap-2 text-indigo-200">
          <Droplets className="w-5 h-5" />
          Quick Add Liquidity (Optional)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="p-4 bg-indigo-950/30 rounded-lg border border-indigo-500/30">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-indigo-200 mb-1">Simplified Liquidity Provision</h4>
              <p className="text-sm text-indigo-300/70">
                This is an optional, simplified way to add liquidity. For advanced options,
                use the full liquidity interface. Configuration is optional - default settings work great!
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pool-select" className="text-purple-300">
            Select Pool
          </Label>
          <Select value={selectedPool} onValueChange={setSelectedPool}>
            <SelectTrigger id="pool-select" className="bg-slate-950/50 border-purple-900/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pools.map(pool => (
                <SelectItem key={pool.pair} value={pool.pair}>
                  <div className="flex items-center gap-2">
                    <span>{pool.icon}</span>
                    <span>{pool.pair}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="liquidity-amount" className="text-purple-300">
            Amount (will be split equally between both tokens)
          </Label>
          <div className="relative">
            <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500" />
            <Input
              id="liquidity-amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount..."
              className="pl-10 bg-slate-950/50 border-purple-900/30 text-purple-100 text-lg"
            />
          </div>
          <p className="text-xs text-purple-400/60">
            You'll provide {amount || "0"} of each token in the pair
          </p>
        </div>

        {amount && parseFloat(amount) > 0 && (
          <div className="p-4 bg-slate-950/50 rounded-lg border border-indigo-900/30 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-indigo-400/70">You'll provide</span>
              <span className="text-indigo-300 font-semibold">{amount} {pools.find(p => p.pair === selectedPool)?.tokenA}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-indigo-400/70">Plus</span>
              <span className="text-indigo-300 font-semibold">{amount} {pools.find(p => p.pair === selectedPool)?.tokenB}</span>
            </div>
            <div className="pt-2 border-t border-indigo-900/30">
              <div className="flex items-center justify-between text-sm">
                <span className="text-indigo-400/70">LP Tokens (estimate)</span>
                <span className="text-green-300 font-semibold">{(parseFloat(amount) * 2).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        <Button
          onClick={handleAddLiquidity}
          disabled={addLiquidityMutation.isPending || !amount || parseFloat(amount) <= 0}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-semibold py-6"
        >
          {addLiquidityMutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Adding Liquidity...
            </>
          ) : (
            <>
              <Plus className="w-5 h-5 mr-2" />
              Add Liquidity
            </>
          )}
        </Button>

        <div className="text-center">
          <p className="text-xs text-purple-400/50">
            ✨ No configuration required - Just enter an amount and go!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}