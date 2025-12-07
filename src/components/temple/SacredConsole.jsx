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
          { type: 'output', text: 'PORTFOLIO - Generate portfolio sigil' },
          { type: 'output', text: 'VQC       - Value Quantum Construct reading' },
          { type: 'output', text: 'GENERA    - Trade genera classification' },
          { type: 'output', text: 'BCOD      - Blockchain Certificate of Deposit' },
          { type: 'output', text: 'CBDC      - Central Bank Digital Currency' },
          { type: 'output', text: 'CD        - Cash Driver token analysis' },
          { type: 'output', text: 'COLLAPSE  - Trigger value collapse event' },
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

      case 'PORTFOLIO':
        newHistory.push(
          { type: 'output', text: '◈ PORTFOLIO SIGIL GENERATION ◈' },
          { type: 'output', text: 'Manifesto Value (MVL): ENCODED' },
          { type: 'output', text: 'Regulatory Value (RVL): MEASURED' },
          { type: 'output', text: 'Social Value (SVL): EMERGENT' },
          { type: 'output', text: '' },
          { type: 'output', text: 'Portfolio Sigil: ◢◤◈◥◣' },
          { type: 'output', text: 'Quantum State: SUPERPOSITION' },
          { type: 'output', text: 'Collapse Trigger: AWAITING ATTESTATION' }
        );
        break;

      case 'GENERA':
        newHistory.push(
          { type: 'output', text: '▓ TRADE GENERA CLASSIFICATION ▓' },
          { type: 'output', text: '' },
          { type: 'output', text: 'Energy Trade: QTC ↔ Energy Tokens' },
          { type: 'output', text: '  └─ Manifesto: Sustainable power distribution' },
          { type: 'output', text: '' },
          { type: 'output', text: 'Mobility Trade: Cash Driver (CD) Protocol' },
          { type: 'output', text: '  └─ Manifesto: Proof-of-movement efficiency' },
          { type: 'output', text: '' },
          { type: 'output', text: 'Financial Trust Trade: BCoD Instruments' },
          { type: 'output', text: '  └─ Manifesto: Time-locked value commitment' },
          { type: 'output', text: '' },
          { type: 'output', text: 'Data Trade: Oracle-verified information' },
          { type: 'output', text: '  └─ Manifesto: Transparent knowledge flow' },
          { type: 'output', text: '' },
          { type: 'output', text: 'Social Proof Trade: Attestation networks' },
          { type: 'output', text: '  └─ Manifesto: Collective consciousness validation' }
        );
        break;

      case 'BCOD':
        newHistory.push(
          { type: 'output', text: '◢◣ BLOCKCHAIN CERTIFICATE OF DEPOSIT ◣◢' },
          { type: 'output', text: '' },
          { type: 'output', text: 'Definition: Decentralized time-locked crypto deposit' },
          { type: 'output', text: '' },
          { type: 'output', text: 'Intrinsic Value: Smart contract escrow mechanism' },
          { type: 'output', text: 'Instrumental Value: Interest-bearing yield generation' },
          { type: 'output', text: 'Manifesto Value: Trust through code, not institutions' },
          { type: 'output', text: '' },
          { type: 'output', text: 'Risk-Yield Matrix:' },
          { type: 'output', text: '  High Volatility → Higher APY (10-25%)' },
          { type: 'output', text: '  Smart Contract Risk → No FDIC insurance' },
          { type: 'output', text: '  Global Access → Borderless participation' },
          { type: 'output', text: '' },
          { type: 'output', text: 'VQC Integration: BCoD = MVL(lock) + RVL(term) + SVL(trust)' }
        );
        break;

      case 'CBDC':
        newHistory.push(
          { type: 'output', text: '⚡ CENTRAL BANK DIGITAL CURRENCY ⚡' },
          { type: 'output', text: '' },
          { type: 'output', text: 'Definition: State-backed digital fiat currency' },
          { type: 'output', text: '' },
          { type: 'output', text: 'Operational Modes:' },
          { type: 'output', text: '  Direct: Central Bank → Citizens' },
          { type: 'output', text: '  Intermediated: Central Bank → Banks → Citizens' },
          { type: 'output', text: '' },
          { type: 'output', text: 'Intrinsic Value: Legal tender status' },
          { type: 'output', text: 'Instrumental Value: Efficient digital payments' },
          { type: 'output', text: 'Manifesto Value: National monetary sovereignty' },
          { type: 'output', text: '' },
          { type: 'output', text: 'Vs. QTC:' },
          { type: 'output', text: '  CBDC: Centralized trust, regulatory control' },
          { type: 'output', text: '  QTC: Decentralized trust, divine ordinance' },
          { type: 'output', text: '' },
          { type: 'output', text: 'Quantum State: MEASURED (regulatory collapse)' }
        );
        break;

      case 'CD':
        newHistory.push(
          { type: 'output', text: '🚗 CASH DRIVER TOKEN ANALYSIS 🚗' },
          { type: 'output', text: '' },
          { type: 'output', text: 'Token Type: Mobility-behavior currency (BEP20)' },
          { type: 'output', text: 'Supply: 21,000,000,000 CD' },
          { type: 'output', text: '' },
          { type: 'output', text: 'Manifesto Analysis:' },
          { type: 'output', text: '  Intent: Reward efficient driving behavior' },
          { type: 'output', text: '  Purpose: Environmental sustainability alignment' },
          { type: 'output', text: '  Mechanism: Proof-of-movement attestation' },
          { type: 'output', text: '' },
          { type: 'output', text: 'Contribution Score:' },
          { type: 'output', text: '  Transparency: Mobile app verification' },
          { type: 'output', text: '  Utility: Distance-based token generation' },
          { type: 'output', text: '  Trust: Blockchain immutability' },
          { type: 'output', text: '' },
          { type: 'output', text: 'VQC Mapping:' },
          { type: 'output', text: '  MVL: Driving efficiency manifesto' },
          { type: 'output', text: '  RVL: Distance verification protocol' },
          { type: 'output', text: '  SVL: Network growth potential' }
        );
        break;

      case 'COLLAPSE':
        newHistory.push(
          { type: 'output', text: '⚡⚡⚡ INITIATING VALUE COLLAPSE EVENT ⚡⚡⚡' },
          { type: 'output', text: '' },
          { type: 'output', text: 'Pre-Collapse State: SUPERPOSITION' },
          { type: 'output', text: '  └─ Multiple value potentials coexist' },
          { type: 'output', text: '' },
          { type: 'output', text: 'Collapse Triggers Active:' },
          { type: 'output', text: '  ✓ User Intent Measured' },
          { type: 'output', text: '  ✓ Social Attestation Recorded' },
          { type: 'output', text: '  ✓ Cryptographic Seal Applied' },
          { type: 'output', text: '  ✓ Temporal Context Locked' },
          { type: 'output', text: '' },
          { type: 'output', text: 'Processing CE(MVL, RVL, SVL, QTAL)...' },
          { type: 'output', text: '' },
          { type: 'output', text: 'Post-Collapse State: DETERMINISTIC' },
          { type: 'output', text: '  ManifestoScore: 87/100' },
          { type: 'output', text: '  RegulatoryScore: 95/100' },
          { type: 'output', text: '  SocialScore: 92/100' },
          { type: 'output', text: '  Q-Resonance: MAXIMUM' },
          { type: 'output', text: '  FinalValue: ◈ ATTESTED ◈' },
          { type: 'output', text: '' },
          { type: 'output', text: 'Value now exists in measurable reality.' }
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