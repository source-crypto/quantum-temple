import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, CheckCircle2 } from "lucide-react";

export default function StopOrderForm() {
  const qc = useQueryClient();
  const [pair, setPair] = useState("QTC/USD");
  const [side, setSide] = useState("sell");
  const [orderType, setOrderType] = useState("stop_loss");
  const [amount, setAmount] = useState(0);
  const [stopPrice, setStopPrice] = useState(0);
  const [limitPrice, setLimitPrice] = useState(0);

  const { data: isAuth } = useQuery({ queryKey: ["auth"], queryFn: () => base44.auth.isAuthenticated() });

  const createOrder = useMutation({
    mutationFn: async () => {
      if (!isAuth) {
        await base44.auth.redirectToLogin();
        return;
      }
      const user = await base44.auth.me();
      return base44.entities.TradingOrder.create({
        order_id: `ord_${Date.now()}`,
        user_email: user.email,
        market_id: pair,
        order_type: orderType,
        side,
        amount: Number(amount),
        stop_price: Number(stopPrice) || undefined,
        limit_price: Number(limitPrice) || undefined,
        status: "active",
        time_in_force: "GTC",
        timestamp: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my_orders"] });
      setAmount(0); setStopPrice(0); setLimitPrice(0);
    }
  });

  return (
    <Card className="bg-slate-900/60 border-purple-900/40">
      <CardHeader>
        <CardTitle className="text-purple-200">Stop/Take-Profit Orders</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Select value={pair} onValueChange={setPair}>
            <SelectTrigger className="bg-slate-950/50 border-purple-900/30 text-purple-100">
              <SelectValue placeholder="Pair" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="QTC/USD">QTC/USD</SelectItem>
              <SelectItem value="QTC/USDC">QTC/USDC</SelectItem>
            </SelectContent>
          </Select>
          <Select value={side} onValueChange={setSide}>
            <SelectTrigger className="bg-slate-950/50 border-purple-900/30 text-purple-100">
              <SelectValue placeholder="Side" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="buy">Buy</SelectItem>
              <SelectItem value="sell">Sell</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Select value={orderType} onValueChange={setOrderType}>
            <SelectTrigger className="bg-slate-950/50 border-purple-900/30 text-purple-100">
              <SelectValue placeholder="Order Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stop_loss">Stop-Loss</SelectItem>
              <SelectItem value="take_profit">Take-Profit</SelectItem>
            </SelectContent>
          </Select>
          <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" className="bg-slate-950/50 border-purple-900/30 text-purple-100" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Input type="number" value={stopPrice} onChange={(e) => setStopPrice(e.target.value)} placeholder="Trigger/Stop Price" className="bg-slate-950/50 border-purple-900/30 text-purple-100" />
          <Input type="number" value={limitPrice} onChange={(e) => setLimitPrice(e.target.value)} placeholder="Limit Price (optional)" className="bg-slate-950/50 border-purple-900/30 text-purple-100" />
        </div>

        <div className="text-xs text-purple-300/70 flex items-center gap-2">
          <ShieldAlert className="w-3 h-3" />
          Orders execute when price crosses the trigger based on index/DEX feed; execution is simulated in this version.
        </div>

        <Button onClick={() => createOrder.mutate()} disabled={createOrder.isPending || !amount || !stopPrice} className="w-full">
          {createOrder.isPending ? "Placing..." : "Place Order"}
        </Button>
        {createOrder.isSuccess && (
          <div className="text-xs text-green-300 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Order submitted
          </div>
        )}
      </CardContent>
    </Card>
  );
}