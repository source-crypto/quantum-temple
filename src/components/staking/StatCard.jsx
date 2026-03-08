import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StatCard({ title, value, subtext, right }) {
  return (
    <Card className="bg-slate-950/60 border-purple-900/40">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium text-purple-300/80">{title}</CardTitle>
        {right}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-purple-100">{value}</div>
        {subtext ? (
          <div className="text-xs text-purple-400/70 mt-1">{subtext}</div>
        ) : null}
      </CardContent>
    </Card>
  );
}