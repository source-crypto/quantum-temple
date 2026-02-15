import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Scale, Minus, Activity } from 'lucide-react';

function getFredApiKey() {
  try { return localStorage.getItem('fred_api_key') || undefined; } catch { return undefined; }
}

export default function GlobalPolicyPanel() {
  const fredKey = getFredApiKey();

  const { data: ecbData } = useQuery({
    queryKey: ['ecb-deposit-core'],
    queryFn: async () => {
      const { data: res } = await base44.functions.invoke('getEcbMacroData', {
        series: [
          { flowRef: 'FM', key: 'M.U2.EUR.4F.KR.DF.LEV', label: 'ECB Deposit' },
          { flowRef: 'ICP', key: 'M.U2.N.XEFG.4.ANR', label: 'HICP Core YoY' },
        ],
        lastN: 360,
      });
      return res;
    },
    refetchInterval: 5 * 60 * 1000,
  });

  const { data: fedData } = useQuery({
    queryKey: ['fred-policy', !!fredKey],
    queryFn: async () => {
      const { data: res } = await base44.functions.invoke('getFredSeries', {
        api_key: fredKey,
        series: [
          { id: 'DFF', label: 'Fed Funds' },
          { id: 'PCEPILFE', label: 'Core PCE YoY', transform: 'yoy_pct', lag: 12 },
        ],
      });
      return res;
    },
    enabled: !!fredKey,
    refetchInterval: 5 * 60 * 1000,
  });

  const { deposit, coreHicp, fedFunds, corePce, spreadBps, realDiff, latestT } = useMemo(() => {
    const ecbRes = ecbData?.results || [];
    const fedRes = fedData?.results || [];

    const dep = ecbRes.find(r => r.label === 'ECB Deposit');
    const hicp = ecbRes.find(r => r.label?.startsWith('HICP Core')) || ecbRes.find(r => /Core/.test(r.label||''));
    const dff = fedRes.find(r => r.label === 'Fed Funds');
    const pce = fedRes.find(r => r.label?.includes('Core PCE'));

    const latestDates = [dep?.points?.at(-1)?.t, hicp?.points?.at(-1)?.t, dff?.points?.at(-1)?.t, pce?.points?.at(-1)?.t].filter(Boolean).sort();
    const t = latestDates.at(-1) || null;

    const vMap = (pts) => new Map((pts||[]).map(p => [p.t, p.v]));
    const depV = vMap(dep?.points).get(t) ?? dep?.points?.at(-1)?.v ?? null;
    const hicpV = vMap(hicp?.points).get(t) ?? hicp?.points?.at(-1)?.v ?? null;
    const dffV = vMap(dff?.points).get(t) ?? dff?.points?.at(-1)?.v ?? null;
    const pceV = vMap(pce?.points).get(t) ?? pce?.points?.at(-1)?.v ?? null;

    const spread = (dffV != null && depV != null) ? (dffV - depV) * 100 : null; // bps
    const realEU = (depV != null && hicpV != null) ? depV - hicpV : null;
    const realUS = (dffV != null && pceV != null) ? dffV - pceV : null;
    const diff = (realUS != null && realEU != null) ? (realUS - realEU) : null;

    return { deposit: depV, coreHicp: hicpV, fedFunds: dffV, corePce: pceV, spreadBps: spread, realDiff: diff, latestT: t };
  }, [ecbData, fedData]);

  return (
    <Card className="bg-slate-900/60 border-purple-900/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-slate-200 text-base">
          <Scale className="w-4 h-4" /> Global Policy Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-slate-300">
        {!fredKey ? (
          <div className="text-slate-400">Add your FRED API key in Settings to enable US data.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-slate-900/50 border border-purple-900/30">
              <div className="text-xs text-slate-400">Fed Funds</div>
              <div className="text-xl font-semibold">{fedFunds != null ? fedFunds.toFixed(2) : '—'}%</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/50 border border-purple-900/30">
              <div className="text-xs text-slate-400">ECB Deposit</div>
              <div className="text-xl font-semibold">{deposit != null ? deposit.toFixed(2) : '—'}%</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/50 border border-purple-900/30">
              <div className="text-xs text-slate-400">Policy Spread</div>
              <div className="text-xl font-semibold">{spreadBps != null ? spreadBps.toFixed(0) : '—'} bps</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/50 border border-purple-900/30">
              <div className="text-xs text-slate-400">Real Rate Differential</div>
              <div className="text-xl font-semibold">{realDiff != null ? realDiff.toFixed(2) : '—'}%</div>
            </div>
          </div>
        )}
        <div className="text-[11px] text-slate-500 mt-2">As of {latestT || '—'}</div>
      </CardContent>
    </Card>
  );
}