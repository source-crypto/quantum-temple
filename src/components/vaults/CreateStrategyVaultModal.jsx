import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { Plus, Minus, Zap } from "lucide-react";

const ORACLE_NODES = ["Alpha Oracle", "Beta Oracle", "Gamma Oracle", "Delta Oracle", "Omega Oracle"];

export default function CreateStrategyVaultModal({ open, onClose, user }) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [risk, setRisk] = useState("medium");
  const [fee, setFee] = useState("10");
  const [autoCompound, setAutoCompound] = useState(true);
  const [allocations, setAllocations] = useState([{ oracle_node: "Alpha Oracle", weight_pct: 100 }]);

  const totalWeight = allocations.reduce((s, a) => s + (Number(a.weight_pct) || 0), 0);

  const addAllocation = () => {
    const unused = ORACLE_NODES.find((n) => !allocations.find((a) => a.oracle_node === n));
    if (unused) setAllocations([...allocations, { oracle_node: unused, weight_pct: 0 }]);
  };

  const removeAllocation = (idx) => setAllocations(allocations.filter((_, i) => i !== idx));

  const updateAllocation = (idx, field, value) => {
    setAllocations(allocations.map((a, i) => (i === idx ? { ...a, [field]: value } : a)));
  };

  const create = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error("Vault name required");
      if (totalWeight !== 100) throw new Error("Allocations must sum to 100%");
      const feeNum = parseFloat(fee);
      if (isNaN(feeNum) || feeNum < 0 || feeNum > 30) throw new Error("Fee must be 0–30%");
      await base44.entities.StrategyVault.create({
        name: name.trim(),
        creator_email: user.email,
        creator_display: displayName.trim() || user.full_name || user.email,
        description: description.trim(),
        oracle_allocations: allocations,
        risk_level: risk,
        performance_fee_pct: feeNum,
        auto_compound: autoCompound,
        is_public: true,
        status: "active",
        current_apy: allocations.reduce((s, a) => {
          const base = { "Alpha Oracle": 14.8, "Beta Oracle": 20.1, "Gamma Oracle": 11.5, "Delta Oracle": 24.1, "Omega Oracle": 9.8 };
          return s + (base[a.oracle_node] || 10) * (Number(a.weight_pct) / 100);
        }, 0),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries(["strategyVaults"]);
      toast({ title: "Strategy Vault created!", description: `${name} is now public.` });
      onClose();
      setName(""); setDescription(""); setDisplayName("");
    },
    onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-purple-800/50 text-purple-100 max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-purple-200">Create Public Strategy Vault</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <div className="text-xs text-purple-400/70 mb-1">Vault Name *</div>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Alpha Strategy" className="bg-slate-800 border-purple-800/50 text-purple-100" />
          </div>

          <div>
            <div className="text-xs text-purple-400/70 mb-1">Your Public Display Name</div>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="e.g. QuantumWhale" className="bg-slate-800 border-purple-800/50 text-purple-100" />
          </div>

          <div>
            <div className="text-xs text-purple-400/70 mb-1">Strategy Description</div>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your strategy..." rows={2} className="bg-slate-800 border-purple-800/50 text-purple-100 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-purple-400/70 mb-1">Risk Level</div>
              <Select value={risk} onValueChange={setRisk}>
                <SelectTrigger className="bg-slate-800 border-purple-800/50 text-purple-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-purple-800/50">
                  <SelectItem value="low" className="text-purple-200">Low</SelectItem>
                  <SelectItem value="medium" className="text-purple-200">Medium</SelectItem>
                  <SelectItem value="high" className="text-purple-200">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="text-xs text-purple-400/70 mb-1">Performance Fee %</div>
              <Input type="number" value={fee} onChange={(e) => setFee(e.target.value)} min="0" max="30" className="bg-slate-800 border-purple-800/50 text-purple-100" />
            </div>
          </div>

          {/* Oracle Allocations */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="text-xs text-purple-400/70">Oracle Node Allocations</div>
              <div className={`text-xs font-semibold ${totalWeight === 100 ? "text-emerald-400" : "text-red-400"}`}>
                Total: {totalWeight}%
              </div>
            </div>
            <div className="space-y-2">
              {allocations.map((a, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Select value={a.oracle_node} onValueChange={(v) => updateAllocation(i, "oracle_node", v)}>
                    <SelectTrigger className="flex-1 bg-slate-800 border-purple-800/50 text-purple-100 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-purple-800/50">
                      {ORACLE_NODES.map((n) => (
                        <SelectItem key={n} value={n} className="text-purple-200 text-xs">{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    value={a.weight_pct}
                    onChange={(e) => updateAllocation(i, "weight_pct", e.target.value)}
                    className="w-20 h-8 text-xs bg-slate-800 border-purple-800/50 text-purple-100"
                    placeholder="%"
                  />
                  <span className="text-purple-400/60 text-xs">%</span>
                  {allocations.length > 1 && (
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:bg-red-900/20" onClick={() => removeAllocation(i)}>
                      <Minus className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {allocations.length < ORACLE_NODES.length && (
              <Button variant="ghost" size="sm" onClick={addAllocation} className="mt-2 text-purple-400 hover:text-purple-300 text-xs">
                <Plus className="w-3 h-3 mr-1" /> Add Oracle
              </Button>
            )}
          </div>

          <Button
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500"
            onClick={() => create.mutate()}
            disabled={create.isPending}
          >
            <Zap className="w-4 h-4 mr-2" />
            {create.isPending ? "Creating…" : "Launch Strategy Vault"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}