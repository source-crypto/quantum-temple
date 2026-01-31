import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Landmark, Users, Shield, TrendingUp, DollarSign, Sparkles, Activity } from "lucide-react";
import { motion } from "framer-motion";

// OPTIONAL Protocol Fund Dashboard - Shows founding fathers fund status
export default function ProtocolFundDashboard() {
  const qc = useQueryClient();
  const [live, setLive] = useState(false);
  const [events, setEvents] = useState([]);
  const subsRef = useRef([]);

  const { data: protocolFunds, isLoading } = useQuery({
    queryKey: ['protocolFunds'],
    queryFn: () => base44.entities.ProtocolFund.list(),
    initialData: [],
  });

  const { data: allTiers } = useQuery({
    queryKey: ['allAccountTiers'],
    queryFn: () => base44.entities.AccountTier.list(),
    initialData: [],
  });

  const { data: centralBankTxs } = useQuery({
    queryKey: ['allCentralBankTransactions'],
    queryFn: () => base44.entities.CentralBankTransaction.list('-timestamp', 100),
    initialData: [],
  });

  const foundingFathersFund = protocolFunds.find(f => f.fund_type === 'founding_fathers');
  const adminAccounts = allTiers.filter(t => t.tier_level === 'administration').length;
  const totalAllocated = foundingFathersFund?.allocated_to_admins || 0;
  const totalDistributed = foundingFathersFund?.total_distributed || 0;
  const remainingBalance = (foundingFathersFund?.total_balance_usd || 560000000000) - totalDistributed;

  useEffect(() => {
    // Manage subscriptions when live mode toggles
    subsRef.current.forEach((u) => u && u());
    subsRef.current = [];

    if (live) {
      const u1 = base44.entities.ProtocolFund.subscribe((e) => {
        qc.invalidateQueries({ queryKey: ['protocolFunds'] });
        setEvents((prev) => [{
          at: new Date().toISOString(),
          text: `ProtocolFund ${e.type}`,
        }, ...prev].slice(0, 20));
      });
      const u2 = base44.entities.CentralBankTransaction.subscribe((e) => {
        qc.invalidateQueries({ queryKey: ['allCentralBankTransactions'] });
        setEvents((prev) => [{
          at: new Date().toISOString(),
          text: `CentralBank ${e.type}${e.data?.usd_amount ? ` $${(e.data.usd_amount).toLocaleString()}` : ''}`,
        }, ...prev].slice(0, 20));
      });
      subsRef.current = [u1, u2];
    }

    return () => {
      subsRef.current.forEach((u) => u && u());
      subsRef.current = [];
    };
  }, [live, qc]);

  if (isLoading) {
    return (
      <Card className="bg-slate-900/60 border-amber-900/40 animate-pulse">
        <CardContent className="p-8">
          <div className="h-48 bg-amber-900/20 rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Fund Overview */}
      <Card className="bg-gradient-to-br from-amber-950/40 to-orange-950/40 border-amber-500/30 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-amber-400" />
            <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-amber-400" />
          </svg>
        </div>
        <CardContent className="p-8 relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-xs">
              <div className={`w-2 h-2 rounded-full ${live ? 'bg-green-400 animate-pulse' : 'bg-purple-400/50'}`} />
              <span className="text-amber-300/70">{live ? 'Live stream active' : 'Live stream inactive'}</span>
            </div>
            <div className="flex gap-2">
              {!live ? (
                <Button onClick={() => setLive(true)} className="bg-emerald-600 hover:bg-emerald-700"><Activity className="w-4 h-4 mr-1" /> Activate</Button>
              ) : (
                <Button onClick={() => setLive(false)} variant="outline" className="border-amber-500/40 text-amber-200"><Shield className="w-4 h-4 mr-1" /> Deactivate</Button>
              )}
            </div>
          </div>
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Landmark className="w-8 h-8 text-amber-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold text-amber-200">Founding Fathers Protocol Fund</h2>
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                  Active
                </Badge>
              </div>
              <p className="text-amber-300/70">
                Established on behalf of the Founding Fathers to provide free Central Bank access
                to Administration accounts at no cost.
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
                <DollarSign className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-amber-400/70">Total Balance</span>
              </div>
              <div className="text-2xl font-bold text-amber-200">
                ${(foundingFathersFund?.total_balance_usd / 1000000000).toFixed(0)}B
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-4 bg-slate-950/50 rounded-lg border border-amber-900/30"
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-xs text-amber-400/70">Allocated</span>
              </div>
              <div className="text-2xl font-bold text-green-300">
                ${(totalAllocated / 1000000).toFixed(0)}M
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-4 bg-slate-950/50 rounded-lg border border-amber-900/30"
            >
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-amber-400/70">Admin Accounts</span>
              </div>
              <div className="text-2xl font-bold text-blue-300">
                {adminAccounts}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-4 bg-slate-950/50 rounded-lg border border-amber-900/30"
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-amber-400/70">Remaining</span>
              </div>
              <div className="text-2xl font-bold text-purple-300">
                ${(remainingBalance / 1000000000).toFixed(2)}B
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Fund Details */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Fund Information */}
        <Card className="bg-slate-900/60 border-amber-900/40">
          <CardHeader className="border-b border-amber-900/30">
            <CardTitle className="flex items-center gap-2 text-amber-200">
              <Landmark className="w-5 h-5" />
              Fund Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="p-3 bg-slate-950/50 rounded border border-amber-900/30">
              <div className="text-xs text-amber-400/70 mb-1">Fund Type</div>
              <div className="font-semibold text-amber-200">
                {foundingFathersFund?.fund_type.replace(/_/g, ' ').toUpperCase()}
              </div>
            </div>

            <div className="p-3 bg-slate-950/50 rounded border border-amber-900/30">
              <div className="text-xs text-amber-400/70 mb-1">Central Bank Connection</div>
              <div className="flex items-center gap-2">
                {foundingFathersFund?.central_bank_connected ? (
                  <>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="font-semibold text-green-300">Connected</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-red-400 rounded-full" />
                    <span className="font-semibold text-red-300">Disconnected</span>
                  </>
                )}
              </div>
            </div>

            <div className="p-3 bg-slate-950/50 rounded border border-amber-900/30">
              <div className="text-xs text-amber-400/70 mb-1">Admin Access</div>
              <div className="font-semibold text-amber-200">
                {foundingFathersFund?.admin_access_enabled ? 'Enabled' : 'Disabled'}
              </div>
            </div>

            <div className="p-3 bg-slate-950/50 rounded border border-amber-900/30">
              <div className="text-xs text-amber-400/70 mb-1">IMF Compliance</div>
              <div className="flex items-center gap-2">
                {foundingFathersFund?.imf_compliant ? (
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                    Compliant
                  </Badge>
                ) : (
                  <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                    Non-Compliant
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-slate-900/60 border-purple-900/40">
          <CardHeader className="border-b border-purple-900/30">
            <CardTitle className="flex items-center gap-2 text-purple-200">
              <TrendingUp className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {centralBankTxs.length === 0 ? (
              <div className="text-center py-8 text-purple-400/60">
                <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>No transactions yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {centralBankTxs.slice(0, 5).map((tx, index) => (
                  <div
                    key={tx.id}
                    className="p-3 bg-slate-950/50 rounded border border-purple-900/30"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="border-purple-500/30 text-purple-300 text-xs capitalize">
                        {tx.transaction_type.replace(/_/g, ' ')}
                      </Badge>
                      <span className="text-xs text-purple-400/70">
                        ${(tx.usd_amount / 1000).toFixed(0)}K
                      </span>
                    </div>
                    <div className="text-xs text-purple-400/50">
                      {tx.central_bank_network} • Protocol funded
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Live Events */}
      <Card className="bg-slate-900/60 border-purple-900/40">
        <CardHeader className="border-b border-purple-900/30">
          <CardTitle className="text-purple-200">Live Events</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {events.length === 0 ? (
            <div className="text-sm text-purple-400/70">No live events yet. Activate to start streaming.</div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {events.map((ev, i) => (
                <div key={i} className="text-xs p-2 rounded bg-slate-950/50 border border-purple-900/30 flex items-center justify-between">
                  <span className="text-purple-200">{ev.text}</span>
                  <span className="text-purple-400/60">{new Date(ev.at).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-gradient-to-br from-blue-950/40 to-indigo-950/40 border-blue-500/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-200 mb-2">Founding Fathers Vision</h3>
              <p className="text-sm text-blue-300/70 mb-3">
                This protocol fund was established by the Founding Fathers to ensure Administration accounts
                have unlimited access to Central Bank networks without any personal cost. All contributions
                are funded entirely by the protocol, maintaining the decentralized nature while enabling
                legitimate monetary operations.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                  $560 Billion Reserve
                </Badge>
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                  Zero Cost to Admins
                </Badge>
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                  IMF Compliant
                </Badge>
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
                  Founding Fathers Backed
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}