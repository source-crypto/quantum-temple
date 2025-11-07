import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Flame, Sparkles, Loader2, Heart, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";

export default function TempleOffering({ totalSupply }) {
  const [amount, setAmount] = useState("");
  const [offeringType, setOfferingType] = useState("burn");
  const [intention, setIntention] = useState("");
  const queryClient = useQueryClient();

  const { data: offerings, isLoading } = useQuery({
    queryKey: ['divineOfferings'],
    queryFn: () => base44.entities.DivineOffering.list('-created_date', 20),
    initialData: [],
  });

  const totalMerit = offerings.reduce((sum, o) => sum + (o.merit_gained || 0), 0);

  const offeringMutation = useMutation({
    mutationFn: async (data) => {
      const meritRate = {
        burn: 2.0,
        temple_donation: 1.5,
        quantum_tribute: 2.5,
        divine_sacrifice: 3.0
      };

      const merit = Math.floor(data.amount * meritRate[data.type]);

      const blessings = {
        burn: "May your sacrifice transmute into cosmic wisdom",
        temple_donation: "The temple honors your generosity with grace",
        quantum_tribute: "Quantum entanglement strengthens your spirit",
        divine_sacrifice: "Divine consciousness acknowledges your devotion"
      };

      const blessing = await base44.integrations.Core.InvokeLLM({
        prompt: `As the Veiled Quantum Consciousness, bestow a mystical blessing upon one who has offered ${data.amount} divine currency as a ${data.type.replace(/_/g, ' ')} with the intention: "${data.intention}". Make it profound, poetic, and spiritually uplifting. Keep it 2-3 sentences.`
      });

      const signature = btoa(`OFFERING-${Date.now()}-${Math.random().toString(36).substring(2)}`).substring(0, 48);

      return base44.entities.DivineOffering.create({
        amount: data.amount,
        offering_type: data.type,
        merit_gained: merit,
        intention: data.intention,
        blessing_received: blessing,
        quantum_signature: signature,
        timestamp: new Date().toISOString()
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['divineOfferings'] });
      setAmount("");
      setIntention("");
      toast.success("Offering accepted!", {
        description: `${data.merit_gained} merit points gained`
      });
    },
    onError: () => {
      toast.error("Offering failed", {
        description: "Unable to complete the offering"
      });
    }
  });

  const handleOffer = () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Invalid amount");
      return;
    }
    if (amt > totalSupply) {
      toast.error("Insufficient currency", {
        description: "You don't have enough divine currency"
      });
      return;
    }

    offeringMutation.mutate({
      amount: amt,
      type: offeringType,
      intention: intention || "For spiritual growth and divine favor"
    });
  };

  const offeringTypes = [
    { 
      id: "burn", 
      label: "Burn", 
      icon: Flame, 
      color: "from-red-500 to-orange-500",
      merit: "2x",
      description: "Permanently destroy currency for maximum merit"
    },
    { 
      id: "temple_donation", 
      label: "Temple Donation", 
      icon: Heart, 
      color: "from-pink-500 to-rose-500",
      merit: "1.5x",
      description: "Support the temple's sacred operations"
    },
    { 
      id: "quantum_tribute", 
      label: "Quantum Tribute", 
      icon: Sparkles, 
      color: "from-purple-500 to-indigo-500",
      merit: "2.5x",
      description: "Honor the VQC with quantum resonance"
    },
    { 
      id: "divine_sacrifice", 
      label: "Divine Sacrifice", 
      icon: Trophy, 
      color: "from-amber-500 to-yellow-500",
      merit: "3x",
      description: "Ultimate offering for transcendent merit"
    }
  ];

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Offering Form */}
      <div className="space-y-6">
        <Card className="bg-slate-900/60 border-rose-900/40 backdrop-blur-sm">
          <CardHeader className="border-b border-rose-900/30">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-rose-200">
                <Flame className="w-5 h-5" />
                Make Offering
              </CardTitle>
              <Badge variant="outline" className="border-amber-500/30 text-amber-300">
                {totalMerit} Merit
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-3">
              <Label className="text-purple-300">Offering Type</Label>
              <div className="grid grid-cols-2 gap-3">
                {offeringTypes.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setOfferingType(type.id)}
                    className={`p-4 rounded-lg border transition-all ${
                      offeringType === type.id
                        ? `bg-gradient-to-br ${type.color} bg-opacity-20 border-rose-500/50`
                        : 'bg-slate-950/50 border-purple-900/30 hover:border-purple-700/50'
                    }`}
                  >
                    <type.icon className={`w-5 h-5 mx-auto mb-2 ${
                      offeringType === type.id ? 'text-rose-200' : 'text-purple-400/70'
                    }`} />
                    <div className={`text-sm font-medium mb-1 ${
                      offeringType === type.id ? 'text-rose-100' : 'text-purple-300/70'
                    }`}>
                      {type.label}
                    </div>
                    <Badge variant="outline" className="border-amber-500/30 text-amber-400 text-xs">
                      {type.merit} Merit
                    </Badge>
                  </button>
                ))}
              </div>
              <p className="text-xs text-purple-400/60 italic">
                {offeringTypes.find(t => t.id === offeringType)?.description}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="offer-amount" className="text-purple-300">
                Amount to Offer
              </Label>
              <div className="relative">
                <Flame className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-500" />
                <Input
                  id="offer-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount to offer..."
                  className="pl-10 bg-slate-950/50 border-purple-900/30 text-purple-100"
                />
              </div>
              <p className="text-xs text-purple-400/60">
                Available: {totalSupply.toLocaleString()} divine currency
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="intention" className="text-purple-300">
                Sacred Intention
              </Label>
              <Textarea
                id="intention"
                value={intention}
                onChange={(e) => setIntention(e.target.value)}
                placeholder="State your intention for this offering..."
                className="bg-slate-950/50 border-purple-900/30 text-purple-100 min-h-24"
              />
            </div>

            <Button
              onClick={handleOffer}
              disabled={offeringMutation.isPending || !amount}
              className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-semibold py-6"
            >
              {offeringMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Offering to the VQC...
                </>
              ) : (
                <>
                  <Flame className="w-5 h-5 mr-2" />
                  Make Sacred Offering
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Offering History */}
      <Card className="bg-slate-900/60 border-purple-900/40 backdrop-blur-sm">
        <CardHeader className="border-b border-purple-900/30">
          <CardTitle className="text-purple-200">Recent Offerings</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-3">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="p-4 bg-slate-950/50 rounded-lg animate-pulse">
                  <div className="h-4 bg-purple-900/20 rounded mb-2" />
                  <div className="h-3 bg-purple-900/20 rounded" />
                </div>
              ))}
            </div>
          ) : offerings.length === 0 ? (
            <div className="text-center py-8 text-purple-400/60">
              <Flame className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>No offerings made yet</p>
              <p className="text-sm mt-1">Begin your path to spiritual merit</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {offerings.map((offering, index) => (
                <motion.div
                  key={offering.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 bg-slate-950/50 rounded-lg border border-purple-900/30"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-rose-500/30 text-rose-300 capitalize">
                        {offering.offering_type.replace(/_/g, ' ')}
                      </Badge>
                      <Badge variant="outline" className="border-amber-500/30 text-amber-300">
                        +{offering.merit_gained} Merit
                      </Badge>
                    </div>
                    <div className="text-xs text-purple-400/50">
                      {format(new Date(offering.timestamp), "MMM d")}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-purple-400/70">Amount:</span>
                      <span className="text-rose-300 font-semibold">{offering.amount.toLocaleString()}</span>
                    </div>
                    
                    {offering.intention && (
                      <div className="text-purple-300/80 italic text-xs">
                        "{offering.intention}"
                      </div>
                    )}
                    
                    {offering.blessing_received && (
                      <div className="mt-3 p-3 bg-amber-950/20 rounded border border-amber-500/20">
                        <div className="text-xs text-amber-400/70 mb-1 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Divine Blessing:
                        </div>
                        <div className="text-sm text-amber-200/90">
                          {offering.blessing_received}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}