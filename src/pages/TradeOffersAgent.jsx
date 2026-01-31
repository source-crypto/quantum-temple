import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Wand2, Play, MessageCircle, PhoneCall } from "lucide-react";

export default function TradeOffersAgent() {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isStarting, setIsStarting] = useState(false);

  // Subscribe to live updates
  useEffect(() => {
    if (!conversation?.id) return;
    const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages || []);
    });
    return () => {
      unsubscribe?.();
    };
  }, [conversation?.id]);

  const startConversation = async () => {
    const conv = await base44.agents.createConversation({
      agent_name: "trade_offers_liquidity",
      metadata: {
        name: "TradeOffers Autonomous Run",
        description: "Autonomous conservative liquidity operations across CEX & DEX",
      },
    });
    setConversation(conv);
    setMessages(conv.messages || []);
  };

  const sendMessage = async (content) => {
    if (!conversation) return;
    await base44.agents.addMessage(conversation, { role: "user", content });
  };

  const quickStart = async () => {
    setIsStarting(true);
    await startConversation();
    await new Promise((r) => setTimeout(r, 300));
    await sendMessage(
      "Begin fully autonomous live trading now. Operate hybrid (CEX + DEX). Enforce conservative risk: max $1,000/day total notional, max 0.5% per single order; avoid slippage >1%, skip illiquid pools. Use QTC and bridged forms (qQTC on EVM, sQTC on Solana). Record bridges in CrossChainBridge, swaps in Swap, orders in TradingOrder, LP adds/removes in LiquidityPosition, and maintain PortfolioHolding cost basis. If spreads >2% or volatility spikes, halve size. Provide a brief daily plan summary and proceed."
    );
    setIsStarting(false);
  };

  const whatsappUrl = useMemo(() => base44.agents.getWhatsAppConnectURL("trade_offers_liquidity"), []);

  return (
    <div className="p-6 md:p-10 space-y-6">
      <Card className="bg-slate-900/60 border-purple-900/40">
        <CardHeader className="flex items-center justify-between border-b border-purple-900/30">
          <CardTitle className="text-purple-200 flex items-center gap-2">
            <Wand2 className="w-5 h-5" /> TradeOffers Liquidity Agent
            <Badge className="ml-2 bg-purple-500/20 text-purple-300 border-purple-500/30">Autonomous</Badge>
          </CardTitle>
          <div className="flex gap-2">
            <a href={whatsappUrl} target="_blank" rel="noreferrer">
              <Button variant="outline" className="border-purple-500/30 text-purple-200 hover:bg-purple-900/30">
                <PhoneCall className="w-4 h-4 mr-2" /> WhatsApp
              </Button>
            </a>
            <Button onClick={quickStart} disabled={isStarting} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500">
              <Play className="w-4 h-4 mr-2" /> {isStarting ? "Starting…" : "Start Autonomous Run"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {!conversation && (
            <div className="rounded-lg border border-purple-900/30 bg-slate-950/40 p-4 text-sm text-purple-300/80">
              Click "Start Autonomous Run" to create a conversation and begin operations, or start a manual chat below.
              <div className="mt-3">
                <Button variant="outline" onClick={startConversation} className="border-purple-500/30 text-purple-200 hover:bg-purple-900/30">
                  <MessageCircle className="w-4 h-4 mr-2" /> Start Manual Chat
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="max-h-[50vh] overflow-auto rounded-lg border border-purple-900/30 bg-slate-950/40 p-4">
              {messages.length === 0 ? (
                <div className="text-sm text-purple-400/70">No messages yet.</div>
              ) : (
                <div className="space-y-3">
                  {messages.map((m, idx) => (
                    <div key={idx} className={"text-sm " + (m.role === "user" ? "text-purple-200" : "text-purple-300") }>
                      <div className="opacity-60 text-xs mb-1">{m.role === "user" ? "You" : "Agent"}</div>
                      <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 items-end">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message or instruction for the agent..."
                className="bg-slate-950/50 border-purple-900/30 text-purple-100"
              />
              <Button onClick={() => { if (input.trim()) { sendMessage(input.trim()); setInput(""); } }}>
                Send
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}