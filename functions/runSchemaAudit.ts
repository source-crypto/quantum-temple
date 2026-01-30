import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const ENTITIES_TO_AUDIT = [
  'QuantumNode','CrossChainBridge','CryptoWallet','CEXListing','AITradingStrategy','CurrencyMint',
  'TempleInteraction','CeremonialArtifact','DivineOffering','DivineFavor','SpiritualToken','CurrencyTransaction',
  'TradeOffer','UserBalance','CryptoBridge','CrossChainLiquidity','CurrencyIndex','ExchangeRate','MarketInsight',
  'LiquidityPool','IntentNode'
];

function quickHash(str) {
  let h = 0; for (let i = 0; i < str.length; i++) { h = ((h * 31) + str.charCodeAt(i)) | 0; } return String(h);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);

    // Build results
    const results = {};
    let issues = 0;
    let warnings = 0;
    const recommendations = [];

    for (const name of ENTITIES_TO_AUDIT) {
      try {
        const schema = await base44.asServiceRole.entities[name].schema();
        const props = schema.properties || {};
        const denormCandidates = Object.entries(props)
          .filter(([, v]) => v && (v.type === 'object' || (v.type === 'array' && v.items && v.items.type === 'object')))
          .map(([k]) => k);
        const required = Array.isArray(schema.required) ? schema.required : [];
        const missingRequired = required.filter((r) => !props[r]);
        const likelyIndexFields = Object.keys(props).filter((k) => ['user_email','node_id','node_type','status','created_date','updated_date'].includes(k));

        results[name] = {
          normalization: {
            denormalization_candidates: denormCandidates,
            missing_required_props: missingRequired,
            likely_index_fields: likelyIndexFields
          }
        };

        if (denormCandidates.length > 0) {
          warnings += denormCandidates.length;
          recommendations.push(`${name}: Consider normalizing [${denormCandidates.join(', ')}]`);
        }
        if (missingRequired.length > 0) {
          issues += missingRequired.length;
          recommendations.push(`${name}: 'required' lists fields not present: [${missingRequired.join(', ')}]`);
        }
      } catch (e) {
        issues += 1;
        results[name] = { error: `Schema fetch failed: ${String(e)}` };
      }
    }

    // Integrity check examples
    try {
      const qn = await base44.asServiceRole.entities.QuantumNode.list('-created_date', 200);
      const seen = new Set();
      const duplicates = [];
      qn.forEach((n) => { if (n.node_id) { if (seen.has(n.node_id)) duplicates.push(n.node_id); seen.add(n.node_id); } });
      if (duplicates.length > 0) {
        issues += duplicates.length;
        recommendations.push(`QuantumNode: duplicate node_id: [${[...new Set(duplicates)].join(', ')}]`);
      }
      results['QuantumNode'] = { ...(results['QuantumNode']||{}), integrity: { duplicate_node_ids: duplicates } };
    } catch (e) {
      results['QuantumNode'] = { ...(results['QuantumNode']||{}), integrity_error: String(e) };
    }

    // Drift detection vs baselines
    const baselines = await base44.asServiceRole.entities.SchemaBaseline.list('-updated_date', 200).catch(() => []);
    const currentHashes = [];
    for (const name of ENTITIES_TO_AUDIT) {
      try {
        const s = await base44.asServiceRole.entities[name].schema();
        currentHashes.push({ entity_name: name, schema_hash: quickHash(JSON.stringify(s)) });
      } catch {}
    }
    const drift = [];
    currentHashes.forEach((h) => {
      const b = baselines.find((x) => x.entity_name === h.entity_name);
      if (b && String(b.schema_hash) !== String(h.schema_hash)) {
        drift.push({ entity: h.entity_name, expected: b.schema_hash, current: h.schema_hash });
      }
    });

    const log = await base44.asServiceRole.entities.SchemaAuditLog.create({
      audit_type: 'full',
      issues_count: issues,
      warnings_count: warnings,
      recommendations,
      results: { ...results, drift },
      performed_by: user?.email || 'system'
    });

    const critical = (issues >= 3) || (drift.length > 0);

    // Alert (email current user if available) + log
    if (critical) {
      if (user?.email) {
        await base44.asServiceRole.functions.invoke('integrationsHub', {
          action: 'sendEmail',
          to: user.email,
          subject: 'Schema Audit Alert',
          body: `Issues: ${issues}\nWarnings: ${warnings}\nDrift: ${drift.length}`
        });
      }
      await base44.asServiceRole.functions.invoke('integrationsHub', {
        action: 'logEvent',
        level: 'warn',
        message: 'Schema audit critical',
        meta: { issues, warnings, driftCount: drift.length }
      });
    }

    return Response.json({ success: true, log, issues, warnings, driftCount: drift.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});