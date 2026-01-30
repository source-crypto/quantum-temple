import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // Automation payload: { event: { type, entity_name, entity_id }, data, old_data, payload_too_large }
    const payload = await req.json().catch(() => ({}));
    const { event, data, old_data, payload_too_large } = payload || {};

    let node = data;
    if (!node && event?.entity_id) {
      try { node = await base44.asServiceRole.entities.IntentNode.get(event.entity_id); } catch {}
    }

    // Evaluate alert rules
    const rules = await base44.asServiceRole.entities.NodeAlertRule.list('-created_date', 500).catch(() => []);
    const applicable = (rules||[]).filter((r) => r.enabled && (r.node_id === node?.id || r.oc_number === node?.oc_number));

    const triggers = [];
    applicable.forEach((r) => {
      if (r.threshold_type === 'resonance_below' && Number(node?.resonance_level||0) < Number(r.threshold_value)) {
        triggers.push({ type: r.threshold_type, value: node?.resonance_level });
      }
      if (r.threshold_type === 'transparency_below' && Number(node?.transparency_accumulated||0) < Number(r.threshold_value)) {
        triggers.push({ type: r.threshold_type, value: node?.transparency_accumulated });
      }
    });

    const notifyList = [];
    if (node?.created_by) notifyList.push(node.created_by);
    const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' }).catch(() => []);
    admins.forEach((a) => notifyList.push(a.email));

    if (triggers.length > 0) {
      for (const to of Array.from(new Set(notifyList))) {
        await base44.asServiceRole.functions.invoke('integrationsHub', {
          action: 'sendEmail',
          to,
          subject: `IntentNode Alert • OC ${node?.oc_number}`,
          body: `Event: ${event?.type}\nTriggers: ${triggers.map(t=>`${t.type}=${t.value}`).join(', ')}\nStatus: ${node?.status}`
        });
      }
      await base44.asServiceRole.functions.invoke('integrationsHub', {
        action: 'logEvent',
        level: 'warn',
        message: 'IntentNode alert triggers',
        meta: { oc_number: node?.oc_number, node_id: node?.id, triggers, event }
      });
    } else {
      await base44.asServiceRole.functions.invoke('integrationsHub', {
        action: 'logEvent',
        level: 'info',
        message: 'IntentNode event received',
        meta: { oc_number: node?.oc_number, node_id: node?.id, event }
      });
    }

    return Response.json({ success: true, triggers });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});