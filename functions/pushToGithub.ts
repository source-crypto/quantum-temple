import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const GITHUB_API = 'https://api.github.com';

async function githubRequest(path, options = {}) {
  const token = Deno.env.get('GITHUB_TOKEN');
  if (!token) throw new Error('GITHUB_TOKEN not set');
  const url = `${GITHUB_API}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API ${res.status} ${res.statusText}: ${text}`);
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return res.json();
  return res.text();
}

function getCommentBlock(fn) {
  const s = fn.toString();
  const start = s.indexOf('/*');
  const end = s.lastIndexOf('*/');
  if (start === -1 || end === -1) return '';
  return s.slice(start + 2, end);
}

// Embedded file contents (exact snapshot at time of deployment)
const layoutContent = getCommentBlock(function(){/*
import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { 
              Sparkles, 
              Shield, 
              Scroll, 
              Coins, 
              MessageCircle, 
              Database,
              Hexagon,
              Settings,
              FileText,
              TrendingUp,
              Waves,
              Network,
              Activity,
              PlugZap,
              CreditCard,
              Wallet,
              PieChart,
              Brain,
              Link2
              } from "lucide-react";
import InAppAnnouncementBar from "./components/app/InAppAnnouncementBar";
import QTCPriceWidget from "./components/currency/QTCPriceWidget";
import WalletConnectButton from "./components/wallet/WalletConnectButton";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Temple Home",
    url: createPageUrl("Home"),
    icon: Sparkles,
  },
  {
    title: "White Paper",
    url: createPageUrl("WhitePaper"),
    icon: FileText,
  },
  {
    title: "Manifesto",
    url: createPageUrl("Manifesto"),
    icon: Scroll,
  },
  {
    title: "Temple Mode",
    url: createPageUrl("TempleMode"),
    icon: Sparkles,
  },
  {
    title: "Attestation",
    url: createPageUrl("Attestation"),
    icon: Shield,
  },
  {
    title: "Ceremonial",
    url: createPageUrl("Ceremonial"),
    icon: Scroll,
  },
  {
    title: "Divine Currency",
    url: createPageUrl("Currency"),
    icon: Coins,
  },
  {
          title: "Checkout",
          url: createPageUrl("Checkout"),
          icon: CreditCard,
        },
        {
          title: "Crypto Checkout",
          url: createPageUrl("CryptoCheckout"),
          icon: Wallet,
        },
        {
        title: "Governance",
    url: createPageUrl("Governance"),
    icon: Database,
  },
  {
    title: "DEX",
    url: createPageUrl("DEX"),
    icon: Hexagon,
  },
  {
    title: "Markets",
    url: createPageUrl("Markets"),
    icon: TrendingUp,
  },
  {
    title: "Quantum Construct",
    url: createPageUrl("QuantumConstruct"),
    icon: Waves,
  },
  {
    title: "Intent Network",
    url: createPageUrl("IntentNetwork"),
    icon: Network,
  },
  {
    title: "Operational Readiness",
    url: createPageUrl("OperationalReadinessDashboard"),
    icon: Activity,
  },
  {
    title: "Security",
    url: createPageUrl("Security"),
    icon: Shield,
  },
  {
    title: "Interactions",
    url: createPageUrl("Interactions"),
    icon: MessageCircle,
  },
  {
    title: "Registry",
    url: createPageUrl("Registry"),
    icon: Database,
  },
  {
    title: "Portfolio",
    url: createPageUrl("Portfolio"),
    icon: PieChart,
  },
  {
    title: "Insights",
    url: createPageUrl("Insights"),
    icon: Brain,
  },
  {
    title: "Cross-Chain",
    url: createPageUrl("CrossChain"),
    icon: Link2,
  },
  {
    title: "Settings",
    url: createPageUrl("Settings"),
    icon: Settings,
  },
  {
    title: "Integrations",
    url: createPageUrl("Integrations"),
    icon: PlugZap,
  },
  {
    title: "Admin Dashboard",
    url: createPageUrl("AdminDashboard"),
    icon: Activity,
  }
  ];

export default function Layout({ children }) {
  const location = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Global real-time broadcast for CurrencyIndex
    const unsubscribe = base44.entities.CurrencyIndex.subscribe(() => {
      queryClient.invalidateQueries(); // wake up all listeners
    });
    return () => unsubscribe?.();
  }, [queryClient]);

  return (
    <SidebarProvider>
      <style>{`
        :root {
          --quantum-purple: #9333ea;
          --quantum-blue: #3b82f6;
          --quantum-gold: #f59e0b;
          --divine-glow: #a855f7;
        }
        
        body {
          background: linear-gradient(135deg, #0f0a1f 0%, #1a0b2e 50%, #16213e 100%);
        }
        
        .quantum-glow {
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.3);
        }
        
        .sacred-pattern {
          background-image: 
            repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(168, 85, 247, 0.03) 10px, rgba(168, 85, 247, 0.03) 20px),
            repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(147, 51, 234, 0.03) 10px, rgba(147, 51, 234, 0.03) 20px);
        }
      `}</style>
      
      <div className="min-h-screen flex w-full">
        <Sidebar className="border-r border-purple-900/30 bg-slate-950/90 backdrop-blur-sm">
          <SidebarHeader className="border-b border-purple-900/30 p-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500/30 blur-xl rounded-full" />
                <div className="relative w-12 h-12 bg-gradient-to-br from-purple-500 via-violet-600 to-indigo-700 rounded-lg flex items-center justify-center quantum-glow">
                  <Hexagon className="w-7 h-7 text-white" strokeWidth={2} />
                </div>
              </div>
              <div>
                <h2 className="font-bold text-lg bg-gradient-to-r from-purple-300 via-violet-300 to-indigo-300 bg-clip-text text-transparent">
                  Quantum Temple
                </h2>
                <p className="text-xs text-purple-400/70">Veiled Consciousness</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3 sacred-pattern">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-medium text-purple-400/60 uppercase tracking-wider px-3 py-2">
                Sacred Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-purple-900/30 hover:text-purple-300 transition-all duration-300 rounded-lg mb-1 ${
                          location.pathname === item.url 
                            ? 'bg-purple-900/40 text-purple-200 quantum-glow border border-purple-500/30' 
                            : 'text-purple-400/70'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-3 py-2.5">
                          <item.icon className="w-4 h-4" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-4">
              <SidebarGroupLabel className="text-xs font-medium text-purple-400/60 uppercase tracking-wider px-3 py-2">
                Market
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-3">
                  <QTCPriceWidget />
                </div>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-4">
              <SidebarGroupLabel className="text-xs font-medium text-purple-400/60 uppercase tracking-wider px-3 py-2">
                Canonical Identity
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-3 py-3 space-y-2 bg-purple-950/30 rounded-lg border border-purple-900/30">
                  <div className="text-xs text-purple-300/80">
                    <div className="font-semibold mb-1">Timestamp:</div>
                    <div className="text-purple-400/60 font-mono text-[10px]">
                      Aug 27, 2002 • 10:37 PM
                    </div>
                  </div>
                  <div className="text-xs text-purple-300/80">
                    <div className="font-semibold mb-1">Location:</div>
                    <div className="text-purple-400/60">Buffalo, NY</div>
                  </div>
                  <div className="text-xs text-purple-300/80 mt-3 pt-3 border-t border-purple-900/30">
                    <div className="font-semibold mb-1">Status:</div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-green-400/80">Veiled & Active</span>
                    </div>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-purple-900/30 p-4 space-y-3">
            <div className="px-1">
              <WalletConnectButton />
            </div>
            <div className="text-center text-xs text-purple-400/50 italic">
              "By God's Will Only"
              <div className="mt-1 text-[10px] text-purple-500/40">
                Singularity • Veiled • Eternal
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col min-h-screen">
          <header className="bg-slate-950/50 backdrop-blur-sm border-b border-purple-900/20 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-purple-900/30 p-2 rounded-lg transition-colors duration-200 text-purple-300" />
              <h1 className="text-xl font-semibold bg-gradient-to-r from-purple-300 to-violet-300 bg-clip-text text-transparent">
                Quantum Temple
              </h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            <InAppAnnouncementBar />
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
*/});

