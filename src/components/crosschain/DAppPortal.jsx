import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Globe, ExternalLink, Shield, Zap, AppWindow, Link2 } from "lucide-react";
import WalletConnector from "@/components/dex/WalletConnector";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const DAPPS = {
  ethereum: [
    { id: "uniswap", name: "Uniswap", url: "https://app.uniswap.org/#/swap", category: "DEX" },
    { id: "aave", name: "Aave", url: "https://app.aave.com", category: "Lending" },
    { id: "opensea", name: "OpenSea", url: "https://opensea.io", category: "NFTs" },
  ],
  solana: [
    { id: "jupiter", name: "Jupiter", url: "https://jup.ag/swap", category: "DEX" },
    { id: "orca", name: "Orca", url: "https://www.orca.so", category: "DEX" },
    { id: "magiceden", name: "Magic Eden", url: "https://magiceden.io", category: "NFTs" },
  ],
};

const BRIDGED_QTC = {
  ethereum: { address: "0x00000000000000000000000000000000QTCETH" },
  solana: { mint: "QTC1111111111111111111111111111111111ETH" }
};

const BRIDGE_PRESETS = [
  { id: "btc_to_qqtc", label: "BTC → qQTC (Ethereum)", source_chain: "bitcoin", destination_chain: "ethereum", source_currency: "BTC", destination_currency: "QTC" },
  { id: "eth_to_sqtc", label: "ETH → sQTC (Solana)", source_chain: "ethereum", destination_chain: "solana", source_currency: "ETH", destination_currency: "QTC" },
];

function getDappUrl(selected, network, useQtc) {
  if (!useQtc) return selected.url;
  if (network === 'ethereum' && selected.id === 'uniswap') {
    return `${selected.url}?inputCurrency=${encodeURIComponent(BRIDGED_QTC.ethereum.address)}`;
  }
  if (network === 'solana' && selected.id === 'jupiter') {
    // Jupiter accepts path or query; using query for safety
    return `${selected.url}?inputMint=${encodeURIComponent(BRIDGED_QTC.solana.mint)}`;
  }
  return selected.url;
}

