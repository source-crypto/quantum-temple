import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

async function notify(base44, summary) {
  // in-app log
  await base44.asServiceRole.entities.AppLog.create({ type: 'alert', message: summary, severity: 'warning', source: 'intentNodeEventHandler', timestamp: new Date().toISOString() });
  // email admins
  try {
    const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' }, '-created_date', 50);
    for (const a of admins) {
      await base44.asServiceRole.integrations.Core.SendEmail({ to: a.email, subject: 'IntentNode Alert', body: summary });
    }
  } catch {}
  // Slack
  try {
    const token = await base44.asServiceRole.connectors.getAccessToken('slack');
    const channel = Deno.env.get('SLACK_CHANNEL_ID');
    if (token && channel) {
      await fetch('https://slack.com/api/chat.postMessage', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ channel, text: summary }) });
    }
  } catch {}
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json().catch(() => ({}));
    const { event, data } = payload;
    if (!event || !data) {
      return Response.json({ error: 'Missing event/data' }, { status: 400 });
    }

    // Evaluate rules
    const rules = await base44.asServiceRole.entities.NodeAlertRule.list('-created_date', 500).catch(()=>[]);
    const applicable = rules.filter(r => r.enabled && (r.node_id === data.id || r.oc_number === data.oc_number));

    for (const r of applicable) {
      if (r.threshold_type === 'resonance_below' && Number(data.resonance_level||0) < Number(r.threshold_value)) {
        await notify(base44, `OC ${data.oc_number}: Resonance ${data.resonance_level} below ${r.threshold_value}`);
      }
      if (r.threshold_type === 'transparency_below' && Number(data.transparency_accumulated||0) < Number(r.threshold_value)) {
        await notify(base44, `OC ${data.oc_number}: Transparency ${data.transparency_accumulated} below ${r.threshold_value}`);
      }
    }

    // Log
    await base44.asServiceRole.entities.AppLog.create({ type: 'alert', message: `IntentNode ${event.type}`, severity: 'info', source: 'intentNodeEventHandler', details: { id: data.id, oc: data.oc_number }, timestamp: new Date().toISOString() });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});