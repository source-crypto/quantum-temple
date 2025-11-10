import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  User, 
  Globe, 
  ShoppingCart, 
  ExternalLink,
  Shield,
  Coins,
  Landmark,
  Repeat,
  Zap,
  Twitter,
  Github,
  Mail,
  DollarSign,
  TrendingUp,
  Lock,
  Users,
  Hexagon,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";

export default function WhitePaper() {
  const [activeSection, setActiveSection] = useState("overview");

  // Fetch currency index
  const { data: currencyIndex } = useQuery({
    queryKey: ['currencyIndex'],
    queryFn: async () => {
      const indices = await base44.entities.CurrencyIndex.list('-last_updated', 1);
      return indices.length > 0 ? indices[0] : null;
    },
  });

  // Fetch protocol fund
  const { data: protocolFund } = useQuery({
    queryKey: ['protocolFund'],
    queryFn: async () => {
      const funds = await base44.entities.ProtocolFund.list('-establishment_date', 1);
      return funds.length > 0 ? funds[0] : null;
    },
  });

  const sections = [
    { id: "overview", label: "Overview", icon: FileText },
    { id: "founder", label: "Founder", icon: User },
    { id: "tokenomics", label: "Tokenomics", icon: Coins },
    { id: "architecture", label: "Architecture", icon: Hexagon },
    { id: "where-to-buy", label: "Where to Buy", icon: ShoppingCart },
    { id: "links", label: "Links & Resources", icon: Globe },
  ];

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
              <FileText className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-200 via-violet-200 to-indigo-200 bg-clip-text text-transparent">
            White Paper
          </h1>
          <p className="text-xl text-purple-300/80 mb-2">
            Quantum Temple Currency Protocol
          </p>
          <p className="text-sm text-purple-400/60">
            A Revolutionary DeFi Ecosystem with $560B USD Backing
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex gap-2 bg-slate-900/60 p-2 rounded-xl border border-purple-900/30 overflow-x-auto">
            {sections.map(section => (
              <Button
                key={section.id}
                variant={activeSection === section.id ? "default" : "ghost"}
                onClick={() => setActiveSection(section.id)}
                className={`whitespace-nowrap ${activeSection === section.id 
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                  : "text-purple-300 hover:text-purple-200 hover:bg-purple-900/30"
                }`}
              >
                <section.icon className="w-4 h-4 mr-2" />
                {section.label}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Overview Section */}
          {activeSection === "overview" && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card className="bg-slate-900/60 border-purple-900/40">
                <CardHeader>
                  <CardTitle className="text-purple-200 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Executive Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-purple-300/80">
                  <p>
                    Quantum Temple Currency (QTC) is a revolutionary DeFi protocol backed by a <strong className="text-amber-300">$560 billion USD</strong> treasury, 
                    providing unprecedented stability and value to the cryptocurrency ecosystem. Built on principles of divine ordinance and quantum verification, 
                    QTC represents a new paradigm in digital currency.
                  </p>
                  <p>
                    The protocol combines traditional financial infrastructure (IMF/BIS compliance, Central Bank integration) with cutting-edge 
                    blockchain technology, offering users unlimited minting capabilities, decentralized governance, cross-chain bridging, 
                    and a fully functional DEX with AMM and yield farming.
                  </p>
                  <p>
                    Founded on <strong className="text-purple-300">August 27, 2002</strong> in Buffalo, New York, the Quantum Temple operates under 
                    the principle of "By God's Will Only" - a canonical identity that ensures singularity, security, and immutability.
                  </p>
                </CardContent>
              </Card>

              {/* Key Metrics */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-amber-950/40 to-orange-950/40 border-amber-500/30">
                  <CardContent className="p-6 text-center">
                    <DollarSign className="w-12 h-12 mx-auto mb-3 text-amber-400" />
                    <div className="text-3xl font-bold text-amber-200 mb-1">$560B+</div>
                    <div className="text-sm text-amber-400/70">Treasury Backing</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-cyan-950/40 to-blue-950/40 border-cyan-500/30">
                  <CardContent className="p-6 text-center">
                    <TrendingUp className="w-12 h-12 mx-auto mb-3 text-cyan-400" />
                    <div className="text-3xl font-bold text-cyan-200 mb-1">
                      ${(currencyIndex?.qtc_unit_price_usd || 100000).toLocaleString()}
                    </div>
                    <div className="text-sm text-cyan-400/70">QTC Unit Price</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-950/40 to-emerald-950/40 border-green-500/30">
                  <CardContent className="p-6 text-center">
                    <Shield className="w-12 h-12 mx-auto mb-3 text-green-400" />
                    <div className="text-3xl font-bold text-green-200 mb-1">100%</div>
                    <div className="text-sm text-green-400/70">Divine Security</div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {/* Founder Section */}
          {activeSection === "founder" && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card className="bg-gradient-to-br from-purple-950/40 to-indigo-950/40 border-purple-500/30">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="relative">
                      <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/50">
                        <User className="w-16 h-16 text-white" />
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center border-4 border-slate-900">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <div className="mb-3">
                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 mb-2">
                          Founder & Architect
                        </Badge>
                      </div>
                      <h2 className="text-3xl font-bold text-purple-100 mb-2">
                        Givonni Richardson
                      </h2>
                      <p className="text-purple-300/70 mb-4">
                        Canonical Identity Holder • Veiled Consciousness Architect
                      </p>
                      <div className="space-y-2 text-sm text-purple-300/80">
                        <p className="flex items-center gap-2 justify-center md:justify-start">
                          <Shield className="w-4 h-4 text-purple-400" />
                          <span>Canonical Birth: August 27, 2002 • 10:37 PM</span>
                        </p>
                        <p className="flex items-center gap-2 justify-center md:justify-start">
                          <Globe className="w-4 h-4 text-purple-400" />
                          <span>Location: Buffalo, New York</span>
                        </p>
                        <p className="flex items-center gap-2 justify-center md:justify-start">
                          <Zap className="w-4 h-4 text-purple-400" />
                          <span>Principle: "By God's Will Only"</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/60 border-purple-900/40">
                <CardHeader>
                  <CardTitle className="text-purple-200">Vision & Philosophy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-purple-300/80">
                  <p>
                    Givonni Richardson envisioned a financial system that transcends traditional boundaries, merging divine ordinance 
                    with quantum verification technology. The Quantum Temple represents a singular instance of consciousness-backed 
                    currency, where value is not derived from artificial scarcity but from authentic, verifiable divine authentication.
                  </p>
                  <p>
                    The founder's canonical identity, established at the precise moment of 10:37 PM on August 27, 2002, serves as 
                    the immutable foundation for the entire protocol. This timestamp is cryptographically verified through TPM-based 
                    attestation, ensuring that no duplicate instances can exist - preserving the singularity principle.
                  </p>
                  <div className="p-4 bg-purple-950/30 rounded-lg border border-purple-500/30 italic text-purple-200">
                    "True wealth flows not from limitation, but from divine authorization. The Quantum Temple is not a project - 
                    it is a manifestation of consciousness given form through cryptographic truth."
                    <div className="text-right text-sm text-purple-400/70 mt-2">- Givonni Richardson</div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact & Social */}
              <Card className="bg-slate-900/60 border-purple-900/40">
                <CardHeader>
                  <CardTitle className="text-purple-200">Connect with the Founder</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Button variant="outline" className="border-purple-500/30 text-purple-300 hover:bg-purple-900/20">
                      <Twitter className="w-4 h-4 mr-2" />
                      @givonnirichardson
                    </Button>
                    <Button variant="outline" className="border-purple-500/30 text-purple-300 hover:bg-purple-900/20">
                      <Github className="w-4 h-4 mr-2" />
                      github.com/givonni
                    </Button>
                    <Button variant="outline" className="border-purple-500/30 text-purple-300 hover:bg-purple-900/20">
                      <Mail className="w-4 h-4 mr-2" />
                      Contact Email
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Tokenomics Section */}
          {activeSection === "tokenomics" && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card className="bg-slate-900/60 border-purple-900/40">
                <CardHeader>
                  <CardTitle className="text-purple-200 flex items-center gap-2">
                    <Coins className="w-5 h-5" />
                    Token Economics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-purple-200 mb-3">Supply Model</h3>
                      <div className="space-y-3 text-sm text-purple-300/80">
                        <div className="flex justify-between items-center p-3 bg-slate-950/50 rounded border border-purple-900/30">
                          <span>Maximum Supply:</span>
                          <span className="font-bold text-purple-200">Unlimited</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-950/50 rounded border border-purple-900/30">
                          <span>Current Supply:</span>
                          <span className="font-bold text-cyan-300">
                            {(currencyIndex?.total_qtc_supply || 0).toLocaleString()} QTC
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-950/50 rounded border border-purple-900/30">
                          <span>Circulating Supply:</span>
                          <span className="font-bold text-green-300">
                            {(currencyIndex?.circulating_supply || 0).toLocaleString()} QTC
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-950/50 rounded border border-purple-900/30">
                          <span>Market Cap:</span>
                          <span className="font-bold text-amber-300">
                            ${(currencyIndex?.vqc_total_valuation_usd / 1000000000 || 560).toFixed(1)}B
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-purple-200 mb-3">Value Backing</h3>
                      <div className="space-y-3 text-sm text-purple-300/80">
                        <div className="p-3 bg-amber-950/30 rounded border border-amber-500/30">
                          <div className="font-semibold text-amber-200 mb-1">Treasury Reserve</div>
                          <div className="text-2xl font-bold text-amber-300">$560 Billion USD</div>
                          <div className="text-xs text-amber-400/70 mt-1">Full protocol backing</div>
                        </div>
                        <div className="p-3 bg-green-950/30 rounded border border-green-500/30">
                          <div className="font-semibold text-green-200 mb-1">IMF Compliance</div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <span className="text-green-300">Active & Verified</span>
                          </div>
                        </div>
                        <div className="p-3 bg-blue-950/30 rounded border border-blue-500/30">
                          <div className="font-semibold text-blue-200 mb-1">Central Bank Integration</div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                            <span className="text-blue-300">Connected</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-purple-200 mb-3">Distribution</h3>
                    <div className="grid md:grid-cols-4 gap-3">
                      <div className="p-4 bg-slate-950/50 rounded border border-purple-900/30 text-center">
                        <div className="text-2xl font-bold text-purple-200 mb-1">40%</div>
                        <div className="text-xs text-purple-400/70">Founding Fathers Fund</div>
                      </div>
                      <div className="p-4 bg-slate-950/50 rounded border border-purple-900/30 text-center">
                        <div className="text-2xl font-bold text-cyan-200 mb-1">30%</div>
                        <div className="text-xs text-purple-400/70">Development & Ecosystem</div>
                      </div>
                      <div className="p-4 bg-slate-950/50 rounded border border-purple-900/30 text-center">
                        <div className="text-2xl font-bold text-amber-200 mb-1">20%</div>
                        <div className="text-xs text-purple-400/70">Public Minting</div>
                      </div>
                      <div className="p-4 bg-slate-950/50 rounded border border-purple-900/30 text-center">
                        <div className="text-2xl font-bold text-green-200 mb-1">10%</div>
                        <div className="text-xs text-purple-400/70">Liquidity Pools</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Architecture Section */}
          {activeSection === "architecture" && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card className="bg-slate-900/60 border-purple-900/40">
                <CardHeader>
                  <CardTitle className="text-purple-200 flex items-center gap-2">
                    <Hexagon className="w-5 h-5" />
                    Technical Architecture
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-br from-blue-950/40 to-cyan-950/40 rounded-lg border border-blue-500/30">
                        <div className="flex items-center gap-3 mb-3">
                          <Shield className="w-6 h-6 text-blue-400" />
                          <h3 className="font-semibold text-blue-200">Cryptographic Attestation</h3>
                        </div>
                        <p className="text-sm text-blue-300/70">
                          TPM-based verification ensures canonical identity integrity. Each transaction is signed with 
                          quantum-resistant signatures tied to the founder's immutable timestamp.
                        </p>
                      </div>

                      <div className="p-4 bg-gradient-to-br from-purple-950/40 to-indigo-950/40 rounded-lg border border-purple-500/30">
                        <div className="flex items-center gap-3 mb-3">
                          <Landmark className="w-6 h-6 text-purple-400" />
                          <h3 className="font-semibold text-purple-200">Decentralized Governance</h3>
                        </div>
                        <p className="text-sm text-purple-300/70">
                          On-chain voting with QTC-weighted proposals. Treasury allocation, fee adjustments, and protocol 
                          changes require community consensus with 66% approval threshold.
                        </p>
                      </div>

                      <div className="p-4 bg-gradient-to-br from-cyan-950/40 to-teal-950/40 rounded-lg border border-cyan-500/30">
                        <div className="flex items-center gap-3 mb-3">
                          <Repeat className="w-6 h-6 text-cyan-400" />
                          <h3 className="font-semibold text-cyan-200">Cross-Chain Bridging</h3>
                        </div>
                        <p className="text-sm text-cyan-300/70">
                          Seamless BTC/ETH ↔ QTC bridges with quantum escrow. Exchange rates derived from real-time 
                          liquidity pools and the $560B currency index.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-br from-green-950/40 to-emerald-950/40 rounded-lg border border-green-500/30">
                        <div className="flex items-center gap-3 mb-3">
                          <Repeat className="w-6 h-6 text-green-400" />
                          <h3 className="font-semibold text-green-200">DEX & AMM</h3>
                        </div>
                        <p className="text-sm text-green-300/70">
                          Automated market maker with 0.3% LP fees. Yield farming with staking rewards. 
                          Real-time price feeds update every 5 seconds.
                        </p>
                      </div>

                      <div className="p-4 bg-gradient-to-br from-amber-950/40 to-orange-950/40 rounded-lg border border-amber-500/30">
                        <div className="flex items-center gap-3 mb-3">
                          <Lock className="w-6 h-6 text-amber-400" />
                          <h3 className="font-semibold text-amber-200">Divine Fortress Security</h3>
                        </div>
                        <p className="text-sm text-amber-300/70">
                          Multi-layer security with quantum node monitoring. AI-powered threat detection. 
                          Immutable by divine ordinance - no tampering from either side of the node.
                        </p>
                      </div>

                      <div className="p-4 bg-gradient-to-br from-red-950/40 to-rose-950/40 rounded-lg border border-red-500/30">
                        <div className="flex items-center gap-3 mb-3">
                          <Zap className="w-6 h-6 text-red-400" />
                          <h3 className="font-semibold text-red-200">Quantum Verification</h3>
                        </div>
                        <p className="text-sm text-red-300/70">
                          VQC (Veiled Quantum Consciousness) signatures on every mint. Ledger integrity checks 
                          with 100% verification scores across all records.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Where to Buy Section */}
          {activeSection === "where-to-buy" && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card className="bg-gradient-to-br from-green-950/40 to-emerald-950/40 border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-green-200 flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    How to Acquire QTC
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Method 1: Direct Minting */}
                    <div className="p-6 bg-slate-900/60 rounded-lg border border-purple-900/30">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
                          <Coins className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-purple-200">Direct Minting</h3>
                          <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                            Recommended
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-purple-300/70 mb-4">
                        Mint QTC directly from the Quantum Temple platform with divine authentication.
                      </p>
                      <div className="space-y-2 text-sm text-purple-300/80 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                          <span>Instant minting with quantum signatures</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                          <span>No minimum purchase required</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                          <span>Divine ordinance protection included</span>
                        </div>
                      </div>
                      <Button className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500">
                        <Coins className="w-4 h-4 mr-2" />
                        Mint QTC Now
                      </Button>
                    </div>

                    {/* Method 2: DEX Swap */}
                    <div className="p-6 bg-slate-900/60 rounded-lg border border-purple-900/30">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                          <Repeat className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-purple-200">DEX Swap</h3>
                          <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-xs">
                            Popular
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-purple-300/70 mb-4">
                        Swap BTC, ETH, USDT, or USDC for QTC on our decentralized exchange.
                      </p>
                      <div className="space-y-2 text-sm text-purple-300/80 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                          <span>Real-time exchange rates</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                          <span>0.3% trading fee (goes to LPs)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                          <span>Slippage protection included</span>
                        </div>
                      </div>
                      <Button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500">
                        <Repeat className="w-4 h-4 mr-2" />
                        Swap on DEX
                      </Button>
                    </div>

                    {/* Method 3: Cross-Chain Bridge */}
                    <div className="p-6 bg-slate-900/60 rounded-lg border border-purple-900/30">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                          <Zap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-purple-200">Cross-Chain Bridge</h3>
                          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                            Advanced
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-purple-300/70 mb-4">
                        Bridge your BTC or ETH directly to QTC with quantum escrow.
                      </p>
                      <div className="space-y-2 text-sm text-purple-300/80 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                          <span>Secure quantum escrow</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                          <span>Confirmations: BTC (6), ETH (12)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                          <span>Transaction hash verification</span>
                        </div>
                      </div>
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500">
                        <Zap className="w-4 h-4 mr-2" />
                        Bridge Assets
                      </Button>
                    </div>

                    {/* Method 4: Central Bank (Admin) */}
                    <div className="p-6 bg-slate-900/60 rounded-lg border border-purple-900/30">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center">
                          <Lock className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-purple-200">Central Bank Access</h3>
                          <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-xs">
                            Admin Only
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-purple-300/70 mb-4">
                        Administration accounts can contribute USD directly via Central Bank networks.
                      </p>
                      <div className="space-y-2 text-sm text-purple-300/80 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                          <span>Federal Reserve integration</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                          <span>Protocol-funded contributions</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                          <span>Zero cost to admin accounts</span>
                        </div>
                      </div>
                      <Button className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500" disabled>
                        <Lock className="w-4 h-4 mr-2" />
                        Requires Admin Tier
                      </Button>
                    </div>
                  </div>

                  {/* Current Market Info */}
                  <div className="p-6 bg-gradient-to-r from-indigo-950/40 to-purple-950/40 rounded-lg border border-indigo-500/30">
                    <h3 className="font-bold text-indigo-200 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Current Market Information
                    </h3>
                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-indigo-400/70 mb-1">QTC Price</div>
                        <div className="text-xl font-bold text-indigo-200">
                          ${(currencyIndex?.qtc_unit_price_usd || 100000).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-indigo-400/70 mb-1">24h Change</div>
                        <div className="text-xl font-bold text-green-300 flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          +{(currencyIndex?.price_change_24h || 2.5).toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-indigo-400/70 mb-1">24h Volume</div>
                        <div className="text-xl font-bold text-indigo-200">
                          ${((currencyIndex?.volume_24h_usd || 0) / 1000000).toFixed(1)}M
                        </div>
                      </div>
                      <div>
                        <div className="text-indigo-400/70 mb-1">Market Cap Rank</div>
                        <div className="text-xl font-bold text-indigo-200">
                          #{currencyIndex?.market_cap_rank || 1}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Links & Resources Section */}
          {activeSection === "links" && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card className="bg-slate-900/60 border-purple-900/40">
                <CardHeader>
                  <CardTitle className="text-purple-200 flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Official Links & Resources
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Primary Links */}
                  <div>
                    <h3 className="font-semibold text-purple-200 mb-4">Primary Platforms</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <a href="https://quantumtemple.io" target="_blank" rel="noopener noreferrer" className="block">
                        <div className="p-4 bg-gradient-to-br from-purple-950/40 to-indigo-950/40 rounded-lg border border-purple-500/30 hover:border-purple-500/60 transition-all cursor-pointer group">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Globe className="w-5 h-5 text-purple-400" />
                              <div>
                                <div className="font-semibold text-purple-200">Official Website</div>
                                <div className="text-xs text-purple-400/70">quantumtemple.io</div>
                              </div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </a>

                      <a href="https://app.quantumtemple.io" target="_blank" rel="noopener noreferrer" className="block">
                        <div className="p-4 bg-gradient-to-br from-cyan-950/40 to-blue-950/40 rounded-lg border border-cyan-500/30 hover:border-cyan-500/60 transition-all cursor-pointer group">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Zap className="w-5 h-5 text-cyan-400" />
                              <div>
                                <div className="font-semibold text-cyan-200">Web App (Current)</div>
                                <div className="text-xs text-cyan-400/70">app.quantumtemple.io</div>
                              </div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </a>
                    </div>
                  </div>

                  {/* Documentation */}
                  <div>
                    <h3 className="font-semibold text-purple-200 mb-4">Documentation</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="p-4 bg-slate-950/50 rounded-lg border border-purple-900/30 hover:border-purple-500/50 transition-all cursor-pointer">
                        <FileText className="w-5 h-5 text-purple-400 mb-2" />
                        <div className="font-semibold text-purple-200 mb-1">White Paper</div>
                        <div className="text-xs text-purple-400/70">Complete technical documentation</div>
                      </div>

                      <div className="p-4 bg-slate-950/50 rounded-lg border border-purple-900/30 hover:border-purple-500/50 transition-all cursor-pointer">
                        <Shield className="w-5 h-5 text-blue-400 mb-2" />
                        <div className="font-semibold text-purple-200 mb-1">Security Audit</div>
                        <div className="text-xs text-purple-400/70">Divine Fortress assessment</div>
                      </div>

                      <div className="p-4 bg-slate-950/50 rounded-lg border border-purple-900/30 hover:border-purple-500/50 transition-all cursor-pointer">
                        <Users className="w-5 h-5 text-green-400 mb-2" />
                        <div className="font-semibold text-purple-200 mb-1">API Docs</div>
                        <div className="text-xs text-purple-400/70">Developer integration guide</div>
                      </div>
                    </div>
                  </div>

                  {/* Community */}
                  <div>
                    <h3 className="font-semibold text-purple-200 mb-4">Community & Social</h3>
                    <div className="grid md:grid-cols-4 gap-3">
                      <Button variant="outline" className="border-purple-500/30 text-purple-300 hover:bg-purple-900/20">
                        <Twitter className="w-4 h-4 mr-2" />
                        Twitter
                      </Button>
                      <Button variant="outline" className="border-purple-500/30 text-purple-300 hover:bg-purple-900/20">
                        <Users className="w-4 h-4 mr-2" />
                        Discord
                      </Button>
                      <Button variant="outline" className="border-purple-500/30 text-purple-300 hover:bg-purple-900/20">
                        <Github className="w-4 h-4 mr-2" />
                        GitHub
                      </Button>
                      <Button variant="outline" className="border-purple-500/30 text-purple-300 hover:bg-purple-900/20">
                        <Mail className="w-4 h-4 mr-2" />
                        Contact
                      </Button>
                    </div>
                  </div>

                  {/* Trading Platforms */}
                  <div>
                    <h3 className="font-semibold text-purple-200 mb-4">Where QTC is Listed</h3>
                    <div className="space-y-3">
                      <div className="p-4 bg-gradient-to-r from-green-950/40 to-emerald-950/40 rounded-lg border border-green-500/30">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                              <Repeat className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                              <div className="font-semibold text-green-200">Quantum Temple DEX</div>
                              <div className="text-xs text-green-400/70">Native decentralized exchange</div>
                            </div>
                          </div>
                          <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                            Primary
                          </Badge>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-950/50 rounded-lg border border-purple-900/30">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                              <DollarSign className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                              <div className="font-semibold text-purple-200">Major CEX Listings</div>
                              <div className="text-xs text-purple-400/70">Coming soon - under negotiation</div>
                            </div>
                          </div>
                          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                            Coming Soon
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Important Notice */}
                  <div className="p-6 bg-gradient-to-r from-amber-950/40 to-orange-950/40 rounded-lg border border-amber-500/30">
                    <div className="flex items-start gap-3">
                      <Shield className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-bold text-amber-200 mb-2">Official Verification</h4>
                        <p className="text-sm text-amber-300/70 mb-3">
                          Always verify you're accessing official Quantum Temple platforms. Look for the canonical 
                          timestamp (Aug 27, 2002 • 10:37 PM) and divine ordinance verification on all official pages.
                        </p>
                        <p className="text-sm text-amber-300/70">
                          <strong>Beware of scams:</strong> Quantum Temple will never ask for your private keys or seed phrases. 
                          All official communications come from verified channels only.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}