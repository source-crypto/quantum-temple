import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Fetch latest index, snapshots (filter last 7 days in code), and recent audit logs for context
    const [indexes, snapshots, auditLogs] = await Promise.all([
      base44.asServiceRole.entities.CurrencyIndex.filter({}, '-last_updated', 5),
      base44.asServiceRole.entities.BlockchainMetricSnapshot.filter({}, '-timestamp', 300),
      base44.asServiceRole.entities.AppLog.filter({ type: 'audit' }, '-timestamp', 50)
    ]);

    const recentSnapshots = (snapshots || []).filter(s => {
      const t = s?.timestamp ? new Date(s.timestamp) : null;
      return t && t >= sevenDaysAgo;
    });

    const latestIndex = (indexes && indexes.length > 0) ? indexes[0] : null;

    const payload = {
      period: { start: sevenDaysAgo.toISOString(), end: now.toISOString() },
      latest_index: latestIndex,
      snapshots_sample: recentSnapshots.slice(0, 100),
      prior_audits: (auditLogs || []).slice(0, 10).map(l => ({ timestamp: l.timestamp, message: l.message }))
    };

    const responseSchema = {
      type: 'object',
      properties: {
        overview: { type: 'string' },
        principle_alignment: {
          type: 'object',
          properties: {
            value: { type: 'number' },
            transparency: { type: 'number' },
            intent: { type: 'number' }
          }
        },
        key_findings: { type: 'array', items: { type: 'string' } },
        risks: { type: 'array', items: { type: 'string' } },
        recommendations: { type: 'array', items: { type: 'string' } }
      }
    };

    const prompt = `You are the Manifesto Analyst. Provide a WEEKLY alignment report for the Divine Currency.\nPrinciples: VALUE, TRANSPARENCY, INTENT.\nInput JSON (period, latest_index, snapshots_sample, prior_audits) will follow.\nReturn a JSON object strictly matching the provided schema with: concise overview, 0-100 scores per principle, 3-8 key findings, notable risks, and clear recommendations.\nFocus on how on-chain and index metrics reflect manifesto goals.\nInput JSON follows:\n${JSON.stringify(payload, null, 2)}`;

    const analysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: responseSchema
    });

    const log = await base44.asServiceRole.entities.AppLog.create({
      type: 'audit',
      severity: 'info',
      source: 'generateManifestoWeeklyReport',
      message: `Weekly Manifesto Alignment Report (${now.toISOString().slice(0, 10)})`,
      details: {
        period: payload.period,
        principle_alignment: analysis?.principle_alignment || null,
        key_findings: analysis?.key_findings || [],
        risks: analysis?.risks || [],
        recommendations: analysis?.recommendations || [],
        overview: analysis?.overview || ''
      },
      timestamp: new Date().toISOString()
    });

    return Response.json({ success: true, log_id: log.id, report: analysis });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});