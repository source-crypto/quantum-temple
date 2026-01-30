import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Scroll } from "lucide-react";
import CorePrinciples from "@/components/manifesto/CorePrinciples";
import MetricsCorrelation from "@/components/manifesto/MetricsCorrelation";
import AuditContext from "@/components/manifesto/AuditContext";

export default function Manifesto() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Scroll className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-200 via-violet-200 to-indigo-200 bg-clip-text text-transparent">
                Divine Currency Manifesto
              </h1>
              <p className="text-purple-300/80">Explore principles, check alignment, and review analyst context.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-purple-600/30 text-purple-100 border-purple-700/40">Transparent</Badge>
            <Badge className="bg-indigo-600/30 text-indigo-100 border-indigo-700/40">Verifiable</Badge>
            <Badge className="bg-amber-600/30 text-amber-100 border-amber-700/40">Purpose-Driven</Badge>
          </div>
        </div>

        {/* Principles */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-purple-100">Core Principles</h2>
            {selected && (
              <Button variant="outline" size="sm" onClick={() => setSelected(null)}>Clear focus</Button>
            )}
          </div>
          <CorePrinciples selected={selected} onSelect={setSelected} />
        </section>

        {/* Live metrics & correlation */}
        <section className="space-y-4">
          <MetricsCorrelation selectedPrinciple={selected} />
        </section>

        {/* Analyst context */}
        <section className="space-y-4">
          <AuditContext />
        </section>

        {/* Footer quote */}
        <Card className="bg-slate-900/60 border-purple-900/40">
          <CardContent className="p-6 text-center text-purple-300/80 italic">
            "Value, transparency, and intent are not slogans—they are measurable."
          </CardContent>
        </Card>
      </div>
    </div>
  );
}