import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Landmark } from "lucide-react";

export default function TreasuryDashboard() {
  return (
    <Card className="bg-slate-900/60 border-amber-900/40">
      <CardContent className="p-12 text-center">
        <Landmark className="w-16 h-16 mx-auto mb-4 text-amber-400/40" />
        <p className="text-amber-400/60">Treasury dashboard coming soon</p>
      </CardContent>
    </Card>
  );
}