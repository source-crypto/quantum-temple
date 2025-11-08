import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export default function YieldFarming() {
  return (
    <Card className="bg-slate-900/60 border-green-900/40">
      <CardContent className="p-12 text-center">
        <TrendingUp className="w-16 h-16 mx-auto mb-4 text-green-400/40" />
        <p className="text-green-400/60">Yield farming interface coming soon</p>
      </CardContent>
    </Card>
  );
}