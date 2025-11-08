import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Repeat } from "lucide-react";

export default function SwapInterface() {
  return (
    <Card className="bg-slate-900/60 border-cyan-900/40">
      <CardContent className="p-12 text-center">
        <Repeat className="w-16 h-16 mx-auto mb-4 text-cyan-400/40" />
        <p className="text-cyan-400/60">Swap interface coming soon</p>
      </CardContent>
    </Card>
  );
}