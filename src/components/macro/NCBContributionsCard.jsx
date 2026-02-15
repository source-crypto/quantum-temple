import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layers } from 'lucide-react';

const NCB_CODES = ['DE','FR','IT','ES','NL','BE','AT','IE','PT','FI','GR','LU','CY','MT','SI','SK','EE','LV','LT'];

export default function NCBContributionsCard() {
  const { data: contrib, isLoading: loadingContrib } = useQuery({
    queryKey: ['ncb-contrib', 'USD'],
    queryFn: async () => {
      const { data: res } = await base44.functions.invoke('getEcbContributions', {
        ncb_codes: NCB_CODES,
        lastN: 156, // ~3y
        currency: 'USD',
      });
      return res;
    },
    refetchInterval: 5 * 60 * 1000,
  });

  const { data: eurosystem } = useQuery({
    queryKey: ['eurosystem-total', 'USD'],
    queryFn: async () => {
      const { data: res } = await base44.functions.invoke('getEcbMacroData', {
        series: [{ flowRef: 'ILM', key: 'W.U2.C.T000000.Z5.Z01', label: 'Eurosystem Total Assets (weekly)' }],
        lastN: 156,
        currency: 'USD',
      });
      return res;
    },
    refetchInterval: 5 * 60 * 1000,
  });

  const rows = useMemo(() => {
    const results = contrib?.results || [];
    const euPts = eurosystem?.results?.[0]?.points || [];
    if (!results.length || !euPts.length) return [];
    const latestT = euPts.at(-1)?.t;
    const euMap = new Map(euPts.map(p => [p.t, p.v]));
    const euVal = euMap.get(latestT);
    if (!euVal) return [];

    const out = results.map(r => {
      const val = new Map(r.points.map(p => [p.t, p.v])).get(latestT) || null;
      const share = val != null ? (val / euVal) * 100 : null;
      return { name: r.label.replace(/ \(USD\)$/,''), value: val, share };
    }).filter(x => x.value != null && x.share != null);

    out.sort((a,b) => b.share - a.share);
    return out.slice(0, 6); // top 6
  }, [contrib, eurosystem]);

  return (
    <Card className="bg-slate-900/60 border-purple-900/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-slate-200 text-base">
          <Layers className="w-4 h-4" /> NCB Contributions (Top 6)
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-slate-300">
        {loadingContrib ? (
          <div className="text-slate-400">Loading NCB data…</div>
        ) : rows.length === 0 ? (
          <div className="text-slate-400">No data available.</div>
        ) : (
          <div className="space-y-2">
            {rows.map((r, idx) => (
              <div key={r.name} className="flex items-center justify-between rounded-lg bg-slate-900/50 border border-purple-900/30 px-3 py-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`h-2 w-2 rounded-full ${idx < 2 ? 'bg-emerald-400' : 'bg-indigo-400'}`} />
                  <span className="truncate">{r.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-slate-800 text-slate-200 border-slate-600">{r.share.toFixed(1)}%</Badge>
                  <span className="text-slate-400 text-xs">${(r.value/1e9).toFixed(1)}B</span>
                </div>
              </div>
            ))}
            <div className="text-[11px] text-slate-500">Shares computed vs latest Eurosystem total (USD).</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}