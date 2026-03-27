import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

async function fetchJson(url) {
  const res = await fetch(url, { headers: { 'accept': 'application/json' } });
  if (!res.ok) throw new Error(`Fetch failed ${res.status} ${url}`);
  return res.json();
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'accept': 'text/plain' } });
  if (!res.ok) throw new Error(`Fetch failed ${res.status} ${url}`);
  return res.text();
}

async function getBTCMetrics() {
  // Prices (fallback chain)
  let priceUsd = null;
  try {
    const coindesk = await fetchJson('https://api.coindesk.com/v1/bpi/currentprice/USD.json');
    priceUsd = Number(coindesk?.bpi?.USD?.rate_float || coindesk?.bpi?.USD?.rate);
  } catch {}
  if (!priceUsd) {
    try {
      const cb = await fetchJson('https://api.coinbase.com/v2/prices/BTC-USD/spot');
      priceUsd = Number(cb?.data?.amount);
    } catch {}
  }

  // Chain stats
  const height = Number(await (await fetch('https://blockstream.info/api/blocks/tip/height')).text());
  const mempool = await fetchJson('https://blockstream.info/api/mempool');
  let hashrateGhs = null;
  try {
    const hr = await fetchText('https://blockchain.info/q/hashrate'); // GH/s
    hashrateGhs = Number(hr);
  } catch {}

  return {
    price_usd: priceUsd || null,
    block_height: isFinite(height) ? height : null,
    mempool_tx: mempool?.count ?? null,
    mempool_vsize: mempool?.vsize ?? null,
    mempool_total_fee_btc: mempool?.total_fee ? mempool.total_fee / 1e8 : null,
    hashrate_ghs: hashrateGhs,
  };
}

async function getETHMetrics() {
  // Price
  let priceUsd = null;
  try {
    const cb = await fetchJson('https://api.coinbase.com/v2/prices/ETH-USD/spot');
    priceUsd = Number(cb?.data?.amount);
  } catch {}

  // Chain stats (etherchain)
  let blockHeight = null;
  let gasPriceGwei = null;
  let hashRateGhs = null;
  try {
    const ethStats = await fetchJson('https://www.etherchain.org/api/basic_stats');
    const s = ethStats?.currentStats || ethStats?.data?.[0] || ethStats;
    blockHeight = Number(s?.blockHeight ?? s?.blocks);
    gasPriceGwei = Number(s?.gasPrice?.gwei ?? s?.gasPrice);
    hashRateGhs = Number(s?.hashRate?.ghs ?? s?.hashrate);
  } catch {}

  return {
    price_usd: priceUsd || null,
    block_height: isFinite(blockHeight) ? blockHeight : null,
    gas_price_gwei: isFinite(gasPriceGwei) ? gasPriceGwei : null,
    hashrate_ghs: isFinite(hashRateGhs) ? hashRateGhs : null,
  };
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  try {
    // Try to get user (may be null when run by automation)
    let user = null;
    try { user = await base44.auth.me(); } catch {}

    const timestamp = new Date().toISOString();

    const [btc, eth] = await Promise.all([
      getBTCMetrics().catch(() => ({})),
      getETHMetrics().catch(() => ({})),
    ]);

    const snapshots = [];
    if (Object.keys(btc).length) snapshots.push({ chain: 'bitcoin', metrics: btc, source: 'blockstream+blockchain.info+coindesk/coinbase', timestamp });
    if (Object.keys(eth).length) snapshots.push({ chain: 'ethereum', metrics: eth, source: 'etherchain+coinbase', timestamp });

    // QTC pseudo on-chain: derive from CurrencyIndex entity
    try {
      const idxList = await base44.asServiceRole.entities.CurrencyIndex.list('-updated_date', 1);
      const idx = Array.isArray(idxList) ? idxList[0] : null;
      if (idx?.id) {
        snapshots.push({
          chain: 'qtc',
          metrics: {
            qtc_unit_price_usd: idx.data?.qtc_unit_price_usd ?? null,
            total_qtc_supply: idx.data?.total_qtc_supply ?? null,
            circulating_supply: idx.data?.circulating_supply ?? null,
          },
          source: 'internal:CurrencyIndex',
          timestamp,
        });
      }
    } catch {}

    // Write snapshots
    const created = [];
    for (const snap of snapshots) {
      const rec = await base44.asServiceRole.entities.BlockchainMetricSnapshot.create(snap);
      created.push(rec);
    }

    // Best-effort: update CurrencyIndex btc/eth price fields
    try {
      const list = await base44.asServiceRole.entities.CurrencyIndex.list('-updated_date', 1);
      const idx = Array.isArray(list) ? list[0] : null;
      if (idx?.id) {
        const patch = {};
        if (btc?.price_usd) patch.btc_price_usd = btc.price_usd;
        if (eth?.price_usd) patch.eth_price_usd = eth.price_usd;
        if (Object.keys(patch).length) {
          patch.last_updated = timestamp;
          await base44.asServiceRole.entities.CurrencyIndex.update(idx.id, patch);
        }
      }
    } catch {}

    // Log to AppLog for auditability
    try {
      await base44.asServiceRole.entities.AppLog.create({
        type: 'integration',
        severity: 'info',
        message: 'Blockchain metrics ingested',
        source: 'functions/ingestBlockchainMetrics',
        timestamp,
        details: { chains: snapshots.map((s) => s.chain) }
      });
    } catch {}

    return Response.json({ success: true, count: created.length, chains: snapshots.map(s => s.chain) });
  } catch (error) {
    try {
      await base44.asServiceRole.entities.AppLog.create({
        type: 'integration',
        severity: 'error',
        message: 'Blockchain metrics ingestion failed',
        source: 'functions/ingestBlockchainMetrics',
        timestamp: new Date().toISOString(),
        details: { error: error.message }
      });
    } catch {}
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});