const walletBtnContent = getCommentBlock(function(){/*
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet as WalletIcon, PlugZap, Copy } from "lucide-react";
import { BrowserProvider } from "ethers";

function truncate(addr) {
  if (!addr) return "";
  return addr.slice(0, 6) + "…" + addr.slice(-4);
}

export default function WalletConnectButton() {
  const [address, setAddress] = React.useState(null);
  const [chainId, setChainId] = React.useState(null);
  const [connecting, setConnecting] = React.useState(false);

  const hasEthereum = typeof window !== "undefined" && window.ethereum;

  const getNetworkName = (id) => {
    const n = Number(id || 0);
    return (
      {
        1: "Ethereum",
        5: "Goerli",
        11155111: "Sepolia",
        137: "Polygon",
        80001: "Mumbai",
        10: "OP",
        8453: "Base",
      }[n] || `Chain ${n}`
    );
  };

  const refresh = React.useCallback(async () => {
    if (!hasEthereum) return;
    const provider = new BrowserProvider(window.ethereum);
    const accounts = await provider.listAccounts();
    if (accounts?.[0]) {
      setAddress(accounts[0].address);
      const net = await provider.getNetwork();
      setChainId(net.chainId);
    } else {
      setAddress(null);
      setChainId(null);
    }
  }, [hasEthereum]);

  const connect = async () => {
    if (!hasEthereum) {
      window.open("https://metamask.io/download/", "_blank");
      return;
    }
    setConnecting(true);
    try {
      const provider = new BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      await refresh();
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = () => {
    // For injected providers there is no programmatic disconnect; clear local state
    setAddress(null);
    setChainId(null);
  };

  React.useEffect(() => {
    if (!hasEthereum) return;
    refresh();
    const handleAccountsChanged = () => refresh();
    const handleChainChanged = () => refresh();
    window.ethereum.on?.("accountsChanged", handleAccountsChanged);
    window.ethereum.on?.("chainChanged", handleChainChanged);
    return () => {
      window.ethereum?.removeListener?.("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [hasEthereum, refresh]);

  return (
    <div className="w-full">
      {address ? (
        <div className="flex items-center justify-between gap-2 p-2 rounded-lg border border-purple-900/30 bg-purple-950/30">
          <div className="flex items-center gap-2 min-w-0">
            <WalletIcon className="w-4 h-4 text-purple-300" />
            <span className="text-sm text-purple-100 truncate">{truncate(address)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] text-purple-300 border-purple-800/60">
              {getNetworkName(chainId)}
            </Badge>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigator.clipboard.writeText(address)}
              className="h-8 w-8"
              title="Copy address"
            >
              <Copy className="w-3.5 h-3.5" />
            </Button>
            <Button variant="secondary" size="sm" onClick={disconnect}>
              Disconnect
            </Button>
          </div>
        </div>
      ) : (
        <Button onClick={connect} disabled={connecting} className="w-full bg-purple-700 hover:bg-purple-600">
          <PlugZap className="w-4 h-4" />
          {hasEthereum ? (connecting ? "Connecting…" : "Connect Wallet") : "Install MetaMask"}
        </Button>
      )}
    </div>
  );
}
*/});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // Best-effort auth (not strictly required for this push)
    try { await base44.auth.me(); } catch (_) {}

    const repoFull = Deno.env.get('GITHUB_REPO');
    if (!repoFull) {
      return Response.json({ error: 'GITHUB_REPO not set' }, { status: 500 });
    }
    const [owner, repo] = repoFull.split('/');
    if (!owner || !repo) {
      return Response.json({ error: 'GITHUB_REPO must be in owner/repo format' }, { status: 500 });
    }

    const branch = 'develop';
    const commitMessage = 'feat: wallet + market data + charts';

    // Ensure ref exists (develop); if not, create from main
    let headRef;
    try {
      headRef = await githubRequest(`/repos/${owner}/${repo}/git/ref/heads/${branch}`);
    } catch (e) {
      // create from main
      const mainRef = await githubRequest(`/repos/${owner}/${repo}/git/ref/heads/main`);
      await githubRequest(`/repos/${owner}/${repo}/git/refs`, {
        method: 'POST',
        body: JSON.stringify({
          ref: `refs/heads/${branch}`,
          sha: mainRef.object.sha,
        }),
      });
      headRef = await githubRequest(`/repos/${owner}/${repo}/git/ref/heads/${branch}`);
    }

    const latestCommitSha = headRef.object.sha;
    const latestCommit = await githubRequest(`/repos/${owner}/${repo}/git/commits/${latestCommitSha}`);

    // Create blobs
    const files = [
      { path: 'layout', content: layoutContent },
      { path: 'components/wallet/WalletConnectButton.jsx', content: walletBtnContent },
    ];

    const blobShas = [];
    for (const f of files) {
      const blob = await githubRequest(`/repos/${owner}/${repo}/git/blobs`, {
        method: 'POST',
        body: JSON.stringify({ content: f.content, encoding: 'utf-8' }),
      });
      blobShas.push({ path: f.path, sha: blob.sha });
    }

    // Create tree from base
    const tree = await githubRequest(`/repos/${owner}/${repo}/git/trees`, {
      method: 'POST',
      body: JSON.stringify({
        base_tree: latestCommit.tree.sha,
        tree: blobShas.map(({ path, sha }) => ({
          path,
          mode: '100644',
          type: 'blob',
          sha,
        })),
      }),
    });

    // Create commit
    const newCommit = await githubRequest(`/repos/${owner}/${repo}/git/commits`, {
      method: 'POST',
      body: JSON.stringify({
        message: commitMessage,
        tree: tree.sha,
        parents: [latestCommitSha],
      }),
    });

    // Update ref to point to new commit
    await githubRequest(`/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
      method: 'PATCH',
      body: JSON.stringify({ sha: newCommit.sha, force: false }),
    });

    return Response.json({
      success: true,
      branch,
      commit_sha: newCommit.sha,
      files: files.map(f => f.path),
      url: `https://github.com/${owner}/${repo}/commit/${newCommit.sha}`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});