import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const ECB_BASE = 'https://sdw-wsrest.ecb.europa.eu/service/data';

async function fetchEcbSeries(flowRef, key, lastN = 240) {
  const url = `${ECB_BASE}/${encodeURIComponent(flowRef)}/${encodeURIComponent(key)}?detail=dataonly&format=jsondata&lastNObservations=${lastN}`;
  const res = await fetch(url, { headers: { 'Accept': 'application/vnd.sdmx.data+json;version=1.0.0' } });
  if (!res.ok) throw new Error(`ECB ${flowRef}/${key} ${res.status} ${res.statusText}`);
  const json = await res.json();
  const dataSets = json?.dataSets || json?.dataSet || [];
  const ds = dataSets[0];
  const seriesObj = ds?.series || {};
  const dimsObs = json?.structure?.dimensions?.observation || [];
  const timeDimIdx = dimsObs.findIndex((d) => (d.id || d.name)?.toUpperCase().includes('TIME'));
  const timeValues = timeDimIdx >= 0 ? (dimsObs[timeDimIdx]?.values || []) : [];

  const series = [];
  for (const seriesKey in seriesObj) {
    const s = seriesObj[seriesKey];
    const obs = s?.observations || {};
    const points = [];
    for (const idxStr in obs) {
      const idx = Number(idxStr);
      const t = timeValues[idx]?.id || timeValues[idx]?.name || '';
      const v = obs[idxStr]?.[0];
      if (t && v !== null && v !== undefined) {
        points.push({ t, v: Number(v) });
      }
    }
    points.sort((a, b) => (a.t > b.t ? 1 : -1));
    series.push({ flowRef, key, points });
  }
  return { flowRef, key, series };
}

// EUR->USD using ECB daily reference rate (USD per EUR)
async function fetchEcbFxEurUsd(lastN = 1500) {
  const flowRef = 'EXR';
  const key = 'D.USD.EUR.SP00.A';
  const url = `${ECB_BASE}/${encodeURIComponent(flowRef)}/${encodeURIComponent(key)}?detail=dataonly&format=jsondata&lastNObservations=${lastN}`;
  const res = await fetch(url, { headers: { 'Accept': 'application/vnd.sdmx.data+json;version=1.0.0' } });
  if (!res.ok) throw new Error(`ECB FX ${flowRef}/${key} ${res.status} ${res.statusText}`);
  const json = await res.json();
  const ds = (json?.dataSets || json?.dataSet || [])[0];
  const seriesObj = ds?.series || {};
  const dimsObs = json?.structure?.dimensions?.observation || [];
  const timeDimIdx = dimsObs.findIndex((d) => (d.id || d.name)?.toUpperCase().includes('TIME'));
  const timeValues = timeDimIdx >= 0 ? (dimsObs[timeDimIdx]?.values || []) : [];
  const out = [];
  for (const sk in seriesObj) {
    const s = seriesObj[sk];
    const obs = s?.observations || {};
    for (const idxStr in obs) {
      const idx = Number(idxStr);
      const t = timeValues[idx]?.id || timeValues[idx]?.name || '';
      const v = obs[idxStr]?.[0];
      if (t && v !== null && v !== undefined) out.push({ t, v: Number(v) });
    }
  }
  out.sort((a, b) => (a.t > b.t ? 1 : -1));
  return out;
}

function parseTimeToDate(t) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return new Date(t + 'T00:00:00Z');
  if (/^\d{4}-\d{2}$/.test(t)) {
    const [y, m] = t.split('-').map(Number);
    const lastDay = new Date(Date.UTC(y, m, 0));
    return lastDay;
  }
  const m = t.match(/^(\d{4})-W(\d{2})$/);
  if (m) {
    const y = Number(m[1]);
    const w = Number(m[2]);
    const jan4 = new Date(Date.UTC(y, 0, 4));
    const jan4Day = jan4.getUTCDay() || 7;
    const weekStart = new Date(jan4);
    weekStart.setUTCDate(jan4.getUTCDate() - (jan4Day - 1) + (w - 1) * 7);
    const friday = new Date(weekStart);
    friday.setUTCDate(weekStart.getUTCDate() + 4);
    return friday;
  }
  return null;
}

function convertPointsEURtoUSD(points, fxDaily) {
  if (!Array.isArray(points) || points.length === 0 || !Array.isArray(fxDaily) || fxDaily.length === 0) return points;
  const fx = fxDaily
    .map((p) => ({ date: parseTimeToDate(p.t) || new Date(p.t + 'T00:00:00Z'), v: p.v }))
    .filter((p) => p.date)
    .sort((a, b) => a.date - b.date);
  return points.map((p) => {
    const d = parseTimeToDate(p.t);
    if (!d) return { ...p };
    let lo = 0, hi = fx.length - 1, best = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (fx[mid].date <= d) { best = mid; lo = mid + 1; } else { hi = mid - 1; }
    }
    if (best >= 0) return { t: p.t, v: Number((p.v * fx[best].v).toFixed(6)) };
    return { ...p };
  });
}

const NCB_MAP = {
  ECB: 'European Central Bank',
  AT: 'Oesterreichische Nationalbank',
  BE: 'National Bank of Belgium',
  CY: 'Central Bank of Cyprus',
  DE: 'Deutsche Bundesbank',
  EE: 'Eesti Pank',
  ES: 'Banco de España',
  FI: 'Suomen Pankki – Finlands Bank',
  FR: 'Banque de France',
  GR: 'Bank of Greece',
  IE: 'Central Bank of Ireland',
  IT: 'Banca d’Italia',
  LT: 'Lietuvos bankas',
  LU: 'Banque centrale du Luxembourg',
  LV: 'Latvijas Banka',
  MT: 'Central Bank of Malta',
  NL: 'De Nederlandsche Bank',
  PT: 'Banco de Portugal',
  SI: 'Banka Slovenije',
  SK: 'Národná banka Slovenska'
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    try { await base44.auth.me(); } catch (_) {}

    let payload = {};
    try { payload = await req.json(); } catch (_) {}

    const lastN = Number(payload.lastN) || 300; // ~6 years of weekly
    const balanceItem = (payload.balance_item || 'T000000').trim();
    const currency = (payload.currency || 'USD').toUpperCase();
    const include = Array.isArray(payload.ncb_codes) && payload.ncb_codes.length > 0
      ? payload.ncb_codes
      : Object.keys(NCB_MAP);

    const results = [];
    const errors = [];

    await Promise.all(include.map(async (code) => {
      try {
        const key = `W.U2.C.${balanceItem}.${code}.EUR`;
        const out = await fetchEcbSeries('ILM', key, lastN);
        for (const s of out.series) {
          let pts = s.points;
          s.label = `${NCB_MAP[code] || code} – Total Assets`;
          s.ncb_code = code;
          s.flowRef = 'ILM';
          s.key = key;
          s.points = pts;
          results.push({ label: s.label, flowRef: 'ILM', key, points: s.points, ncb_code: code });
        }
      } catch (e) {
        errors.push({ code, error: e.message });
      }
    }));

    if (currency === 'USD') {
      try {
        const fx = await fetchEcbFxEurUsd(1500);
        for (const r of results) {
          r.points = convertPointsEURtoUSD(r.points, fx);
          if (r.label && !/\(USD\)/.test(r.label)) r.label = `${r.label} (USD)`;
        }
      } catch (e) {
        errors.push({ flowRef: 'EXR', key: 'D.USD.EUR.SP00.A', error: e.message });
      }
    }

    return Response.json({ success: true, results, errors, meta: { balance_item: balanceItem, currency, ncb_count: results.length } });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});