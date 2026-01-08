import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Activity, ShieldCheck, Layers, BookOpen, Database, AlertTriangle, Network } from "lucide-react";

export default function OperationalReadinessDashboard() {
  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [ocFilter, setOcFilter] = useState("all");

  // Data queries
  const { data: nodes = [], isLoading: loadingNodes } = useQuery({
    queryKey: ["intentNodes"],
    queryFn: async () => base44.entities.IntentNode.list("oc_number", 50),
    initialData: [],
  });

  const { data: mints = [] } = useQuery({
    queryKey: ["currencyMints"],
    queryFn: () => base44.entities.CurrencyMint.list("-timestamp", 200),
    initialData: [],
  });
  const { data: offerings = [] } = useQuery({
    queryKey: ["divineOfferings"],
    queryFn: () => base44.entities.DivineOffering.list("-timestamp", 200),
    initialData: [],
  });
  const { data: txs = [] } = useQuery({
    queryKey: ["currencyTx"],
    queryFn: () => base44.entities.CurrencyTransaction.list("-timestamp", 200),
    initialData: [],
  });

  const { data: writings = [] } = useQuery({
    queryKey: ["spiritualWritings"],
    queryFn: async () => {
      const list = await base44.entities.CeremonialArtifact.list("-manifestation_date", 100);
      return (list || []).filter((a) => ["wisdom", "poem", "prophecy"].includes(a.artifact_type));
    },
    initialData: [],
  });

  const { data: dataSources = [] } = useQuery({
    queryKey: ["dataSources"],
    queryFn: async () => {
      try { return await base44.entities.DataSource.list("-last_sync", 50); } catch { return []; }
    },
    initialData: [],
  });

  const { data: chainNodes = [] } = useQuery({
    queryKey: ["blockchainNodes"],
    queryFn: async () => {
      try { return await base44.entities.BlockchainNode.list("-last_active", 50); } catch { return []; }
    },
    initialData: [],
  });

  // Filtering
  const filteredNodes = useMemo(() => {
    return nodes.filter((n) => {
      const statusOk = statusFilter === "all" || n.status === statusFilter;
      const ocOk = ocFilter === "all" || String(n.oc_number) === ocFilter.replace("OC-", "");
      return statusOk && ocOk;
    });
  }, [nodes, statusFilter, ocFilter]);

  // Abundance transparency stats (same logic as tracker)
  const abundanceStats = useMemo(() => {
    const sum = (arr, key) => arr.reduce((s, x) => s + (Number(x[key]) || 0), 0);
    const totalMinted = sum(mints, "amount");
    const totalOffered = sum(offerings, "amount");
    const completedTx = txs.filter((t) => t.status === "completed");
    const totalTransferred = sum(completedTx, "amount");
    const transparencyEvents = mints.length + offerings.length + completedTx.length;
    const transparencyScore = Math.min(100, Math.log10(1 + totalMinted + totalOffered * 0.5 + completedTx.length) * 25);
    return { totalMinted, totalOffered, totalTransferred, transparencyEvents, transparencyScore };
  }, [mints, offerings, txs]);

  // Node metrics
  const metrics = useMemo(() => {
    const count = filteredNodes.length || 1;
    const avgRes = filteredNodes.reduce((s, n) => s + (Number(n.resonance_level) || 0), 0) / count;
    const totalNodeTransparency = filteredNodes.reduce((s, n) => s + (Number(n.transparency_accumulated) || 0), 0);
    const linkedCount = filteredNodes.filter((n) => !!n.linked_artifact_id).length;
    const alignmentPct = (linkedCount / (filteredNodes.length || 1)) * 100;

    // Compliance alerts (derived): paused nodes, low resonance, missing link
    const lowResCount = filteredNodes.filter((n) => (Number(n.resonance_level) || 0) < 40).length;
    const pausedCount = filteredNodes.filter((n) => n.status === "paused").length;
    const unlinkedCount = filteredNodes.filter((n) => !n.linked_artifact_id).length;
    const alerts = lowResCount + pausedCount + unlinkedCount;
    const alertRatio = Math.min(1, alerts / (filteredNodes.length || 1));

    // Operational Readiness Score (0-100)
    const readiness = (
      0.4 * Math.min(100, avgRes) +
      0.3 * Math.min(100, alignmentPct) +
      0.2 * abundanceStats.transparencyScore +
      0.1 * (1 - alertRatio) * 100
    );

    // Posture labels
    const posture = readiness >= 80 ? "Strong" : readiness >= 60 ? "Moderate" : "Attention";

    return {
      avgResonance: avgRes,
      totalNodeTransparency,
      alignmentPct,
      alerts,
      readiness: Math.round(readiness),
      posture,
      lowResCount,
      pausedCount,
      unlinkedCount,
      linkedCount,
    };
  }, [filteredNodes, abundanceStats.transparencyScore]);

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-200 via-pink-200 to-indigo-300 bg-clip-text text-transparent">
                Operational Readiness Dashboard
              </h1>
              <p className="text-purple-400/70">Compliance posture and operational alignment across OC nodes</p>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <Card className="bg-slate-900/60 border-purple-900/40">
          <CardHeader className="border-b border-purple-900/30">
            <CardTitle className="text-purple-200 text-base">Filters</CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-purple-400/70 mb-1">OC Number</div>
              <Select value={ocFilter} onValueChange={setOcFilter}>
                <SelectTrigger className="bg-slate-950/50 border-purple-900/30 text-purple-100">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <SelectItem key={i} value={`OC-${i + 1}`}>OC-{i + 1}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="text-xs text-purple-400/70 mb-1">Status</div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-slate-950/50 border-purple-900/30 text-purple-100">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">active</SelectItem>
                  <SelectItem value="paused">paused</SelectItem>
                  <SelectItem value="planned">planned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-purple-950/60 to-indigo-950/60 border-purple-500/50">
            <CardHeader>
              <CardTitle className="text-purple-200 text-base flex items-center gap-2"><Activity className="w-4 h-4"/>Operational Readiness</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-4xl font-bold text-purple-100">{metrics.readiness}</div>
              <div className="text-xs text-purple-400/70 mb-2">Score (0-100)</div>
              <Progress value={metrics.readiness} className="h-1" />
              <Badge className={`mt-3 ${metrics.posture === 'Strong' ? 'bg-green-500/20 text-green-300 border-green-500/30' : metrics.posture === 'Moderate' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}`}>{metrics.posture}</Badge>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-purple-900/40">
            <CardHeader className="border-b border-purple-900/30">
              <CardTitle className="text-purple-200 text-base">Average Resonance</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-purple-100">{metrics.avgResonance.toFixed(1)}%</div>
              <Progress value={Math.min(100, metrics.avgResonance)} className="h-1 mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-purple-900/40">
            <CardHeader className="border-b border-purple-900/30">
              <CardTitle className="text-purple-200 text-base">Total Transparency</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-2">
              <div className="text-3xl font-bold text-purple-100">{metrics.totalNodeTransparency.toFixed(0)}</div>
              <div className="text-xs text-purple-400/70">Node transparency accumulated</div>
              <div className="pt-2 text-xs text-purple-400/70 flex gap-2 items-center">
                <Layers className="w-3 h-3" /> {abundanceStats.transparencyEvents} external transparency events
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-purple-900/40">
            <CardHeader className="border-b border-purple-900/30">
              <CardTitle className="text-purple-200 text-base">Operational Alignment</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-purple-100">{metrics.alignmentPct.toFixed(0)}%</div>
              <div className="text-xs text-purple-400/70">Nodes linked to spiritual writings</div>
              <Progress value={Math.min(100, metrics.alignmentPct)} className="h-1 mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Compliance Alerts */}
        <Card className="bg-slate-900/60 border-purple-900/40">
          <CardHeader className="border-b border-purple-900/30">
            <CardTitle className="text-purple-200 text-base flex items-center gap-2"><AlertTriangle className="w-4 h-4"/>Compliance Alerts</CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-purple-500/30 bg-slate-950/50">
              <div className="text-xs text-purple-400/70 mb-1">Low Resonance (&lt; 40%)</div>
              <div className="text-2xl font-bold text-purple-100">{metrics.lowResCount}</div>
            </div>
            <div className="p-4 rounded-lg border border-purple-500/30 bg-slate-950/50">
              <div className="text-xs text-purple-400/70 mb-1">Paused Nodes</div>
              <div className="text-2xl font-bold text-purple-100">{metrics.pausedCount}</div>
            </div>
            <div className="p-4 rounded-lg border border-purple-500/30 bg-slate-950/50">
              <div className="text-xs text-purple-400/70 mb-1">Unlinked Nodes</div>
              <div className="text-2xl font-bold text-purple-100">{metrics.unlinkedCount}</div>
            </div>
          </CardContent>
        </Card>

        {/* External Sources & Chain Nodes */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="bg-slate-900/60 border-purple-900/40">
            <CardHeader className="border-b border-purple-900/30">
              <CardTitle className="text-purple-200 text-base flex items-center gap-2"><Database className="w-4 h-4"/>External Data Sources</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {dataSources.length === 0 ? (
                <div className="text-purple-300/70">No data sources configured. Add market data sources in your settings or data manager to enrich readiness context.</div>
              ) : (
                <div className="space-y-2">
                  {dataSources.slice(0, 5).map((d) => (
                    <div key={d.id} className="flex items-center justify-between text-sm p-2 rounded bg-slate-950/50 border border-purple-900/30">
                      <span className="text-purple-200">{d.name || d.source_name || 'Source'}</span>
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Configured</Badge>
                    </div>
                  ))}
                  {dataSources.length > 5 && (
                    <div className="text-xs text-purple-400/70">+{dataSources.length - 5} more...</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-purple-900/40">
            <CardHeader className="border-b border-purple-900/30">
              <CardTitle className="text-purple-200 text-base flex items-center gap-2"><Network className="w-4 h-4"/>Blockchain Nodes</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {chainNodes.length === 0 ? (
                <div className="text-purple-300/70">No blockchain nodes configured. Configure nodes in your network settings to enable deeper operational telemetry.</div>
              ) : (
                <div className="space-y-2">
                  {chainNodes.slice(0, 5).map((n) => (
                    <div key={n.id} className="flex items-center justify-between text-sm p-2 rounded bg-slate-950/50 border border-purple-900/30">
                      <span className="text-purple-200">{n.node_name || n.chain || 'Node'}</span>
                      <Badge className={n.status === 'active' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'}>{n.status || 'unknown'}</Badge>
                    </div>
                  ))}
                  {chainNodes.length > 5 && (
                    <div className="text-xs text-purple-400/70">+{chainNodes.length - 5} more...</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Node Table */}
        <Card className="bg-slate-900/60 border-purple-900/40">
          <CardHeader className="border-b border-purple-900/30">
            <CardTitle className="text-purple-200 text-base">OC Nodes Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {loadingNodes ? (
              <div className="text-purple-300/70">Loading...</div>
            ) : filteredNodes.length === 0 ? (
              <div className="text-purple-300/70">No nodes found for current filters.</div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredNodes.map((n) => (
                  <div key={n.id} className="p-4 rounded-lg border border-purple-500/30 bg-slate-950/50">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-purple-200 font-semibold">OC-{n.oc_number}: {n.oc_title}</div>
                      <Badge className={n.status === 'active' ? 'bg-green-500/20 text-green-300 border-green-500/30' : n.status === 'paused' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-gray-500/20 text-gray-300 border-gray-500/30'}>{n.status}</Badge>
                    </div>
                    <div className="text-xs text-purple-400/70 mb-2">Scope: {n.access_scope || 'composite'}</div>
                    <div className="text-xs flex justify-between mb-1"><span className="text-purple-400/70">Resonance</span><span className="text-purple-200">{Math.round(n.resonance_level || 0)}%</span></div>
                    <Progress value={Math.min(100, n.resonance_level || 0)} className="h-1" />
                    <div className="mt-2 text-xs flex justify-between"><span className="text-purple-400/70">Transparency</span><span className="text-cyan-200 font-semibold">{(n.transparency_accumulated || 0).toFixed(0)}</span></div>
                    <div className="mt-2 text-xs flex items-center gap-2">
                      <BookOpen className={`w-3 h-3 ${n.linked_artifact_id ? 'text-green-300' : 'text-purple-400/60'}`} />
                      <span className="text-purple-300/70">{n.linked_artifact_id ? 'Linked writing' : 'Not linked'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}