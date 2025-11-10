import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Target, Shield, Zap, Clock, CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function AdvancedTrading({ market }) {
  const [orderType, setOrderType] = useState("limit");
  const [side, setSide] = useState("buy");
  const [amount, setAmount] = useState("");
  const [limitPrice, setLimitPrice] = useState("");
  const [stopPrice, setStopPrice] = useState("");
  const [timeInForce, setTimeInForce] = useState("GTC");

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: activeOrders } = useQuery({
    queryKey: ['activeOrders'],
    queryFn: async () => {
      if (!user) return [];
      return base44.entities.TradingOrder.filter({ 
        user_email: user.email,
        status: 'active'
      }, '-timestamp', 20);
    },
    enabled: !!user,
    initialData: [],
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData) => {
      const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      
      return base44.entities.TradingOrder.create({
        order_id: orderId,
        user_email: user.email,
        market_id: market?.market_id,
        order_type: orderData.orderType,
        side: orderData.side,
        amount: parseFloat(orderData.amount),
        limit_price: orderData.limitPrice ? parseFloat(orderData.limitPrice) : null,
        stop_price: orderData.stopPrice ? parseFloat(orderData.stopPrice) : null,
        trigger_price: orderData.stopPrice ? parseFloat(orderData.stopPrice) : null,
        status: 'active',
        filled_amount: 0,
        time_in_force: orderData.timeInForce,
        timestamp: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeOrders'] });
      toast.success("Order placed!", {
        description: `Your ${orderType} ${side} order has been created`
      });
      setAmount("");
      setLimitPrice("");
      setStopPrice("");
    },
    onError: () => {
      toast.error("Order failed", {
        description: "Unable to place order. Please try again."
      });
    }
  });

  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId) => {
      const order = activeOrders.find(o => o.order_id === orderId);
      return base44.entities.TradingOrder.update(order.id, { status: 'cancelled' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeOrders'] });
      toast.success("Order cancelled");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Invalid amount");
      return;
    }

    if (orderType === "limit" && (!limitPrice || parseFloat(limitPrice) <= 0)) {
      toast.error("Limit price required for limit orders");
      return;
    }

    if ((orderType === "stop_loss" || orderType === "take_profit") && (!stopPrice || parseFloat(stopPrice) <= 0)) {
      toast.error("Stop price required");
      return;
    }

    createOrderMutation.mutate({
      orderType,
      side,
      amount,
      limitPrice,
      stopPrice,
      timeInForce
    });
  };

  const orderTypes = [
    { value: "limit", label: "Limit Order", icon: Target, desc: "Buy/sell at specific price or better" },
    { value: "market", label: "Market Order", icon: Zap, desc: "Execute immediately at current price" },
    { value: "stop_loss", label: "Stop Loss", icon: Shield, desc: "Auto-sell when price drops to limit losses" },
    { value: "take_profit", label: "Take Profit", icon: TrendingUp, desc: "Auto-sell when price rises to lock gains" }
  ];

  const selectedOrderType = orderTypes.find(ot => ot.value === orderType);

  return (
    <div className="space-y-6">
      {/* Order Placement Form */}
      <Card className="bg-slate-900/60 border-purple-900/40">
        <CardHeader className="border-b border-purple-900/30">
          <CardTitle className="text-purple-200 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Advanced Order Placement
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Order Type Selector */}
            <div className="space-y-3">
              <Label className="text-purple-300">Order Type</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {orderTypes.map(type => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setOrderType(type.value)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        orderType === type.value
                          ? 'border-purple-500 bg-purple-900/30'
                          : 'border-purple-900/30 bg-slate-950/50 hover:border-purple-500/50'
                      }`}
                    >
                      <Icon className={`w-6 h-6 mx-auto mb-2 ${orderType === type.value ? 'text-purple-300' : 'text-purple-400/70'}`} />
                      <div className={`text-sm font-semibold ${orderType === type.value ? 'text-purple-200' : 'text-purple-300/70'}`}>
                        {type.label}
                      </div>
                    </button>
                  );
                })}
              </div>
              {selectedOrderType && (
                <p className="text-sm text-purple-400/70 italic">{selectedOrderType.desc}</p>
              )}
            </div>

            {/* Buy/Sell Toggle */}
            <div className="space-y-2">
              <Label className="text-purple-300">Side</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSide("buy")}
                  className={`p-3 rounded-lg border-2 font-semibold transition-all ${
                    side === "buy"
                      ? 'border-green-500 bg-green-900/30 text-green-200'
                      : 'border-purple-900/30 bg-slate-950/50 text-purple-400/70 hover:border-green-500/50'
                  }`}
                >
                  Buy / Long
                </button>
                <button
                  type="button"
                  onClick={() => setSide("sell")}
                  className={`p-3 rounded-lg border-2 font-semibold transition-all ${
                    side === "sell"
                      ? 'border-red-500 bg-red-900/30 text-red-200'
                      : 'border-purple-900/30 bg-slate-950/50 text-purple-400/70 hover:border-red-500/50'
                  }`}
                >
                  Sell / Short
                </button>
              </div>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-purple-300">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="bg-slate-950/50 border-purple-900/30 text-purple-100 text-lg"
                required
              />
            </div>

            {/* Limit Price (for limit orders) */}
            {orderType === "limit" && (
              <div className="space-y-2">
                <Label htmlFor="limitPrice" className="text-purple-300">Limit Price</Label>
                <Input
                  id="limitPrice"
                  type="number"
                  step="0.001"
                  min="0"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  placeholder="0.000"
                  className="bg-slate-950/50 border-purple-900/30 text-purple-100 text-lg"
                  required
                />
              </div>
            )}

            {/* Stop Price (for stop-loss/take-profit) */}
            {(orderType === "stop_loss" || orderType === "take_profit") && (
              <div className="space-y-2">
                <Label htmlFor="stopPrice" className="text-purple-300">
                  {orderType === "stop_loss" ? "Stop Loss Price" : "Take Profit Price"}
                </Label>
                <Input
                  id="stopPrice"
                  type="number"
                  step="0.001"
                  min="0"
                  value={stopPrice}
                  onChange={(e) => setStopPrice(e.target.value)}
                  placeholder="0.000"
                  className="bg-slate-950/50 border-purple-900/30 text-purple-100 text-lg"
                  required
                />
              </div>
            )}

            {/* Time in Force */}
            <div className="space-y-2">
              <Label className="text-purple-300">Time in Force</Label>
              <Select value={timeInForce} onValueChange={setTimeInForce}>
                <SelectTrigger className="bg-slate-950/50 border-purple-900/30 text-purple-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GTC">Good Till Cancelled</SelectItem>
                  <SelectItem value="IOC">Immediate or Cancel</SelectItem>
                  <SelectItem value="FOK">Fill or Kill</SelectItem>
                  <SelectItem value="DAY">Day Order</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              disabled={createOrderMutation.isPending || !user}
              className={`w-full font-semibold py-6 ${
                side === "buy"
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500'
                  : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500'
              }`}
            >
              {createOrderMutation.isPending ? 'Placing Order...' : `Place ${side.toUpperCase()} Order`}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <Card className="bg-slate-900/60 border-purple-900/40">
          <CardHeader className="border-b border-purple-900/30">
            <CardTitle className="text-purple-200 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Active Orders ({activeOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {activeOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-slate-950/50 rounded-lg border border-purple-900/30"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`${
                        order.side === 'buy' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'
                      } text-xs`}>
                        {order.side.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="border-purple-500/30 text-purple-300 text-xs capitalize">
                        {order.order_type.replace(/_/g, ' ')}
                      </Badge>
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                        {order.time_in_force}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-xs text-purple-400/70">Amount</div>
                        <div className="font-semibold text-purple-200">{order.amount}</div>
                      </div>
                      {order.limit_price && (
                        <div>
                          <div className="text-xs text-purple-400/70">Limit Price</div>
                          <div className="font-semibold text-purple-200">${order.limit_price.toFixed(3)}</div>
                        </div>
                      )}
                      {order.stop_price && (
                        <div>
                          <div className="text-xs text-purple-400/70">Stop Price</div>
                          <div className="font-semibold text-purple-200">${order.stop_price.toFixed(3)}</div>
                        </div>
                      )}
                      <div>
                        <div className="text-xs text-purple-400/70">Filled</div>
                        <div className="font-semibold text-cyan-300">
                          {((order.filled_amount / order.amount) * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => cancelOrderMutation.mutate(order.order_id)}
                    className="border-red-500/30 text-red-300 hover:bg-red-900/20"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}