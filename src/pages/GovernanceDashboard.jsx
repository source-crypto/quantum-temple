import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Vote, Landmark, Activity, Cpu } from "lucide-react";

import ProposalVotePanel from "../components/governance/ProposalVotePanel";
import TreasuryAllocationView from "../components/governance/TreasuryAllocationView";
import StakeSimulator from "../components/governance/StakeSimulator";

const TABS = [
  { id: "proposals", label: "Active Proposals", icon: Vote },
  { id: "treasury",  label: "Treasury Allocation", icon: Landmark },
  { id: "simulate",  label: "Stake Simulator", icon: Cpu },
];

export default function GovernanceDashboard() {
  const [tab, setTab] = useState("proposals");

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const { data: userBalance } = useQuery({
    queryKey: ["userBalance"],
    queryFn: async () => {
      if (!user) return null;
      const b = await base44.entities.UserBalance.filter({ user_email: user.email });
      return b[0] || null;
    },
    enabled: !!user,
  });

  const { data: divineFavor } = useQuery({
    queryKey: ["divineFavor", user?.email],
    queryFn: async () => {
      if (!user) return null;
      const f = await base44.entities.DivineFavor.filter({ created_by: user.email });
      return f[0] || null;
    },
    enabled: !!user,
  });

  const availableQTC = userBalance?.available_balance || 0;
  const stakedQTC = divineFavor?.staked_amount || userBalance?.staked_balance || 0;
  const votingPower = stakedQTC || availableQTC;
  const totalQTC = availableQTC + stakedQTC;

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-200 via-purple-200 to-violet-300 bg-clip-text text-transparent">
                Governance Dashboard
              </h1>
              <p className="text-purple-400/70 text-sm mt-0.5">
                Vote on proposals · Monitor treasury · Simulate stake allocation
              </p>
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="bg-slate-900/60 border-purple-900/40">
              <CardContent className="p-3">
                <div className="text-xs text-purple-400/70 mb-1">Voting Power</div>
                <div className="text-lg font-bold text-purple-200">{votingPower.toLocaleString()} QTC</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/60 border-cyan-900/40">
              <CardContent className="p-3">
                <div className="text-xs text-cyan-400/70 mb-1">Available Balance</div>
                <div className="text-lg font-bold text-cyan-200">{availableQTC.toLocaleString()} QTC</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/60 border-emerald-900/40">
              <CardContent className="p-3">
                <div className="text-xs text-emerald-400/70 mb-1">Currently Staked</div>
                <div className="text-lg font-bold text-emerald-200">{stakedQTC.toLocaleString()} QTC</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/60 border-amber-900/40">
              <CardContent className="p-3">
                <div className="text-xs text-amber-400/70 mb-1">Favor Level</div>
                <div className="text-lg font-bold text-amber-200">{divineFavor?.favor_level ?? "—"}</div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Tab nav */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 bg-slate-900/60 p-2 rounded-xl border border-purple-900/30 overflow-x-auto"
        >
          {TABS.map((t) => (
            <Button
              key={t.id}
              variant={tab === t.id ? "default" : "ghost"}
              onClick={() => setTab(t.id)}
              className={`whitespace-nowrap ${
                tab === t.id
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                  : "text-purple-300 hover:text-purple-200 hover:bg-purple-900/30"
              }`}
            >
              <t.icon className="w-4 h-4 mr-2" />
              {t.label}
            </Button>
          ))}
        </motion.div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.2 }}
          >
            {tab === "proposals" && (
              <ProposalVotePanel votingPower={votingPower} user={user} />
            )}
            {tab === "treasury" && <TreasuryAllocationView />}
            {tab === "simulate" && <StakeSimulator totalQTC={totalQTC || 10000} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}