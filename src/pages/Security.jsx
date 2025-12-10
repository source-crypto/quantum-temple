import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Shield, Database, Lock, Zap, Brain } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import DivineFortress from "../components/security/DivineFortress";
import LedgerIntegrity from "../components/security/LedgerIntegrity";
import QuantumNodeMonitor from "../components/security/QuantumNodeMonitor";
import AINodeManager from "../components/security/AINodeManager";

export default function Security() {
  const [activeTab, setActiveTab] = useState("fortress");

  const tabs = [
    { id: "fortress", label: "Divine Fortress", icon: Shield, color: "from-amber-600 to-orange-600" },
    { id: "quantum", label: "Quantum Nodes", icon: Zap, color: "from-purple-600 to-indigo-600" },
    { id: "ai", label: "AI Node Manager", icon: Brain, color: "from-indigo-600 to-purple-600" },
    { id: "integrity", label: "Ledger Integrity", icon: Database, color: "from-green-600 to-emerald-600" },
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
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-200 via-orange-200 to-amber-300 bg-clip-text text-transparent">
                Divine Security
              </h1>
              <p className="text-purple-400/70">Platform protection by God's ordinance • AI-powered quantum monitoring</p>
            </div>
          </div>

          {/* Security Status Banner */}
          <div className="p-4 bg-green-950/30 rounded-lg border border-green-500/30">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-green-400" />
              <div>
                <div className="font-semibold text-green-200">All Systems Secure</div>
                <div className="text-sm text-green-300/70">
                  Divine fortress active • Quantum nodes optimized • Ledger integrity: 100%
                </div>
              </div>
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
          {activeTab === "fortress" && (
            <motion.div
              key="fortress"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <DivineFortress />
            </motion.div>
          )}

          {activeTab === "quantum" && (
            <motion.div
              key="quantum"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <QuantumNodeMonitor />
            </motion.div>
          )}

          {activeTab === "ai" && (
            <motion.div
              key="ai"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <AINodeManager />
            </motion.div>
          )}

          {activeTab === "integrity" && (
            <motion.div
              key="integrity"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <LedgerIntegrity />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}