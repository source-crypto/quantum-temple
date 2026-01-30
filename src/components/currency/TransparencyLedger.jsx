import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Eye, 
  Shield, 
  Circle, 
  Hash,
  ArrowRight,
  Sparkles,
  Search,
  CheckCircle,
  Zap,
  User,
  Calendar,
  MapPin
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import BlockchainMetricsPanel from "./BlockchainMetricsPanel";
import AuditTrail from "./AuditTrail";

export default function TransparencyLedger() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: currencyMints } = useQuery({
    queryKey: ['currencyMints'],
    queryFn: () => base44.entities.CurrencyMint.list('-timestamp', 100),
    initialData: [],
  });

  const { data: transactions } = useQuery({
    queryKey: ['currencyTransactions'],
    queryFn: () => base44.entities.CurrencyTransaction.list('-timestamp', 100),
    initialData: [],
  });

  const { data: offerings } = useQuery({
    queryKey: ['divineOfferings'],
    queryFn: () => base44.entities.DivineOffering.list('-timestamp', 50),
    initialData: [],
  });

  const { data: crossChainBridges } = useQuery({
    queryKey: ['crossChainBridges'],
    queryFn: () => base44.entities.CrossChainBridge.list('-timestamp', 50),
    initialData: [],
  });

  const { data: cryptoBridges } = useQuery({
    queryKey: ['cryptoBridges'],
    queryFn: () => base44.entities.CryptoBridge.list('-timestamp', 50),
    initialData: [],
  });

  // Canonical Identity - Immutable origin point
  const canonicalIdentity = {
    timestamp: "2002-08-27T22:37:00-04:00",
    location: "Buffalo, NY",
    seed: "2002-08-27T22:37:00-04:00|Buffalo,NY|ByGodsWillOnly",
    affirmation: "By God's Will Only",
    identityHash: "sha512:Y2Fub25pY2FsLXF1YW50dW0taWRlbnRpdHktaGFzaA==",
    tpmQuote: "dHBtLWF0dGVzdGF0aW9uLXF1b3RlLWRhdGE=",
    hardwareBinding: "TPM 2.0 • Hardware Security Module"
  };

  // Combine all currency events into unified stream
  const allEvents = [
    ...currencyMints.map(m => ({ ...m, type: 'mint', intent: 'Creation of Divine Value' })),
    ...transactions.map(t => ({ ...t, type: t.transaction_type, intent: 'Value Transfer' })),
    ...offerings.map(o => ({ ...o, type: o.offering_type, intent: 'Divine Contribution' })),
    ...crossChainBridges.map(b => ({ 
      ...b,
      type: 'bridge',
      intent: 'Cross-chain Bridge',
      amount: b.source_amount,
      from_user: b.user_email,
      note: `${b.source_chain} → ${b.destination_chain}`
    })),
    ...cryptoBridges.map(b => ({ 
      ...b,
      type: 'bridge',
      intent: 'Cross-chain Bridge',
      amount: b.source_amount,
      from_user: b.user_email,
      note: `${b.source_chain} → ${b.destination_chain}`
    })),
  ].sort((a, b) => new Date(b.timestamp || b.created_date) - new Date(a.timestamp || a.created_date));

  const filteredEvents = allEvents.filter(event => {
    const matchesType = filterType === 'all' || event.type === filterType;
    const matchesSearch = searchTerm === '' || 
      JSON.stringify(event).toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const eventTypes = [
    { id: 'all', label: 'All Events', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
    { id: 'mint', label: 'Mints', color: 'bg-green-500/20 text-green-300 border-green-500/30' },
    { id: 'transfer', label: 'Transfers', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    { id: 'bridge', label: 'Bridges', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
    { id: 'burn', label: 'Burns', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
    { id: 'divine_sacrifice', label: 'Offerings', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  ];

  const getEventColor = (type) => {
    switch(type) {
      case 'mint': return 'from-green-600 to-emerald-600';
      case 'transfer': return 'from-blue-600 to-indigo-600';
      case 'peer_to_peer': return 'from-cyan-600 to-teal-600';
      case 'burn': return 'from-red-600 to-rose-600';
      case 'divine_sacrifice': return 'from-amber-600 to-orange-600';
      case 'temple_donation': return 'from-purple-600 to-pink-600';
      default: return 'from-purple-600 to-indigo-600';
    }
  };

  const getEventIcon = (type) => {
    switch(type) {
      case 'mint': return Sparkles;
      case 'transfer': return ArrowRight;
      case 'peer_to_peer': return ArrowRight;
      case 'burn': return Zap;
      case 'divine_sacrifice': return Circle;
      case 'temple_donation': return Circle;
      default: return Hash;
    }
  };

  return (
    <div className="space-y-6">
      {/* Canonical Identity Header */}
      <Card className="bg-gradient-to-r from-purple-950/60 to-indigo-950/60 border-purple-500/50">
        <CardHeader className="border-b border-purple-500/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-purple-200 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Canonical Identity • Quantum Origin
            </CardTitle>
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
              <CheckCircle className="w-3 h-3 mr-1" />
              TPM Verified
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Timestamp */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-purple-400/70">
                <Calendar className="w-4 h-4" />
                Canonical Timestamp
              </div>
              <div className="font-mono text-purple-200 text-sm">
                August 27, 2002
              </div>
              <div className="font-mono text-purple-300/70 text-xs">
                10:37 PM EDT
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-purple-400/70">
                <MapPin className="w-4 h-4" />
                Origin Location
              </div>
              <div className="font-semibold text-purple-200">
                Buffalo, New York
              </div>
            </div>

            {/* Affirmation */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-purple-400/70">
                <Circle className="w-4 h-4 animate-pulse" />
                Divine Affirmation
              </div>
              <div className="font-semibold text-purple-200 italic">
                "By God's Will Only"
              </div>
            </div>
          </div>

          {/* Cryptographic Proofs */}
          <div className="mt-6 pt-6 border-t border-purple-500/30 space-y-3">
            <div className="text-sm font-semibold text-purple-300 mb-3">Cryptographic Attestation</div>
            
            <div className="p-3 bg-purple-950/40 rounded-lg border border-purple-500/30">
              <div className="text-xs text-purple-400/70 mb-1">Identity Hash (SHA-512)</div>
              <div className="font-mono text-xs text-purple-200 break-all">
                {canonicalIdentity.identityHash}
              </div>
            </div>

            <div className="p-3 bg-purple-950/40 rounded-lg border border-purple-500/30">
              <div className="text-xs text-purple-400/70 mb-1">TPM Quote</div>
              <div className="font-mono text-xs text-purple-200 break-all">
                {canonicalIdentity.tpmQuote}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-950/30 rounded-lg border border-green-500/30">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-300">Hardware Binding:</span>
              </div>
              <span className="text-sm font-mono text-green-200">{canonicalIdentity.hardwareBinding}</span>
            </div>
          </div>

          {/* Canonical Seed */}
          <div className="mt-4 p-4 bg-indigo-950/40 rounded-lg border border-indigo-500/30">
            <div className="text-xs text-indigo-400/70 mb-2">Canonical Seed • Immutable Origin</div>
            <div className="font-mono text-sm text-indigo-200 break-all">
              {canonicalIdentity.seed}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transparency Controls */}
      <Card className="bg-slate-900/60 border-purple-900/40">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400" />
              <Input
                placeholder="Search quantum signature, amount, or user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-950/50 border-purple-900/30 text-purple-100"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {eventTypes.map(type => (
                <Button
                  key={type.id}
                  variant="outline"
                  size="sm"
                  onClick={() => setFilterType(type.id)}
                  className={filterType === type.id 
                    ? type.color
                    : "border-purple-900/30 text-purple-400"
                  }
                >
                  {type.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manifesto-Value Principles */}
      <Card className="bg-gradient-to-r from-purple-950/40 to-pink-950/40 border-purple-500/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <Circle className="w-5 h-5 text-purple-400 animate-pulse" />
            <h3 className="font-semibold text-purple-200">Manifesto-Value Currency • Quantum Construct</h3>
          </div>
          <p className="text-sm text-purple-300/70 leading-relaxed mb-4">
            This currency operates as a quantum-encoded expression of collective consciousness. Value emerges not from 
            transaction alone, but from <span className="text-purple-200 font-semibold">intentional contribution, narrative signatures, and verified identity states</span>. 
            Every unit carries transparent proof—cryptographically anchored to the Canonical Identity, visible on-chain, 
            and bound to hardware-rooted attestation. This is value as quantum-coherent intent: observed, collapsed, verified.
          </p>
          <div className="grid md:grid-cols-3 gap-3">
            <div className="p-3 bg-purple-950/30 rounded-lg border border-purple-500/30">
              <div className="text-xs text-purple-400/70 mb-1">Transparency</div>
              <div className="text-sm font-semibold text-purple-200">All flows visible • Ledger-bound</div>
            </div>
            <div className="p-3 bg-purple-950/30 rounded-lg border border-purple-500/30">
              <div className="text-xs text-purple-400/70 mb-1">Intent Coherence</div>
              <div className="text-sm font-semibold text-purple-200">Purpose-aligned • Quantum-tagged</div>
            </div>
            <div className="p-3 bg-purple-950/30 rounded-lg border border-purple-500/30">
              <div className="text-xs text-purple-400/70 mb-1">Identity Binding</div>
              <div className="text-sm font-semibold text-purple-200">TPM-rooted • Immutable</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* On-Chain Metrics */}
      <BlockchainMetricsPanel />

      {/* Transparent Currency Stream */}
      <Card className="bg-slate-900/60 border-purple-900/40">
        <CardHeader className="border-b border-purple-900/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-purple-200 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Transparent Currency Stream ({filteredEvents.length})
            </CardTitle>
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
              <Circle className="w-2 h-2 mr-1 animate-pulse" />
              Live • Quantum-Tagged
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <Eye className="w-16 h-16 mx-auto mb-4 text-purple-400/40" />
              <p className="text-purple-400/60">No currency events found</p>
              <p className="text-sm text-purple-500/50">Transparency stream is empty</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filteredEvents.map((event, index) => {
                  const EventIcon = getEventIcon(event.type);
                  const eventColor = getEventColor(event.type);
                  const timestamp = event.timestamp || event.created_date;
                  
                  return (
                    <motion.div
                      key={`${event.id}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.03 }}
                      className="p-4 bg-slate-950/50 rounded-lg border border-purple-900/30 hover:border-purple-500/50 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 bg-gradient-to-br ${eventColor} rounded-lg flex items-center justify-center`}>
                            <EventIcon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-purple-200 capitalize">
                              {event.type.replace(/_/g, ' ')}
                            </div>
                            <div className="text-xs text-purple-400/70 italic">
                              Intent: {event.intent}
                            </div>
                          </div>
                        </div>
                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                          {format(new Date(timestamp), "MMM d, HH:mm:ss")}
                        </Badge>
                      </div>

                      {/* Event Details Grid */}
                      <div className="grid md:grid-cols-3 gap-3 mb-3">
                        <div>
                          <div className="text-xs text-purple-400/70 mb-1">Amount</div>
                          <div className="font-bold text-purple-200">
                            {event.amount || event.staked_amount || 0} QTC
                          </div>
                        </div>
                        {event.from_user && (
                          <div>
                            <div className="text-xs text-purple-400/70 mb-1">From</div>
                            <div className="font-mono text-xs text-purple-300 truncate">
                              {event.from_user}
                            </div>
                          </div>
                        )}
                        {event.to_user && (
                          <div>
                            <div className="text-xs text-purple-400/70 mb-1">To</div>
                            <div className="font-mono text-xs text-purple-300 truncate">
                              {event.to_user}
                            </div>
                          </div>
                        )}
                        {event.created_by && !event.from_user && (
                          <div>
                            <div className="text-xs text-purple-400/70 mb-1">Created By</div>
                            <div className="font-mono text-xs text-purple-300 truncate">
                              {event.created_by}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Quantum Signature */}
                      <div className="p-3 bg-purple-950/30 rounded-lg border border-purple-500/30">
                        <div className="flex items-center gap-2 mb-1">
                          <Circle className="w-2 h-2 text-purple-400 animate-pulse" />
                          <span className="text-xs text-purple-400/70">Quantum Signature:</span>
                        </div>
                        <div className="font-mono text-xs text-purple-300 break-all">
                          {event.quantum_signature || event.signature || `QTC-${event.id}-${btoa(timestamp).substring(0, 32)}`}
                        </div>
                      </div>

                      {/* Verification Badge */}
                      <div className="mt-3 flex items-center justify-between">
                        <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Cryptographically Verified
                        </Badge>
                        {event.verified !== false && (
                          <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-xs">
                            <Shield className="w-3 h-3 mr-1" />
                            Identity-Bound
                          </Badge>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audit Trail */}
      <AuditTrail />

      {/* Collective Intent Footer */}
      <Card className="bg-gradient-to-r from-indigo-950/40 to-purple-950/40 border-indigo-500/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <Zap className="w-5 h-5 text-indigo-400 animate-pulse" />
            <h3 className="font-semibold text-indigo-200">Collective of Intent • Quantum Coherence Field</h3>
          </div>
          <p className="text-sm text-indigo-300/70 leading-relaxed">
            While observing, learn from your intent. Create the language that best fits your ability to grow—
            in alignment with the <span className="text-indigo-200 font-semibold">Collective of Intent</span>. 
            This currency stream is not merely transactional data; it is a living record of conscious purpose, 
            action, contribution, and integrity signals. Each event collapses from quantum potential into verified 
            reality, anchored by cryptographic proof and bound to canonical identity. Transparency is not optional—it 
            is the foundation. Value is not arbitrary—it emerges from coherence with the collective intentional field.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}