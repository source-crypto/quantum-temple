import React, { useState } from "react";
import TradingViewWidget from "./TradingViewWidget";
import StopOrderForm from "./StopOrderForm";
import OrderBookView from "../markets/OrderBookView";
import TradeHistory from "./TradeHistory";
import QTCPaymentAdoption from "./QTCPaymentAdoption";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const symbols = [
  { label: "BTC/USDT", value: "BINANCE:BTCUSDT" },
  { label: "ETH/USDT", value: "BINANCE:ETHUSDT" },
  { label: "QTC/USD (ref)", value: "BINANCE:BTCUSDT" },
];

export default function TradingTerminal() {
  const [symbol, setSymbol] = useState(symbols[0].value);

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        <Card className="bg-slate-900/60 border-purple-900/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-purple-200">Advanced Chart</CardTitle>
            <div className="w-48">
              <Select value={symbol} onValueChange={setSymbol}>
                <SelectTrigger className="bg-slate-950/50 border-purple-900/30 text-purple-100">
                  <SelectValue placeholder="Symbol" />
                </SelectTrigger>
                <SelectContent>
                  {symbols.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <TradingViewWidget symbol={symbol} />
          </CardContent>
        </Card>

        <TradeHistory />
      </div>

      <div className="lg:col-span-1 space-y-4">
        <StopOrderForm />
        <QTCPaymentAdoption />
        <OrderBookView />
      </div>
    </div>
  );
}