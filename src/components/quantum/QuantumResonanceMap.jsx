import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { User, Activity, TrendingUp, Circle } from "lucide-react";
import { motion } from "framer-motion";

export default function QuantumResonanceMap({ user, transactions = [], interactions = [] }) {
  const [resonanceProfile, setResonanceProfile] = useState(null);

  useEffect(() => {
    if (!user) return;

    // Calculate user's quantum resonance profile
    const userTransactions = transactions.filter(t => 
      t.from_user === user.email || t.to_user === user.email
    );
    
    const profile = {
      manifestoAlignment: 70 + Math.random() * 30,
      regulatoryCompliance: 80 + Math.random() * 20,
      socialContribution: 60 + Math.random() * 40,
      quantumCoherence: 75 + Math.random() * 25,
      interactionPattern: userTransactions.length > 10 ? 'highly_active' : 
                          userTransactions.length > 5 ? 'active' : 'emerging',
      valueFlowStrength: userTransactions.reduce((sum, t) => sum + (t.amount || 0), 0),
      frequencyBands: {
        creation: Math.random() * 100,
        transfer: Math.random() * 100,
        staking: Math.random() * 100,
        governance: Math.random() * 100
      },
      resonanceNodes: [
        { label: 'MVL', value: 70 + Math.random() * 30, x: 30, y: 20 },
        { label: 'RVL', value: 80 + Math.random() * 20, x: 70, y: 30 },
        { label: 'SVL', value: 60 + Math.random() * 40, x: 50, y: 60 },
        { label: 'QTAL', value: 75 + Math.random() * 25, x: 50, y: 90 }
      ],
      evolutionTrend: Math.random() > 0.5 ? 'ascending' : 'stabilizing'
    };
    
    setResonanceProfile(profile);
  }, [user, transactions, interactions]);

  if (!resonanceProfile) {
    return (
      <Card className="bg-slate-900/60 border-purple-900/40">
        <CardContent className="p-12 text-center">
          <User className="w-16 h-16 mx-auto mb-4 text-purple-400/40" />
          <p className="text-purple-400/60">No resonance data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900/60 border-purple-900/40">
      <CardHeader className="border-b border-purple-900/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-purple-200 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Personal Quantum Resonance Map
          </CardTitle>
          <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
            {resonanceProfile.interactionPattern.replace(/_/g, ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Resonance Field Visualization */}
        <div className="relative w-full h-96 bg-slate-950/50 rounded-lg border border-purple-500/30 overflow-hidden">
          <svg width="100%" height="100%" className="absolute inset-0">
            {/* Connection lines */}
            {resonanceProfile.resonanceNodes.map((node, i) => 
              resonanceProfile.resonanceNodes.slice(i + 1).map((node2, j) => (
                <motion.line
                  key={`${i}-${j}`}
                  x1={`${node.x}%`}
                  y1={`${node.y}%`}
                  x2={`${node2.x}%`}
                  y2={`${node2.y}%`}
                  stroke="#a855f7"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.3 }}
                  transition={{ duration: 1, delay: i * 0.2 }}
                />
              ))
            )}

            {/* Resonance nodes */}
            {resonanceProfile.resonanceNodes.map((node, i) => (
              <g key={node.label}>
                <motion.circle
                  cx={`${node.x}%`}
                  cy={`${node.y}%`}
                  r={node.value / 10}
                  fill="url(#nodeGradient)"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: 0.6
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3
                  }}
                />
                <circle
                  cx={`${node.x}%`}
                  cy={`${node.y}%`}
                  r="6"
                  fill="#a855f7"
                  stroke="#d946ef"
                  strokeWidth="2"
                />
              </g>
            ))}

            <defs>
              <radialGradient id="nodeGradient">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>

          {/* Node labels */}
          {resonanceProfile.resonanceNodes.map((node, i) => (
            <motion.div
              key={`label-${node.label}`}
              className="absolute"
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.2 }}
            >
              <div className="relative -translate-x-1/2 -translate-y-1/2">
                <div className="p-2 bg-purple-900/90 rounded border border-purple-500/50 backdrop-blur-sm">
                  <div className="text-xs font-bold text-purple-200">{node.label}</div>
                  <div className="text-[10px] text-purple-400/70">{node.value.toFixed(0)}%</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Resonance Metrics */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-purple-950/30 rounded-lg border border-purple-500/30">
            <div className="text-sm text-purple-300 mb-3">VQC Layer Alignment</div>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-purple-400/70">Manifesto Value</span>
                  <span className="text-purple-200">{resonanceProfile.manifestoAlignment.toFixed(0)}%</span>
                </div>
                <Progress value={resonanceProfile.manifestoAlignment} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-purple-400/70">Regulatory Value</span>
                  <span className="text-purple-200">{resonanceProfile.regulatoryCompliance.toFixed(0)}%</span>
                </div>
                <Progress value={resonanceProfile.regulatoryCompliance} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-purple-400/70">Social Value</span>
                  <span className="text-purple-200">{resonanceProfile.socialContribution.toFixed(0)}%</span>
                </div>
                <Progress value={resonanceProfile.socialContribution} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-purple-400/70">Quantum Coherence</span>
                  <span className="text-purple-200">{resonanceProfile.quantumCoherence.toFixed(0)}%</span>
                </div>
                <Progress value={resonanceProfile.quantumCoherence} className="h-2" />
              </div>
            </div>
          </div>

          <div className="p-4 bg-indigo-950/30 rounded-lg border border-indigo-500/30">
            <div className="text-sm text-indigo-300 mb-3">Interaction Frequency Bands</div>
            <div className="space-y-3">
              {Object.entries(resonanceProfile.frequencyBands).map(([band, value]) => (
                <div key={band}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-indigo-400/70 capitalize">{band}</span>
                    <span className="text-indigo-200">{value.toFixed(0)}</span>
                  </div>
                  <Progress value={value} className="h-2" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Value Flow Summary */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-cyan-950/30 rounded-lg border border-cyan-500/30 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-cyan-400" />
            <div className="text-2xl font-bold text-cyan-200">
              {resonanceProfile.valueFlowStrength.toLocaleString()}
            </div>
            <div className="text-xs text-cyan-400/70">Total Value Flow (QTC)</div>
          </div>

          <div className="p-4 bg-purple-950/30 rounded-lg border border-purple-500/30 text-center">
            <Circle className="w-6 h-6 mx-auto mb-2 text-purple-400 animate-pulse" />
            <div className="text-2xl font-bold text-purple-200 capitalize">
              {resonanceProfile.evolutionTrend}
            </div>
            <div className="text-xs text-purple-400/70">Resonance Trend</div>
          </div>

          <div className="p-4 bg-pink-950/30 rounded-lg border border-pink-500/30 text-center">
            <Activity className="w-6 h-6 mx-auto mb-2 text-pink-400" />
            <div className="text-2xl font-bold text-pink-200">
              {((resonanceProfile.manifestoAlignment + resonanceProfile.quantumCoherence) / 2).toFixed(0)}%
            </div>
            <div className="text-xs text-pink-400/70">Overall Resonance</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}