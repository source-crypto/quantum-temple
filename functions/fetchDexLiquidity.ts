import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const PAIRS = [
  { query: 'QTC/USDT', pair: 'QTC/USDT' },
  { query: 'SOL/USDC', pair: 'SOL/USDC' },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const now = new Date().toISOString();

    const results = [];
    for (const p of PAIRS) {
      try {
        const res = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(p.query)}`);
        const data = await res.json();
        const first = data?.pairs?.[0];
        if (first) {
          results.push({
            pair: p.pair,
            dex: first.dexId || first.dex || 'dexscreener',
            chain: first.chainId || first.chain || 'unknown',
            price_usd: Number(first.priceUsd || first.priceUSD || 0),
            liquidity_usd: Number(first.liquidity?.usd || 0),
            volume24h_usd: Number(first.volume?.h24 || 0),
            change24h_percent: Number(first.priceChange?.h24 || 0),
            timestamp: now,
          });
        }
      } catch (_) {
        // ignore individual pair errors
      }
    }

    if (results.length > 0) {
      await base44.asServiceRole.entities.DexLiquiditySnapshot.bulkCreate(results);
    }

    return Response.json({ success: true, count: results.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});