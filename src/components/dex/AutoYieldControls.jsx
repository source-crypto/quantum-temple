import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Rocket, ShieldCheck } from "lucide-react";

export default function AutoYieldControls() {
  const qc = useQueryClient();
  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });

  const updateMe = useMutation({
    mutationFn: async (payload) => base44.auth.updateMe(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["currentUser"] }),
  });

  const runNow = useMutation({
    mutationFn: async () => base44.functions.invoke("autoYield", { scope: "me" }),
  });

  const enabled = !!user?.auto_yield_enabled;
  const risk = user?.auto_yield_risk || "medium";
  const strategy = user?.auto_yield_strategy || "balanced";

  if (!user) return null;

  return (
    <Card className="bg-slate-900/60 border-purple-900/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-purple-200 text-sm flex items-center gap-2">
          <ShieldCheck className="w-4 h-4"/> Automated Yield
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row gap-3 items-start md:items-center">
        <div className="flex items-center gap-3">
          <Switch checked={enabled} onCheckedChange={(v) => updateMe.mutate({ auto_yield_enabled: v })} />
          <span className="text-sm text-purple-300/80">Enable automation</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-purple-400/80">Risk</span>
          <Select value={risk} onValueChange={(v) => updateMe.mutate({ auto_yield_risk: v })}>
            <SelectTrigger className="w-28"><SelectValue placeholder="Risk"/></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-purple-400/80">Strategy</span>
          <Select value={strategy} onValueChange={(v) => updateMe.mutate({ auto_yield_strategy: v })}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Strategy"/></SelectTrigger>
            <SelectContent>
              <SelectItem value="stable_only">Stable Only</SelectItem>
              <SelectItem value="balanced">Balanced</SelectItem>
              <SelectItem value="aggressive">Aggressive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="ml-auto">
          <Button size="sm" onClick={() => runNow.mutate()} className="gap-2">
            <Rocket className="w-4 h-4"/> Run Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}