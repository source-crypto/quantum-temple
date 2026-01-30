import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, ExternalLink, Shield, Zap, AppWindow, Link2 } from "lucide-react";

const DAPPS = {
  ethereum: [
    { id: "uniswap", name: "Uniswap", url: "https://app.uniswap.org", category: "DEX" },
    { id: "aave", name: "Aave", url: "https://app.aave.com", category: "Lending" },
    { id: "opensea", name: "OpenSea", url: "https://opensea.io", category: "NFTs" },
  ],
  solana: [
    { id: "jupiter", name: "Jupiter", url: "https://jup.ag/swap", category: "DEX" },
    { id: "orca", name: "Orca", url: "https://www.orca.so", category: "DEX" },
    { id: "magiceden", name: "Magic Eden", url: "https://magiceden.io", category: "NFTs" },
  ],
};

export default function DAppPortal() {
  const [network, setNetwork] = useState("ethereum");
  const [selectedId, setSelectedId] = useState(DAPPS.ethereum[0].id);
  const selected = useMemo(() => DAPPS[network].find(d => d.id === selectedId) || DAPPS[network][0], [network, selectedId]);
  const [canEmbed, setCanEmbed] = useState(true);

  useEffect(() => {
    // reset embed state on change
    setCanEmbed(true);
  }, [network, selectedId]);

  return (
    <Card className="bg-slate-900/60 border-purple-900/40">
      <CardHeader className="border-b border-purple-900/30">
        <CardTitle className="text-purple-200 flex items-center gap-2">
          <AppWindow className="w-5 h-5" />
          EVM & Solana dApp Portal
          <Badge className="ml-2 bg-purple-500/20 text-purple-300 border-purple-500/30">QTC Interop</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Network Tabs */}
        <Tabs value={network} onValueChange={(v) => { setNetwork(v); setSelectedId(DAPPS[v][0].id); }}>
          <TabsList className="bg-slate-950/50 border border-purple-900/30">
            <TabsTrigger value="ethereum">Ethereum</TabsTrigger>
            <TabsTrigger value="solana">Solana</TabsTrigger>
          </TabsList>
        </Tabs>

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
            <a href={selected.url} target="_blank" rel="noreferrer" className="text-xs inline-flex items-center gap-1 text-cyan-300 hover:text-cyan-200">
              Open in new tab <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="rounded-lg overflow-hidden border border-purple-900/30 bg-slate-950/40">
            {canEmbed ? (
              <iframe
                key={`${network}-${selected.id}`}
                title={`${selected.name} - ${network}`}
                src={selected.url}
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