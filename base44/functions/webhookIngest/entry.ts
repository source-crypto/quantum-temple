import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const provided = url.searchParams.get('secret') || req.headers.get('x-webhook-secret') || '';
    const expected = Deno.env.get('WEBHOOK_SHARED_SECRET') || '';
    if (!expected || provided !== expected) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(()=>({}));
    const type = body.type || 'unknown';

    if (type === 'schema_audit') {
      const res = await base44.asServiceRole.functions.invoke('runSchemaAudit', {});
      return Response.json({ ok: true, audit: res.data });
    }

    if (type === 'intent_node_update') {
      const { oc_number, resonance_level, transparency_accumulated, status } = body;
      const nodes = await base44.asServiceRole.entities.IntentNode.filter({ oc_number });
      if (nodes.length) {
        await base44.asServiceRole.entities.IntentNode.update(nodes[0].id, { resonance_level, transparency_accumulated, status });
      }
      return Response.json({ ok: true });
    }

    if (type === 'manifestation_event') {
      await base44.asServiceRole.entities.ManifestationEvent.create({
        event_type: 'increment', node_oc_number: body.oc_number, units_added: Number(body.units||0), total_transparency: Number(body.total||0), note: body.note||'webhook', timestamp: new Date().toISOString()
      });
      return Response.json({ ok: true });
    }

    await base44.asServiceRole.entities.AppLog.create({ type: 'webhook', message: `Unhandled webhook type: ${type}`, severity: 'warning', source: 'webhookIngest', details: body, timestamp: new Date().toISOString() });
    return Response.json({ ok: true, ignored: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});