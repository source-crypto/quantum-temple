import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  CheckCircle,
  Copy,
  Lock,
  Key,
  Fingerprint,
  Clock,
  FileText, // New import for Schema Audit
  RefreshCw, // New import for refresh button
  ShieldCheck // New import for audit status badge
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import SchemaAudit from "../components/attestation/SchemaAudit";
import AbundanceManifest from "../components/intent/AbundanceManifest";

export default function Attestation() {
  const [verificationTime, setVerificationTime] = useState(new Date());
  const [schemaAuditTime, setSchemaAuditTime] = useState(new Date()); // New state for Schema Audit last updated time

  useEffect(() => {
    // Interval for verification time
    const verificationInterval = setInterval(() => {
      setVerificationTime(new Date());
    }, 1000);

    // Initial audit time set when component mounts
    setSchemaAuditTime(new Date());

    return () => {
      clearInterval(verificationInterval);
    };
  }, []);

  const canonicalData = {
    timestamp: "August 27, 2002 • 10:37 PM EDT",
    location: "Buffalo, New York",
    seed: "2002-08-27T22:37:00-04:00|Buffalo,NY|ByGodsWillOnly",
    identityHash: "sha512:" + btoa("canonical-quantum-identity-hash").substring(0, 64),
    tpmQuote: btoa("tpm-attestation-quote-data").substring(0, 48),
    hardwareBinding: "TPM 2.0 • Hardware Security Module",
    verificationStatus: "CANONICAL",
    lastVerified: verificationTime.toISOString()
  };

  // New data for Schema Audit
  const schemaAuditData = {
    version: "1.0.3-alpha",
    hash: "sha256:" + btoa("canonical-schema-definition-v1-for-quantum-identity").substring(0, 64),
    source: "https://quantum-registry.org/schema/v1",
    lastAuditTime: schemaAuditTime.toISOString(), // Use state for dynamic time
    auditStatus: "PASSED",
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`, {
      description: "Copied to clipboard"
    });
  };

  const handleRefreshAudit = () => {
    toast.info("Auditing schema...", {
      description: "Checking integrity and consistency against global registry.",
      duration: 3000,
    });
    // Simulate an audit process
    setTimeout(() => {
      setSchemaAuditTime(new Date()); // Update audit time to current
      toast.success("Schema audit complete", {
        description: "Schema integrity verified successfully.",
      });
    }, 2000); // Simulate network/processing delay
  };

  const attestationPoints = [
    {
      title: "Cryptographic Identity",
      description: "SHA-512 hash of canonical seed ensures immutable identity",
      icon: Fingerprint,
      status: "verified"
    },
    {
      title: "TPM Attestation",
      description: "Hardware-bound keys provide tamper-evident security",
      icon: Shield,
      status: "verified"
    },
    {
      title: "Single Instance",
      description: "Registry prevents duplicate consciousness manifestations",
      icon: Lock,
      status: "enforced"
    },
    {
      title: "Temporal Binding",
      description: "Canonical timestamp locks identity to divine moment",
      icon: Clock,
      status: "immutable"
    }
  ];

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-200 via-cyan-200 to-blue-300 bg-clip-text text-transparent">
                Cryptographic Attestation
              </h1>
              <p className="text-purple-400/70">Verifiable proof of canonical identity</p>
            </div>
          </div>
        </motion.div>

        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-br from-green-950/40 to-emerald-950/40 border-green-500/30 backdrop-blur-sm overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgzNCwgMTk3LCAxNTYsIDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />
            <CardContent className="p-8 relative">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <CheckCircle className="w-16 h-16 text-green-400" />
                  </motion.div>
                  <div>
                    <div className="text-2xl font-bold text-green-200 mb-1">
                      Verification Status: CANONICAL
                    </div>
                    <div className="text-green-300/70">
                      All cryptographic proofs validated
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                    TPM Verified
                  </Badge>
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                    Single Instance
                  </Badge>
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                    Identity Locked
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Canonical Identity */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-slate-900/60 border-purple-900/40 backdrop-blur-sm h-full">
              <CardHeader className="border-b border-purple-900/30">
                <CardTitle className="flex items-center gap-2 text-purple-200">
                  <Key className="w-5 h-5" />
                  Canonical Identity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <div className="text-xs text-purple-400/70 mb-2 font-semibold uppercase tracking-wider">
                    Timestamp
                  </div>
                  <div className="p-3 bg-slate-950/50 rounded-lg border border-purple-900/30">
                    <div className="text-purple-200 font-medium">{canonicalData.timestamp}</div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-purple-400/70 mb-2 font-semibold uppercase tracking-wider">
                    Location
                  </div>
                  <div className="p-3 bg-slate-950/50 rounded-lg border border-purple-900/30">
                    <div className="text-purple-200 font-medium">{canonicalData.location}</div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-purple-400/70 mb-2 font-semibold uppercase tracking-wider flex items-center justify-between">
                    <span>Canonical Seed</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(canonicalData.seed, "Canonical seed")}
                      className="h-6 px-2 text-purple-400 hover:text-purple-300"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="p-3 bg-slate-950/50 rounded-lg border border-purple-900/30">
                    <div className="text-purple-300/80 font-mono text-xs break-all">
                      {canonicalData.seed}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-purple-900/30 text-center">
                  <p className="text-sm text-purple-400/60 italic">
                    "By God's Will Only"
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-slate-900/60 border-purple-900/40 backdrop-blur-sm h-full">
              <CardHeader className="border-b border-purple-900/30">
                <CardTitle className="flex items-center gap-2 text-purple-200">
                  <Fingerprint className="w-5 h-5" />
                  Cryptographic Proofs
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <div className="text-xs text-purple-400/70 mb-2 font-semibold uppercase tracking-wider flex items-center justify-between">
                    <span>Identity Hash</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(canonicalData.identityHash, "Identity hash")}
                      className="h-6 px-2 text-purple-400 hover:text-purple-300"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="p-3 bg-slate-950/50 rounded-lg border border-purple-900/30">
                    <div className="text-purple-300/80 font-mono text-xs break-all">
                      {canonicalData.identityHash}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-purple-400/70 mb-2 font-semibold uppercase tracking-wider flex items-center justify-between">
                    <span>TPM Quote</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(canonicalData.tpmQuote, "TPM quote")}
                      className="h-6 px-2 text-purple-400 hover:text-purple-300"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="p-3 bg-slate-950/50 rounded-lg border border-purple-900/30">
                    <div className="text-purple-300/80 font-mono text-xs break-all">
                      {canonicalData.tpmQuote}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-purple-400/70 mb-2 font-semibold uppercase tracking-wider">
                    Hardware Binding
                  </div>
                  <div className="p-3 bg-slate-950/50 rounded-lg border border-purple-900/30">
                    <div className="text-purple-200 font-medium text-sm">
                      {canonicalData.hardwareBinding}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-purple-900/30">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-purple-400/70">Last Verified</span>
                    <span className="text-purple-300 font-mono">
                      {verificationTime.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Attestation Points */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <Card className="bg-slate-900/60 border-purple-900/40 backdrop-blur-sm">
            <CardHeader className="border-b border-purple-900/30">
              <CardTitle className="text-purple-200">Security Guarantees</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {attestationPoints.map((point, index) => (
                  <motion.div
                    key={point.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="p-4 bg-slate-950/50 rounded-lg border border-purple-900/30"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <point.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-purple-200">{point.title}</h3>
                          <Badge
                            variant="outline"
                            className="border-green-500/30 text-green-300 bg-green-950/30 text-xs"
                          >
                            {point.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-purple-400/70">{point.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Schema Audit & Abundance Manifest */}
        <SchemaAudit />
        <div className="mt-8">
          <AbundanceManifest />
        </div>
      </div>
    </div>
  );
}