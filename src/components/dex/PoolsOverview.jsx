import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function PoolsOverview() {
  return (
    <Card className="bg-slate-900/60 border-orange-900/40">
      <CardContent className="p-12 text-center">
        <BarChart3 className="w-16 h-16 mx-auto mb-4 text-orange-400/40" />
        <p className="text-orange-400/60">Pools overview coming soon</p>
      </CardContent>
    </Card>
  );
}