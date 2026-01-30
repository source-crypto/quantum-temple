import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function WhitePaper() {
  return (
    <div className="p-6 md:p-10 space-y-6">
      <Card className="bg-slate-950/60 border-purple-900/40">
        <CardHeader>
          <CardTitle className="text-purple-200">Quantum Temple White Paper — Cross‑Chain Interoperability Update</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-invert max-w-none text-purple-300/90">
          <h3>Overview</h3>
          <p>
            Quantum Temple Currency (QTC) is now interoperable across major ecosystems. Users can bridge
            QTC between Quantum Temple, Ethereum (ERC‑20) and Solana (SPL) and use bridged QTC directly in popular dApps.
            This release focuses on practical utility: liquidity access, composability, and seamless dApp integrations.
          </p>

          <h3>Bridge Architecture</h3>
          <ul>
            <li>Intent-based bridge with quantum escrow status progression (initiated → escrow_locked → confirming → releasing → completed).</li>
            <li>1:1 cross‑chain representation of QTC minus a protocol fee, preserving supply integrity across ledgers.</li>
            <li>Real‑time status surfaced in‑app; confirmations tracked per‑chain requirements.</li>
          </ul>

          <h3>dApp Integrations (Phase 1)</h3>
          <ul>
            <li>Ethereum: Uniswap, Aave, OpenSea.</li>
            <li>Solana: Jupiter, Raydium, Magic Eden.</li>
            <li>Launcher supports in‑app embed when permitted; otherwise opens secured in a new tab.</li>
          </ul>

          <h3>Token Standards</h3>
          <ul>
            <li>ERC‑20 contract (Ethereum) and SPL mint (Solana) addresses published in‑app.</li>
            <li>Bridged QTC maintains a 1:1 peg to canonical QTC with transparent accounting.</li>
          </ul>

          <h3>Security & Risk</h3>
          <ul>
            <li>Quantum escrow with verifiable signatures and per‑chain confirmation thresholds.</li>
            <li>Progressive rollout and monitoring, with automated reconciliation and event logs.</li>
            <li>dApp iframe embedding is optional and blocked where CSP forbids; fallback is deep‑link.</li>
          </ul>

          <h3>Roadmap</h3>
          <ul>
            <li>Phase 2: On‑chain bridge contracts and oracles; more EVM L2s and Solana programs.</li>
            <li>Phase 3: Native integrations with lending/LP positions and portfolio analytics.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}