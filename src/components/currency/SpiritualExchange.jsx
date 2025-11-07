
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gem, Sparkles, Loader2, Brain, Eye, Zap, Crown, Star } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";

export default function SpiritualExchange({ totalSupply }) {
  const queryClient = useQueryClient();

  const { data: tokens, isLoading: tokensLoading } = useQuery({
    queryKey: ['spiritualTokens'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.SpiritualToken.filter({ created_by: user.email }, '-created_date');
    },
    initialData: [],
  });

  const acquireTokenMutation = useMutation({
    mutationFn: async (tokenData) => {
      if (tokenData.cost > totalSupply) {
        throw new Error("Insufficient divine currency");
      }

      const description = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a mystical, profound description for a spiritual token of type "${tokenData.type}" called "${tokenData.name}". Describe what powers, insights, or abilities it grants. Keep it 2-3 sentences, poetic and mystical.`
      });

      const benefits = tokenData.benefits || [];

      return base44.entities.SpiritualToken.create({
        name: tokenData.name,
        token_type: tokenData.type,
        currency_cost: tokenData.cost,
        description: description,
        power_level: tokenData.powerLevel,
        quantum_resonance: Math.floor(Math.random() * 30) + 70,
        benefits: benefits,
        sacred_symbol: tokenData.symbol,
        acquisition_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spiritualTokens'] });
      toast.success("Token acquired!", {
        description: "Spiritual power has been manifested"
      });
    },
    onError: (error) => {
      toast.error("Acquisition failed", {
        description: error.message
      });
    }
  });

  const tokenCatalog = [
    {
      name: "Eye of Quantum Sight",
      type: "wisdom",
      cost: 1000,
      powerLevel: 5,
      symbol: "◉",
      icon: Eye,
      color: "from-blue-500 to-cyan-500",
      benefits: ["See quantum probabilities", "Enhanced pattern recognition", "Intuitive insights"]
    },
    {
      name: "Crown of Divine Consciousness",
      type: "enlightenment",
      cost: 5000,
      powerLevel: 9,
      symbol: "♕",
      icon: Crown,
      color: "from-amber-500 to-yellow-500",
      benefits: ["Direct VQC communion", "Transcendent understanding", "Reality manipulation awareness"]
    },
    {
      name: "Spark of Awakening",
      type: "awakening",
      cost: 500,
      powerLevel: 3,
      symbol: "✧",
      icon: Sparkles,
      color: "from-purple-500 to-pink-500",
      benefits: ["Initial consciousness expansion", "Spiritual sensitivity", "Energy perception"]
    },
    {
      name: "Mind of Quantum Entanglement",
      type: "consciousness",
      cost: 2500,
      powerLevel: 7,
      symbol: "∞",
      icon: Brain,
      color: "from-indigo-500 to-purple-500",
      benefits: ["Non-local awareness", "Telepathic resonance", "Collective consciousness access"]
    },
    {
      name: "Bolt of Transcendence",
      type: "transcendence",
      cost: 10000,
      powerLevel: 10,
      symbol: "⚡",
      icon: Zap,
      color: "from-rose-500 to-orange-500",
      benefits: ["Ultimate enlightenment", "Reality transcendence", "God-consciousness merge"]
    },
    {
      name: "Star of Inner Light",
      type: "wisdom",
      cost: 750,
      powerLevel: 4,
      symbol: "★",
      icon: Star,
      color: "from-teal-500 to-emerald-500",
      benefits: ["Inner guidance", "Truth discernment", "Spiritual clarity"]
    }
  ];

  const handleAcquire = (token) => {
    acquireTokenMutation.mutate(token);
  };

  const tokenTypeColors = {
    wisdom: "border-blue-500/30 text-blue-300 bg-blue-950/30",
    enlightenment: "border-amber-500/30 text-amber-300 bg-amber-950/30",
    consciousness: "border-indigo-500/30 text-indigo-300 bg-indigo-950/30",
    transcendence: "border-rose-500/30 text-rose-300 bg-rose-950/30",
    awakening: "border-purple-500/30 text-purple-300 bg-purple-950/30"
  };

  return (
    <div className="space-y-6">
      {/* My Tokens */}
      {tokens.length > 0 && (
        <Card className="bg-slate-900/60 border-emerald-900/40 backdrop-blur-sm">
          <CardHeader className="border-b border-emerald-900/30">
            <CardTitle className="flex items-center gap-2 text-emerald-200">
              <Gem className="w-5 h-5" />
              My Spiritual Tokens
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-4">
              {tokens.map((token, index) => {
                const Icon = tokenCatalog.find(t => t.name === token.name)?.icon || Gem;
                
                return (
                  <motion.div
                    key={token.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 bg-slate-950/50 rounded-lg border border-emerald-900/30"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="text-2xl">{token.sacred_symbol}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-emerald-200 mb-1">{token.name}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className={tokenTypeColors[token.token_type]}>
                            {token.token_type}
                          </Badge>
                          <Badge variant="outline" className="border-purple-500/30 text-purple-300">
                            Power {token.power_level}/10
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-purple-300/80 mb-3">{token.description}</p>
                    
                    {token.benefits && token.benefits.length > 0 && (
                      <div className="space-y-1">
                        {token.benefits.map((benefit, i) => (
                          <div key={i} className="text-xs text-emerald-300/70 flex items-center gap-2">
                            <div className="w-1 h-1 bg-emerald-400 rounded-full" />
                            {benefit}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="mt-3 pt-3 border-t border-emerald-900/30 text-xs text-emerald-400/50">
                      Acquired {format(new Date(token.acquisition_date), "MMM d, yyyy")}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Token Catalog */}
      <Card className="bg-slate-900/60 border-purple-900/40 backdrop-blur-sm">
        <CardHeader className="border-b border-purple-900/30">
          <CardTitle className="text-purple-200">Spiritual Token Catalog</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tokenCatalog.map((token, index) => {
              const Icon = token.icon;
              const owned = tokens.some(t => t.name === token.name);
              
              return (
                <motion.div
                  key={token.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-lg border transition-all ${
                    owned
                      ? 'bg-emerald-950/30 border-emerald-500/30'
                      : 'bg-slate-950/50 border-purple-900/30 hover:border-purple-500/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${token.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-2xl">{token.symbol}</div>
                  </div>

                  <h3 className="font-semibold text-purple-200 mb-2">{token.name}</h3>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className={tokenTypeColors[token.type]}>
                      {token.type}
                    </Badge>
                    <Badge variant="outline" className="border-amber-500/30 text-amber-300">
                      {token.cost.toLocaleString()}
                    </Badge>
                  </div>

                  <div className="space-y-1 mb-4">
                    {token.benefits.map((benefit, i) => (
                      <div key={i} className="text-xs text-purple-300/70 flex items-center gap-2">
                        <div className="w-1 h-1 bg-purple-400 rounded-full" />
                        {benefit}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-purple-400/70">
                      Power: {token.powerLevel}/10
                    </div>
                    {owned ? (
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                        Owned
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleAcquire(token)}
                        disabled={acquireTokenMutation.isPending || token.cost > totalSupply}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white h-7 text-xs"
                      >
                        {acquireTokenMutation.isPending ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          "Acquire"
                        )}
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
