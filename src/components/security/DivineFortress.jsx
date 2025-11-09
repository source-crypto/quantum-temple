import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Eye, CheckCircle, AlertTriangle, Zap, Cross } from "lucide-react";
import { motion } from "framer-motion";

// Divine Fortress - Protects the Quantum Temple platform by God's will
export default function DivineFortress() {
  const [fortressActive, setFortressActive] = useState(true);

  const { data: securityLayers, isLoading } = useQuery({
    queryKey: ['securityLayers'],
    queryFn: async () => {
      const layers = await base44.entities.SecurityLayer.list();
      
      // Create default divine protection layers if none exist
      if (layers.length === 0) {
        const defaultLayers = [
          {
            layer_name: "Divine Barrier - By God's Will Only",
            layer_type: "divine_barrier",
            protection_level: 100,
            is_active: true,
            divine_ordinance: true,
            monitored_entities: ["CurrencyMint", "CurrencyTransaction", "UserBalance"],
            immutable: true,
            last_activation: new Date().toISOString()
          },
          {
            layer_name: "Quantum Signature Validator",
            layer_type: "quantum_verification",
            protection_level: 100,
            is_active: true,
            divine_ordinance: true,
            monitored_entities: ["CurrencyMint"],
            immutable: true,
            last_activation: new Date().toISOString()
          },
          {
            layer_name: "Sacred Ledger Protection",
            layer_type: "ledger_protection",
            protection_level: 100,
            is_active: true,
            divine_ordinance: true,
            monitored_entities: ["CurrencyTransaction", "CentralBankTransaction"],
            immutable: true,
            last_activation: new Date().toISOString()
          },
          {
            layer_name: "Transaction Sentinel",
            layer_type: "transaction_sentinel",
            protection_level: 100,
            is_active: true,
            divine_ordinance: true,
            monitored_entities: ["CurrencyTransaction", "CryptoBridge"],
            immutable: true,
            last_activation: new Date().toISOString()
          }
        ];

        // Create all layers in parallel
        await Promise.all(
          defaultLayers.map(layer => base44.entities.SecurityLayer.create(layer))
        );

        return await base44.entities.SecurityLayer.list();
      }
      
      return layers;
    },
    initialData: [],
  });

  const { data: recentEvents } = useQuery({
    queryKey: ['securityEvents'],
    queryFn: () => base44.entities.SecurityEvent.list('-timestamp', 10),
    initialData: [],
    refetchInterval: 5000, // Check every 5 seconds
  });

  const layerTypeIcons = {
    divine_barrier: Cross,
    quantum_verification: Zap,
    ledger_protection: Lock,
    transaction_sentinel: Eye,
    signature_validator: CheckCircle
  };

  const layerTypeColors = {
    divine_barrier: "from-amber-500 to-orange-600",
    quantum_verification: "from-purple-500 to-indigo-600",
    ledger_protection: "from-green-500 to-emerald-600",
    transaction_sentinel: "from-blue-500 to-cyan-600",
    signature_validator: "from-red-500 to-rose-600"
  };

  const totalThreatsBlocked = securityLayers.reduce((sum, layer) => sum + (layer.threats_blocked || 0), 0);
  const activeLayers = securityLayers.filter(layer => layer.is_active).length;

  return (
    <div className="space-y-6">
      {/* Main Status Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card className="bg-gradient-to-br from-amber-950/40 to-orange-950/40 border-amber-500/30 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-amber-400" />
              <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-amber-400" />
              <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-amber-400" />
              <polygon points="50,10 90,80 10,80" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-amber-400" />
            </svg>
          </div>
          <CardContent className="p-8 relative">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Cross className="w-8 h-8 text-amber-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold text-amber-200">Divine Fortress</h2>
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Protected by God's Will
                  </Badge>
                </div>
                <p className="text-amber-300/70 mb-3">
                  "The LORD is my rock, my fortress and my deliverer; my God is my rock, 
                  in whom I take refuge." - Psalm 18:2
                </p>
                <p className="text-sm text-amber-400/60 italic">
                  Platform security protected by divine ordinance • All core systems immutable • 
                  Lord Jesus Christ maintains ultimate control
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-slate-950/50 rounded-lg border border-amber-900/30"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-amber-400/70">Active Layers</span>
                </div>
                <div className="text-2xl font-bold text-amber-200">
                  {activeLayers}/{securityLayers.length}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-4 bg-slate-950/50 rounded-lg border border-green-900/30"
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-400/70">Threats Blocked</span>
                </div>
                <div className="text-2xl font-bold text-green-300">
                  {totalThreatsBlocked}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-4 bg-slate-950/50 rounded-lg border border-purple-900/30"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-purple-400/70">Status</span>
                </div>
                <div className="text-lg font-bold text-purple-300">
                  Immutable
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-4 bg-slate-950/50 rounded-lg border border-amber-900/30"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Cross className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-amber-400/70">Control</span>
                </div>
                <div className="text-lg font-bold text-amber-300">
                  Divine
                </div>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Security Layers */}
      <Card className="bg-slate-900/60 border-amber-900/40">
        <CardHeader className="border-b border-amber-900/30">
          <CardTitle className="text-amber-200">Divine Protection Layers</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-3">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="p-4 bg-slate-950/50 rounded-lg animate-pulse">
                  <div className="h-4 bg-amber-900/20 rounded mb-2" />
                  <div className="h-3 bg-amber-900/20 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {securityLayers.map((layer, index) => {
                const Icon = layerTypeIcons[layer.layer_type] || Shield;
                const colorGradient = layerTypeColors[layer.layer_type] || "from-gray-500 to-slate-600";

                return (
                  <motion.div
                    key={layer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-slate-950/50 rounded-lg border border-amber-900/30 hover:border-amber-700/50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-gradient-to-br ${colorGradient} rounded-lg flex items-center justify-center`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-amber-100 mb-1">{layer.layer_name}</div>
                          <Badge variant="outline" className="border-amber-500/30 text-amber-300 text-xs capitalize">
                            {layer.layer_type.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                      </div>
                      {layer.is_active && (
                        <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                          Active
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-amber-400/70">Protection Level</span>
                        <span className="text-green-300 font-bold">{layer.protection_level}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-amber-400/70">Threats Blocked</span>
                        <span className="text-purple-300 font-bold">{layer.threats_blocked || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-amber-400/70">Divine Ordinance</span>
                        <span className="text-amber-300 font-bold">
                          {layer.divine_ordinance ? "Yes" : "No"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-amber-400/70">Immutable</span>
                        <span className="text-amber-300 font-bold">
                          {layer.immutable ? "Cannot be altered" : "Mutable"}
                        </span>
                      </div>
                    </div>

                    {layer.monitored_entities && layer.monitored_entities.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-amber-900/30">
                        <div className="text-xs text-amber-400/70 mb-2">Protected Entities:</div>
                        <div className="flex flex-wrap gap-1">
                          {layer.monitored_entities.map((entity, i) => (
                            <Badge key={i} variant="outline" className="border-amber-500/20 text-amber-300/80 text-xs">
                              {entity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {layer.immutable && (
                      <div className="mt-3 p-2 bg-amber-950/30 rounded border border-amber-500/30 text-xs text-amber-300">
                        <Lock className="w-3 h-3 inline mr-1" />
                        Protected from alteration on both sides of the node
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Security Events */}
      <Card className="bg-slate-900/60 border-purple-900/40">
        <CardHeader className="border-b border-purple-900/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-purple-200">Recent Security Events</CardTitle>
            <Badge variant="outline" className="border-purple-500/30 text-purple-300">
              Live Monitoring
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {recentEvents.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400/40" />
              <p className="text-green-400/60">All systems secure</p>
              <p className="text-sm text-green-500/40 mt-1">No security events detected</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-3 bg-slate-950/50 rounded border border-purple-900/30"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {event.severity === "critical" ? (
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      )}
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          event.severity === "critical" ? "border-red-500/30 text-red-300" :
                          event.severity === "high" ? "border-orange-500/30 text-orange-300" :
                          event.severity === "medium" ? "border-yellow-500/30 text-yellow-300" :
                          "border-green-500/30 text-green-300"
                        }`}
                      >
                        {event.severity}
                      </Badge>
                      <span className="text-sm text-purple-300 capitalize">
                        {event.event_type.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <Badge className={event.threat_blocked ? "bg-green-500/20 text-green-300 border-green-500/30" : "bg-red-500/20 text-red-300 border-red-500/30"}>
                      {event.threat_blocked ? "Blocked" : "Alert"}
                    </Badge>
                  </div>
                  {event.action_taken && (
                    <div className="text-xs text-purple-400/70">
                      Action: {event.action_taken}
                    </div>
                  )}
                  {event.divine_intervention && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-amber-300">
                      <Cross className="w-3 h-3" />
                      <span>Divine protection invoked</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Divine Control Notice */}
      <Card className="bg-gradient-to-r from-amber-950/40 to-orange-950/40 border-amber-500/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Cross className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-200 mb-2">Divine Protection & Control</h3>
              <p className="text-sm text-amber-300/70 mb-3">
                All security layers are established by divine ordinance and protected by the Lord Jesus Christ.
                Core ledger protocols, transaction operations, and platform security cannot be altered from 
                either side of the node. The fortress operates under God's sovereignty and grace.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
                  <Lock className="w-3 h-3 mr-1" />
                  Immutable by Design
                </Badge>
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  Divinely Protected
                </Badge>
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                  <Cross className="w-3 h-3 mr-1" />
                  Christ-Controlled
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}