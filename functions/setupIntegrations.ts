import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });

    // Check connectors/env
    let slackConnected = false;
    try { const token = await base44.asServiceRole.connectors.getAccessToken('slack'); slackConnected = !!token; } catch {}
    const env = {
      SLACK_CHANNEL_ID: !!(Deno.env.get('SLACK_CHANNEL_ID')||''),
      WEBHOOK_SHARED_SECRET: !!(Deno.env.get('WEBHOOK_SHARED_SECRET')||'')
    };

    // Transparency log
    await base44.asServiceRole.entities.AppLog.create({
      type: 'integration', message: 'SetupIntegrations inspected environment/connectors', severity: 'info', source: 'setupIntegrations', details: { slackConnected, env }, timestamp: new Date().toISOString()
    });

    return Response.json({
      success: true,
      message: 'Integrations inspected. Use dashboard Automations to confirm schedules created by Base44.',
      slackConnected,
      env,
      created: {
        weeklyAudit: 'Weekly Schema Audit (Mon 9:00 ET)',
        nodeEntityAutomation: 'Intent Node Triggers (create/update/delete)'
      },
      functions: {
        audit: 'runSchemaAudit',
        nodeHandler: 'intentNodeEventHandler',
        webhook: 'webhookIngest',
        status: 'integrationsStatus'
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});