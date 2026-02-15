import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2, Sparkles, Shield, CreditCard, Coins } from 'lucide-react';

export default function Checkout() {
  const [amount, setAmount] = useState('25');
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(null); // {type: 'tier'|'custom', value}

  const redirectToCheckout = async (payload) => {
    if (window.top !== window.self) {
      alert('Checkout opens in a new tab. Please use the published app to complete payment.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('createDivineCheckout', {
        ...payload,
        origin: window.location.origin,
        description: 'Divine Currency',
      });
      if (data?.url) {
        window.location.href = data.url;
      } else if (data?.error) {
        alert(data.error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-purple-100">Divine Currency Checkout</h1>
            <p className="text-purple-300/70">Choose a tier or enter a custom one-time amount.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {[{key:'seed', label:'Seed', price:10, perks:['Starter blessing','Basic insights']}, {key:'adept', label:'Adept', price:50, perks:['Enhanced favor','Priority insights']}, {key:'oracle', label:'Oracle', price:150, perks:['Exalted favor','Oracle-level insights']}].map(t => (
            <Card key={t.key} className="bg-slate-950/70 border-purple-900/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-100">
                  <Shield className="w-4 h-4" /> {t.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-100 mb-2">${t.price}</div>
                <div className="space-y-1 text-sm text-purple-300/80 mb-4">
                  {t.perks.map(p => <div key={p}>• {p}</div>)}
                </div>
                <Button disabled={loading} className="w-full bg-purple-600 hover:bg-purple-500" onClick={() => setConfirm({ type: 'tier', value: t })}>
                  <CreditCard className="w-4 h-4 mr-2" /> Buy {t.label}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-slate-950/70 border-purple-900/40">
          <CardHeader>
            <CardTitle className="text-purple-100 flex items-center gap-2">
              <Coins className="w-4 h-4" /> One-time amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <div className="flex items-center gap-2 w-full sm:w-64">
                <Badge className="bg-purple-600">USD</Badge>
                <Input type="number" min="1" step="1" value={amount} onChange={(e) => setAmount(e.target.value)} className="bg-slate-900 border-purple-900/40" />
              </div>
              <Button disabled={loading} onClick={() => setConfirm({ type: 'custom', value: Math.round(Number(amount) * 100) })}>
                <CreditCard className="w-4 h-4 mr-2" /> Pay ${Number(amount || 0).toFixed(0)}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-xs text-purple-400/60">
          Test mode active. Use card 4242 4242 4242 4242, any future expiry, any CVC.
        </div>
      </div>

      <Dialog open={!!confirm} onOpenChange={(o)=>!o && setConfirm(null)}>
        <DialogContent className="bg-slate-950/90 border-purple-900/40">
          <DialogHeader>
            <DialogTitle className="text-purple-100">Confirm Checkout</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-purple-200/80 space-y-1">
            {confirm?.type === 'tier' ? (
              <>
                <div>Tier: <span className="font-semibold">{confirm.value.label}</span></div>
                <div>Price: ${confirm.value.price}</div>
              </>
            ) : (
              <div>Amount: ${(confirm?.value/100).toFixed(0)} USD</div>
            )}
            <div className="text-xs text-purple-400/70">You will be redirected to a secure checkout page.</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setConfirm(null)} className="border-purple-900/40">Cancel</Button>
            <Button onClick={()=>{
              if(confirm?.type==='tier') redirectToCheckout({ tier: confirm.value.key });
              else redirectToCheckout({ amount_usd_cents: confirm.value });
            }} disabled={loading} className="gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin"/>}
              Proceed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}