import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Eye, Scale, Atom, Target } from "lucide-react";

const PRINCIPLES = [
  {
    id: "value",
    title: "Value Rooted in Reality",
    description:
      "Currency value emerges from transparent metrics, real activity, and verifiable intent.",
    icon: Target,
    keyMetrics: ["qtc_unit_price_usd", "volume_24h_usd", "price_change_24h"],
  },
  {
    id: "transparency",
    title: "Radical Transparency",
    description:
      "Supply, flows, and decisions remain observable and auditable by everyone.",
    icon: Eye,
    keyMetrics: ["total_qtc_supply", "total_transactions_24h", "circulating_supply"],
  },
  {
    id: "intent",
    title: "Aligned Intent",
    description:
      "Economic coordination aligns with clearly stated purposes and social good.",
    icon: ShieldCheck,
    keyMetrics: ["intervention_active", "market_cap_rank"],
  },
  {
    id: "equity",
    title: "Equitable Access",
    description:
      "Fair participation regardless of origin—fees, speed, and access matter.",
    icon: Scale,
    keyMetrics: ["qtc_to_btc_rate", "qtc_to_eth_rate"],
  },
  {
    id: "verifiability",
    title: "Quantum Verifiability",
    description:
      "Trust comes from cryptographic proofs and independent validation layers.",
    icon: Atom,
    keyMetrics: ["last_updated"],
  },
];

export default function CorePrinciples({ selected, onSelect }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {PRINCIPLES.map((p) => {
        const Icon = p.icon;
        const isActive = selected === p.id;
        return (
          <Card
            key={p.id}
            className={`bg-slate-900/60 border-purple-900/40 transition-all ${
              isActive ? "ring-2 ring-purple-500/50" : "hover:border-purple-700/40"
            }`}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-purple-100">
                  <Icon className="w-5 h-5" /> {p.title}
                </CardTitle>
                <Button size="sm" variant={isActive ? "secondary" : "outline"} onClick={() => onSelect?.(isActive ? null : p.id)}>
                  {isActive ? "Selected" : "Explore"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-purple-300/80">{p.description}</p>
              <div className="flex flex-wrap gap-2">
                {p.keyMetrics.map((m) => (
                  <Badge key={m} variant="outline" className="text-xs text-purple-200 border-purple-800/50">
                    {m}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}