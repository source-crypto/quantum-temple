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

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // No auth required for public macro data reads; keep optional
    try { await base44.auth.me(); } catch (_) {}

    let payload = {};
    try { payload = await req.json(); } catch (_) {}

    // Expected: { series: [{ flowRef, key, label? }], lastN? }
    const lastN = Number(payload.lastN) || 240;

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

    return Response.json({ success: true, results, errors });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});