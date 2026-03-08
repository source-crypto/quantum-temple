import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import WalletConnectButton from "@/components/wallet/WalletConnectButton";
import StatCard from "@/components/staking/StatCard";
import PoolRow from "@/components/staking/PoolRow";

function priceFor(symbol, idx) {
  const sym = (symbol || '').toUpperCase();
  if (!idx) return 0;
  if (sym === 'USDC' || sym === 'USDT') return 1;
  if (sym === 'QTC') return Number(idx.qtc_unit_price_usd || 0);
  if (sym === 'ETH') return Number(idx.eth_price_usd || 0);
  if (sym === 'BTC') return Number(idx.btc_price_usd || 0);
  return 0;
}

export default function Staking() {
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    let mounted = true;
    base44.auth.isAuthenticated().then((ok) => mounted && setIsAuth(!!ok)).catch(() => {});
    return () => { mounted = false; };
  }, []);

  const { data: indexRec, isLoading: loadingIdx, refetch: refetchIdx } = useQuery({
    queryKey: ['currency-index-latest'],
    queryFn: async () => {
      const rows = await base44.entities.CurrencyIndex.list('-updated_date', 1);
      return rows?.[0] || null;
    }
  });

  const { data: pools = [], isLoading: loadingPools, refetch: refetchPools } = useQuery({
    queryKey: ['liquidity-pools'],
    queryFn: async () => {
      const rows = await base44.entities.LiquidityPool.list();
      return rows || [];
    }
  });

  const { data: favors = [], isLoading: loadingFavors, refetch: refetchFavors } = useQuery({
    queryKey: ['divine-favor'],
    enabled: isAuth,
    queryFn: async () => {
      const me = await base44.auth.me();
      const rows = await base44.entities.DivineFavor.filter({ created_by: me.email }, '-updated_date', 50);
      return rows || [];
    }
  });

  const computed = useMemo(() => {
    if (!pools?.length) return { totalTVL: 0, weightedAPR: 0, enriched: [] };
    const idx = indexRec;
    let totalTVL = 0;
    const enriched = pools.map((p) => {
      const pair = (p.currency_pair || '').toUpperCase();
      const [, right] = pair.split('/') || [];
      const priceQ = priceFor('QTC', idx);
      const priceR = priceFor(right || 'USDC', idx);
      const tvl = Number(p.qtc_liquidity || 0) * priceQ + Number(p.paired_liquidity || 0) * priceR;
      totalTVL += tvl;
      return { ...p, tvl_usd: tvl };
    });
    const weightedAPR = enriched.reduce((acc, p) => acc + (Number(p.apy || 0) * (p.tvl_usd || 0)), 0) / (totalTVL || 1);
    return { totalTVL, weightedAPR, enriched };
  }, [pools, indexRec]);

  const pendingRewards = useMemo(() => {
    if (!favors?.length) return 0;
    return favors.reduce((sum, f) => sum + Number(f.unclaimed_rewards || 0), 0);
  }, [favors]);

  const refreshing = loadingIdx || loadingPools || loadingFavors;

  return (
    <div className="p-6 md:p-10 space-y-6">
      <div className="flex items-start md:items-center justify-between gap-3 flex-col md:flex-row">
        <div>
          <h1 className="text-3xl font-bold text-purple-200">Staking & Liquidity</h1>
          <p className="text-purple-400/70">Live APR, TVL, and your pending rewards across QTC pools.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => { refetchIdx(); refetchPools(); if (isAuth) refetchFavors(); }} className="gap-2">
            {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Refresh
          </Button>
          <WalletConnectButton />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Current APR (weighted)" value={`${(computed.weightedAPR || 0).toFixed(2)}%`} subtext="Weighted by pool TVL" />
        <StatCard title="Total Value Locked" value={`$${(computed.totalTVL || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`} subtext="Across all active pools" />
        <StatCard title="Pending Rewards" value={`${pendingRewards.toLocaleString()} QTC`} subtext={isAuth ? "From your staked positions" : "Login to view personal rewards"} />
      </div>

      <Card className="bg-slate-950/60 border-purple-900/40">
        <CardHeader>
          <CardTitle className="text-purple-200">Pools</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {computed.enriched.length === 0 ? (
            <div className="text-sm text-purple-400/70">No pools available yet.</div>
          ) : (
            <div className="space-y-2">
              <div className="hidden md:grid grid-cols-6 gap-3 px-3 text-xs text-purple-400/70">
                <div className="col-span-2">Pool</div>
                <div>APR</div>
                <div>TVL (USD)</div>
                <div>24h Volume</div>
                <div>Fee</div>
              </div>
              {computed.enriched
                .sort((a,b) => (b.tvl_usd||0) - (a.tvl_usd||0))
                .map((p) => (
                  <PoolRow key={p.id} pool={p} />
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}