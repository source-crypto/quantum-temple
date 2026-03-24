import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const ENTITIES_TO_AUDIT = [
  'QuantumNode','CrossChainBridge','CryptoWallet','CEXListing','AITradingStrategy','CurrencyMint',
  'TempleInteraction','CeremonialArtifact','DivineOffering','DivineFavor','SpiritualToken','CurrencyTransaction',
  'TradeOffer','UserBalance','CryptoBridge','CrossChainLiquidity','CurrencyIndex','ExchangeRate','MarketInsight',
  'LiquidityPool','IntentNode'
];

async function postSlack(accessToken, channel, text) {
  const res = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
    body: JSON.stringify({ channel, text })
  });
  return await res.json();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Build audit
    let issues = 0; let warnings = 0; const recommendations = {}; const results = {};

    for (const name of ENTITIES_TO_AUDIT) {
      try {
        const schema = await base44.asServiceRole.entities[name].schema();
        const props = schema.properties || {};
        const denorm = Object.entries(props).filter(([, v]) => v && (v.type === 'object' || (v.type === 'array' && v.items && v.items.type === 'object'))).map(([k]) => k);
        const required = Array.isArray(schema.required) ? schema.required : [];
        const missing = required.filter((r) => !props[r]);
        const likelyIdx = Object.keys(props).filter((k) => ['user_email','node_id','node_type','status','created_date','updated_date'].includes(k));
        results[name] = { normalization: { denormalization_candidates: denorm, missing_required_props: missing, likely_index_fields: likelyIdx } };
        recommendations[name] = [];
        if (denorm.length) { warnings += denorm.length; recommendations[name].push(`Extract nested fields [${denorm.slice(0,3).join(', ')}] to separate entities/refs.`); }
        if (missing.length) { issues += missing.length; recommendations[name].push(`Align 'required' with properties: review [${missing.slice(0,3).join(', ')}].`); }
        if (likelyIdx.length) { recommendations[name].push(`Add indexes on [${likelyIdx.slice(0,3).join(', ')}] for common queries.`); }
      } catch (e) {
        issues += 1; results[name] = { error: `Schema fetch failed: ${String(e)}` };
      }
    }

    // Integrity sample checks
    try {
      const qn = await base44.asServiceRole.entities.QuantumNode.list('-created_date', 500);
      const seen = new Set(); const dup = [];
      for (const n of qn) { if (!n.node_id) continue; if (seen.has(n.node_id)) dup.push(n.node_id); seen.add(n.node_id); }
      if (dup.length) { issues += dup.length; (recommendations['QuantumNode'] ||= []).push(`Enforce unique node_id; duplicates: ${[...new Set(dup)].join(', ')}`); }
      results['QuantumNode'] = { ...(results['QuantumNode']||{}), integrity: { duplicate_node_ids: dup } };
    } catch (e) { results['QuantumNode'] = { ...(results['QuantumNode']||{}), integrity_error: String(e) }; }

    // Profiling timings (simplified)
    results['profiling'] = { generated_at: new Date().toISOString() };

    // Persist audit log
    const flatRecs = Object.entries(recommendations).flatMap(([k, arr]) => arr.map(s => `${k}: ${s}`));
    const log = await base44.asServiceRole.entities.SchemaAuditLog.create({
      audit_type: 'full', issues_count: issues, warnings_count: warnings, recommendations: flatRecs, results, performed_by: 'automation'
    });

    // Drift detection vs baselines
    const baselines = await base44.asServiceRole.entities.SchemaBaseline.list('-updated_date', 500).catch(()=>[]);
    const drift = [];
    for (const name of ENTITIES_TO_AUDIT) {
      try {
        const s = await base44.asServiceRole.entities[name].schema();
        const str = JSON.stringify(s); let h = 0; for (let i=0;i<str.length;i++){ h = ((h*31) + str.charCodeAt(i))|0; }
        const b = baselines.find(x => x.entity_name === name);
        if (b && String(b.schema_hash) !== String(h)) { drift.push({ entity: name, expected: b.schema_hash, current: String(h) }); }
      } catch {}
    }

    // Log transparency
    await base44.asServiceRole.entities.AppLog.create({
      type: 'audit', message: `Schema audit completed: ${issues} issues, ${warnings} warnings, ${drift.length} drift`, severity: issues>0? 'warning':'info', source: 'runSchemaAudit', details: { log_id: log.id, drift }, timestamp: new Date().toISOString()
    });

    // Notify admins via email
    try {
      const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' }, '-created_date', 50);
      for (const admin of admins) {
        await base44.asServiceRole.integrations.Core.SendEmail({ to: admin.email, subject: 'Schema Audit Report', body: `Issues: ${issues}\nWarnings: ${warnings}\nDrift: ${drift.length}\nLog ID: ${log.id}` });
      }
    } catch {}

    // Slack notify if connected
    try {
      const token = await base44.asServiceRole.connectors.getAccessToken('slack');
      const channel = Deno.env.get('SLACK_CHANNEL_ID');
      if (token && channel) {
        await postSlack(token, channel, `Schema audit: issues ${issues}, warnings ${warnings}, drift ${drift.length} (log ${log.id})`);
      }
    } catch {}

    return Response.json({ success: true, log_id: log.id, issues, warnings, drift_count: drift.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});