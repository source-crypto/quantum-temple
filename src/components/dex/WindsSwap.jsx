import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Loader2, Repeat, ArrowDown, Info, ShieldCheck } from "lucide-react";
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

  const [fromAddress, setFromAddress] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [fromAmount, setFromAmount] = useState("");
  const [estOut, setEstOut] = useState<string | null>(null);
  const [slippage, setSlippage] = useState("0.5"); // %
  const [working, setWorking] = useState(false);
  const [tokenInfo, setTokenInfo] = useState({ from: null, to: null });

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
          const [symbol, decimals] = await Promise.all([c.symbol(), c.decimals()]);
          info.from = { symbol, decimals };
        }
        if (toAddress) {
          const c = new Contract(toAddress, ERC20_ABI, readProvider);
          const [symbol, decimals] = await Promise.all([c.symbol(), c.decimals()]);
          info.to = { symbol, decimals };
        }
        setTokenInfo(info);
      } catch (_e) {
        // ignore
      }
    };
    fetchMeta();
  }, [fromAddress, toAddress, readProvider]);

  // Estimate output via router.getAmountsOut
  useEffect(() => {
    const estimate = async () => {
      try {
        setEstOut(null);
        if (!routerAddress || !readProvider) return;
        if (!fromAddress || !toAddress) return;
        const amount = parseFloat(fromAmount);
        if (!amount || amount <= 0) return;

        const router = new Contract(routerAddress, UNI_V2_ROUTER_ABI, readProvider);
        const fromDec = tokenInfo.from?.decimals ?? 18;
        const amtIn = parseUnits(String(amount), fromDec);
        const amounts = await router.getAmountsOut(amtIn, [fromAddress, toAddress]);
        const outDec = tokenInfo.to?.decimals ?? 18;
        const out = formatUnits(amounts[1], outDec);
        setEstOut(out);
      } catch (_e) {
        setEstOut(null);
      }
    };
    estimate();
  }, [fromAmount, fromAddress, toAddress, routerAddress, readProvider, tokenInfo.from?.decimals, tokenInfo.to?.decimals]);

  const needsRouter = !routerAddress;
  const canSwap = !!(fromAddress && toAddress && fromAmount && Number(fromAmount) > 0 && routerAddress);

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
      const router = new Contract(routerAddress, UNI_V2_ROUTER_ABI, signer);

      // Amounts
      const fromDec = tokenInfo.from?.decimals ?? 18;
      const toDec = tokenInfo.to?.decimals ?? 18;
      const amtIn = parseUnits(String(fromAmount), fromDec);

      // Allowance
      const owner = await signer.getAddress();
      const allowance = await fromToken.allowance(owner, routerAddress);
      if (allowance < amtIn) {
        const txApprove = await fromToken.approve(routerAddress, amtIn);
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

      const path = [fromAddress, toAddress];
      const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes
      const swapTx = await router.swapExactTokensForTokens(amtIn, outMin, path, owner, deadline);
      await swapTx.wait?.();

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
              <Repeat className="w-5 h-5" /> Winds Swap (Uniswap V2)
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
            <div>Router: <span className="font-mono">{routerAddress || "(WINDS_ROUTER_ADDRESS not set)"}</span></div>
          </div>

          {needsRouter && (
            <div className="p-3 bg-amber-900/20 border border-amber-700/40 rounded text-amber-200 text-sm flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5" />
              Set WINDS_ROUTER_ADDRESS to an Uniswap V2-compatible router to enable swaps. QTC address detected: {qtcAddress || "—"}
            </div>
          )}

          <div className="grid gap-4">
            {/* From */}
            <div className="p-4 bg-slate-950/50 rounded-lg border border-cyan-900/30">
              <div className="text-sm text-cyan-400/70 mb-2">From (token address)</div>
              <Input value={fromAddress} onChange={(e) => setFromAddress(e.target.value.trim())} placeholder="0x… (e.g., QTC token)" className="bg-slate-900/50 border-cyan-900/30" />
              {tokenInfo.from?.symbol && (
                <div className="text-xs text-cyan-400/70 mt-1">Symbol: {tokenInfo.from.symbol}</div>
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
              {tokenInfo.to?.symbol && (
                <div className="text-xs text-cyan-400/70 mt-1">Symbol: {tokenInfo.to.symbol}</div>
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