import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Droplets } from "lucide-react";

export default function LiquidityInterface() {
  return (
    <Card className="bg-slate-900/60 border-indigo-900/40">
      <CardContent className="p-12 text-center">
        <Droplets className="w-16 h-16 mx-auto mb-4 text-indigo-400/40" />
        <p className="text-indigo-400/60">Liquidity interface coming soon</p>
      </CardContent>
    </Card>
  );
}