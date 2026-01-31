import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Fetch ETH & SOL from CoinGecko
    const cg = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,solana&vs_currencies=usd', { headers: { 'accept': 'application/json' }});
    const cgData = await cg.json();

    const now = new Date().toISOString();
    const records = [];
    if (cgData?.ethereum?.usd) records.push({ symbol: 'ETH', price_usd: Number(cgData.ethereum.usd), source: 'CoinGecko', timestamp: now });
    if (cgData?.solana?.usd) records.push({ symbol: 'SOL', price_usd: Number(cgData.solana.usd), source: 'CoinGecko', timestamp: now });

    // QTC from CurrencyIndex (fallback)
    try {
      const idx = await base44.asServiceRole.entities.CurrencyIndex.list('-updated_date', 1);
      const qtc = idx?.[0]?.qtc_unit_price_usd;
      if (qtc) {
        records.push({ symbol: 'QTC', price_usd: Number(qtc), source: 'CurrencyIndex', timestamp: now });
      }
    } catch (_) {}

    if (records.length > 0) {
      await base44.asServiceRole.entities.MarketPrice.bulkCreate(records);
    }

    return Response.json({ success: true, count: records.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});