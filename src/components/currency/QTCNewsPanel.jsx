import React from "react";
import MarketNewsFeed from "../news/MarketNewsFeed";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Newspaper } from "lucide-react";

export default function QTCNewsPanel() {
  return (
    <div className="space-y-4">
      <Card className="bg-indigo-950/40 border-indigo-800/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-200">
            <Newspaper className="w-4 h-4" /> Market Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-indigo-300/80">
          Curated headlines with sentiment and impact estimates for QTC/DCI and adjacent crypto markets.
        </CardContent>
      </Card>
      <MarketNewsFeed />
    </div>
  );
}