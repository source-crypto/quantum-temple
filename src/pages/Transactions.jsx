import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Copy, Hash, Activity, Wallet } from 'lucide-react';

function getFredApiKey(){ try { return localStorage.getItem('fred_api_key') || undefined; } catch { return undefined; } }

function useTxData(){
  return useQuery({
    queryKey: ['tx-history'],
    queryFn: async () => {
      const [ct, bridge, pay] = await Promise.all([
        base44.entities.CurrencyTransaction.list('-timestamp', 100),
        base44.entities.CryptoBridge.list('-timestamp', 100),
        base44.entities.Payment.list('-event_time', 100).catch(()=>[]),
      ]);
      const items = [];
      (ct||[]).forEach(t => items.push({
        id: `ct_${t.id}`, source: 'currency_tx', type: t.transaction_type, amount: t.amount, status: t.status, ts: t.timestamp, hash: t.transaction_hash, extra: { from: t.from_user, to: t.to_user }
      }));
      (bridge||[]).forEach(b => items.push({
        id: `br_${b.id}`, source: 'bridge', type: b.bridge_type, amount: b.source_amount, status: b.status, ts: b.timestamp, hash: b.btc_transaction_hash || b.eth_transaction_hash || b.qtc_transaction_hash, extra: { from: b.source_chain, to: b.destination_chain }
      }));
      (pay||[]).forEach(p => items.push({
        id: `pay_${p.id}`, source: 'payment', type: p.event_type, amount: (p.amount_total||0)/100, status: p.payment_status||p.subscription_status||'n/a', ts: p.event_time, hash: p.payment_intent_id||p.session_id, extra: { currency: p.currency }
      }));
      items.sort((a,b)=> new Date(b.ts) - new Date(a.ts));
      return items;
    },
    initialData: [],
    refetchInterval: 60_000,
  });
}

export default function Transactions(){
  const fredKey = getFredApiKey();

  const { data: txs, isLoading } = useTxData();
  const { data: ecb } = useQuery({
    queryKey: ['ecb-deposit'],
    queryFn: async () => (await base44.functions.invoke('getEcbMacroData', { series: [{ flowRef: 'FM', key: 'M.U2.EUR.4F.KR.DF.LEV', label: 'ECB Deposit' }], lastN: 360 })).data,
  });
  const { data: fed } = useQuery({
    queryKey: ['fred-dff', !!fredKey],
    queryFn: async () => (await base44.functions.invoke('getFredSeries', { api_key: fredKey, series: [{ id: 'DFF', label: 'Fed Funds' }] })).data,
    enabled: !!fredKey,
  });

  const policyAt = useMemo(()=>{
    const dep = ecb?.results?.[0]?.points || [];
    const dff = fed?.results?.find(r => r.label==='Fed Funds')?.points || [];
    const mDep = new Map(dep.map(p=>[p.t,p.v]));
    const mDff = new Map(dff.map(p=>[p.t,p.v]));
    return (iso) => {
      if(!iso) return null;
      const d = new Date(iso);
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}`; // monthly match
      const depV = mDep.get(key) ?? dep.at(-1)?.v;
      const dffV = mDff.get(key) ?? dff.at(-1)?.v;
      if (depV==null || dffV==null) return null;
      return (dffV - depV) * 100; // bps
    };
  }, [ecb, fed]);

  const copy = (text)=>{ navigator.clipboard?.writeText(text); };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-950/40 to-slate-900/30 text-slate-100">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-300 to-indigo-300 bg-clip-text text-transparent">Transaction History</h1>
          <Badge className="bg-purple-600/30 text-purple-200 border-purple-700/40">{isLoading? 'Loading…' : `${txs.length} items`}</Badge>
        </div>

        <Card className="bg-slate-900/60 border-purple-900/30">
          <CardHeader>
            <CardTitle className="text-slate-200 text-base flex items-center gap-2"><Activity className="w-4 h-4"/> On‑chain Activities</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-purple-900/20">
            {txs.map((t)=> (
              <div key={t.id} className="py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="flex items-center gap-3">
                  <Badge className="bg-slate-800 border-purple-900/30 text-slate-200 capitalize">{t.source}</Badge>
                  <div>
                    <div className="text-slate-200 text-sm font-semibold">{t.type}</div>
                    <div className="text-[11px] text-slate-400">{new Date(t.ts).toLocaleString()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={t.status==='completed' || t.status==='succeeded' ? 'bg-green-500/20 text-green-300 border-green-700/30' : t.status==='failed' ? 'bg-red-500/20 text-red-300 border-red-700/30' : 'bg-amber-500/20 text-amber-300 border-amber-700/30'}>
                    {t.status}
                  </Badge>
                  <div className="text-slate-200 text-sm">{t.amount != null ? t.amount.toLocaleString(undefined,{maximumFractionDigits:2}) : '—'}</div>
                  {t.hash && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button onClick={()=>copy(t.hash)} className="text-slate-400 hover:text-slate-200 flex items-center gap-1"><Hash className="w-4 h-4"/>copy</button>
                        </TooltipTrigger>
                        <TooltipContent>Copy transaction ID</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  <div className="text-xs text-slate-400">
                    Policy spread: {policyAt ? (policyAt(t.ts)?.toFixed(0) ?? '—') : '—'} bps
                  </div>
                </div>
              </div>
            ))}
            {txs.length===0 && (
              <div className="py-6 text-sm text-slate-400">No transactions yet.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}