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