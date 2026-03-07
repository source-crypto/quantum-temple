import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function WalletConnectButton() {
  const [account, setAccount] = useState("");
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    async function detect() {
      try {
        if (!window.ethereum) return;
        const accs = await window.ethereum.request({ method: "eth_accounts" });
        if (accs && accs[0]) setAccount(accs[0]);
        window.ethereum.removeListener?.("accountsChanged", onAccountsChanged);
        window.ethereum.on?.("accountsChanged", onAccountsChanged);
      } catch (_) {}
    }
    function onAccountsChanged(accs) {
      setAccount(accs && accs[0] ? accs[0] : "");
    }
    detect();
    return () => {
      try { window.ethereum?.removeListener?.("accountsChanged", onAccountsChanged); } catch (_) {}
    };
  }, []);

  const connect = async () => {
    try {
      setConnecting(true);
      if (!window.ethereum) {
        alert("No wallet detected. Please install a Web3 wallet like MetaMask.");
        return;
      }
      const accs = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accs && accs[0]) setAccount(accs[0]);
    } finally {
      setConnecting(false);
    }
  };

  const short = (a) => (a ? a.slice(0, 6) + "…" + a.slice(-4) : "");

  return (
    <Button size="sm" variant={account ? "outline" : "default"} onClick={connect} disabled={connecting}>
      {connecting ? "Connecting…" : account ? short(account) : "Connect Wallet"}
    </Button>
  );
}