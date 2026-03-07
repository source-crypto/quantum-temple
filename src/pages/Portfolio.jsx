import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import HoldingsTable from "../components/portfolio/HoldingsTable";
import PortfolioCharts from "../components/portfolio/PortfolioCharts";
import { Contract, BrowserProvider, JsonRpcProvider, formatUnits } from "ethers";

const ERC20_ABI = [
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)"
];

function getMajorsForChain(chainId) {
  switch (Number(chainId)) {
    case 1: // Ethereum mainnet
      return [
        // WETH, USDC, USDT on mainnet
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        "0xdAC17F958D2ee523a2206206994597C13D831ec7"
      ];
    default:
      return [];
  }
}

export default function Portfolio() {
  const { data: config } = useQuery({
    queryKey: ["winds-config"],
    queryFn: async () => (await base44.functions.invoke("windsConfig", {})).data,
    staleTime: 10_000
  });

  const rpcUrl = config?.configured?.rpc_url || config?.health?.target_rpc || "";
  const chainId = config?.configured?.chain_id || null;
  const qtcAddress = (config?.configured?.qtc_erc20_address || "").trim();

  const { data: index } = useQuery({
    queryKey: ["currencyIndex"],
    queryFn: async () => {
      const list = await base44.entities.CurrencyIndex.list('-last_updated', 1);
      return list?.[0];
    },
  });

  const readProvider = useMemo(() => (rpcUrl ? new JsonRpcProvider(rpcUrl) : null), [rpcUrl]);

  const [walletAddress, setWalletAddress] = useState("");
  const [tokenAddrs, setTokenAddrs] = useState([]);
  const [customInput, setCustomInput] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const majors = useMemo(() => getMajorsForChain(chainId), [chainId]);

  useEffect(() => {
    // Initialize default token list once config is ready
    const baseList = [];
    if (qtcAddress) baseList.push(qtcAddress);
    const defaults = Array.from(new Set([...baseList, ...majors]));
    setTokenAddrs(prev => (prev.length ? prev : defaults));
  }, [qtcAddress, majors]);

  const prices = useMemo(() => ({
    QTC: index?.qtc_unit_price_usd || 0,
    BTC: index?.btc_price_usd || 0,
    ETH: index?.eth_price_usd || 0,
    WETH: index?.eth_price_usd || 0,
    USDC: 1,
    USDT: 1
  }), [index]);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("No wallet found. Please install a Web3 wallet like MetaMask.");
      return;
    }
    const bp = new BrowserProvider(window.ethereum);
    await bp.send('eth_requestAccounts', []);
    const si = await bp.getSigner();
    const addr = await si.getAddress();
    setWalletAddress(addr);
  };

  const addCustomTokens = () => {
    const list = customInput.split(',').map(s => s.trim()).filter(Boolean);
    if (!list.length) return;
    setTokenAddrs(prev => Array.from(new Set([...prev, ...list])));
    setCustomInput("");
  };

  const loadBalances = async () => {
    try {
      setLoading(true);
      setItems([]);
      if (!readProvider || !walletAddress || !tokenAddrs.length) return;
      const results = await Promise.all(tokenAddrs.map(async (addr) => {
        try {
          const c = new Contract(addr, ERC20_ABI, readProvider);
          const [symbol, decimals, raw] = await Promise.all([
            c.symbol().catch(() => ""),
            c.decimals().catch(() => 18),
            c.balanceOf(walletAddress).catch(() => 0n)
          ]);
          const qty = parseFloat(formatUnits(raw, decimals));
          // Prefer symbol, but if token equals QTC address, enforce QTC
          const sym = qtcAddress && addr.toLowerCase() === qtcAddress.toLowerCase() ? 'QTC' : (symbol || '').toUpperCase();
          const price = prices[sym] ?? 0;
          const value = qty * (price || 0);
          return {
            asset_symbol: sym || addr.slice(0,6)+"…"+addr.slice(-4),
            quantity: qty,
            price_usd: price,
            value_usd: value,
            token_address: addr,
            decimals
          };
        } catch (_e) {
          return null;
        }
      }));
      setItems(results.filter(Boolean));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-load when prerequisites ready
    if (walletAddress && readProvider && tokenAddrs.length) {
      loadBalances();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress, readProvider, JSON.stringify(tokenAddrs)]);

  const total = useMemo(() => items.reduce((s, i) => s + (i?.value_usd || 0), 0), [items]);

  return (
    <div className="p-6 md:p-10 space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-end gap-3">
        <div>
          <h1 className="text-3xl font-bold text-purple-200">Portfolio</h1>
          <p className="text-purple-400/70">On-chain balances from your connected wallet.</p>
        </div>
        <div className="ml-auto flex flex-wrap gap-2 items-center">
          {walletAddress ? (
            <div className="text-xs text-purple-300/80 px-3 py-2 bg-purple-950/40 rounded border border-purple-900/40">
              {walletAddress.slice(0,6)}…{walletAddress.slice(-4)} {chainId ? (<span className="ml-2 opacity-70">(Chain {chainId})</span>) : null}
            </div>
          ) : null}
          <Button onClick={connectWallet} variant={walletAddress ? "outline" : "default"}>
            {walletAddress ? "Change Wallet" : "Connect Wallet"}
          </Button>
          <Button onClick={loadBalances} variant="outline" disabled={!walletAddress || loading}>
            {loading ? "Refreshing…" : "Refresh"}
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-slate-950/60 border-purple-900/40">
          <CardHeader>
            <CardTitle className="text-purple-200">Net Worth (USD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-100">${total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
            <div className="text-xs text-purple-400/70 mt-1">Pricing: QTC/ETH/BTC from CurrencyIndex, stables at $1</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-950/60 border-purple-900/40 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-purple-200">Track Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-2">
              <Input placeholder="Add token addresses (comma separated)" value={customInput} onChange={(e) => setCustomInput(e.target.value)} />
              <Button variant="outline" onClick={addCustomTokens}>Add</Button>
            </div>
            {tokenAddrs.length ? (
              <div className="text-xs text-purple-400/70 mt-2 break-all">
                Tracking: {tokenAddrs.join(", ")}
              </div>
            ) : (
              <div className="text-xs text-purple-400/70 mt-2">No tokens tracked yet.</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-slate-950/60 border-purple-900/40 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-purple-200">Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <HoldingsTable items={items} />
          </CardContent>
        </Card>
        <Card className="bg-slate-950/60 border-purple-900/40">
          <CardHeader>
            <CardTitle className="text-purple-200">Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <PortfolioCharts items={items} total={total} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}