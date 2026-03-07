import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import HoldingsTable from "../components/portfolio/HoldingsTable";
import PortfolioCharts from "../components/portfolio/PortfolioCharts";
import WalletConnectButton from "@/components/wallet/WalletConnectButton";
import { Contract, BrowserProvider, JsonRpcProvider, formatUnits } from "ethers";

const ERC20_ABI = [
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)"
];

export default function Portfolio() {
  // Winds config (RPC, chain, QTC address)
  const { data: config } = useQuery({
    queryKey: ["winds-config"],
    queryFn: async () => (await base44.functions.invoke("windsConfig", {})).data,
    staleTime: 10_000
  });
  const rpcUrl = config?.configured?.rpc_url || "";
  const chainId = config?.configured?.chain_id || null;
  const qtcAddress = (config?.configured?.qtc_erc20_address || "").trim();

  // Providers
  const [readProvider, setReadProvider] = useState(null);
  useEffect(() => { setReadProvider(rpcUrl ? new JsonRpcProvider(rpcUrl) : null); }, [rpcUrl]);

  // Connected wallet
  const [account, setAccount] = useState("");
  useEffect(() => {
    async function detect() {
      try {
        if (!window.ethereum) return;
        const accs = await window.ethereum.request({ method: "eth_accounts" });
        if (accs && accs[0]) setAccount(accs[0]);
      } catch (_) {}
    }
    detect();
  }, []);

  // Track tokens: QTC + user-provided addresses
  const [addrInput, setAddrInput] = useState("");
  const tracked = useMemo(() => {
    const list = [];
    if (qtcAddress) list.push(qtcAddress);
    addrInput.split(',').map(s => s.trim()).filter(Boolean).forEach(a => list.push(a));
    return Array.from(new Set(list));
  }, [qtcAddress, addrInput]);

  // Currency index for pricing
  const { data: index } = useQuery({
    queryKey: ["currencyIndex"],
    queryFn: async () => (await base44.entities.CurrencyIndex.list('-last_updated', 1))?.[0],
  });

  // Fetch balances on-chain
  const [balances, setBalances] = useState([]);
  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        if (!readProvider || !account || !tracked.length) { setBalances([]); return; }
        const results = await Promise.all(tracked.map(async (address) => {
          try {
            const c = new Contract(address, ERC20_ABI, readProvider);
            const [symbol, decimals, raw] = await Promise.all([
              c.symbol(), c.decimals(), c.balanceOf(account)
            ]);
            const qty = parseFloat(formatUnits(raw, decimals));
            return { token_address: address, asset_symbol: String(symbol || '').toUpperCase(), decimals, quantity: qty };
          } catch (_) { return null; }
        }));
        const filtered = results.filter(Boolean).filter(r => (r.quantity || 0) > 0);
        if (!cancelled) setBalances(filtered);
      } catch (_) { if (!cancelled) setBalances([]); }
    }
    run();
    const id = setInterval(run, 20_000); // refresh
    return () => { cancelled = true; clearInterval(id); };
  }, [readProvider, account, tracked.join('|')]);

  // Price map per requirements
  const priceFor = (sym) => {
    const s = (sym || '').toUpperCase();
    if (s === 'QTC') return index?.qtc_unit_price_usd || 0;
    if (s === 'ETH' || s === 'WETH') return index?.eth_price_usd || 0;
    if (s === 'BTC' || s === 'WBTC') return index?.btc_price_usd || 0;
    if (s === 'USDC' || s === 'USDT') return 1;
    return 0; // unknowns = 0 for now
  };

  const valuations = useMemo(() => {
    const items = balances.map(b => ({
      ...b,
      price_usd: priceFor(b.asset_symbol),
      value_usd: priceFor(b.asset_symbol) * (b.quantity || 0)
    }));
    const total = items.reduce((s, i) => s + (i.value_usd || 0), 0);
    return { items, total };
  }, [balances, index]);

  return (
    <div className="p-6 md:p-10 space-y-6">
      <div className="flex items-start md:items-center gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-purple-200">Portfolio</h1>
          <p className="text-purple-400/70">On-chain balances for your connected wallet. Pricing via CurrencyIndex.</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <WalletConnectButton />
        </div>
      </div>

      <Card className="bg-slate-950/60 border-purple-900/40">
        <CardHeader>
          <CardTitle className="text-purple-200">Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4 text-purple-300/90">
          <div>
            <div className="text-xs text-purple-400/70">Wallet</div>
            <div className="font-mono text-sm break-all">{account || 'Not connected'}</div>
          </div>
          <div>
            <div className="text-xs text-purple-400/70">Chain ID</div>
            <div className="font-mono text-sm">{chainId ?? '—'}</div>
          </div>
          <div>
            <div className="text-xs text-purple-400/70">Net Worth (USD)</div>
            <div className="text-2xl font-bold">${valuations.total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-950/60 border-purple-900/40">
        <CardHeader>
          <CardTitle className="text-purple-200">Tracked Tokens</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-xs text-purple-400/70">Additional token addresses (comma-separated). Defaults include QTC if configured.</div>
          <div className="flex gap-2">
            <Input placeholder="0x..., 0x..., 0x..." value={addrInput} onChange={(e) => setAddrInput(e.target.value)} />
            <Button variant="outline" onClick={() => setAddrInput(addrInput.trim())}>Apply</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-slate-950/60 border-purple-900/40 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-purple-200">Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <HoldingsTable items={valuations.items} />
          </CardContent>
        </Card>
        <Card className="bg-slate-950/60 border-purple-900/40">
          <CardHeader>
            <CardTitle className="text-purple-200">Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <PortfolioCharts items={valuations.items} total={valuations.total} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}