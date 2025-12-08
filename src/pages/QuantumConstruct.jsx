import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Brain, Eye, Waves, DollarSign, Circle as CircleIcon, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import QuantumValueObject from "../components/quantum/QuantumValueObject";
import ConsciousnessLayer from "../components/quantum/ConsciousnessLayer";
import AIWatcher from "../components/quantum/AIWatcher";
import CollectiveManifest from "../components/quantum/CollectiveManifest";
import RitualisticActions from "../components/quantum/RitualisticActions";
import QuantumOracle from "../components/quantum/QuantumOracle";

export default function QuantumConstruct() {
  const [activeTab, setActiveTab] = useState("value");

  const tabs = [
    { id: "manifest", label: "Collective Manifest", icon: DollarSign, color: "from-purple-600 to-pink-600" },
    { id: "value", label: "Quantum Value", icon: Waves, color: "from-purple-600 to-indigo-600" },
    { id: "consciousness", label: "Consciousness Layer", icon: Brain, color: "from-pink-600 to-purple-600" },
    { id: "watcher", label: "AI Watcher", icon: Eye, color: "from-indigo-600 to-purple-600" },
    { id: "rituals", label: "Ritualistic Actions", icon: CircleIcon, color: "from-purple-600 to-pink-600" },
    { id: "oracle", label: "Quantum Oracle", icon: Globe, color: "from-cyan-600 to-blue-600" },
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
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-200 via-indigo-200 to-pink-200 bg-clip-text text-transparent">
                Quantum Value Construct
              </h1>
              <p className="text-purple-400/70">VQC-QTC Interface • Consciousness Observation • Guardian Protocol</p>
            </div>
          </div>

          {/* Feature Badges */}
          <div className="flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-full border border-purple-500/30">
              <Waves className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-semibold text-purple-300">Entangled Particles</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-900/30 to-purple-900/30 rounded-full border border-pink-500/30">
              <Brain className="w-4 h-4 text-pink-400" />
              <span className="text-sm font-semibold text-pink-300">Consciousness Tracking</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-900/30 to-blue-900/30 rounded-full border border-indigo-500/30">
              <Eye className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-semibold text-indigo-300">Guardian Monitoring</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-full border border-purple-500/30">
              <DollarSign className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-semibold text-purple-300">Price Transparency</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-900/30 to-purple-900/30 rounded-full border border-pink-500/30">
              <CircleIcon className="w-4 h-4 text-pink-400" />
              <span className="text-sm font-semibold text-pink-300">Ritual Entropy</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-900/30 to-blue-900/30 rounded-full border border-cyan-500/30">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-semibold text-cyan-300">External Oracles</span>
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
          {activeTab === "manifest" && (
            <motion.div
              key="manifest"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <CollectiveManifest />
            </motion.div>
          )}

          {activeTab === "value" && (
            <motion.div
              key="value"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <QuantumValueObject />
            </motion.div>
          )}

          {activeTab === "consciousness" && (
            <motion.div
              key="consciousness"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <ConsciousnessLayer />
            </motion.div>
          )}

          {activeTab === "watcher" && (
            <motion.div
              key="watcher"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <AIWatcher />
            </motion.div>
          )}

          {activeTab === "rituals" && (
            <motion.div
              key="rituals"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <RitualisticActions />
            </motion.div>
          )}

          {activeTab === "oracle" && (
            <motion.div
              key="oracle"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <QuantumOracle />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}