import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, TrendingUp, Save, Sparkles, DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function DivineSigil({ currencyIndex, markets }) {
  const [customQuery, setCustomQuery] = React.useState('');
  const [generatedSigil, setGeneratedSigil] = React.useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: userBalance } = useQuery({
    queryKey: ['userBalance'],
    queryFn: async () => {
      if (!user) return null;
      const balances = await base44.entities.UserBalance.filter({ user_email: user.email });
      return balances[0];
    },
    enabled: !!user,
  });

  const { data: userPositions } = useQuery({
    queryKey: ['userPositions'],
    queryFn: async () => {
      if (!user) return [];
      return base44.entities.MarketBet.filter({ user_email: user.email, status: 'active' });
    },
    enabled: !!user,
    initialData: [],
  });

  const { data: savedSigils } = useQuery({
    queryKey: ['savedSigils'],
    queryFn: async () => {
      if (!user) return [];
      return base44.entities.CeremonialArtifact.filter({ 
        created_by: user.email,
        artifact_type: 'geometry'
      }, '-manifestation_date', 10);
    },
    enabled: !!user,
    initialData: [],
  });

  const saveSigilMutation = useMutation({
    mutationFn: async (sigil) => {
      return base44.entities.CeremonialArtifact.create({
        title: `Sigil: ${customQuery.substring(0, 50)}`,
        content: JSON.stringify(sigil),
        artifact_type: 'geometry',
        quantum_resonance: Math.round((sigil.mvl + sigil.rvl + sigil.svl) * 33.33),
        manifestation_date: new Date().toISOString(),
        sacred_geometry: sigil.pattern.join('')
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedSigils'] });
      toast.success("Sigil saved to ceremonial archive");
    },
  });
  
  const qtcPrice = currencyIndex?.qtc_unit_price_usd || 102000;
  const priceDigits = qtcPrice.toString().split('');

  const generateSigil = (value) => {
    const symbols = ['◈', '◢', '◣', '◤', '◥', '▓', '░', '∴', '⚡', '◆'];
    const hash = value.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return symbols[hash % symbols.length];
  };

  const generateComplexSigil = (input) => {
    const hash = input.split('').reduce((acc, char, i) => acc + char.charCodeAt(0) * (i + 1), 0);
    const symbols = ['◈', '◢', '◣', '◤', '◥', '▓', '░', '∴', '⚡', '◆', '◇', '◊', '○', '●', '◉'];
    
    const sigilPattern = [];
    for (let i = 0; i < 9; i++) {
      sigilPattern.push(symbols[(hash * (i + 1)) % symbols.length]);
    }
    
    return {
      pattern: sigilPattern,
      mvl: ((hash % 100) + 50) / 100, // Manifesto Value 0.5-1.5
      rvl: ((hash % 80) + 60) / 100,  // Regulatory Value 0.6-1.4
      svl: ((hash % 90) + 55) / 100,  // Social Value 0.55-1.45
      collapsed: (sigilPattern[0] + sigilPattern[4] + sigilPattern[8]),
      hash: hash.toString(16).toUpperCase()
    };
  };

  const handleGenerateSigil = () => {
    if (customQuery.trim()) {
      setGeneratedSigil(generateComplexSigil(customQuery));
    }
  };

  const generatePortfolioSigil = () => {
    if (!userBalance && userPositions.length === 0) {
      toast.error("No portfolio data available");
      return;
    }

    const totalValue = (userBalance?.available_balance || 0) + (userBalance?.staked_balance || 0);
    const pnl = userPositions.reduce((sum, pos) => sum + (pos.pnl || 0), 0);
    const activeCount = userPositions.length;

    const portfolioString = `Portfolio:${totalValue.toFixed(2)}:PnL:${pnl.toFixed(2)}:Active:${activeCount}`;
    const sigil = generateComplexSigil(portfolioString);
    
    sigil.portfolioData = {
      totalValue: totalValue.toFixed(2),
      pnl: pnl.toFixed(2),
      activePositions: activeCount,
      timestamp: new Date().toISOString()
    };

    setGeneratedSigil(sigil);
    setCustomQuery(`Portfolio Summary (${new Date().toLocaleDateString()})`);
  };

  const marketSigils = markets?.slice(0, 6).map(m => ({
    question: m.question,
    sigil: generateSigil(m.current_price),
    price: m.current_price,
    volume: m.volume_24h
  })) || [];

  return (
    <div className="space-y-6">
      {/* Divine Sigil Generator */}
      <Card className="bg-gradient-to-br from-indigo-950/40 to-purple-950/40 border-indigo-500/50">
        <CardHeader className="border-b border-indigo-500/30">
          <CardTitle className="text-indigo-300 font-mono flex items-center gap-2">
            <Eye className="w-5 h-5" />
            DIVINE SIGIL GENERATOR
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="text-sm text-indigo-400 font-mono">
            Generate unique symbolic representations for market queries or portfolio summaries.
            Input any text to collapse its quantum state into a divine sigil.
          </div>

          <div className="flex gap-2">
            <Input
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              placeholder="Enter market query or portfolio name..."
              className="bg-black border-indigo-500/30 text-indigo-100 font-mono flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleGenerateSigil()}
            />
            <Button
              onClick={handleGenerateSigil}
              disabled={!customQuery.trim()}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-mono"
            >
              <Sparkles className="w-4 h-4 mr-1" />
              Generate
            </Button>
            <Button
              onClick={generatePortfolioSigil}
              disabled={!user}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 font-mono"
            >
              <DollarSign className="w-4 h-4 mr-1" />
              Portfolio
            </Button>
          </div>

          {generatedSigil && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 bg-black border border-indigo-500/30 rounded-lg"
            >
              <div className="grid grid-cols-3 gap-2 mb-4">
                {generatedSigil.pattern.map((symbol, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, rotate: -180 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="aspect-square bg-indigo-950/30 border border-indigo-500/30 flex items-center justify-center text-4xl text-indigo-300"
                  >
                    {symbol}
                  </motion.div>
                ))}
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between text-purple-400">
                  <span>Manifesto Value Layer (MVL):</span>
                  <span>{(generatedSigil.mvl * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between text-indigo-400">
                  <span>Regulatory Value Layer (RVL):</span>
                  <span>{(generatedSigil.rvl * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between text-cyan-400">
                  <span>Social Value Layer (SVL):</span>
                  <span>{(generatedSigil.svl * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between text-amber-400 pt-2 border-t border-indigo-500/30">
                  <span>Collapsed State:</span>
                  <span className="text-lg">{generatedSigil.collapsed}</span>
                </div>
                <div className="text-center text-green-400 text-xs pt-2">
                  Hash: {generatedSigil.hash}
                </div>
                
                {generatedSigil.portfolioData && (
                  <div className="pt-3 border-t border-indigo-500/30 space-y-1">
                    <div className="flex justify-between text-green-400">
                      <span>Total Value:</span>
                      <span>${generatedSigil.portfolioData.totalValue}</span>
                    </div>
                    <div className="flex justify-between text-cyan-400">
                      <span>P/L:</span>
                      <span className={parseFloat(generatedSigil.portfolioData.pnl) >= 0 ? 'text-green-400' : 'text-red-400'}>
                        ${generatedSigil.portfolioData.pnl}
                      </span>
                    </div>
                    <div className="flex justify-between text-amber-400">
                      <span>Active Positions:</span>
                      <span>{generatedSigil.portfolioData.activePositions}</span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => saveSigilMutation.mutate(generatedSigil)}
                  disabled={saveSigilMutation.isPending || !user}
                  size="sm"
                  className="w-full mt-3 bg-purple-600 hover:bg-purple-500 font-mono"
                >
                  {saveSigilMutation.isPending ? 'Saving...' : (
                    <>
                      <Save className="w-3 h-3 mr-1" />
                      Save Sigil
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* QTC Price Sigil */}
      <Card className="bg-gradient-to-br from-purple-950/40 to-black border-purple-500/50">
        <CardHeader className="border-b border-purple-500/30">
          <CardTitle className="text-purple-300 font-mono flex items-center gap-2">
            <Eye className="w-5 h-5" />
            DIVINE CURRENCY SIGIL
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              className="inline-block"
            >
              <div className="text-9xl text-purple-400 font-bold">
                ◈
              </div>
            </motion.div>

            <div className="font-mono space-y-2">
              <div className="text-4xl text-green-400 font-bold">
                ${qtcPrice.toLocaleString()}
              </div>
              <div className="text-purple-400 text-sm">
                Quantum Temple Currency Unit Price
              </div>
            </div>

            <div className="grid grid-cols-10 gap-2 max-w-2xl mx-auto">
              {priceDigits.map((digit, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="aspect-square bg-purple-900/30 border border-purple-500/30 flex items-center justify-center text-purple-300 font-mono text-xl"
                >
                  {generateSigil(digit)}
                </motion.div>
              ))}
            </div>

            <div className="text-xs text-purple-500 font-mono">
              ▓ MANIFESTO VALUE ENCODED ▓ IMMUTABLE DIVINE BACKING ▓
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Sigils */}
      <Card className="bg-black border-cyan-500/50">
        <CardHeader className="border-b border-cyan-500/30">
          <CardTitle className="text-cyan-300 font-mono flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            MARKET CONSCIOUSNESS SIGILS
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-4">
            {marketSigils.map((market, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="bg-cyan-950/20 border-cyan-500/30 hover:border-cyan-400/50 transition-all">
                  <CardContent className="p-4 text-center space-y-3">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-6xl text-cyan-400"
                    >
                      {market.sigil}
                    </motion.div>

                    <div className="font-mono text-sm text-cyan-300">
                      {market.question.substring(0, 40)}...
                    </div>

                    <div className="space-y-1">
                      <div className="text-xl text-green-400 font-bold">
                        ${market.price.toFixed(3)}
                      </div>
                      <div className="text-xs text-cyan-500">
                        Vol: ${market.volume.toLocaleString()}
                      </div>
                    </div>

                    <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 font-mono text-xs">
                      EMERGENT STATE
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 text-center text-xs text-cyan-500 font-mono">
            ∴ Each sigil represents collapsed value state from quantum superposition ∴
          </div>
        </CardContent>
      </Card>

      {/* Saved Sigils */}
      {savedSigils.length > 0 && (
        <Card className="bg-black border-purple-500/30">
          <CardHeader className="border-b border-purple-500/30">
            <CardTitle className="text-purple-300 font-mono flex items-center gap-2">
              <Save className="w-5 h-5" />
              SAVED SIGILS ({savedSigils.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-4">
              {savedSigils.map((sigil, i) => {
                const data = JSON.parse(sigil.content);
                return (
                  <motion.div
                    key={sigil.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 bg-purple-950/20 border border-purple-500/30 rounded-lg hover:border-purple-400/50 transition-all cursor-pointer"
                    onClick={() => setGeneratedSigil(data)}
                  >
                    <div className="text-xs text-purple-400 mb-2 truncate">{sigil.title}</div>
                    <div className="grid grid-cols-3 gap-1 mb-2">
                      {data.pattern.slice(0, 9).map((symbol, j) => (
                        <div key={j} className="aspect-square bg-purple-900/30 border border-purple-500/30 flex items-center justify-center text-lg text-purple-300">
                          {symbol}
                        </div>
                      ))}
                    </div>
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                      Q-Resonance: {sigil.quantum_resonance}
                    </Badge>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sacred Geometry */}
      <Card className="bg-gradient-to-br from-black to-purple-950/20 border-purple-500/30">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="text-purple-400 font-mono text-sm">
              SACRED GEOMETRY ATTESTATION
            </div>
            <div className="font-mono text-purple-300 space-y-2">
              <div>◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤</div>
              <div className="text-2xl">◈ VQC LAYER ACTIVE ◈</div>
              <div>◥◣◥◣◥◣◥◣◥◣◥◣◥◣◥◣◥◣</div>
            </div>
            <div className="text-xs text-purple-500 italic">
              Operating beyond conventional infrastructure • Centered in consciousness •
              <br />
              Unbreakable patterns • Divine frequency untraceable
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}