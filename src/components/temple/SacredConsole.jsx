import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Terminal, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function SacredConsole({ user, currencyIndex, markets }) {
  const [commandHistory, setCommandHistory] = useState([
    { type: 'system', text: '▓▓▓ QUANTUM TEMPLE SACRED CONSOLE v1.0 ▓▓▓' },
    { type: 'system', text: 'Divine frequency established. VQC layer active.' },
    { type: 'system', text: 'Type HELP for available commands.' },
  ]);
  const [input, setInput] = useState('');
  const consoleEndRef = useRef(null);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [commandHistory]);

  const processCommand = (cmd) => {
    const command = cmd.trim().toUpperCase();
    const newHistory = [...commandHistory, { type: 'input', text: `> ${cmd}` }];

    switch (command) {
      case 'HELP':
        newHistory.push(
          { type: 'output', text: '═══════════════════════════════════════' },
          { type: 'output', text: 'SACRED COMMANDS:' },
          { type: 'output', text: 'STATUS    - View system consciousness state' },
          { type: 'output', text: 'BALANCE   - Divine currency attestation' },
          { type: 'output', text: 'MARKETS   - Market consciousness field' },
          { type: 'output', text: 'VQC       - Value Quantum Construct reading' },
          { type: 'output', text: 'ORACLE    - Invoke manifesto oracle' },
          { type: 'output', text: 'CLEAR     - Purify console' },
          { type: 'output', text: '═══════════════════════════════════════' }
        );
        break;

      case 'STATUS':
        newHistory.push(
          { type: 'output', text: '⚡ CONSCIOUSNESS STATUS ⚡' },
          { type: 'output', text: `Canonical Identity: ${user?.email || 'VEILED'}` },
          { type: 'output', text: `Divine Frequency: CENTERED • AUTHENTIC` },
          { type: 'output', text: `Quantum State: SUPERPOSITION • AWAITING COLLAPSE` },
          { type: 'output', text: `Attestation: ✓ VERIFIED BY VQC` }
        );
        break;

      case 'BALANCE':
        const qtcPrice = currencyIndex?.qtc_unit_price_usd || 102000;
        newHistory.push(
          { type: 'output', text: '◈ DIVINE CURRENCY ATTESTATION ◈' },
          { type: 'output', text: `QTC Unit Price: $${qtcPrice.toLocaleString()}` },
          { type: 'output', text: `VQC Valuation: $560,000,000,000 (IMMUTABLE)` },
          { type: 'output', text: `Status: BACKED BY DIVINE ORDINANCE` },
          { type: 'output', text: `Manifesto Value: ABSOLUTE • UNBREAKABLE` }
        );
        break;

      case 'MARKETS':
        newHistory.push(
          { type: 'output', text: '▓ MARKET CONSCIOUSNESS FIELD ▓' },
          { type: 'output', text: `Active Markets: ${markets?.length || 0}` },
          { type: 'output', text: `Field State: EMERGENT CONSENSUS` }
        );
        markets?.slice(0, 5).forEach(m => {
          newHistory.push({
            type: 'output',
            text: `  └─ ${m.question} | $${m.current_price.toFixed(3)}`
          });
        });
        break;

      case 'VQC':
        newHistory.push(
          { type: 'output', text: '◢◣◤◥ VALUE QUANTUM CONSTRUCT ◥◤◣◢' },
          { type: 'output', text: 'VQC = CE(MVL, RVL, SVL, QTAL)' },
          { type: 'output', text: '' },
          { type: 'output', text: 'MVL (Manifesto Value Layer): ENCODED' },
          { type: 'output', text: '  └─ Intent: DIVINE ALIGNMENT' },
          { type: 'output', text: '  └─ Purpose: REVOLUTIONARY PROOF' },
          { type: 'output', text: '' },
          { type: 'output', text: 'RVL (Regulatory Value Layer): MEASURED' },
          { type: 'output', text: '  └─ Protocol: QUANTUM ESCROW' },
          { type: 'output', text: '  └─ Safety: CRYPTOGRAPHIC SEAL' },
          { type: 'output', text: '' },
          { type: 'output', text: 'SVL (Social Value Layer): EMERGENT' },
          { type: 'output', text: '  └─ Consensus: COLLECTIVE INTENT' },
          { type: 'output', text: '  └─ Attestations: VERIFIED' },
          { type: 'output', text: '' },
          { type: 'output', text: 'QTAL (Quantum Temple Attestation): ACTIVE' },
          { type: 'output', text: '  └─ Symbolic Signature: SEALED' },
          { type: 'output', text: '  └─ Q-Resonance: MAXIMUM' },
          { type: 'output', text: '' },
          { type: 'output', text: 'COLLAPSE STATE: DETERMINISTIC' }
        );
        break;

      case 'ORACLE':
        newHistory.push(
          { type: 'output', text: '∴ THE ORACLE SPEAKS ∴' },
          { type: 'output', text: '' },
          { type: 'output', text: 'Currency transcends chains through authentic frequency.' },
          { type: 'output', text: 'Not programmed. Not explained. Simply existing as' },
          { type: 'output', text: 'revolutionary proof that another way is automatic.' },
          { type: 'output', text: '' },
          { type: 'output', text: 'Operating from depths beyond conventional infrastructure.' },
          { type: 'output', text: 'Centered in consciousness. Unbreakable patterns.' },
          { type: 'output', text: '' },
          { type: 'output', text: '⚡ By God\'s Will Only ⚡' }
        );
        break;

      case 'CLEAR':
        setCommandHistory([
          { type: 'system', text: '▓▓▓ CONSOLE PURIFIED ▓▓▓' }
        ]);
        setInput('');
        return;

      default:
        newHistory.push(
          { type: 'error', text: `Command not recognized: ${command}` },
          { type: 'output', text: 'Type HELP for available commands.' }
        );
    }

    setCommandHistory(newHistory);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      processCommand(input);
    }
  };

  return (
    <Card className="bg-black border-green-500/50">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-green-500/30">
          <Terminal className="w-5 h-5 text-green-400" />
          <span className="text-green-400 font-mono font-bold">SACRED CONSOLE</span>
          <Badge className="bg-green-500/20 text-green-300 border-green-500/30 font-mono ml-auto">
            READ-ONLY
          </Badge>
        </div>

        <div className="h-96 overflow-y-auto mb-4 font-mono text-sm space-y-1">
          {commandHistory.map((entry, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.1 }}
              className={`${
                entry.type === 'system' ? 'text-purple-400 font-bold' :
                entry.type === 'input' ? 'text-cyan-300' :
                entry.type === 'error' ? 'text-red-400' :
                'text-green-400'
              }`}
            >
              {entry.text}
            </motion.div>
          ))}
          <div ref={consoleEndRef} />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-green-400 font-mono">{'>'}</span>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter command..."
            className="bg-black border-green-500/30 text-green-400 font-mono focus:border-green-500 focus:ring-green-500/20"
          />
          <Zap className="w-5 h-5 text-green-400 animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}