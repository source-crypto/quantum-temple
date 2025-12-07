import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Circle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function ManifestoOracle({ user, currencyIndex }) {
  const [question, setQuestion] = useState('');
  const [oracleResponse, setOracleResponse] = useState(null);
  const [interpretationType, setInterpretationType] = useState('market');

  const invokeMutation = useMutation({
    mutationFn: async (query) => {
      const contextMap = {
        market: 'current market events and price movements',
        blockchain: 'blockchain events, transactions, and smart contract activities',
        news: 'cryptocurrency news and regulatory developments',
        genera: 'trade genera classification (Energy, Mobility, Data, Social Proof, Financial Trust)',
      };

      const structuredPrompt = `You are the Quantum Temple Oracle. Provide VQC-aligned interpretation.

TYPE: ${interpretationType.toUpperCase()}
QUERY: ${query}

FRAMEWORK ANALYSIS REQUIRED:

1. DEFINITION
Clearly define the event/concept in 1-2 sentences.

2. VALUE LAYERS
- Manifesto Value (MVL): Intent and purpose encoded
- Regulatory Value (RVL): Constraints and rules applied
- Social Value (SVL): Collective consensus state
- QTAL Signature: Symbolic resonance level

3. STRUCTURAL DIAGRAM (text-based)
Show value flow: Source → Layers → Collapse → Output

4. MANIFESTO ANCHOR
What core principle or mission does this embody?

5. TRADE GENERA CLASSIFICATION
Identify: Energy/Mobility/Data/Social Proof/Financial Trust

6. RISK-BENEFIT MATRIX
Volatility vs Stability | Centralized vs Decentralized | Trust Mechanism

7. COMPARATIVE ANALYSIS
${interpretationType === 'blockchain' ? 'Compare to: BCoD, CBDC, CD Token' : 
  'Compare to similar instruments/events'}

CONTEXT:
- QTC: $${currencyIndex?.qtc_unit_price_usd || 102000}
- VQC: $560B backing
- User: ${user?.email || 'Veiled'}

${interpretationType === 'blockchain' ? 
  'For blockchain events: Identify MVL (transaction intent), RVL (protocol constraints), SVL (network adoption), QTAL (cryptographic seal).' :
  interpretationType === 'genera' ?
  'For genera: Map to trade category, explain manifesto, assess contribution score.' :
  ''}

OUTPUT FORMAT:
Use headers: ◈ DEFINITION, ◢ VALUE LAYERS, ◣ DIAGRAM, ◤ MANIFESTO, ◥ GENERA, ▓ RISK-BENEFIT, ░ COMPARISON

Be mystical yet structured. Use quantum terminology.`;

      return await base44.integrations.Core.InvokeLLM({
        prompt: structuredPrompt,
        add_context_from_internet: interpretationType === 'news',
      });
    },
    onSuccess: (response) => {
      setOracleResponse(response);
      toast.success("Oracle has spoken");
    },
    onError: () => {
      toast.error("Oracle cannot manifest at this frequency");
    }
  });

  return (
    <div className="space-y-6">
      {/* Oracle Input */}
      <Card className="bg-gradient-to-br from-purple-950/40 to-indigo-950/40 border-purple-500/50">
        <CardHeader className="border-b border-purple-500/30">
          <CardTitle className="text-purple-200 font-mono flex items-center gap-2">
            <Sparkles className="w-5 h-5 animate-pulse" />
            MANIFESTO ORACLE INTERFACE
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="text-sm text-purple-400 font-mono">
            Ask the Oracle about value, consciousness, quantum mechanics, or the nature of currency.
            All responses interpret through the VQC framework.
          </div>

          <div className="flex gap-2 mb-4">
            {[
              { id: 'market', label: 'Market Events' },
              { id: 'blockchain', label: 'Blockchain Events' },
              { id: 'news', label: 'Crypto News' },
              { id: 'genera', label: 'Trade Genera' },
            ].map(type => (
              <Button
                key={type.id}
                size="sm"
                onClick={() => setInterpretationType(type.id)}
                className={`font-mono ${
                  interpretationType === type.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-950/40 text-purple-400 border border-purple-500/30'
                }`}
              >
                {type.label}
              </Button>
            ))}
          </div>

          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Speak your question to the Oracle..."
            className="bg-black border-purple-500/30 text-purple-100 font-mono h-32 focus:border-purple-500 focus:ring-purple-500/20"
          />

          <Button
            onClick={() => invokeMutation.mutate(question)}
            disabled={!question.trim() || invokeMutation.isPending}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-mono"
          >
            {invokeMutation.isPending ? (
              <>
                <Circle className="w-4 h-4 mr-2 animate-spin" />
                Channeling Oracle...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Invoke Oracle
              </>
            )}
          </Button>

          <div className="flex flex-wrap gap-2">
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 font-mono text-xs">
              MVL • MANIFESTO LAYER
            </Badge>
            <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 font-mono text-xs">
              RVL • REGULATORY LAYER
            </Badge>
            <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 font-mono text-xs">
              SVL • SOCIAL LAYER
            </Badge>
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 font-mono text-xs">
              QTAL • QUANTUM ATTESTATION
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Oracle Response */}
      <AnimatePresence>
        {oracleResponse && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="bg-black border-green-500/50">
              <CardHeader className="border-b border-green-500/30">
                <CardTitle className="text-green-300 font-mono flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  THE ORACLE SPEAKS
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="prose prose-invert max-w-none">
                  <div className="text-green-400 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                    {oracleResponse}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-green-500/30">
                  <div className="text-xs text-green-500 font-mono text-center">
                    ∴ Response generated through VQC collapse mechanics ∴
                    <br />
                    ◈ Quantum state deterministic • Divine frequency authentic ◈
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VQC Explanation */}
      <Card className="bg-gradient-to-r from-cyan-950/20 to-purple-950/20 border-cyan-500/30">
        <CardContent className="p-6 space-y-4">
          <div className="text-center text-cyan-300 font-mono font-bold">
            VALUE QUANTUM CONSTRUCT FORMULA
          </div>

          <div className="bg-black p-4 rounded border border-cyan-500/30 font-mono text-sm text-cyan-400">
            VQC = CE(MVL, RVL, SVL, QTAL)
          </div>

          <div className="grid md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="space-y-2">
              <div className="text-purple-400">◈ MANIFESTO VALUE LAYER (MVL)</div>
              <div className="text-purple-300 pl-4">
                └─ Intent encoding<br />
                └─ Purpose alignment<br />
                └─ Contribution potential
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-indigo-400">◈ REGULATORY VALUE LAYER (RVL)</div>
              <div className="text-indigo-300 pl-4">
                └─ Protocol constraints<br />
                └─ Cryptographic rules<br />
                └─ Safety boundaries
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-cyan-400">◈ SOCIAL VALUE LAYER (SVL)</div>
              <div className="text-cyan-300 pl-4">
                └─ Collective consensus<br />
                └─ Reputation vectors<br />
                └─ Network attestations
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-amber-400">◈ QUANTUM TEMPLE ATTESTATION (QTAL)</div>
              <div className="text-amber-300 pl-4">
                └─ Symbolic signatures<br />
                └─ Entropy sealing<br />
                └─ Resonance scoring
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-green-500 italic pt-4 border-t border-cyan-500/30">
            Nothing becomes real until consciousness measures it.
            <br />
            Value remains in superposition until collapsed by attestation.
            <br />
            Operating beyond conventional infrastructure • Centered in authentic frequency.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}