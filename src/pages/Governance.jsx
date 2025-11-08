import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Landmark, Vote, TrendingUp, Shield, FileText, DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import ProposalList from "../components/governance/ProposalList";
import CreateProposal from "../components/governance/CreateProposal";
import TreasuryDashboard from "../components/governance/TreasuryDashboard";

export default function Governance() {
  const [activeTab, setActiveTab] = useState("proposals");

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: userBalance } = useQuery({
    queryKey: ['userBalance'],
    queryFn: async () => {
      if (!user) return null;
      const balances = await base44.entities.UserBalance.filter({ user_email: user.email });
      return balances.length > 0 ? balances[0] : null;
    },
    enabled: !!user,
  });

  const votingPower = userBalance?.available_balance || 0;

  const tabs = [
    { id: "proposals", label: "Proposals", icon: FileText, color: "from-blue-600 to-cyan-600" },
    { id: "create", label: "Create Proposal", icon: Vote, color: "from-purple-600 to-indigo-600" },
    { id: "treasury", label: "Treasury", icon: Landmark, color: "from-amber-600 to-orange-600" },
  ];

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Landmark className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-300 bg-clip-text text-transparent">
                Decentralized Governance
              </h1>
              <p className="text-purple-400/70">Shape the future of Quantum Temple Currency</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-900/60 rounded-lg border border-blue-900/30">
              <div className="flex items-center gap-2 mb-2">
                <Vote className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-blue-400/70">Your Voting Power</span>
              </div>
              <div className="text-xl font-bold text-blue-300">{votingPower.toLocaleString()} QTC</div>
            </div>
            <div className="p-4 bg-slate-900/60 rounded-lg border border-purple-900/30">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-purple-400/70">Active Proposals</span>
              </div>
              <div className="text-xl font-bold text-purple-300">-</div>
            </div>
            <div className="p-4 bg-slate-900/60 rounded-lg border border-amber-900/30">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-amber-400/70">Treasury Value</span>
              </div>
              <div className="text-xl font-bold text-amber-300">$560B+</div>
            </div>
            <div className="p-4 bg-slate-900/60 rounded-lg border border-green-900/30">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-xs text-green-400/70">IMF Compliance</span>
              </div>
              <div className="text-sm font-bold text-green-300">Active</div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex gap-2 bg-slate-900/60 p-2 rounded-xl border border-purple-900/30 overflow-x-auto">
            {tabs.map(tab => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap ${activeTab === tab.id 
                  ? `bg-gradient-to-r ${tab.color} text-white`
                  : "text-purple-300 hover:text-purple-200 hover:bg-purple-900/30"
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "proposals" && (
            <motion.div
              key="proposals"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <ProposalList votingPower={votingPower} />
            </motion.div>
          )}

          {activeTab === "create" && (
            <motion.div
              key="create"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <CreateProposal votingPower={votingPower} />
            </motion.div>
          )}

          {activeTab === "treasury" && (
            <motion.div
              key="treasury"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <TreasuryDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}