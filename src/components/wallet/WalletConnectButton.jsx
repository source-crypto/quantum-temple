import React from "react";
import { Button } from "@/components/ui/button";

function truncate(addr) {
  if (!addr) return "";
  return addr.slice(0, 6) + "…" + addr.slice(-4);
}

export default function WalletConnectButton() {
  const [account, setAccount] = React.useState(null);
  const [connecting, setConnecting] = React.useState(false);

  React.useEffect(() => {
    if (!window.ethereum) return;
    const handleAccounts = (accs) => setAccount(accs && accs.length ? accs[0] : null);
    window.ethereum.request({ method: "eth_accounts" }).then(handleAccounts).catch(() => {});
    window.ethereum.on?.("accountsChanged", handleAccounts);
    return () => {
      window.ethereum?.removeListener?.("accountsChanged", handleAccounts);
    };
  }, []);

  const connect = async () => {
    try {
      if (!window.ethereum) return alert("No wallet detected. Please install a web3 wallet.");
      setConnecting(true);
      const accs = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accs && accs.length ? accs[0] : null);
    } catch (e) {
      // ignore
    } finally {
      setConnecting(false);
    }
  };

  if (!window.ethereum) {
    return (
      <Button variant="outline" size="sm" onClick={() => alert("No wallet detected")}>No Wallet</Button>
    );
  }

  return account ? (
    <Button variant="secondary" size="sm" title={account}>
      {truncate(account)}
    </Button>
  ) : (
    <Button size="sm" onClick={connect} disabled={connecting}>
      {connecting ? "Connecting…" : "Connect Wallet"}
    </Button>
  );
}