import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const ECB_BASE = 'https://sdw-wsrest.ecb.europa.eu/service/data';

async function fetchEcbSeries(flowRef, key, lastN = 240) {
  const url = `${ECB_BASE}/${encodeURIComponent(flowRef)}/${encodeURIComponent(key)}?detail=dataonly&format=jsondata&lastNObservations=${lastN}`;
  const res = await fetch(url, { headers: { 'Accept': 'application/vnd.sdmx.data+json;version=1.0.0' } });
  if (!res.ok) throw new Error(`ECB ${flowRef}/${key} ${res.status} ${res.statusText}`);
  const json = await res.json();
  // SDMX-JSON parsing (simplified): map observations to time-value points
  const dataSets = json?.dataSets || json?.dataSet || [];
  const ds = dataSets[0];
  const seriesObj = ds?.series || {};
  const dimsObs = json?.structure?.dimensions?.observation || [];
  // Find time dimension
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
    // Sort by date string
    points.sort((a, b) => (a.t > b.t ? 1 : -1));
    series.push({ flowRef, key, points });
  }

  return { flowRef, key, series };
}

// Fetch EUR→USD FX (USD per EUR), daily reference rate
async function fetchEcbFxEurUsd(lastN = 1000) {
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
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return new Date(t + 'T00:00:00Z');
  // YYYY-MM (use last day of month)
  if (/^\d{4}-\d{2}$/.test(t)) {
    const [y, m] = t.split('-').map(Number);
    const lastDay = new Date(Date.UTC(y, m, 0)); // day 0 of next month gives last day prev month
    return lastDay;
  }
  // ISO week: YYYY-Www (use Friday of that ISO week)
  const m = t.match(/^(\d{4})-W(\d{2})$/);
  if (m) {
    const y = Number(m[1]);
    const w = Number(m[2]);
    // ISO week 1 is the week with the first Thursday of the year
    const jan4 = new Date(Date.UTC(y, 0, 4));
    const jan4Day = jan4.getUTCDay() || 7; // 1..7
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
  // Precompute FX with parsed dates
  const fx = fxDaily
    .map((p) => ({ date: parseTimeToDate(p.t) || new Date(p.t + 'T00:00:00Z'), v: p.v }))
    .filter((p) => p.date)
    .sort((a, b) => a.date - b.date);
  return points.map((p) => {
    const d = parseTimeToDate(p.t);
    if (!d) return { ...p };
    // find latest fx <= d via binary search
    let lo = 0, hi = fx.length - 1, best = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (fx[mid].date <= d) { best = mid; lo = mid + 1; } else { hi = mid - 1; }
    }
    if (best >= 0) {
      return { t: p.t, v: Number((p.v * fx[best].v).toFixed(6)) };
    }
    return { ...p };
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // No auth required for public macro data reads; keep optional
    try { await base44.auth.me(); } catch (_) {}

    let payload = {};
    try { payload = await req.json(); } catch (_) {}

    // Expected: { series: [{ flowRef, key, label? }], lastN? }
    const lastN = Number(payload.lastN) || 240;
    const currency = (payload.currency || 'EUR').toUpperCase();

    // Sensible ECB defaults (Euro area): Policy rates (monthly) and HICP headline/core YoY
    const defaultSeries = [
      { flowRef: 'FM', key: 'M.U2.EUR.4F.KR.MRR_FR.LEV', label: 'ECB MRO (Main Refinancing Rate)' },
      { flowRef: 'FM', key: 'M.U2.EUR.4F.KR.DF.LEV', label: 'ECB Deposit Facility Rate' },
      { flowRef: 'FM', key: 'M.U2.EUR.4F.KR.MLF.LEV', label: 'ECB Marginal Lending Facility' },
      // Eurosystem consolidated balance sheet - Total assets (weekly)
      { flowRef: 'ILM', key: 'W.U2.C.T000000.Z5.Z01', label: 'Eurosystem Total Assets (weekly)' },
      // HICP YoY headline (ICP flow, COICOP CP00 = All-items; ANR = Annual rate of change)
      { flowRef: 'ICP', key: 'M.U2.N.CP00.4.ANR', label: 'HICP YoY (Headline, Euro area)' },
      // Core proxy (excluding energy and unprocessed food) commonly referenced as XEFG
      { flowRef: 'ICP', key: 'M.U2.N.XEFG.4.ANR', label: 'HICP YoY (Core: ex energy & unproc. food)' },
      // Selected HICP components (YoY): Food (CP01), Housing (CP04), Transport (CP07)
      { flowRef: 'ICP', key: 'M.U2.N.CP01.4.ANR', label: 'HICP YoY - Food & non-alcoholic bev.' },
      { flowRef: 'ICP', key: 'M.U2.N.CP04.4.ANR', label: 'HICP YoY - Housing & utilities' },
      { flowRef: 'ICP', key: 'M.U2.N.CP07.4.ANR', label: 'HICP YoY - Transport' },
    ];

    const inputSeries = Array.isArray(payload.series) && payload.series.length > 0 ? payload.series : defaultSeries;

    const results = [];
    const errors = [];

    // Fetch all series in parallel
    const promises = inputSeries.map(async (s) => {
      try {
        const out = await fetchEcbSeries(s.flowRef, s.key, lastN);
        // Attach label if provided
        const packed = out.series.map((ss) => ({
          flowRef: s.flowRef,
          key: s.key,
          label: s.label || `${s.flowRef}/${s.key}`,
          points: ss.points,
        }));
        results.push(...packed);
      } catch (e) {
        errors.push({ flowRef: s.flowRef, key: s.key, error: e.message });
      }
    });

    await Promise.all(promises);

    // Optional currency conversion EUR -> USD using ECB FX
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

    return Response.json({ success: true, results, errors });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});