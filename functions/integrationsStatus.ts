import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(()=>null);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Slack connector check
    let slackConnected = false;
    try { const token = await base44.asServiceRole.connectors.getAccessToken('slack'); slackConnected = !!token; } catch { slackConnected = false; }

    const envKeys = {
      SLACK_CHANNEL_ID: !!(Deno.env.get('SLACK_CHANNEL_ID')||''),
      WEBHOOK_SHARED_SECRET: !!(Deno.env.get('WEBHOOK_SHARED_SECRET')||'')
    };

    return Response.json({ slackConnected, envKeys, webhookFunction: 'webhookIngest' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});