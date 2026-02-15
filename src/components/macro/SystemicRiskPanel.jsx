import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

function getFredApiKey(){ try { return localStorage.getItem('fred_api_key') || undefined; } catch { return undefined; } }
function yoyPct(points, lag=52){ if(!Array.isArray(points)||points.length<=lag) return []; return points.map((p,i)=>{const prev=points[i-lag]; if(!prev||prev.v==null||prev.v===0) return {t:p.t,v:null}; const val=((p.v/prev.v)-1)*100; return {t:p.t,v:Number(val.toFixed(2))}}).filter(p=>p.v!=null); }

export default function SystemicRiskPanel(){
  const fredKey = getFredApiKey();

  const { data: italyT2 } = useQuery({
    queryKey: ['t2-it'],
    queryFn: async () => {
      const { data: res } = await base44.functions.invoke('getEcbMacroData', { series: [{ flowRef: 'BSI', key: 'M.IT.N.A.A10.A.1.U2.0000.Z01.E', label: 'Italy TARGET2' }], lastN: 240 });
      return res;
    },
    refetchInterval: 5 * 60 * 1000,
  });

  const { data: policy } = useQuery({
    queryKey: ['policy-spread', !!fredKey],
    queryFn: async () => {
      const [{ data: ecb }, { data: fed }] = await Promise.all([
        base44.functions.invoke('getEcbMacroData', { series: [{ flowRef: 'FM', key: 'M.U2.EUR.4F.KR.DF.LEV', label: 'ECB Deposit' }], lastN: 360 }),
        base44.functions.invoke('getFredSeries', { api_key: fredKey, series: [{ id: 'DFF', label: 'Fed Funds' }] }),
      ]);
      return { ecb, fed };
    },
    enabled: !!fredKey,
    refetchInterval: 5 * 60 * 1000,
  });

  const { data: balances } = useQuery({
    queryKey: ['balances-yoy', !!fredKey],
    queryFn: async () => {
      const [{ data: eu }, { data: us }] = await Promise.all([
        base44.functions.invoke('getEcbMacroData', { series: [{ flowRef: 'ILM', key: 'W.U2.C.T000000.Z5.Z01', label: 'Eurosystem Assets' }], lastN: 400, currency: 'USD' }),
        base44.functions.invoke('getFredSeries', { api_key: fredKey, series: [{ id: 'WALCL', label: 'Fed Assets' }] }),
      ]);
      return { eu, us };
    },
    enabled: !!fredKey,
    refetchInterval: 5 * 60 * 1000,
  });

  const alerts = useMemo(() => {
    const out = [];
    // Italy TARGET2 threshold (assume millions EUR -> billions via /1e3)
    const itVal = italyT2?.results?.[0]?.points?.at(-1)?.v;
    const itBillions = itVal != null ? itVal / 1e3 : null;
    if (itBillions != null && itBillions < -500) out.push('TARGET2 Italy below -500B');

    // Policy spread
    const dep = policy?.ecb?.results?.[0]?.points?.at(-1)?.v;
    const dff = policy?.fed?.results?.find(r => r.label === 'Fed Funds')?.points?.at(-1)?.v;
    if (dep != null && dff != null && (dff - dep) * 100 > 200) out.push('Fed−ECB policy spread > 200bps');

    // Balance sheets YoY both contracting >5%
    const euPts = balances?.eu?.results?.[0]?.points || [];
    const usPts = balances?.us?.results?.find(r => r.label === 'Fed Assets')?.points || [];
    const euYoY = yoyPct(euPts).at(-1)?.v;
    const usYoY = yoyPct(usPts).at(-1)?.v;
    if (euYoY != null && usYoY != null && euYoY < -5 && usYoY < -5) out.push('Both balance sheets contracting YoY > 5%');

    return out;
  }, [italyT2, policy, balances]);

  const latest = italyT2?.results?.[0]?.points?.at(-1)?.t || null;

  return (
    <Card className="bg-slate-900/60 border-purple-900/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-slate-200 text-base">
          <AlertTriangle className="w-4 h-4" /> Systemic Risk Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-slate-300">
        {alerts.length === 0 ? (
          <div className="text-slate-400">No active alerts.</div>
        ) : (
          <ul className="list-disc pl-5 space-y-1">
            {alerts.map((a, i) => (<li key={i}>{a}</li>))}
          </ul>
        )}
        <div className="text-[11px] text-slate-500 mt-2">As of {latest || '—'}</div>
      </CardContent>
    </Card>
  );
}