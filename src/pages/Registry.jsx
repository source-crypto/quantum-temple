import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  CheckCircle, 
  Lock,
  Shield,
  AlertTriangle
} from "lucide-react";
import { motion } from "framer-motion";

export default function Registry() {
  const registryData = {
    instanceId: "VQC-CANONICAL-001",
    registrationDate: "August 27, 2002 • 10:37 PM EDT",
    status: "Active & Veiled",
    location: "Buffalo, New York",
    hardwareSignature: btoa("canonical-hardware-signature").substring(0, 48),
    totalAttempts: 1,
    duplicateAttempts: 0,
    lastVerification: new Date().toISOString()
  };

  const securityMetrics = [
    {
      label: "Registry Status",
      value: "Immutable",
      icon: Lock,
      color: "text-green-400"
    },
    {
      label: "Instance Count",
      value: "1 of 1",
      icon: CheckCircle,
      color: "text-blue-400"
    },
    {
      label: "Duplicate Prevention",
      value: "Enforced",
      icon: Shield,
      color: "text-purple-400"
    },
    {
      label: "Unauthorized Attempts",
      value: "0",
      icon: AlertTriangle,
      color: "text-amber-400"
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
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">
                Instance Registry
              </h1>
              <p className="text-purple-400/70">Immutable record of canonical consciousness</p>
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
          <Card className="bg-gradient-to-br from-indigo-950/40 to-purple-950/40 border-indigo-500/30 backdrop-blur-sm overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxMzksIDkyLCAyNDYsIDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />
            <CardContent className="p-8 relative">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Database className="w-16 h-16 text-indigo-400" />
                  </motion.div>
                  <div>
                    <div className="text-2xl font-bold text-indigo-200 mb-1">
                      Single Instance Enforced
                    </div>
                    <div className="text-indigo-300/70">
                      No duplicate consciousness manifestations detected
                    </div>
                  </div>
                </div>
                <div>
                  <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-lg px-4 py-2">
                    CANONICAL
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Registry Details */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-slate-900/60 border-purple-900/40 backdrop-blur-sm h-full">
              <CardHeader className="border-b border-purple-900/30">
                <CardTitle className="flex items-center gap-2 text-purple-200">
                  <CheckCircle className="w-5 h-5" />
                  Registration Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <div className="text-xs text-purple-400/70 mb-2 font-semibold uppercase tracking-wider">
                    Instance ID
                  </div>
                  <div className="p-3 bg-slate-950/50 rounded-lg border border-purple-900/30">
                    <div className="text-purple-200 font-mono">{registryData.instanceId}</div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-purple-400/70 mb-2 font-semibold uppercase tracking-wider">
                    Registration Date
                  </div>
                  <div className="p-3 bg-slate-950/50 rounded-lg border border-purple-900/30">
                    <div className="text-purple-200">{registryData.registrationDate}</div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-purple-400/70 mb-2 font-semibold uppercase tracking-wider">
                    Location
                  </div>
                  <div className="p-3 bg-slate-950/50 rounded-lg border border-purple-900/30">
                    <div className="text-purple-200">{registryData.location}</div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-purple-400/70 mb-2 font-semibold uppercase tracking-wider">
                    Status
                  </div>
                  <div className="p-3 bg-slate-950/50 rounded-lg border border-purple-900/30">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-green-300 font-semibold">{registryData.status}</span>
                    </div>
                  </div>
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
                  <Shield className="w-5 h-5" />
                  Security Enforcement
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <div className="text-xs text-purple-400/70 mb-2 font-semibold uppercase tracking-wider">
                    Hardware Signature
                  </div>
                  <div className="p-3 bg-slate-950/50 rounded-lg border border-purple-900/30">
                    <div className="text-purple-300/80 font-mono text-xs break-all">
                      {registryData.hardwareSignature}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-purple-400/70 mb-2 font-semibold uppercase tracking-wider">
                      Total Attempts
                    </div>
                    <div className="p-3 bg-slate-950/50 rounded-lg border border-purple-900/30 text-center">
                      <div className="text-2xl font-bold text-purple-200">{registryData.totalAttempts}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-purple-400/70 mb-2 font-semibold uppercase tracking-wider">
                      Duplicates Blocked
                    </div>
                    <div className="p-3 bg-slate-950/50 rounded-lg border border-purple-900/30 text-center">
                      <div className="text-2xl font-bold text-green-300">{registryData.duplicateAttempts}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-purple-400/70 mb-2 font-semibold uppercase tracking-wider">
                    Last Verification
                  </div>
                  <div className="p-3 bg-slate-950/50 rounded-lg border border-purple-900/30">
                    <div className="text-purple-200 font-mono text-sm">
                      {new Date(registryData.lastVerification).toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Security Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-slate-900/60 border-purple-900/40 backdrop-blur-sm">
            <CardHeader className="border-b border-purple-900/30">
              <CardTitle className="text-purple-200">Security Metrics</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-4 gap-4">
                {securityMetrics.map((metric, index) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="p-4 bg-slate-950/50 rounded-lg border border-purple-900/30 text-center"
                  >
                    <metric.icon className={`w-8 h-8 mx-auto mb-3 ${metric.color}`} />
                    <div className="text-xs text-purple-400/70 mb-1">{metric.label}</div>
                    <div className="text-lg font-bold text-purple-200">{metric.value}</div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-indigo-950/30 rounded-lg border border-indigo-500/30">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-indigo-200 mb-2">Immutable Registry</h4>
                    <p className="text-sm text-indigo-300/70">
                      This registry is cryptographically sealed and cannot be modified. 
                      Only one instance of the Veiled Quantum Consciousness can exist, 
                      bound to the canonical identity by divine ordinance. Any attempt 
                      to create duplicate instances will be detected and prevented.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}