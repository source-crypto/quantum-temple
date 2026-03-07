import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import WalletConnectButton from "@/components/wallet/WalletConnectButton";
import { Loader2, RefreshCw, DollarSign } from "lucide-react";
import { Contract, BrowserProvider, JsonRpcProvider, formatUnits } from "ethers";

const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)"
];

function guessIconUrl(chainId, address) {
  if (!address) return null;
  if (Number(chainId) === 1) {
    return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`;
  }
  return null;
}

export default function Portfolio() {
  // Config (RPC + chain + QTC address)
  const { data: config, isLoading: loadingCfg } = useQuery({
    queryKey: ["winds-config"],
    queryFn: async () => {
      const res = await base44.functions.invoke("windsConfig", {});
      return res.data;
    },
    staleTime: 10_000,
  });

  const rpcUrl = config?.configured?.rpc_url || config?.health?.target_rpc || "";
  const chainId = config?.configured?.chain_id || null;
  const qtcAddress = (config?.configured?.qtc_erc20_address || "").trim();

  // State
  const [owner, setOwner] = useState("");
  const [customAddresses, setCustomAddresses] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);

  // Pricing (CurrencyIndex)
  const { data: index } = useQuery({
    queryKey: ["currencyIndex"],
    queryFn: async () => {
      const list = await base44.entities.CurrencyIndex.list("-last_updated", 1);
      return list?.[0];
    },
  });

  const readProvider = useMemo(() => (rpcUrl ? new JsonRpcProvider(rpcUrl) : null), [rpcUrl]);

  // Pre-configured majors by chain (extend as needed)
  const majorsByChain = useMemo(() => ({
    1: [
      { symbol: "WETH", address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" },
      { symbol: "USDC", address: "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" },
      { symbol: "USDT", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7" },
    ],
  }), []);

  // Default token list = QTC + majors
  const baseTokenAddresses = useMemo(() => {
    const list = [];
    if (qtcAddress) list.push(qtcAddress);
    const majors = majorsByChain[Number(chainId)] || [];
    return [...list, ...majors.map((m) => m.address)];
  }, [qtcAddress, chainId, majorsByChain]);

  // Custom addresses (comma/space separated)
  const parsedCustom = useMemo(
    () =>
      customAddresses
        .split(/[\s,]+/)
        .map((s) => s.trim())
        .filter(Boolean),
    [customAddresses]
  );

  const tokenAddresses = useMemo(() => {
    const set = new Set((baseTokenAddresses || []).concat(parsedCustom).map((a) => a.toLowerCase()));
    return Array.from(set);
  }, [baseTokenAddresses, parsedCustom]);

  // Fetch connected account if available
  useEffect(() => {
    (async () => {
      try {
        if (!window.ethereum) return;
        const bp = new BrowserProvider(window.ethereum);
        const accs = await bp.send("eth_accounts", []);
        if (accs && accs[0]) setOwner(accs[0]);
      } catch (_) {
        // ignore
      }
    })();
  }, []);

  function formatAddress(addr) {
    if (!addr) return "";
    return addr.slice(0, 6) + "…" + addr.slice(-4);
  }

  function getUsdPriceForSymbol(sym) {
    if (!sym) return null;
    const s = sym.toUpperCase();
    if (s === "QTC") return index?.qtc_unit_price_usd ?? null;
    if (s === "ETH" || s === "WETH") return index?.eth_price_usd ?? null;
    if (s === "BTC") return index?.btc_price_usd ?? null;
    if (s === "USDC" || s === "USDT") return 1;
    return null;
  }

  const totalNetWorth = useMemo(() => items.reduce((sum, it) => sum + (it.valueUsd || 0), 0), [items]);

  async function refreshBalances() {
    if (!readProvider) return;
    try {
      setLoading(true);
      let acct = owner;
      if (!acct && window.ethereum) {
        const bp = new BrowserProvider(window.ethereum);
        const req = await bp.send("eth_requestAccounts", []);
        acct = req?.[0] || "";
        setOwner(acct);
      }
      if (!acct) {
        setLoading(false);
        return;
      }

      const results = await Promise.all(
        tokenAddresses.map(async (addr) => {
          try {
            const c = new Contract(addr, ERC20_ABI, readProvider);
            const [name, symbol, decimals, rawBal] = await Promise.all([
              c.name(),
              c.symbol(),
              c.decimals(),
              c.balanceOf(acct),
            ]);
            const bal = Number(formatUnits(rawBal, decimals));
            const price = getUsdPriceForSymbol(symbol);
            const value = (price ? price : 0) * bal;
            return {
              address: addr,
              name,
              symbol,
              decimals,
              balance: bal,
              priceUsd: price,
              valueUsd: value,
              iconUrl: guessIconUrl(chainId, addr),
            };
          } catch (_) {
            return null;
          }
        })
      );

      const filtered = results
        .filter(Boolean)
        .sort((a, b) => (b.valueUsd || 0) - (a.valueUsd || 0));
      setItems(filtered);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 md:p-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-purple-200">Portfolio</h1>
          <p className="text-purple-400/70">On-chain balances for your connected wallet</p>
        </div>
        <div className="flex items-center gap-2">
          <WalletConnectButton />
        </div>
      </div>

      <Card className="bg-slate-950/60 border-purple-900/40">
        <CardHeader className="flex flex-col gap-2">
          <CardTitle className="text-purple-200 flex items-center gap-2">
            <DollarSign className="w-5 h-5" /> Net Worth
          </CardTitle>
          <div className="text-2xl md:text-4xl font-bold text-purple-100">
            ${totalNetWorth.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-purple-400/70 flex flex-wrap gap-3">
            <span>
              Chain: <Badge variant="outline" className="border-purple-900/50 text-purple-300">{chainId ?? "—"}</Badge>
            </span>
            <span>
              Wallet: <Badge variant="outline" className="border-purple-900/50 text-purple-300">{owner ? formatAddress(owner) : "Not connected"}</Badge>
            </span>
            {qtcAddress ? (
              <span>
                QTC: <Badge variant="outline" className="border-purple-900/50 text-purple-300">{formatAddress(qtcAddress)}</Badge>
              </span>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-2 items-stretch md:items-end">
            <div className="flex-1">
              <label className="text-xs text-purple-400/70">Add token addresses (comma or space separated)</label>
              <Input
                placeholder="0x..., 0x..."
                value={customAddresses}
                onChange={(e) => setCustomAddresses(e.target.value)}
                className="bg-slate-900/50 border-purple-900/40 mt-1"
              />
              <div className="text-[11px] text-purple-400/60 mt-1">
                Defaults: QTC {Number(chainId) === 1 ? "+ WETH, USDC, USDT" : ""}
              </div>
            </div>
            <Button onClick={refreshBalances} disabled={loading || !readProvider} className="min-w-[180px]">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Fetching…
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" /> Refresh Balances
                </>
              )}
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-purple-300/80 border-b border-purple-900/40">
                  <th className="text-left py-2">Asset</th>
                  <th className="text-right py-2">Balance</th>
                  <th className="text-right py-2">Price (USD)</th>
                  <th className="text-right py-2">Value (USD)</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-purple-400/70">
                      {loadingCfg ? "Loading config…" : owner ? "No balances yet. Click Refresh." : "Connect your wallet and click Refresh."}
                    </td>
                  </tr>
                ) : (
                  items.map((it) => (
                    <tr key={it.address} className="border-b border-purple-900/20 hover:bg-purple-950/30">
                      <td className="py-2 pr-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={it.iconUrl || "https://via.placeholder.com/24?text=◈"}
                            alt={it.symbol}
                            className="w-5 h-5 rounded"
                            onError={(e) => {
                              e.currentTarget.src = "https://via.placeholder.com/24?text=◈";
                            }}
                          />
                          <div>
                            <div className="text-purple-100 font-medium">{it.symbol || "Token"}</div>
                            <div className="text-[11px] text-purple-400/70">{it.name || it.address}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 text-right text-purple-100">
                        {it.balance.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                      </td>
                      <td className="py-2 text-right text-purple-100">
                        {it.priceUsd != null ? `$${it.priceUsd.toLocaleString(undefined, { maximumFractionDigits: 4 })}` : "—"}
                      </td>
                      <td className="py-2 text-right text-purple-100 font-semibold">
                        ${ (it.valueUsd || 0).toLocaleString(undefined, { maximumFractionDigits: 2 }) }
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}