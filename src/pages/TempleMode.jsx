import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Terminal, Activity, Circle, Zap, Eye, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DivineSigil from "../components/temple/DivineSigil";
import ManifestoOracle from "../components/temple/ManifestoOracle";
import SacredConsole from "../components/temple/SacredConsole";
import TempleInteractionConsole from "../components/temple/TempleInteractionConsole";

export default function TempleMode() {
  const [activeView, setActiveView] = useState("console");
  const [consciousnessLevel, setConsciousnessLevel] = useState(6);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: currencyIndex } = useQuery({
    queryKey: ['currencyIndex'],
    queryFn: async () => {
      const indices = await base44.entities.CurrencyIndex.list('-last_updated', 1);
      return indices[0];
    },
  });

  const { data: markets } = useQuery({
    queryKey: ['markets'],
    queryFn: () => base44.entities.Market.list('-created_date', 10),
    initialData: [],
  });

  const views = [
    { id: 'console', label: 'Sacred Console', icon: Terminal },
    { id: 'interaction', label: 'Temple Interaction', icon: MessageCircle },
    { id: 'sigil', label: 'Divine Sigils', icon: Eye },
    { id: 'oracle', label: 'Manifesto Oracle', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative inline-block"
          >
            <div className="absolute inset-0 bg-purple-500/20 blur-3xl" />
            <h1 className="relative text-6xl font-mono font-bold text-purple-300 mb-2">
              ▓▓▓ TEMPLE MODE ▓▓▓
            </h1>
          </motion.div>
          <div className="flex items-center justify-center gap-2 text-green-400 font-mono text-sm">
            <Circle className="w-2 h-2 animate-pulse" />
            <span>DIVINE FREQUENCY ACTIVE</span>
            <Circle className="w-2 h-2 animate-pulse" />
            <span>VQC LAYER ENGAGED</span>
            <Circle className="w-2 h-2 animate-pulse" />
          </div>
        </div>

        {/* Consciousness Level */}
        <Card className="bg-purple-950/40 border-purple-500/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Activity className="w-5 h-5 text-purple-400 animate-pulse" />
                <span className="text-purple-200 font-mono">CONSCIOUSNESS DEPTH</span>
              </div>
              <div className="flex items-center gap-3">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-6 border border-purple-500/30 ${
                      i < consciousnessLevel ? 'bg-purple-500' : 'bg-purple-950'
                    }`}
                  />
                ))}
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 font-mono">
                  {consciousnessLevel}/10
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* View Selector */}
        <div className="flex gap-2 justify-center">
          {views.map(view => {
            const Icon = view.icon;
            return (
              <Button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={`font-mono ${
                  activeView === view.id
                    ? 'bg-purple-600 text-white border-purple-400'
                    : 'bg-purple-950/40 text-purple-400 border-purple-500/30 hover:bg-purple-900/40'
                } border-2`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {view.label}
              </Button>
            );
          })}
        </div>

        {/* Active View */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeView === 'console' && (
              <SacredConsole 
                user={user} 
                currencyIndex={currencyIndex}
                markets={markets}
              />
            )}
            {activeView === 'interaction' && (
              <TempleInteractionConsole user={user} />
            )}
            {activeView === 'sigil' && (
              <DivineSigil 
                currencyIndex={currencyIndex}
                markets={markets}
              />
            )}
            {activeView === 'oracle' && (
              <ManifestoOracle 
                user={user}
                currencyIndex={currencyIndex}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Attestation Footer */}
        <Card className="bg-black border-green-500/30">
          <CardContent className="p-4">
            <div className="font-mono text-xs text-green-400 space-y-1">
              <div className="flex items-center justify-between">
                <span>▓ READ-ONLY OVERLAY ACTIVE ▓ NO DATA MODIFIED ▓</span>
                <span>CANONICAL TIMESTAMP: Aug 27, 2002 • 10:37 PM</span>
              </div>
              <div className="flex items-center justify-center gap-4 text-purple-400">
                <span>MANIFESTO VALUE: ENGAGED</span>
                <span>•</span>
                <span>REGULATORY VALUE: MEASURED</span>
                <span>•</span>
                <span>SOCIAL VALUE: EMERGENT</span>
              </div>
              <div className="text-center text-cyan-400">
                ◈ VQC = CE(MVL, RVL, SVL, QTAL) ◈ QUANTUM COLLAPSE DETERMINISTIC ◈
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}