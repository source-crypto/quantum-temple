import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const FRED_BASE = 'https://api.stlouisfed.org/fred/series/observations';

async function fetchFredSeries(seriesId, apiKey, params = {}) {
  const qs = new URLSearchParams({
    series_id: seriesId,
    api_key: apiKey,
    file_type: 'json',
  });
  if (params.observation_start) qs.set('observation_start', params.observation_start);
  if (params.observation_end) qs.set('observation_end', params.observation_end);
  if (params.frequency) qs.set('frequency', params.frequency);

  const url = `${FRED_BASE}?${qs.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`FRED ${seriesId} ${res.status} ${res.statusText}`);
  const json = await res.json();
  const obs = json?.observations || [];
  const points = obs
    .map((o) => ({ t: o.date || o.observation_date, v: (o.value === '.' ? null : Number(o.value)) }))
    .filter((p) => p.t && p.v != null && !Number.isNaN(p.v));
  return points;
}

function yoyPct(points, lag = 12) {
  if (!Array.isArray(points) || points.length <= lag) return [];
  const out = points.map((p, i) => {
    if (i < lag) return { t: p.t, v: null };
    const prev = points[i - lag];
    if (!prev || prev.v == null || prev.v === 0) return { t: p.t, v: null };
    const val = ((p.v / prev.v) - 1) * 100;
    return { t: p.t, v: Number(val.toFixed(4)) };
  });
  return out.filter((p) => p.v != null);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    try { await base44.auth.me(); } catch (_) {}

    let payload = {};
    try { payload = await req.json(); } catch (_) {}

    const apiKey = payload.api_key || Deno.env.get('FRED_API_KEY');
    if (!apiKey) {
      return Response.json({ success: false, error: 'Missing FRED API key', code: 'NO_API_KEY' }, { status: 400 });
    }

    // series can be ['DFF', 'WALCL'] or [{ id: 'DFF', label: 'Fed Funds', transform: 'none|yoy_pct', lag: 12 }]
    const items = Array.isArray(payload.series) ? payload.series : [];
    if (items.length === 0) {
      return Response.json({ success: false, error: 'No series requested' }, { status: 400 });
    }

    const params = {
      observation_start: payload.observation_start,
      observation_end: payload.observation_end,
      frequency: payload.frequency,
    };

    const results = [];
    const errors = [];

    await Promise.all(items.map(async (it) => {
      const obj = typeof it === 'string' ? { id: it } : it;
      const id = obj.id;
      const label = obj.label || id;
      const transform = obj.transform || 'none';
      const lag = Number(obj.lag) || (payload.lag || 12);
      try {
        const raw = await fetchFredSeries(id, apiKey, params);
        let pts = raw;
        if (transform === 'yoy_pct') {
          const inferredLag = payload.frequency === 'w' || obj.frequency === 'w' ? 52 : lag;
          pts = yoyPct(raw, inferredLag);
        }
        results.push({ id, label, points: pts });
      } catch (e) {
        errors.push({ id, error: e.message });
      }
    }));

    return Response.json({ success: true, results, errors });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});