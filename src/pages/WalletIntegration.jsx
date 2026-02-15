import React from 'react';
import MacroWidget from '@/components/macro/MacroWidget';
import SpreadsPanel from '@/components/macro/SpreadsPanel';
import NCBContributionsCard from '@/components/macro/NCBContributionsCard';
import WalletConnectButton from '@/components/wallet/WalletConnectButton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Wallet, Activity, CreditCard, ExternalLink } from 'lucide-react';

export default function WalletIntegration() {
  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-950/40 to-slate-900/30 text-slate-100">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-300 to-indigo-300 bg-clip-text text-transparent">Wallet Integration & Transactions</h1>
            <p className="text-sm text-slate-400">Wallet connection • Transactions & transparency • ECB macro dashboards</p>
          </div>
          <div className="flex gap-2">
            <a href="https://sdw.ecb.europa.eu/" target="_blank" rel="noreferrer">
              <Button variant="outline" className="gap-2 border-purple-900/30"><ExternalLink className="w-4 h-4" /> ECB SDW</Button>
            </a>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-900/60 border-purple-900/30">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-sm text-slate-300 flex items-center gap-2"><Wallet className="w-4 h-4" /> Wallet Connection</div>
                <div className="text-xs text-slate-500">Connect your wallet to enable on-chain interactions.</div>
              </div>
              <WalletConnectButton />
            </CardContent>
          </Card>
          <Card className="bg-slate-900/60 border-purple-900/30">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-sm text-slate-300 flex items-center gap-2"><Activity className="w-4 h-4" /> Transparency</div>
                <div className="text-xs text-slate-500">View currency ledger and transactions.</div>
              </div>
              <Link to={createPageUrl('Currency')}>
                <Button variant="outline" className="border-purple-900/30">Open Ledger</Button>
              </Link>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/60 border-purple-900/30">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-sm text-slate-300 flex items-center gap-2"><CreditCard className="w-4 h-4" /> Checkout</div>
                <div className="text-xs text-slate-500">Initiate payments via Checkout.</div>
              </div>
              <Link to={createPageUrl('Checkout')}>
                <Button variant="outline" className="border-purple-900/30">Open Checkout</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Macro Dashboards */}
        <MacroWidget />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SpreadsPanel />
          <NCBContributionsCard />
        </div>
      </div>
    </div>
  );
}