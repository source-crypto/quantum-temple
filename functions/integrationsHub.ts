import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);

    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const payload = await req.json().catch(() => ({}));
    const action = payload.action;

    if (!action) {
      return Response.json({ error: 'action is required' }, { status: 400 });
    }

    if (action === 'logEvent') {
      const { level = 'info', message = '', source = 'integrationsHub', meta = {} } = payload;
      if (!message) return Response.json({ error: 'message is required' }, { status: 400 });

      const log = await base44.asServiceRole.entities.AppLog.create({
        level, message, source, meta, user_email: user?.email || null
      });
      return Response.json({ success: true, log });
    }

    if (action === 'sendEmail') {
      const { to, subject, body, from_name } = payload;
      if (!to || !subject || !body) {
        return Response.json({ error: 'to, subject, body are required' }, { status: 400 });
      }

      const res = await base44.integrations.Core.SendEmail({
        to, subject, body, from_name: from_name || 'Quantum Temple'
      });

      await base44.asServiceRole.entities.AppLog.create({
        level: 'info', message: 'Email sent', source: 'integrationsHub', meta: { to, subject }, user_email: user?.email || null
      });

      return Response.json({ success: true, email_result: res });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});