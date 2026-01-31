import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DollarSign, PauseCircle, Play, Wallet } from "lucide-react";

export default function TreasuryQuickActions() {
  const [amount, setAmount] = useState(10000);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async (action) => {
    setLoading(true);
    setStatus("");
    try {
      const res = await base44.functions.invoke('treasurySpend', {
        action,
        amount_usd: Number(amount),
        memo: `Quick action: ${action}`,
      });
      if (res?.status === 200) setStatus(`${action} executed`);
      else setStatus(`Failed: ${res?.status}`);
    } catch (e) {
      setStatus(`Error: ${e?.message || 'unknown'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-slate-900/60 border-purple-900/40">
      <CardHeader>
        <CardTitle className="text-purple-200 flex items-center gap-2">
          <Wallet className="w-5 h-5" /> Treasury Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row md:items-end gap-3">
          <div className="flex-1">
            <label className="text-xs text-purple-400/70">Amount (USD)</label>
            <Input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} className="bg-slate-950/50 border-purple-900/30 text-purple-100" />
          </div>
          <div className="flex gap-2">
            <Button disabled={loading} onClick={() => run('fund')} className="bg-amber-600 hover:bg-amber-700"><DollarSign className="w-4 h-4" /> Fund</Button>
            <Button disabled={loading} onClick={() => run('pause')} variant="outline" className=""><PauseCircle className="w-4 h-4" /> Pause</Button>
            <Button disabled={loading} onClick={() => run('withdraw')} className="bg-emerald-600 hover:bg-emerald-700"><Play className="w-4 h-4" /> Withdraw</Button>
          </div>
        </div>
        {status && <div className="text-xs mt-2 text-purple-300">{status}</div>}
      </CardContent>
    </Card>
  );
}