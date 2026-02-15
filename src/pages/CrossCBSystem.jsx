import React from 'react';
import GlobalPolicyPanel from '@/components/macro/GlobalPolicyPanel';
import GlobalLiquidityPanel from '@/components/macro/GlobalLiquidityPanel';
import Target2Panel from '@/components/macro/Target2Panel';
import SystemicRiskPanel from '@/components/macro/SystemicRiskPanel';
import MacroWidget from '@/components/macro/MacroWidget';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Network, ExternalLink } from 'lucide-react';

export default function CrossCBSystem(){
  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-950/40 to-slate-900/30 text-slate-100">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-300 to-indigo-300 bg-clip-text text-transparent">Cross‑Central‑Bank Liquidity & Policy</h1>
            <p className="text-sm text-slate-400">Fed vs ECB • TARGET2 • Cross‑Atlantic spreads • Institutional layout</p>
          </div>
          <div className="flex gap-2">
            <a href="https://sdw.ecb.europa.eu/" target="_blank" rel="noreferrer"><Button variant="outline" className="gap-2 border-purple-900/30"><ExternalLink className="w-4 h-4" /> ECB SDW</Button></a>
            <a href="https://fred.stlouisfed.org/" target="_blank" rel="noreferrer"><Button variant="outline" className="gap-2 border-purple-900/30"><ExternalLink className="w-4 h-4" /> FRED</Button></a>
          </div>
        </div>

        {/* Top policy & liquidity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlobalPolicyPanel />
          <GlobalLiquidityPanel />
        </div>

        {/* TARGET2 & Risk */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Target2Panel />
          <SystemicRiskPanel />
        </div>

        {/* Full ECB Macro widget */}
        <MacroWidget />
      </div>
    </div>
  );
}