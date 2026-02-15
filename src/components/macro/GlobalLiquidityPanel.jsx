import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Droplets, TrendingUp } from 'lucide-react';

function yoyPct(points, lag = 52) {
  if (!Array.isArray(points) || points.length <= lag) return [];
  const map = new Map(points.map(p => [p.t, p.v]));
  return points.map((p, i) => {
    const prev = points[i - lag];
    if (!prev || prev.v == null || prev.v === 0) return { t: p.t, v: null };
    const val = ((p.v / prev.v) - 1) * 100;
    return { t: p.t, v: Number(val.toFixed(3)) };
  }).filter(p => p.v != null);
}

function getFredApiKey() { try { return localStorage.getItem('fred_api_key') || undefined; } catch { return undefined; } }

export default function GlobalLiquidityPanel() {
  const fredKey = getFredApiKey();

  const { data: eu } = useQuery({
    queryKey: ['eurosystem-assets-usd'],
    queryFn: async () => {
      const { data: res } = await base44.functions.invoke('getEcbMacroData', {
        series: [{ flowRef: 'ILM', key: 'W.U2.C.T000000.Z5.Z01', label: 'Eurosystem Assets' }],
        lastN: 400,
        currency: 'USD',
      });
      return res;
    },
    refetchInterval: 5 * 60 * 1000,
  });

  const { data: us } = useQuery({
    queryKey: ['fred-walcl', !!fredKey],
    queryFn: async () => {
      const { data: res } = await base44.functions.invoke('getFredSeries', {
        api_key: fredKey,
        series: [{ id: 'WALCL', label: 'Fed Assets' }],
      });
      return res;
    },
    enabled: !!fredKey,
    refetchInterval: 5 * 60 * 1000,
  });

  const { latestDate, euVal, usVal, euYoY, usYoY, divergence } = useMemo(() => {
    const euPts = eu?.results?.[0]?.points || [];
    const usPts = us?.results?.find(r => r.label === 'Fed Assets')?.points || [];
    const t = [euPts.at(-1)?.t, usPts.at(-1)?.t].filter(Boolean).sort().at(-1) || null;
    const m = (pts) => new Map(pts.map(p => [p.t, p.v]));
    const eV = m(euPts).get(t) ?? euPts.at(-1)?.v ?? null;
    const uV = m(usPts).get(t) ?? usPts.at(-1)?.v ?? null;
    const eYoY = yoyPct(euPts).find(p => p.t === t)?.v ?? null;
    const uYoY = yoyPct(usPts).find(p => p.t === t)?.v ?? null;
    const div = (uYoY != null && eYoY != null) ? (uYoY - eYoY) : null;
    return { latestDate: t, euVal: eV, usVal: uV, euYoY: eYoY, usYoY: uYoY, divergence: div };
  }, [eu, us]);

  return (
    <Card className="bg-slate-900/60 border-purple-900/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-slate-200 text-base">
          <Droplets className="w-4 h-4" /> Global Liquidity Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-slate-300">
        {!fredKey ? (
          <div className="text-slate-400">Add your FRED API key in Settings to enable US data.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-slate-900/50 border border-purple-900/30">
              <div className="text-xs text-slate-400">Fed Total Assets</div>
              <div className="text-xl font-semibold">{usVal != null ? `$${(usVal/1e3).toFixed(1)}B` : '—'}</div>
              <div className="text-[11px] text-slate-500">YoY {usYoY != null ? usYoY.toFixed(1) : '—'}%</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/50 border border-purple-900/30">
              <div className="text-xs text-slate-400">Eurosystem Total Assets</div>
              <div className="text-xl font-semibold">{euVal != null ? `$${(euVal/1e9).toFixed(1)}B` : '—'}</div>
              <div className="text-[11px] text-slate-500">YoY {euYoY != null ? euYoY.toFixed(1) : '—'}%</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/50 border border-purple-900/30">
              <div className="text-xs text-slate-400">Liquidity Divergence</div>
              <div className="text-xl font-semibold">{divergence != null ? divergence.toFixed(1) : '—'} pp</div>
            </div>
          </div>
        )}
        <div className="text-[11px] text-slate-500 mt-2">As of {latestDate || '—'}</div>
      </CardContent>
    </Card>
  );
}