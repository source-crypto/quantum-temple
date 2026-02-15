import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2, Wallet, Shield, ExternalLink, Coins } from "lucide-react";

const tiers = [
  { key: "seed", label: "Seed", perks: ["Starter blessing", "Basic insights"], color: "from-emerald-500 to-teal-600" },
  { key: "adept", label: "Adept", perks: ["Enhanced favor", "Priority insights"], color: "from-indigo-500 to-violet-600" },
  { key: "oracle", label: "Oracle", perks: ["Exalted favor", "Oracle-level insights"], color: "from-amber-500 to-orange-600" },
];

export default function CryptoCheckout() {
  const { data: links } = useQuery({
    queryKey: ["CryptoCheckoutLink"],
    queryFn: () => base44.entities.CryptoCheckoutLink.list(),
    initialData: [],
  });

  const linkByTier = Object.fromEntries((links || []).map(l => [l.tier, l.url]));

  const [confirm, setConfirm] = React.useState(null); // {label, url}
  const [loading, setLoading] = React.useState(false);

  const handleOpen = (tLabel, url) => {
    if (!url) return;
    setConfirm({ label: tLabel, url });
  };

  const proceed = () => {
    setLoading(true);
    setTimeout(()=>{
      window.open(confirm.url, '_blank', 'noopener');
      setLoading(false);
      setConfirm(null);
    }, 300);
  };

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-purple-100">Crypto Checkout</h1>
            <p className="text-purple-300/70">Pay with BTC / ETH / USDC via Coinbase Commerce hosted checkouts.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {tiers.map(t => {
            const url = linkByTier[t.key];
            return (
              <Card key={t.key} className="bg-slate-950/70 border-purple-900/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-100">
                    <Shield className="w-4 h-4" /> {t.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`mb-3 h-2 rounded bg-gradient-to-r ${t.color}`} />
                  <div className="space-y-1 text-sm text-purple-300/80 mb-4">
                    {t.perks.map(p => <div key={p}>• {p}</div>)}
                  </div>
                  {url ? (
                    <Button className="w-full bg-purple-600 hover:bg-purple-500" onClick={() => handleOpen(t.label, url)}>
                      <Coins className="w-4 h-4 mr-2" /> Pay with Crypto <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <div className="text-xs text-purple-400/70">Admin: add a CryptoCheckoutLink for tier "{t.key}" to enable.</div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-xs text-purple-400/60">
          Note: This opens an external hosted checkout. Access tier is granted automatically for Stripe payments. For crypto, an admin may verify and grant the corresponding tier.
        </div>
      </div>

      <Dialog open={!!confirm} onOpenChange={(o)=>!o && setConfirm(null)}>
        <DialogContent className="bg-slate-950/90 border-purple-900/40">
          <DialogHeader>
            <DialogTitle className="text-purple-100">Confirm Crypto Checkout</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-purple-200/80 space-y-1">
            <div>Tier: <span className="font-semibold">{confirm?.label}</span></div>
            <div className="text-xs text-purple-400/70">An external hosted crypto checkout will open in a new tab.</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={()=>setConfirm(null)} className="border-purple-900/40">Cancel</Button>
            <Button onClick={proceed} disabled={loading} className="gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin"/>}
              Proceed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}