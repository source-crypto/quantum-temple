import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Repeat, ArrowDown, Info, ShieldCheck, ExternalLink } from "lucide-react";
import WalletConnectButton from "@/components/wallet/WalletConnectButton";
import { Contract, BrowserProvider, JsonRpcProvider, formatUnits, parseUnits } from "ethers";

const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 value) returns (bool)"
];

// Minimal UniswapV2 router subset
const UNI_V2_ROUTER_ABI = [
  "function getAmountsOut(uint256 amountIn, address[] calldata path) view returns (uint256[] memory amounts)",
  "function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) returns (uint256[] memory amounts)"
];

// Uniswap V3 minimal ABIs
const UNI_V3_QUOTER_ABI = [
  "function quoteExactInputSingle(address tokenIn,address tokenOut,uint24 fee,uint256 amountIn,uint160 sqrtPriceLimitX96) view returns (uint256 amountOut)"
];

const UNI_V3_ROUTER_ABI = [
  "function exactInputSingle(tuple(address tokenIn,address tokenOut,uint24 fee,address recipient,uint256 deadline,uint256 amountIn,uint256 amountOutMinimum,uint160 sqrtPriceLimitX96)) payable returns (uint256 amountOut)"
];

function getExplorerAddressUrl(chainId, address) {
  switch (Number(chainId)) {
    case 1: return `https://etherscan.io/address/${address}`;
    case 5: return `https://goerli.etherscan.io/address/${address}`;
    case 11155111: return `https://sepolia.etherscan.io/address/${address}`;
    case 137: return `https://polygonscan.com/address/${address}`;
    case 42161: return `https://arbiscan.io/address/${address}`;
    case 10: return `https://optimistic.etherscan.io/address/${address}`;
    case 56: return `https://bscscan.com/address/${address}`;
    case 8453: return `https://basescan.org/address/${address}`;
    default: return null;
  }
}

