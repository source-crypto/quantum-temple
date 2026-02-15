import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Percent, LineChart } from 'lucide-react';

const SERIES = [
  { flowRef: 'FM', key: 'M.U2.EUR.4F.KR.DF.LEV', id: 'deposit', label: 'Deposit Facility' },
  { flowRef: 'ICP', key: 'M.U2.N.CP00.4.ANR', id: 'hicp', label: 'HICP YoY (Headline)' },
  { flowRef: 'ICP', key: 'M.U2.N.XEFG.4.ANR', id: 'core', label: 'HICP YoY (Core)' },
];

function latestTwo(points) {
  if (!Array.isArray(points) || points.length === 0) return { latest: null, prev: null };
  const last = points[points.length - 1];
  // find previous non-null
  let idx = points.length - 2;
  while (idx >= 0 && (points[idx]?.v == null)) idx--;
  const prev = idx >= 0 ? points[idx] : null;
  return { latest: last, prev };
}

export default function SpreadsPanel() {
  const { data, isLoading } = useQuery({
    queryKey: ['macro-spreads', 'USD'],
    queryFn: async () => {
      const { data: res } = await base44.functions.invoke('getEcbMacroData', {
        series: SERIES.map(({ flowRef, key, label }) => ({ flowRef, key, label })),
        lastN: 360,
        currency: 'USD',
      });
      return res;
    },
    refetchInterval: 5 * 60 * 1000,
  });

  const { deposit, hicp, core, realHeadline, realCore, latestDate } = useMemo(() => {
    const results = data?.results || [];
    const byLabel = Object.fromEntries(results.map(r => [r.label, r]));
    const dep = byLabel['Deposit Facility'];
    const head = byLabel['HICP YoY (Headline)'];
    const cor = byLabel['HICP YoY (Core: ex energy & unproc. food)'] || byLabel['HICP YoY (Core)'] || byLabel['HICP YoY (Core: ex energy & unproc. food) (USD)'] || byLabel['HICP YoY (Core) (USD)'];

    const depPts = dep?.points || [];
    const headPts = head?.points || [];
    const corePts = cor?.points || [];

    const latestT = [depPts.at(-1)?.t, headPts.at(-1)?.t, corePts.at(-1)?.t].filter(Boolean).sort().at(-1) || null;

    const findVal = (pts, t) => {
      const m = new Map(pts.map(p => [p.t, p.v]));
      const v = m.get(t);
      return typeof v === 'number' ? v : null;
    };

    const depV = findVal(depPts, latestT);
    const headV = findVal(headPts, latestT);
    const coreV = findVal(corePts, latestT);

    return {
      deposit: depV,
      hicp: headV,
      core: coreV,
      realHeadline: depV != null && headV != null ? depV - headV : null,
      realCore: depV != null && coreV != null ? depV - coreV : null,
      latestDate: latestT,
    };
  }, [data]);

  return (
    <Card className="bg-slate-900/60 border-purple-900/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-slate-200 text-base">
          <LineChart className="w-4 h-4" /> Macro Spreads
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-slate-300">
        {isLoading ? (
          <div className="text-slate-400">Loading spreads…</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-slate-900/50 border border-purple-900/30">
              <div className="text-xs text-slate-400 mb-1">Deposit − Headline</div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-semibold">{realHeadline != null ? realHeadline.toFixed(2) : '—'}%</span>
                <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-700/40">Real (headline)</Badge>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">As of {latestDate || '—'}</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/50 border border-purple-900/30">
              <div className="text-xs text-slate-400 mb-1">Deposit − Core</div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-semibold">{realCore != null ? realCore.toFixed(2) : '—'}%</span>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-700/40">Real (core)</Badge>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">As of {latestDate || '—'}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}