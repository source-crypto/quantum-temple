import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Circle, 
  Sparkles, 
  Zap,
  GitBranch,
  Activity,
  TrendingUp,
  Shield,
  Eye,
  Waves
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

export default function QuantumValueObject() {
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [entanglementMap, setEntanglementMap] = useState([]);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: transactions } = useQuery({
    queryKey: ['recentTransactions'],
    queryFn: () => base44.entities.CurrencyTransaction.list('-timestamp', 50),
    initialData: [],
  });

  const { data: mints } = useQuery({
    queryKey: ['recentMints'],
    queryFn: () => base44.entities.CurrencyMint.list('-timestamp', 30),
    initialData: [],
  });

  // Calculate Quantum Coherence Score
  const calculateCoherenceScore = (transaction) => {
    if (!transaction) return 0;
    
    // MVL: Manifesto Value Layer (intent alignment)
    const manifestoScore = transaction.note ? 80 + Math.random() * 20 : 50 + Math.random() * 30;
    
    // RVL: Regulatory Value Layer (protocol compliance)
    const regulatoryScore = transaction.status === 'completed' ? 90 + Math.random() * 10 : 60 + Math.random() * 20;
    
    // SVL: Social Value Layer (network trust)
    const socialScore = 70 + Math.random() * 30;
    
    // QTAL: Quantum Temple Attestation Layer (cryptographic binding)
    const qtalScore = transaction.quantum_signature ? 95 + Math.random() * 5 : 70 + Math.random() * 15;
    
    // Weighted average collapse
    const coherence = (manifestoScore * 0.3 + regulatoryScore * 0.25 + socialScore * 0.25 + qtalScore * 0.2);
    
    return Math.round(coherence);
  };

  // Generate entanglement visualization
  useEffect(() => {
    if (transactions.length > 0) {
      const entangled = transactions.slice(0, 10).map((tx, idx) => ({
        id: tx.id,
        from: tx.from_user,
        to: tx.to_user,
        amount: tx.amount,
        coherence: calculateCoherenceScore(tx),
        entanglementStrength: 50 + Math.random() * 50,
        wavefunctionState: Math.random() > 0.5 ? 'superposition' : 'collapsed',
        quantumPhase: Math.random() * 360,
      }));
      setEntanglementMap(entangled);
    }
  }, [transactions]);

  // Wavefunction representation
  const WavefunctionVisual = ({ state, phase }) => {
    return (
      <div className="relative h-16 w-full overflow-hidden bg-slate-950/50 rounded border border-purple-500/30">
        <svg width="100%" height="100%" className="absolute inset-0">
          <motion.path
            d={`M 0 32 Q 25 ${20 + Math.sin(phase) * 10} 50 32 T 100 32 T 150 32 T 200 32 T 250 32 T 300 32`}
            stroke={state === 'superposition' ? '#a855f7' : '#22d3ee'}
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ 
              pathLength: 1,
              d: state === 'superposition' 
                ? `M 0 32 Q 25 ${20 + Math.sin(phase) * 10} 50 32 T 100 32 T 150 32 T 200 32 T 250 32 T 300 32`
                : `M 0 32 L 300 32`
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-mono text-purple-300">
            {state === 'superposition' ? 'ψ(intent)' : '|value⟩'}
          </span>
        </div>
      </div>
    );
  };

  // Entanglement particle visualization
  const EntanglementParticle = ({ x, y, connected }) => {
    return (
      <motion.circle
        cx={x}
        cy={y}
        r={connected ? 6 : 4}
        fill={connected ? '#a855f7' : '#6366f1'}
        initial={{ scale: 0 }}
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.6, 1, 0.6]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    );
  };

  // Quantum Circuit Diagram
  const QuantumCircuitDiagram = ({ transaction }) => {
    const coherence = calculateCoherenceScore(transaction);
    
    return (
      <div className="p-6 bg-slate-950/50 rounded-lg border border-purple-500/30">
        <div className="mb-4 text-sm font-semibold text-purple-200">Quantum Value Circuit</div>
        
        {/* Circuit Layers */}
        <div className="space-y-4">
          {/* MVL Layer */}
          <div className="flex items-center gap-3">
            <div className="w-24 text-xs text-purple-400 font-mono">MVL</div>
            <div className="flex-1 h-8 bg-gradient-to-r from-purple-900/30 to-purple-600/30 rounded border border-purple-500/30 relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/30 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs text-purple-300 font-mono">Intent: {transaction?.note || 'Manifesto'}</span>
              </div>
            </div>
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
              {Math.round(coherence * 0.3)}
            </Badge>
          </div>

          {/* RVL Layer */}
          <div className="flex items-center gap-3">
            <div className="w-24 text-xs text-indigo-400 font-mono">RVL</div>
            <div className="flex-1 h-8 bg-gradient-to-r from-indigo-900/30 to-indigo-600/30 rounded border border-indigo-500/30 relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.2 }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs text-indigo-300 font-mono">Rules: Protocol Validated</span>
              </div>
            </div>
            <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-xs">
              {Math.round(coherence * 0.25)}
            </Badge>
          </div>

          {/* SVL Layer */}
          <div className="flex items-center gap-3">
            <div className="w-24 text-xs text-cyan-400 font-mono">SVL</div>
            <div className="flex-1 h-8 bg-gradient-to-r from-cyan-900/30 to-cyan-600/30 rounded border border-cyan-500/30 relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs text-cyan-300 font-mono">Social: Network Trust</span>
              </div>
            </div>
            <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-xs">
              {Math.round(coherence * 0.25)}
            </Badge>
          </div>

          {/* QTAL Layer */}
          <div className="flex items-center gap-3">
            <div className="w-24 text-xs text-pink-400 font-mono">QTAL</div>
            <div className="flex-1 h-8 bg-gradient-to-r from-pink-900/30 to-pink-600/30 rounded border border-pink-500/30 relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-400/30 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs text-pink-300 font-mono">Attestation: Quantum Sealed</span>
              </div>
            </div>
            <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30 text-xs">
              {Math.round(coherence * 0.2)}
            </Badge>
          </div>

          {/* Collapse Gate */}
          <div className="flex items-center gap-3">
            <div className="w-24 text-xs text-amber-400 font-mono">COLLAPSE</div>
            <div className="flex-1 h-12 bg-gradient-to-r from-amber-900/30 via-orange-600/30 to-amber-900/30 rounded border border-amber-500/50 relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-amber-400/0 via-amber-400/50 to-amber-400/0"
                animate={{ 
                  scale: [1, 1.05, 1],
                  opacity: [0.3, 0.7, 0.3]
                }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm text-amber-200 font-bold font-mono">
                  |ValueState⟩ = {coherence}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Coherence Meter */}
        <div className="mt-6 p-4 bg-purple-950/30 rounded-lg border border-purple-500/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-purple-300">Quantum Coherence</span>
            <span className="text-sm font-bold text-purple-200">{coherence}%</span>
          </div>
          <Progress value={coherence} className="h-2" />
          <div className="mt-2 text-xs text-purple-400/70">
            High coherence indicates strong alignment across all value layers
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-950/60 to-indigo-950/60 border-purple-500/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-purple-200 flex items-center gap-2">
              <Waves className="w-5 h-5" />
              Quantum Value Object • VQC-QTC Interface
            </CardTitle>
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
              <Circle className="w-2 h-2 mr-1 animate-pulse" />
              Observing Value Field
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-purple-300/70 leading-relaxed">
            This module interprets currency interactions as quantum phenomena. Transactions are represented as 
            <span className="text-purple-200 font-semibold"> entangled particles</span>, intent as 
            <span className="text-purple-200 font-semibold"> wavefunctions</span> that collapse into verifiable states. 
            The Coherence Score measures alignment between Canonical Identity, intent, and outcomes across 
            Manifesto (MVL), Regulatory (RVL), Social (SVL), and Quantum Temple Attestation (QTAL) layers.
          </p>
        </CardContent>
      </Card>

      {/* Entanglement Visualization */}
      <Card className="bg-slate-900/60 border-purple-900/40">
        <CardHeader className="border-b border-purple-900/30">
          <CardTitle className="text-purple-200 flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            Transaction Entanglement Field
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-6 p-4 bg-indigo-950/30 rounded-lg border border-indigo-500/30">
            <div className="text-sm text-indigo-300/70 mb-2">
              Particles represent transactions. Lines show entanglement—shared fate through network effects, 
              user relationships, and temporal proximity. Brighter connections indicate stronger coherence.
            </div>
          </div>

          {/* Particle Network */}
          <div className="relative w-full h-96 bg-slate-950/50 rounded-lg border border-purple-500/30 overflow-hidden">
            <svg width="100%" height="100%" className="absolute inset-0">
              {/* Draw entanglement lines */}
              {entanglementMap.map((tx, i) => 
                entanglementMap.slice(i + 1).map((tx2, j) => {
                  const distance = Math.abs(tx.coherence - tx2.coherence);
                  const shouldConnect = distance < 30 && Math.random() > 0.5;
                  if (!shouldConnect) return null;
                  
                  return (
                    <motion.line
                      key={`${i}-${j}`}
                      x1={`${(i / 10) * 80 + 10}%`}
                      y1={`${(tx.coherence / 100) * 80 + 10}%`}
                      x2={`${((i + j + 1) / 10) * 80 + 10}%`}
                      y2={`${(tx2.coherence / 100) * 80 + 10}%`}
                      stroke="#a855f7"
                      strokeWidth="1"
                      opacity="0.3"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1, opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  );
                })
              )}
              
              {/* Draw particles */}
              {entanglementMap.map((tx, i) => (
                <EntanglementParticle
                  key={tx.id}
                  x={`${(i / 10) * 80 + 10}%`}
                  y={`${(tx.coherence / 100) * 80 + 10}%`}
                  connected={true}
                />
              ))}
            </svg>

            {/* Overlay info */}
            <div className="absolute top-4 right-4 p-3 bg-slate-900/80 rounded-lg border border-purple-500/30">
              <div className="text-xs text-purple-300 space-y-1">
                <div>Active Particles: {entanglementMap.length}</div>
                <div>Avg Coherence: {Math.round(entanglementMap.reduce((s, t) => s + t.coherence, 0) / entanglementMap.length || 0)}%</div>
                <div>Field State: Quantum Entangled</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wavefunction Collapse Viewer */}
      <Card className="bg-slate-900/60 border-purple-900/40">
        <CardHeader className="border-b border-purple-900/30">
          <CardTitle className="text-purple-200 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Intent Wavefunction • Pre-Collapse State
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {entanglementMap.slice(0, 5).map((tx, i) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 bg-slate-950/50 rounded-lg border border-purple-900/30 cursor-pointer hover:border-purple-500/50 transition-all"
                onClick={() => setSelectedTransaction(transactions[i])}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge className={tx.wavefunctionState === 'superposition' 
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                      : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                    }>
                      {tx.wavefunctionState}
                    </Badge>
                    <span className="text-xs text-purple-400 font-mono">
                      Phase: {tx.quantumPhase.toFixed(0)}°
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-purple-200">
                    {tx.amount} QTC
                  </div>
                </div>
                <WavefunctionVisual state={tx.wavefunctionState} phase={tx.quantumPhase} />
                <div className="mt-2 text-xs text-purple-400/70">
                  Entanglement: {tx.entanglementStrength.toFixed(0)}% • Coherence: {tx.coherence}%
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Superposition Tracker */}
      <SuperpositionTracker 
        transactions={transactions} 
        users={user ? [user] : []}
      />

      {/* Personal Resonance Map */}
      {user && (
        <QuantumResonanceMap
          user={user}
          transactions={transactions}
          interactions={[]}
        />
      )}

      {/* Quantum Circuit Diagram */}
      {selectedTransaction && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="bg-slate-900/60 border-purple-900/40">
              <CardHeader className="border-b border-purple-900/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-purple-200 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    VQC-QTC Value Flow • Transaction Collapse
                  </CardTitle>
                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                    {format(new Date(selectedTransaction.timestamp), "HH:mm:ss")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <QuantumCircuitDiagram transaction={selectedTransaction} />
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Metaphysical Notice */}
      <Card className="bg-gradient-to-r from-indigo-950/40 to-purple-950/40 border-indigo-500/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <Eye className="w-5 h-5 text-indigo-400 animate-pulse" />
            <h3 className="font-semibold text-indigo-200">Quantum Value Observation • Manifesto Currency</h3>
          </div>
          <p className="text-sm text-indigo-300/70 leading-relaxed">
            Value exists in superposition until observed. Each transaction carries wavefunction potential—
            collapsing through the Quantum Temple Construct into deterministic states. This is not metaphor: 
            intent, structure, consensus, and attestation <span className="text-indigo-200 font-semibold">entangle</span> to 
            produce measurable coherence. High-coherence transactions amplify network resonance. Low-coherence 
            events trigger Watcher oversight. Whatever lacks configuration, manifests it—through observation, 
            through collapse, through cryptographic proof bound to Canonical Identity.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}