function guessIconUrl(chainId, address) {
  if (!address) return null;
  if (Number(chainId) === 1) {
    return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`;
  }
  return null;
}

function getZeroExBaseUrl(chainId) {
  switch (Number(chainId)) {
    case 1: return 'https://api.0x.org'; // Ethereum
    case 137: return 'https://polygon.api.0x.org';
    case 42161: return 'https://arbitrum.api.0x.org';
    case 10: return 'https://optimism.api.0x.org';
    case 56: return 'https://bsc.api.0x.org';
    case 8453: return 'https://base.api.0x.org';
    default: return null;
  }
}

export default function WindsSwap() {
  // Load Winds config (env + health)
  const { data: config, isLoading: loadingCfg, refetch } = useQuery({
    queryKey: ["winds-config"],
    queryFn: async () => {
      const res = await base44.functions.invoke("windsConfig", {});
      return res.data;
    },
    staleTime: 10_000
  });

  const rpcUrl = config?.configured?.rpc_url || config?.health?.target_rpc || "";
  const chainId = config?.configured?.chain_id || null;
  const qtcAddress = (config?.configured?.qtc_erc20_address || "").trim();
  const routerAddress = (config?.configured?.router_address || "").trim();
  const quoterV3Address = (config?.configured?.quoter_v3_address || "").trim();
  const routerV3Address = (config?.configured?.router_v3_address || "").trim();

  const [fromAddress, setFromAddress] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [fromAmount, setFromAmount] = useState("");
  const [estOut, setEstOut] = useState<string | null>(null);
  const [slippage, setSlippage] = useState("0.5"); // %
  const [working, setWorking] = useState(false);
  const [tokenInfo, setTokenInfo] = useState({ from: null, to: null });
  const [useV3, setUseV3] = useState(false);
  const [feeTier, setFeeTier] = useState("3000"); // 0.3% default

  // Initialize defaults when config loads
  useEffect(() => {
    if (qtcAddress && !fromAddress) setFromAddress(qtcAddress);
  }, [qtcAddress]);

  // Helpers: providers
  const readProvider = useMemo(() => (rpcUrl ? new JsonRpcProvider(rpcUrl) : null), [rpcUrl]);

  async function getBrowserProvider() {
    if (!window.ethereum) throw new Error("No injected wallet found");
    const bp = new BrowserProvider(window.ethereum);
    return bp;
  }

  // Fetch token meta
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        if (!readProvider) return;
        const info: any = { from: null, to: null };
        if (fromAddress) {
          const c = new Contract(fromAddress, ERC20_ABI, readProvider);
          const [name, symbol, decimals] = await Promise.all([c.name(), c.symbol(), c.decimals()]);
          info.from = { name, symbol, decimals, iconUrl: guessIconUrl(chainId, fromAddress), address: fromAddress };
        }
        if (toAddress) {
          const c = new Contract(toAddress, ERC20_ABI, readProvider);
          const [name, symbol, decimals] = await Promise.all([c.name(), c.symbol(), c.decimals()]);
          info.to = { name, symbol, decimals, iconUrl: guessIconUrl(chainId, toAddress), address: toAddress };
        }
        setTokenInfo(info);
      } catch (_e) {
        // ignore
      }
    };
    fetchMeta();
  }, [fromAddress, toAddress, readProvider, chainId]);

  // Estimate output via V2 router or V3 quoter
  useEffect(() => {
    const estimate = async () => {
      try {
        setEstOut(null);
        if (!readProvider) return;
        if (!fromAddress || !toAddress) return;
        const amount = parseFloat(fromAmount);
        if (!amount || amount <= 0) return;

        const fromDec = tokenInfo.from?.decimals ?? 18;
        const amtIn = parseUnits(String(amount), fromDec);

        if (useV3 && quoterV3Address) {
          const quoter = new Contract(quoterV3Address, UNI_V3_QUOTER_ABI, readProvider);
          const fee = Number(feeTier) || 3000;
          const quoted = await quoter.quoteExactInputSingle(fromAddress, toAddress, fee, amtIn, 0n);
          const outDec = tokenInfo.to?.decimals ?? 18;
          const out = formatUnits(quoted, outDec);
          setEstOut(out);
        } else if (routerAddress) {
          const router = new Contract(routerAddress, UNI_V2_ROUTER_ABI, readProvider);
          const amounts = await router.getAmountsOut(amtIn, [fromAddress, toAddress]);
          const outDec = tokenInfo.to?.decimals ?? 18;
          const out = formatUnits(amounts[1], outDec);
          setEstOut(out);
        }
      } catch (_e) {
        setEstOut(null);
      }
    };
    estimate();
  }, [fromAmount, fromAddress, toAddress, routerAddress, quoterV3Address, useV3, feeTier, readProvider, tokenInfo.from?.decimals, tokenInfo.to?.decimals]);

  const needsRouter = useV3 ? (!routerV3Address || !quoterV3Address) : !routerAddress;
  const canSwap = !!(fromAddress && toAddress && fromAmount && Number(fromAmount) > 0 && (useV3 ? routerV3Address : routerAddress));

  const handleSwap = async () => {
    if (!canSwap) return;
    setWorking(true);
    try {
      const bp = await getBrowserProvider();
      const signer = await bp.getSigner();

      // Ensure chain
      if (chainId) {
        const nw = await bp.send("eth_chainId", []);
        const current = parseInt(nw, 16);
        if (current !== Number(chainId)) {
          const hexId = "0x" + Number(chainId).toString(16);
          try {
            await bp.send("wallet_switchEthereumChain", [{ chainId: hexId }]);
          } catch (_switchErr) {
            // Best-effort add chain (no detailed params known; user should switch manually if it fails)
          }
        }
      }

      // Contracts
      const fromToken = new Contract(fromAddress, ERC20_ABI, signer);
      const routerV2 = routerAddress ? new Contract(routerAddress, UNI_V2_ROUTER_ABI, signer) : null;
      const routerV3 = routerV3Address ? new Contract(routerV3Address, UNI_V3_ROUTER_ABI, signer) : null;

      // Amounts
      const fromDec = tokenInfo.from?.decimals ?? 18;
      const toDec = tokenInfo.to?.decimals ?? 18;
      const amtIn = parseUnits(String(fromAmount), fromDec);

      // Allowance
      const owner = await signer.getAddress();
      const spender = useV3 ? routerV3Address : routerAddress;
      const allowance = await fromToken.allowance(owner, spender);
      if (allowance < amtIn) {
        const txApprove = await fromToken.approve(spender, amtIn);
        await txApprove.wait?.();
      }

      // Min out using slippage
      let outMin = 0n;
      try {
        if (estOut) {
          const slp = Math.max(0, Math.min(100, Number(slippage)));
          const est = parseUnits(estOut, toDec);
          outMin = (est * BigInt(Math.round((100 - slp) * 1000))) / 100000n; // (100-slp)%
        }
      } catch (_e) { /* ignore */ }

      const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes
      if (useV3 && routerV3) {
        const params = {
          tokenIn: fromAddress,
          tokenOut: toAddress,
          fee: Number(feeTier) || 3000,
          recipient: owner,
          deadline,
          amountIn: amtIn,
          amountOutMinimum: outMin,
          sqrtPriceLimitX96: 0n
        };
        const tx = await routerV3.exactInputSingle(params);
        await tx.wait?.();
      } else if (routerV2) {
        const path = [fromAddress, toAddress];
        const tx = await routerV2.swapExactTokensForTokens(amtIn, outMin, path, owner, deadline);
        await tx.wait?.();
      } else {
        throw new Error("Router not configured");
      }

      await refetch();
      setFromAmount("");
      setEstOut(null);
      alert("Swap submitted successfully");
    } catch (e) {
      alert(e?.message || "Swap failed");
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Card className="bg-slate-900/60 border-cyan-900/40">
        <CardHeader className="border-b border-cyan-900/30">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-cyan-200">
              <Repeat className="w-5 h-5" /> {useV3 ? "Winds Swap (Uniswap V3)" : "Winds Swap (Uniswap V2)"}
            </CardTitle>
            <div className="flex items-center gap-2">
              <WalletConnectButton />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {loadingCfg ? (
            <div className="text-cyan-300 flex items-center gap-2 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Loading config…</div>
          ) : null}

          <div className="p-3 bg-slate-950/40 rounded border border-cyan-900/30 text-xs text-cyan-300/80">
            <div>RPC: <span className="font-mono">{rpcUrl || "(not set)"}</span></div>
            <div>Chain ID: <span className="font-mono">{chainId ?? "(unknown)"}</span></div>
            <div>V2 Router: <span className="font-mono">{routerAddress || "(not set)"}</span></div>
            <div>V3 Quoter: <span className="font-mono">{quoterV3Address || "(not set)"}</span></div>
            <div>V3 Router: <span className="font-mono">{routerV3Address || "(not set)"}</span></div>
          </div>

          {needsRouter && (
            <div className="p-3 bg-amber-900/20 border border-amber-700/40 rounded text-amber-200 text-sm flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5" />
              {useV3 ? (
                <span>Set Uniswap V3 Quoter and Router addresses to enable V3 quotes/swaps. QTC address detected: {qtcAddress || "—"}</span>
              ) : (
                <span>Set an Uniswap V2-compatible router to enable swaps. QTC address detected: {qtcAddress || "—"}</span>
              )}
            </div>
          )}

          <div className="p-3 bg-slate-950/50 rounded-lg border border-cyan-900/30 flex items-center justify-between gap-3">
            <label className="text-sm text-cyan-400/80 flex items-center gap-2">
              <input type="checkbox" checked={useV3} onChange={(e) => setUseV3(e.target.checked)} />
              Use Uniswap V3 (Quoter)
            </label>
            {useV3 && (
              <div className="flex items-center gap-2">
                <Label className="text-xs text-cyan-400/70">Fee tier (bps)</Label>
                <Input value={feeTier} onChange={(e) => setFeeTier(e.target.value)} className="w-28 bg-slate-900/50 border-cyan-900/30" />
              </div>
            )}
          </div>

          <div className="grid gap-4">
            {/* From */}
            <div className="p-4 bg-slate-950/50 rounded-lg border border-cyan-900/30">
              <div className="text-sm text-cyan-400/70 mb-2">From (token address)</div>
              <Input value={fromAddress} onChange={(e) => setFromAddress(e.target.value.trim())} placeholder="0x… (e.g., QTC token)" className="bg-slate-900/50 border-cyan-900/30" />
              {tokenInfo.from && (
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={tokenInfo.from.iconUrl || ""} alt={tokenInfo.from.symbol || "token"} onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/32?text=◈'; }} />
                      <AvatarFallback className="text-[10px]">{(tokenInfo.from.symbol || '?').slice(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="text-xs text-cyan-300">
                      <span className="font-medium">{tokenInfo.from.name || 'Unknown'}</span>
                      {tokenInfo.from.symbol ? <span className="text-cyan-400/70 ml-1">({tokenInfo.from.symbol})</span> : null}
                    </div>
                  </div>
                  {tokenInfo.from.address && getExplorerAddressUrl(chainId, tokenInfo.from.address) && (
                    <a href={getExplorerAddressUrl(chainId, tokenInfo.from.address)} target="_blank" rel="noreferrer" className="text-cyan-400/80 hover:text-cyan-200 text-xs inline-flex items-center gap-1">
                      View <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}
              <div className="mt-3">
                <Label className="text-xs text-cyan-400/70">Amount</Label>
                <Input type="number" value={fromAmount} onChange={(e) => setFromAmount(e.target.value)} placeholder="0.0" className="bg-slate-900/50 border-cyan-900/30 text-cyan-100 text-lg font-semibold mt-1" />
              </div>
            </div>

            <div className="flex justify-center">
              <ArrowDown className="w-5 h-5 text-cyan-400" />
            </div>

            {/* To */}
            <div className="p-4 bg-slate-950/50 rounded-lg border border-cyan-900/30">
              <div className="text-sm text-cyan-400/70 mb-2">To (token address)</div>
              <Input value={toAddress} onChange={(e) => setToAddress(e.target.value.trim())} placeholder="0x… (target token)" className="bg-slate-900/50 border-cyan-900/30" />
              {tokenInfo.to && (
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={tokenInfo.to.iconUrl || ""} alt={tokenInfo.to.symbol || "token"} onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/32?text=◈'; }} />
                      <AvatarFallback className="text-[10px]">{(tokenInfo.to.symbol || '?').slice(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="text-xs text-cyan-300">
                      <span className="font-medium">{tokenInfo.to.name || 'Unknown'}</span>
                      {tokenInfo.to.symbol ? <span className="text-cyan-400/70 ml-1">({tokenInfo.to.symbol})</span> : null}
                    </div>
                  </div>
                  {tokenInfo.to.address && getExplorerAddressUrl(chainId, tokenInfo.to.address) && (
                    <a href={getExplorerAddressUrl(chainId, tokenInfo.to.address)} target="_blank" rel="noreferrer" className="text-cyan-400/80 hover:text-cyan-200 text-xs inline-flex items-center gap-1">
                      View <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}
              <div className="mt-3 text-sm text-cyan-300/80">
                {estOut ? (
                  <div>
                    Estimated: <span className="font-semibold">{estOut}</span> {tokenInfo.to?.symbol || ""}
                    <div className="text-xs text-cyan-400/70 mt-1">Slippage: {slippage}% • Min received set at swap</div>
                  </div>
                ) : (
                  <span className="text-cyan-400/60">Enter amount to estimate output</span>
                )}
              </div>
            </div>

            {/* Slippage */}
            <div className="p-3 bg-slate-950/50 rounded-lg border border-cyan-900/30">
              <Label className="text-xs text-cyan-400/70 mr-2">Slippage</Label>
              <Input type="number" step="0.1" value={slippage} onChange={(e) => setSlippage(e.target.value)} className="inline-block w-24 bg-slate-900/50 border-cyan-900/30 ml-2" />
            </div>
          </div>

          <Button disabled={!canSwap || working} onClick={handleSwap} className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 font-semibold py-6 disabled:opacity-50">
            {working ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Swapping…</>) : (canSwap ? "Swap" : "Enter details")}
          </Button>

          <div className="flex items-center gap-2 text-xs text-cyan-400/60 mt-2">
            <ShieldCheck className="w-4 h-4" /> Transactions are signed locally by your wallet
          </div>
        </CardContent>
      </Card>
    </div>
  );
}