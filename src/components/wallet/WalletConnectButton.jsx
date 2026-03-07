import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function WalletConnectButton() {
  const [address, setAddress] = useState("");

  useEffect(() => {
    const handler = async () => {
      try {
        if (!window.ethereum) return;
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts && accounts[0]) setAddress(accounts[0]);
      } catch {}
    };
    handler();
    if (window.ethereum) {
      window.ethereum.on?.('accountsChanged', (accs) => setAddress(accs?.[0] || ""));
    }
    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener('accountsChanged', (accs) => setAddress(accs?.[0] || ""));
      }
    };
  }, []);

  const connect = async () => {
    if (!window.ethereum) {
      alert('No wallet found. Please install MetaMask or a compatible wallet.');
      return;
    }
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAddress(accounts?.[0] || "");
  };

  const short = address ? `${address.slice(0,6)}…${address.slice(-4)}` : '';

  return (
    <Button size="sm" variant={address ? 'outline' : 'default'} onClick={connect}>
      {address ? short : 'Connect Wallet'}
    </Button>
  );
}