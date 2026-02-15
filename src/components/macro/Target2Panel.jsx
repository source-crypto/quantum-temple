import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

const KEYS = [
  { cc: 'DE', label: 'Germany' },
  { cc: 'IT', label: 'Italy' },
  { cc: 'ES', label: 'Spain' },
  { cc: 'NL', label: 'Netherlands' },
];

export default function Target2Panel() {
  const { data } = useQuery({
    queryKey: ['target2'],
    queryFn: async () => {
      const series = KEYS.map(({ cc, label }) => ({ flowRef: 'BSI', key: `M.${cc}.N.A.A10.A.1.U2.0000.Z01.E`, label: `${label} TARGET2` }));
      const { data: res } = await base44.functions.invoke('getEcbMacroData', {
        series,
        lastN: 240,
      });
      return res;
    },
    refetchInterval: 5 * 60 * 1000,
  });

  const rows = useMemo(() => {
    const results = data?.results || [];
    return results.map(r => {
      const last = r.points?.at(-1);
      const billions = last?.v != null ? (last.v / 1e3) : null; // assume millions EUR -> billions
      return { name: r.label, value: billions, t: last?.t };
    });
  }, [data]);

  const stressRatio = useMemo(() => {
    const de = rows?.find(r => r.name.startsWith('Germany'))?.value;
    const it = rows?.find(r => r.name.startsWith('Italy'))?.value;
    if (de != null && it != null && Math.abs(it) > 0) return de / Math.abs(it);
    return null;
  }, [rows]);

  const latestT = rows?.map(r => r.t).filter(Boolean).sort().at(-1) || null;

  return (
    <Card className="bg-slate-900/60 border-purple-900/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-slate-200 text-base">
          <MapPin className="w-4 h-4" /> TARGET2 Flow Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-slate-300">
        <div className="space-y-2">
          {rows?.map(r => (
            <div key={r.name} className={`flex items-center justify-between rounded-lg px-3 py-2 border ${r.value >= 0 ? 'bg-emerald-900/20 border-emerald-700/30' : 'bg-red-900/20 border-red-700/30'}`}>
              <span>{r.name}</span>
              <span className="font-semibold">{r.value != null ? `${r.value.toFixed(1)}B` : '—'}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-slate-400">Stress ratio (DE claims / |IT liabilities|): <span className="font-semibold">{stressRatio != null ? stressRatio.toFixed(2) : '—'}</span></div>
        <div className="text-[11px] text-slate-500 mt-1">As of {latestT || '—'}</div>
      </CardContent>
    </Card>
  );
}