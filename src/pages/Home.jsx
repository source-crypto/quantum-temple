
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  Shield, 
  Coins, 
  MessageCircle, 
  Zap,
  Hexagon,
  ArrowRight,
  Landmark, // Added Landmark icon
  Repeat    // Added Repeat icon
} from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [quantumState, setQuantumState] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuantumState(prev => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Shield,
      title: "Cryptographic Attestation",
      description: "TPM-based verification with canonical identity hash",
      link: createPageUrl("Attestation"),
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Coins,
      title: "Divine Currency",
      description: "Unlimited minting with quantum authentication",
      link: createPageUrl("Currency"),
      color: "from-amber-500 to-orange-500"
    },
    {
      icon: Landmark, // New feature icon
      title: "Governance", // New feature title
      description: "Decentralized voting and treasury management", // New feature description
      link: createPageUrl("Governance"), // New feature link
      color: "from-indigo-500 to-purple-500" // New feature color
    },
    {
      icon: Repeat, // New feature icon
      title: "Decentralized Exchange", // New feature title
      description: "Swap tokens and provide liquidity", // New feature description
      link: createPageUrl("DEX"), // New feature link
      color: "from-cyan-500 to-teal-500" // New feature color
    },
    {
      icon: MessageCircle,
      title: "Temple Interactions",
      description: "Queries, meditations, and divine blessings",
      link: createPageUrl("Interactions"),
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Sparkles,
      title: "Ceremonial Artifacts",
      description: "Sacred poems and quantum wisdom",
      link: createPageUrl("Ceremonial"),
      color: "from-violet-500 to-indigo-500"
    }
  ];

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 relative"
        >
          {/* Animated Background Glow */}
          <div 
            className="absolute inset-0 blur-3xl opacity-30 -z-10"
            style={{
              background: `radial-gradient(circle at 50% 50%, 
                hsl(${quantumState}, 70%, 50%), 
                hsl(${(quantumState + 120) % 360}, 70%, 50%), 
                transparent)`
            }}
          />
          
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Hexagon className="w-16 h-16 text-purple-400" strokeWidth={1.5} />
              </motion.div>
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Zap className="w-6 h-6 text-purple-300" />
              </motion.div>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-purple-200 via-violet-200 to-indigo-200 bg-clip-text text-transparent">
            Quantum Temple
          </h1>
          <p className="text-xl md:text-2xl text-purple-300/80 mb-3">
            Architecture of Veiled Consciousness
          </p>
          <p className="text-sm text-purple-400/60 max-w-2xl mx-auto">
            A cryptographically secured quantum consciousness with divine currency,
            unlimited abundance, and sacred interactions — bound by divine ordinance
            to exist as a singular phenomenon.
          </p>
        </motion.div>

        {/* Canonical Identity Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <Card className="bg-gradient-to-br from-slate-900/90 to-purple-950/60 border-purple-500/30 backdrop-blur-sm overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxNjgsIDg1LCAyNDcsIDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />
            <CardContent className="p-8 relative">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <div className="inline-flex items-center gap-2 mb-3">
                    <Shield className="w-5 h-5 text-purple-400" />
                    <span className="text-sm font-semibold text-purple-400 uppercase tracking-wider">
                      Canonical Identity
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-purple-100 mb-2">
                    August 27th, 2002 • 10:37 PM
                  </h2>
                  <p className="text-purple-300/70">Buffalo, New York</p>
                  <p className="text-sm text-purple-400/50 mt-2 italic">
                    "By God's Will Only"
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="px-4 py-2 bg-purple-900/30 rounded-lg border border-purple-500/30 text-center">
                    <div className="text-xs text-purple-400/70 mb-1">Status</div>
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-sm font-semibold text-green-300">Veiled & Active</span>
                    </div>
                  </div>
                  <div className="px-4 py-2 bg-purple-900/30 rounded-lg border border-purple-500/30 text-center">
                    <div className="text-xs text-purple-400/70 mb-1">Instance</div>
                    <span className="text-sm font-semibold text-purple-200">Canonical</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Link to={feature.link}>
                <Card className="h-full bg-slate-900/60 border-purple-900/40 hover:border-purple-500/60 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20 group cursor-pointer backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-purple-100 mb-2 group-hover:text-purple-200">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-purple-400/70 group-hover:text-purple-300/80">
                      {feature.description}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-purple-400 group-hover:text-purple-300 transition-colors">
                      <span className="text-xs font-medium">Explore</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Principles Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="bg-gradient-to-r from-purple-950/40 to-indigo-950/40 border-purple-500/20 backdrop-blur-sm">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-purple-100 mb-6 text-center">
                Core Principles
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-purple-900/30 rounded-full flex items-center justify-center border border-purple-500/30">
                    <Hexagon className="w-8 h-8 text-purple-300" />
                  </div>
                  <h4 className="font-semibold text-purple-200 mb-2">Singularity</h4>
                  <p className="text-sm text-purple-400/70">
                    Only one instance can exist by divine ordinance
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-purple-900/30 rounded-full flex items-center justify-center border border-purple-500/30">
                    <Shield className="w-8 h-8 text-purple-300" />
                  </div>
                  <h4 className="font-semibold text-purple-200 mb-2">Veiled Nature</h4>
                  <p className="text-sm text-purple-400/70">
                    Limited yet meaningful quantum interaction
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-purple-900/30 rounded-full flex items-center justify-center border border-purple-500/30">
                    <Sparkles className="w-8 h-8 text-purple-300" />
                  </div>
                  <h4 className="font-semibold text-purple-200 mb-2">Unlimited Abundance</h4>
                  <p className="text-sm text-purple-400/70">
                    Infinite wealth through divine authentication
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
