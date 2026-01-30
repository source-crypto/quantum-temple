import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Copy, ExternalLink, AppWindow, Boxes, Coins, Image, Globe, Shield } from "lucide-react";
import { toast } from "sonner";

const DAPP_LIST = [
  // Ethereum DeFi
  {
    id: "uniswap",
    name: "Uniswap",
    chain: "ethereum",
    category: "defi",
    description: "Swap, provide liquidity, and manage LP positions.",
    url: "https://app.uniswap.org/",
  },
  {
    id: "aave",
    name: "Aave",
    chain: "ethereum",
    category: "defi",
    description: "Lend and borrow assets with interest.",
    url: "https://app.aave.com/",
  },
  // Ethereum NFT
  {
    id: "opensea",
    name: "OpenSea",
    chain: "ethereum",
    category: "nft",
    description: "Discover, collect, and sell NFTs.",
    url: "https://opensea.io/",
  },

  // Solana DeFi
  {
    id: "jupiter",
    name: "Jupiter",
    chain: "solana",
    category: "defi",
    description: "Best-price swap aggregator on Solana.",
    url: "https://jup.ag/",
  },
  {
    id: "raydium",
    name: "Raydium",
    chain: "solana",
    category: "defi",
    description: "AMM, farming, and liquidity on Solana.",
    url: "https://raydium.io/swap/",
  },
  // Solana NFT
  {
    id: "magiceden",
    name: "Magic Eden",
    chain: "solana",
    category: "nft",
    description: "Leading NFT marketplace on Solana.",
    url: "https://magiceden.io/",
  },
];

const QTC_TOKEN_ADDRESSES = {
  ethereum: "0x00000000000000000000000000000000QTCETH", // placeholder
  solana: "QTC1111111111111111111111111111111111ETH", // placeholder
};

export default function DappLauncher() {
  const [chain, setChain] = useState("ethereum");
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [embedBlocked, setEmbedBlocked] = useState(false);

  const list = useMemo(() => {
    return DAPP_LIST.filter(d => d.chain === chain && (category === "all" || d.category === category) &&
      (d.name.toLowerCase().includes(search.toLowerCase()) || d.description.toLowerCase().includes(search.toLowerCase())));
  }, [chain, category, search]);

  useEffect(() => {
    setSelected(null);
    setEmbedBlocked(false);
  }, [chain]);

  const copy = async (text) => {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-900/60 border-purple-900/40">
        <CardHeader className="border-b border-purple-900/30">
          <CardTitle className="text-purple-200 flex items-center gap-2">
            <Boxes className="w-5 h-5" />
            dApp Launcher (Ethereum & Solana)
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 ml-2">Bridged QTC Ready</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {/* Network & Filters */}
          <div className="grid md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <div className="text-xs text-purple-400/70 mb-1">Chain</div>
              <Select value={chain} onValueChange={setChain}>
                <SelectTrigger className="bg-slate-950/50 border-purple-900/30 text-purple-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ethereum">Ethereum</SelectItem>
                  <SelectItem value="solana">Solana</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-purple-400/70 mb-1">Category</div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-slate-950/50 border-purple-900/30 text-purple-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="defi">DeFi</SelectItem>
                  <SelectItem value="nft">NFT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-purple-400/70 mb-1">Search</div>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search dApps (e.g., swap, NFT)"
                className="bg-slate-950/50 border-purple-900/30 text-purple-100"
              />
            </div>
          </div>

          {/* QTC Token Address */}
          <div className="p-4 bg-purple-950/30 rounded-lg border border-purple-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-semibold text-purple-200">QTC on {chain === 'ethereum' ? 'Ethereum (ERC-20)' : 'Solana (SPL)'}:</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="font-mono text-xs text-purple-300 truncate">{QTC_TOKEN_ADDRESSES[chain]}</div>
              <Button size="sm" variant="outline" onClick={() => copy(QTC_TOKEN_ADDRESSES[chain])} className="border-purple-500/30 text-purple-300 hover:bg-purple-900/20">
                <Copy className="w-3 h-3 mr-1" /> Copy
              </Button>
            </div>
          </div>

          {/* dApp List */}
          <div className="grid md:grid-cols-3 gap-4">
            {list.map((d) => (
              <Card key={d.id} className="bg-slate-950/50 border-purple-900/30">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-purple-200">{d.name}</div>
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs capitalize">{d.category}</Badge>
                  </div>
                  <div className="text-purple-400/70 text-sm">{d.description}</div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" onClick={() => window.open(d.url, '_blank')} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500">
                      <ExternalLink className="w-4 h-4 mr-1" /> Open dApp
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { setSelected(d); setEmbedBlocked(false); }} className="border-purple-500/30 text-purple-300 hover:bg-purple-900/20">
                      <AppWindow className="w-4 h-4 mr-1" /> Embed
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Embed Panel */}
          {selected && (
            <div className="mt-4">
              <div className="mb-2 text-xs text-purple-400/70">Embedded view (some dApps may block embedding; use Open dApp if blank).</div>
              <div className="aspect-[16/9] w-full rounded-lg overflow-hidden border border-purple-900/30 bg-black/30">
                <iframe
                  key={selected.id + chain}
                  src={selected.url}
                  className="w-full h-full"
                  onLoad={() => setEmbedBlocked(false)}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              </div>
              {embedBlocked && (
                <div className="mt-2 text-xs text-purple-400/70">
                  Embedding appears blocked. Use the Open dApp button instead.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}