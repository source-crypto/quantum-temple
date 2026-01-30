import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

function toCsvValue(v) {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function buildCsv(rows) {
  const headers = [
    'timestamp', 'source', 'event', 'amount', 'currency', 'customer_email', 'tier', 'metadata_json'
  ];
  const lines = [headers.join(',')];
  for (const r of rows) {
    lines.push([
      toCsvValue(r.timestamp || ''),
      toCsvValue(r.source || ''),
      toCsvValue(r.event || ''),
      toCsvValue(r.amount || ''),
      toCsvValue(r.currency || ''),
      toCsvValue(r.customer_email || ''),
      toCsvValue(r.tier || ''),
      toCsvValue(r.metadata_json || '')
    ].join(','));
  }
  return lines.join('\n');
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  try {
    let body = {};
    try { body = await req.json(); } catch { body = {}; }

    // Gather Stripe events from AppLog (created by stripeWebhook)
    const logs = await base44.asServiceRole.entities.AppLog.filter({
      source: 'stripeWebhook',
      type: 'integration'
    }, '-timestamp', 1000);

    const rows = (logs || []).map((log) => {
      const d = log.details || {};
      const meta = d.metadata || {};
      const timestamp = log.timestamp || new Date().toISOString();
      const amount = (d.amount_total ?? d.amount ?? null);
      const currency = d.currency || null;
      const customer_email = d.customer_email || null;
      const tier = meta.tier || null;
      return {
        timestamp,
        source: 'stripe',
        event: log.message || 'payment',
        amount,
        currency,
        customer_email,
        tier,
        metadata_json: JSON.stringify(meta)
      };
    });

    const csv = buildCsv(rows);

    if (body.mode === 'upload' || (!req.headers.get('x-run-mode') && req.method === 'POST' && Object.keys(body).length === 0)) {
      // Scheduled run: upload to private storage
      const fileName = `finance-export-${new Date().toISOString().slice(0,10)}.csv`;
      const blob = new Blob([csv], { type: 'text/csv' });
      const file = new File([blob], fileName, { type: 'text/csv' });
      const upload = await base44.asServiceRole.integrations.Core.UploadPrivateFile({ file });

      await base44.asServiceRole.entities.AppLog.create({
        type: 'integration',
        message: 'Finance CSV exported',
        source: 'exportFinanceCsv',
        details: { file_uri: upload.file_uri, rows: rows.length }
      });

      return Response.json({ success: true, file_uri: upload.file_uri, rows: rows.length });
    }

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="finance-export.csv"'
      }
    });
  } catch (error) {
    try {
      await base44.asServiceRole.entities.AppLog.create({
        type: 'error',
        message: 'Finance CSV export failed',
        source: 'exportFinanceCsv',
        details: { error: String(error) }
      });
    } catch (_) {}
    return Response.json({ error: String(error) }, { status: 500 });
  }
});