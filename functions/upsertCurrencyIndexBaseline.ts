import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Admin-only to protect baseline
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Baseline inputs (from user)
    const vqc_total_valuation_usd = 560_000_000_000;
    const total_qtc_supply = 599_827_105_725_659_300_000;
    const btc_price_usd = 77_477.405;
    const eth_price_usd = 2_336.635;

    // Derived
    const qtc_unit_price_usd = vqc_total_valuation_usd / total_qtc_supply;
    const qtc_to_btc_rate = btc_price_usd / qtc_unit_price_usd; // QTC per 1 BTC
    const qtc_to_eth_rate = eth_price_usd / qtc_unit_price_usd; // QTC per 1 ETH

    const payload = {
      index_name: 'Divine Currency Index (DCI)',
      vqc_total_valuation_usd,
      total_qtc_supply,
      qtc_unit_price_usd,
      btc_price_usd,
      eth_price_usd,
      qtc_to_btc_rate,
      qtc_to_eth_rate,
      market_cap_rank: 1,
      total_transactions_24h: 0,
      volume_24h_usd: 0,
      price_change_24h: 0,
      circulating_supply: total_qtc_supply,
      last_updated: new Date().toISOString(),
    };

    // Upsert by index_name
    const existing = await base44.asServiceRole.entities.CurrencyIndex.filter({ index_name: 'Divine Currency Index (DCI)' }, '-updated_date', 1);
    let record;
    if (existing && existing.length) {
      record = existing[0];
      await base44.asServiceRole.entities.CurrencyIndex.update(record.id, payload);
    } else {
      record = await base44.asServiceRole.entities.CurrencyIndex.create(payload);
    }

    return Response.json({ success: true, id: record.id || record?.id, data: payload });
  } catch (error) {
    // Log for transparency
    try {
      const base44 = createClientFromRequest(req);
      await base44.asServiceRole.entities.AppLog?.create?.({
        level: 'error',
        source: 'upsertCurrencyIndexBaseline',
        message: error?.message || String(error),
        context: { stack: error?.stack },
      });
    } catch (_) { /* no-op */ }
    return Response.json({ error: error.message || String(error) }, { status: 500 });
  }
});