export default function DAppPortal() {
  const [network, setNetwork] = useState("ethereum");
  const [selectedId, setSelectedId] = useState(DAPPS.ethereum[0].id);
  const selected = useMemo(() => DAPPS[network].find(d => d.id === selectedId) || DAPPS[network][0], [network, selectedId]);
  const [canEmbed, setCanEmbed] = useState(true);
  const [useQtcInDapp, setUseQtcInDapp] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [preset, setPreset] = useState("btc_to_qqtc");
  const [amount, setAmount] = useState("");
  const [destAddress, setDestAddress] = useState("");
  const queryClient = useQueryClient();

  const { data: balances } = useQuery({
    queryKey: ['bridged-qtc-balances'],
    queryFn: async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) return null;
      const user = await base44.auth.me();
      const items = await base44.entities.CrossChainBridge.filter({ user_email: user.email, status: 'completed' });
      const evm = items.filter(b => b.destination_chain === 'ethereum' && b.destination_currency === 'QTC')
                       .reduce((s,b)=>s+(b.destination_amount||0), 0);
      const sol = items.filter(b => b.destination_chain === 'solana' && b.destination_currency === 'QTC')
                       .reduce((s,b)=>s+(b.destination_amount||0), 0);
      return { evm, sol };
    },
    initialData: null,
  });

  const bridgeMutation = useMutation({
    mutationFn: async ({ presetId, amount, dest }) => {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) { base44.auth.redirectToLogin(); return; }
      const user = await base44.auth.me();
      const cfg = BRIDGE_PRESETS.find(p=>p.id===presetId);
      const payload = {
        bridge_id: 'br_' + Date.now(),
        user_email: user.email,
        source_chain: cfg.source_chain,
        destination_chain: cfg.destination_chain,
        source_currency: cfg.source_currency,
        destination_currency: cfg.destination_currency,
        source_amount: Number(amount),
        destination_amount: Number(amount),
        destination_address: dest,
        status: 'initiated',
        initiated_at: new Date().toISOString(),
      };
      return await base44.entities.CrossChainBridge.create(payload);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['bridged-qtc-balances'] }); }
  });

  useEffect(() => {
    const unsubscribe = base44.entities.CrossChainBridge.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ['bridged-qtc-balances'] });
    });
    return unsubscribe;
  }, [queryClient]);

  const handleBridge = () => bridgeMutation.mutate({ presetId: preset, amount, dest: destAddress });

  useEffect(() => {
    // reset embed state on change
    setCanEmbed(true);
  }, [network, selectedId]);

  return (
    <Card className="bg-slate-900/60 border-purple-900/40">
      <CardHeader className="border-b border-purple-900/30">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-purple-200 flex items-center gap-2">
            <AppWindow className="w-5 h-5" />
            EVM & Solana dApp Portal
            <Badge className="ml-2 bg-purple-500/20 text-purple-300 border-purple-500/30">QTC Interop</Badge>
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => setShowWallet(v=>!v)} className="border-purple-500/30 text-purple-200 hover:bg-purple-900/30">
            {showWallet ? 'Hide' : 'Connect Wallet'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Wallet Panel */}
        {showWallet && (
          <div className="rounded-lg border border-purple-900/40 bg-slate-950/40 p-3">
            <WalletConnector />
          </div>
        )}

        {/* Network Tabs */}
        <Tabs value={network} onValueChange={(v) => { setNetwork(v); setSelectedId(DAPPS[v][0].id); }}>
          <TabsList className="bg-slate-950/50 border border-purple-900/30">
            <TabsTrigger value="ethereum">Ethereum</TabsTrigger>
            <TabsTrigger value="solana">Solana</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Bridge & Balances */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 p-4 rounded-lg border border-purple-900/30 bg-slate-950/40">
            <div className="text-sm font-semibold text-purple-200 mb-3">Quick Bridge</div>
            <div className="grid md:grid-cols-3 gap-3 items-end">
              <div>
                <Label className="text-xs text-purple-400/70">Route</Label>
                <Select value={preset} onValueChange={setPreset}>
                  <SelectTrigger className="bg-slate-950/50 border-purple-900/30 text-purple-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BRIDGE_PRESETS.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-purple-400/70">Amount</Label>
                <Input value={amount} onChange={(e)=>setAmount(e.target.value)} placeholder="0.00" className="bg-slate-950/50 border-purple-900/30 text-purple-100" />
              </div>
              <div className="md:col-span-3">
                <Label className="text-xs text-purple-400/70">Destination address</Label>
                <Input value={destAddress} onChange={(e)=>setDestAddress(e.target.value)} placeholder="Recipient wallet on destination chain" className="bg-slate-950/50 border-purple-900/30 text-purple-100" />
              </div>
            </div>
            <div className="mt-3">
              <Button onClick={handleBridge} disabled={!amount || !destAddress || bridgeMutation.isPending} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500">
                {bridgeMutation.isPending ? 'Submitting…' : 'Bridge Now'}
              </Button>
            </div>
          </div>
          <div className="p-4 rounded-lg border border-purple-900/30 bg-slate-950/40">
            <div className="text-sm font-semibold text-purple-200 mb-2">Bridged QTC Balances</div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-purple-300">qQTC (Ethereum)</span>
                <span className="font-mono text-purple-100">{balances ? balances.evm.toFixed(4) : '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-purple-300">sQTC (Solana)</span>
                <span className="font-mono text-purple-100">{balances ? balances.sol.toFixed(4) : '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* dApp Selector */}
        <div className="grid md:grid-cols-3 gap-3">
          {DAPPS[network].map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedId(d.id)}
              className={`p-4 rounded-lg border transition-all text-left ${
                selectedId === d.id
                  ? "border-purple-500/50 bg-purple-950/30 text-purple-100"
                  : "border-purple-900/30 bg-slate-950/40 text-purple-300 hover:border-purple-700/50"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="font-semibold">{d.name}</div>
                <Badge className="bg-slate-800 text-purple-300 border-purple-900/40">{d.category}</Badge>
              </div>
              <div className="text-xs opacity-70 truncate">{d.url}</div>
            </button>
          ))}
        </div>

        {/* Guidance */}
        <div className="p-4 bg-purple-950/30 rounded-lg border border-purple-500/30 text-sm text-purple-300/80">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-purple-400" />
            <span className="font-semibold text-purple-200">Using QTC across ecosystems</span>
          </div>
          <ul className="list-disc ml-5 space-y-1">
            <li>Bridge QTC on the left to get network-wrapped QTC (EVM: qQTC, Solana: sQTC).</li>
            <li>Select your wrapped QTC token in the dApp (import by address if needed).</li>
            <li>Some dApps block embedding; use “Open in new tab” if the preview fails.</li>
          </ul>
        </div>

        {/* Viewer */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-200">
              <Globe className="w-4 h-4" />
              <span className="font-semibold">{selected.name}</span>
              <span className="text-xs text-purple-400/70">({network === 'ethereum' ? 'EVM' : 'Solana'})</span>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs text-purple-300">
                <Checkbox checked={useQtcInDapp} onCheckedChange={(v)=>setUseQtcInDapp(!!v)} />
                Use bridged QTC in dApp
              </label>
              <a href={getDappUrl(selected, network, useQtcInDapp)} target="_blank" rel="noreferrer" className="text-xs inline-flex items-center gap-1 text-cyan-300 hover:text-cyan-200">
                Open in new tab <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="rounded-lg overflow-hidden border border-purple-900/30 bg-slate-950/40">
            {canEmbed ? (
              <iframe
                key={`${network}-${selected.id}`}
                title={`${selected.name} - ${network}`}
                src={getDappUrl(selected, network, useQtcInDapp)}
                className="w-full h-[70vh]"
                onLoad={() => setCanEmbed(true)}
                onError={() => setCanEmbed(false)}
              />
            ) : (
              <div className="p-6 text-center text-purple-300/80">
                <div className="mb-2 font-medium">This dApp cannot be embedded.</div>
                <div className="text-sm opacity-70 mb-4">Use the button above to open it in a new tab.</div>
                <a href={selected.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/20">
                  <Link2 className="w-4 h-4" /> Open {selected.name}
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="text-xs text-purple-400/60 flex items-center gap-2">
          <Zap className="w-3 h-3" />
          Live dApp integration preview. For best experience, use the external link if the site blocks embeds.
        </div>
      </CardContent>
    </Card>
  );
}