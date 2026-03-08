import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function WhitePaper() {
  return (
    <div className="p-6 md:p-10 space-y-6">
      <Card className="bg-slate-950/60 border-purple-900/40">
        <CardHeader>
          <CardTitle className="text-purple-200">Quantum Temple White Paper — Protocol Overview (2026)</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-invert max-w-none text-purple-300/90">
          <h3>1. Mission</h3>
          <p>
            Quantum Temple Currency (QTC) aims to provide programmable, censorship‑resistant money with
            predictable issuance and transparent market operations across EVM chains.
          </p>

          <h3>2. Monetary Policy</h3>
          <ul>
            <li>Supply: Transparent total supply with circulating disclosures via on‑chain index.</li>
            <li>Price Reference: CurrencyIndex defines qtc_unit_price_usd used across app valuation modules.</li>
            <li>Intervention: Controlled toggles for intervention_active with published rationale.</li>
          </ul>

          <h3>3. Markets & Liquidity</h3>
          <ul>
            <li>Pools: Deterministic AMM pools tracked via LiquidityPool entity (reserves, APY, volume, fees).</li>
            <li>TVL: Aggregated as Σ(QTC_reserve·Pqtc + Pair_reserve·Ppair) using index pricing.</li>
            <li>Routing: External DEX integrations (Uni V2/V3, 0x) for execution with local signing.</li>
          </ul>

          <h3>4. Staking & Rewards</h3>
          <ul>
            <li>DivineFavor entity tracks stake, favor_level, and unclaimed_rewards per account.</li>
            <li>Rewards: Emissions proportional to stake and pool performance; claims settle in QTC.</li>
            <li>Security: Non‑custodial; approvals and redemptions signed in user wallet.</li>
          </ul>

          <h3>5. Governance</h3>
          <ul>
            <li>Proposal lifecycle with quorum and thresholds; on‑chain execution metadata recorded.</li>
            <li>Voting power derived from staked QTC and delegated balances.</li>
          </ul>

          <h3>6. Risk & Compliance</h3>
          <ul>
            <li>Operational transparency via AppLog; continuous monitoring of RPC health and oracles.</li>
            <li>Bridge risks mitigated with confirmations and event reconciliation.</li>
          </ul>

          <h3>Appendix</h3>
          <ul>
            <li>Data model references: CurrencyIndex, LiquidityPool, DivineFavor, ExchangeRate.</li>
            <li>Changelog: 2026‑03 — Added staking dashboard, clarified reward accounting.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}