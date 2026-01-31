import React, { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { LineChart as LineChartIcon, Info, Activity, TrendingUp, ArrowLeftRight, BarChart3 } from "lucide-react";
import LiquidityInterface from "./LiquidityInterface";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";

const SUPPORTED = {
  uniswap: [
    { id: "QTC/ETH", label: "QTC / ETH" },
    { id: "QTC/USDC", label: "QTC / USDC" },
  ],
  orca: [
    { id: "QTC/USDT", label: "QTC / USDT" },
  ],
};

export default function LiquidityInsights() {
  const [dex, setDex] = useState("uniswap");
  const [poolId, setPoolId] = useState(SUPPORTED.uniswap[0].id);
  const [priceShift, setPriceShift] = useState(0); // -50 to +50 (%)
  const [showManager, setShowManager] = useState(false);
  const queryClient = useQueryClient();

  // Real-time liquidity snapshots from our entity (acts as live store)
  const { data: pools } = useQuery({
    queryKey: ["crosschain-liquidity"],
    queryFn: async () => await base44.entities.CrossChainLiquidity.list(),
    initialData: [],
  });

  useEffect(() => {
    const unsubscribe = base44.entities.CrossChainLiquidity.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ["crosschain-liquidity"] });
    });
    return unsubscribe;
  }, [queryClient]);

  // Currency index for USD conversions
  const { data: index } = useQuery({
    queryKey: ["currency-index"],
    queryFn: async () => {
      const res = await base44.entities.CurrencyIndex.list();
      return res?.[0] || null;
    },
    initialData: null,
  });

  const selectedPool = useMemo(() => {
    return pools.find((p) => p.currency_pair === poolId) || null;
  }, [pools, poolId]);

  const tvlUSD = useMemo(() => {
    if (!selectedPool || !index) return null;
    const qtcUSD = index.qtc_unit_price_usd || 0.1;
    const pairedSymbol = (poolId.split("/")[1] || "USDC").toUpperCase();
    const pairedUSD = pairedSymbol === "ETH" ? (index.eth_price_usd || 0) : pairedSymbol === "BTC" ? (index.btc_price_usd || 0) : 1; // assume stables = 1
    const a = (selectedPool.qtc_liquidity || 0) * qtcUSD;
    const b = (selectedPool.paired_liquidity || 0) * pairedUSD;
    return a + b;
  }, [selectedPool, index, poolId]);

  // APY estimate from fee capture
  const apy = useMemo(() => {
    if (!selectedPool || !tvlUSD) return null;
    const dailyFees = (selectedPool.total_volume_24h || 0) * (selectedPool.fee_percentage || 0.003) / 100; // fee_percentage is %
    const dailyYield = tvlUSD > 0 ? dailyFees / tvlUSD : 0;
    return (dailyYield * 365 * 100); // %
  }, [selectedPool, tvlUSD]);

  // Impermanent loss calculation for price change (delta in %)
  const ilPercent = useMemo(() => {
    const delta = Number(priceShift) / 100; // -0.5 .. 0.5
    const r = 1 + delta;
    if (r <= 0) return 0;
    const il = (2 * Math.sqrt(r)) / (1 + r) - 1; // negative value
    return Math.abs(il * 100);
  }, [priceShift]);

  // Synthetic historical price series
  const history = useMemo(() => {
    const base = selectedPool?.current_exchange_rate || 1;
    const DAYS = 30;
    const now = Date.now();
    return new Array(DAYS).fill(0).map((_, i) => {
      const t = now - (DAYS - i) * 24 * 3600 * 1000;
      const jitter = (Math.sin(i / 3) + Math.random() * 0.3) * 0.02; // +/- ~2%
      const price = base * (1 + jitter);
      const d = new Date(t);
      return { date: `${d.getMonth() + 1}/${d.getDate()}`, price: Number(price.toFixed(4)) };
    });
  }, [selectedPool]);

  const poolOptions = SUPPORTED[dex];

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Left: Controls and metrics */}
      <div className="lg:col-span-1 space-y-4">
        <Card className="bg-slate-900/60 border-purple-900/40">
          <CardHeader className="border-b border-purple-900/30">
            <CardTitle className="text-purple-200 flex items-center gap-2">
              <LineChartIcon className="w-5 h-5" /> Liquidity Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="space-y-2">
              <div className="text-xs text-purple-400/70">DEX</div>
              <div className="flex gap-2">
                <Button variant={dex === "uniswap" ? "default" : "ghost"} onClick={() => { setDex("uniswap"); setPoolId(SUPPORTED.uniswap[0].id); }}>
                  Uniswap
                </Button>
                <Button variant={dex === "orca" ? "default" : "ghost"} onClick={() => { setDex("orca"); setPoolId(SUPPORTED.orca[0].id); }}>
                  Orca
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-purple-400/70">Pool</div>
              <Select value={poolId} onValueChange={setPoolId}>
                <SelectTrigger className="bg-slate-950/50 border-purple-900/30 text-purple-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {poolOptions.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Metric label="TVL" value={tvlUSD != null ? `$${tvlUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : "-"} icon={BarChart3} />
              <Metric label="APY (est.)" value={apy != null ? `${apy.toFixed(2)}%` : "-"} icon={TrendingUp} />
              <div className="col-span-2 p-3 rounded-lg border border-purple-900/30 bg-slate-950/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-purple-400/70">Impermanent Loss Potential</div>
                  <Badge className="bg-purple-500/20 text-purple-200 border-purple-500/30">{ilPercent.toFixed(2)}%</Badge>
                </div>
                <input
                  type="range"
                  min={-50}
                  max={50}
                  step={1}
                  value={priceShift}
                  onChange={(e) => setPriceShift(e.target.value)}
                  className="w-full"
                />
                <div className="text-[11px] text-purple-400/60 mt-1">Price change: {priceShift}%</div>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-purple-900/30 bg-purple-950/20 text-xs text-purple-300/80 flex gap-2">
              <Info className="w-4 h-4 text-purple-300" />
              Estimates are based on current pool metrics and may differ from on-chain execution.
            </div>

            <div className="flex gap-2">
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600" onClick={() => setShowManager(v=>!v)}>
                <ArrowLeftRight className="w-4 h-4 mr-2" /> {showManager ? 'Hide' : 'Add/Remove Liquidity'}
              </Button>
              <a href={dex === 'uniswap' ? 'https://app.uniswap.org/#/pool' : 'https://www.orca.so/pools'} target="_blank" rel="noreferrer">
                <Button variant="outline" className="border-purple-500/30 text-purple-200 hover:bg-purple-900/30">Open DEX</Button>
              </a>
            </div>
          </CardContent>
        </Card>

        {showManager && (
          <Card className="bg-slate-900/60 border-purple-900/40">
            <CardHeader className="border-b border-purple-900/30">
              <CardTitle className="text-purple-200 flex items-center gap-2">
                <Activity className="w-5 h-5" /> Manage Liquidity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <LiquidityInterface />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right: Chart */}
      <div className="lg:col-span-2">
        <Card className="bg-slate-900/60 border-purple-900/40">
          <CardHeader className="border-b border-purple-900/30">
            <CardTitle className="text-purple-200">Historical Price (30d) — {poolId}</CardTitle>
          </CardHeader>
          <CardContent className="p-5 h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid stroke="#2a1f3f" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#a78bfa" tick={{ fontSize: 12 }} />
                <YAxis stroke="#a78bfa" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "#0f0a1f", border: "1px solid #5b21b6" }} />
                <Line type="monotone" dataKey="price" stroke="#22d3ee" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Metric({ label, value, icon: Icon }) {
  return (
    <div className="p-3 rounded-lg border border-purple-900/30 bg-slate-950/50">
      <div className="text-xs text-purple-400/70 flex items-center gap-1"><Icon className="w-3 h-3" /> {label}</div>
      <div className="text-lg font-semibold text-purple-100 mt-1">{value}</div>
    </div>
  );
}