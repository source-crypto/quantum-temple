import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Circle, Zap, GitBranch } from "lucide-react";
import { motion } from "framer-motion";

export default function SuperpositionTracker({ transactions = [], users = [] }) {
  const [superpositionEntities, setSuperpositionEntities] = useState([]);

  useEffect(() => {
    // Identify entities in superposition (pre-collapse state)
    const entities = [
      ...transactions.slice(0, 5).filter(t => !t.quantum_signature || t.status === 'pending').map(t => ({
        id: t.id,
        type: 'transaction',
        label: `TX-${t.id.substring(0, 8)}`,
        potentialEnergy: 50 + Math.random() * 50,
        uncertaintyLevel: 30 + Math.random() * 40,
        possibleStates: ['approved', 'flagged', 'enhanced'],
        awaitingMeasurement: 'network_consensus',
        x: Math.random() * 80 + 10,
        y: Math.random() * 60 + 20
      })),
      ...users.slice(0, 3).map((u, i) => ({
        id: `user-${i}`,
        type: 'user',
        label: u.email?.substring(0, 10) || 'User',
        potentialEnergy: 60 + Math.random() * 40,
        uncertaintyLevel: 20 + Math.random() * 30,
        possibleStates: ['aligned', 'neutral', 'transitional'],
        awaitingMeasurement: 'interaction_collapse',
        x: Math.random() * 80 + 10,
        y: Math.random() * 60 + 20
      }))
    ];
    
    setSuperpositionEntities(entities);
  }, [transactions, users]);

  return (
    <Card className="bg-slate-900/60 border-purple-900/40">
      <CardHeader className="border-b border-purple-900/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-purple-200 flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            Superposition State Tracker
          </CardTitle>
          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
            <Circle className="w-2 h-2 mr-1 animate-pulse" />
            {superpositionEntities.length} in superposition
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-4 p-3 bg-amber-950/30 rounded-lg border border-amber-500/30">
          <div className="text-sm text-amber-300/70">
            These entities exist in quantum superposition—awaiting observation/measurement to collapse into determinate states. 
            Their final value remains undefined until network consensus or user interaction triggers the collapse event.
          </div>
        </div>

        {/* Superposition Field Visualization */}
        <div className="relative w-full h-96 bg-slate-950/50 rounded-lg border border-purple-500/30 overflow-hidden">
          <svg width="100%" height="100%" className="absolute inset-0">
            {/* Uncertainty field */}
            <defs>
              <radialGradient id="uncertaintyGlow">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Draw uncertainty fields */}
            {superpositionEntities.map((entity, i) => (
              <motion.circle
                key={`glow-${entity.id}`}
                cx={`${entity.x}%`}
                cy={`${entity.y}%`}
                r={entity.uncertaintyLevel}
                fill="url(#uncertaintyGlow)"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
              />
            ))}

            {/* Draw entities */}
            {superpositionEntities.map((entity, i) => (
              <g key={entity.id}>
                <motion.circle
                  cx={`${entity.x}%`}
                  cy={`${entity.y}%`}
                  r="8"
                  fill={entity.type === 'transaction' ? '#a855f7' : '#ec4899'}
                  stroke={entity.type === 'transaction' ? '#d946ef' : '#f472b6'}
                  strokeWidth="2"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: [0.6, 1, 0.6],
                    scale: [1, 1.15, 1],
                    rotate: [0, 360]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
                {/* Orbital paths representing possible states */}
                <motion.circle
                  cx={`${entity.x}%`}
                  cy={`${entity.y}%`}
                  r="15"
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.2, 0.4, 0.2], rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />
              </g>
            ))}
          </svg>

          {/* Entity cards */}
          {superpositionEntities.map((entity, i) => (
            <motion.div
              key={`card-${entity.id}`}
              className="absolute"
              style={{ left: `${entity.x}%`, top: `${entity.y}%` }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="relative -translate-x-1/2 -translate-y-1/2 mt-6">
                <div className="p-2 bg-slate-900/90 rounded border border-purple-500/50 backdrop-blur-sm min-w-[120px]">
                  <div className="text-xs font-mono text-purple-200">{entity.label}</div>
                  <div className="text-[10px] text-purple-400/70 mt-1">
                    Energy: {entity.potentialEnergy.toFixed(0)}
                  </div>
                  <div className="text-[10px] text-amber-400/70">
                    States: {entity.possibleStates.length}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Entity Details */}
        <div className="mt-6 space-y-2">
          {superpositionEntities.map((entity, i) => (
            <motion.div
              key={`detail-${entity.id}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-3 bg-slate-950/50 rounded border border-purple-500/30"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={entity.type === 'transaction' 
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                      : 'bg-pink-500/20 text-pink-300 border-pink-500/30'
                    }>
                      {entity.type}
                    </Badge>
                    <span className="text-sm font-mono text-purple-200">{entity.label}</span>
                  </div>
                  <div className="text-xs text-purple-300/70 space-y-1">
                    <div>Potential Energy: <span className="text-purple-300">{entity.potentialEnergy.toFixed(1)}</span></div>
                    <div>Uncertainty: <span className="text-amber-300">{entity.uncertaintyLevel.toFixed(1)}%</span></div>
                    <div>
                      Possible States: {entity.possibleStates.map((s, idx) => (
                        <Badge key={idx} variant="outline" className="border-purple-500/30 text-purple-300 text-[10px] ml-1">
                          {s}
                        </Badge>
                      ))}
                    </div>
                    <div>Awaiting: <span className="text-cyan-300">{entity.awaitingMeasurement.replace(/_/g, ' ')}</span></div>
                  </div>
                </div>
                <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}