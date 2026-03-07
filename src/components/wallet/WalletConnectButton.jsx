import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { BrowserProvider } from "ethers";

function truncate(addr) {
  if (!addr) return "";
  return addr.slice(0, 6) + "…" + addr.slice(-4);
}

export default function WalletConnectButton() {
  const [account, setAccount] = useState("");
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        if (!window.ethereum) return;
        const bp = new BrowserProvider(window.ethereum);
        const accs = await bp.send("eth_accounts", []);
        if (accs && accs[0]) setAccount(accs[0]);
      } catch (_) {
        // ignore
      }
    })();
  }, []);

  async function connect() {
    if (!window.ethereum) {
      alert("No wallet detected");
      return;
    }
    try {
      setConnecting(true);
      const bp = new BrowserProvider(window.ethereum);
      const accs = await bp.send("eth_requestAccounts", []);
      setAccount(accs?.[0] || "");
    } finally {
      setConnecting(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={connect} disabled={connecting} className="gap-2">
      <Wallet className="w-4 h-4" />
      {account ? truncate(account) : connecting ? "Connecting…" : "Connect Wallet"}
    </Button>
  );
}