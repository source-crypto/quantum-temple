import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // Public app: auth optional
    await base44.auth.me().catch(() => null);

    // Connector checks (service role)
    const [slackToken, notionToken, hubspotToken] = await Promise.all([
      base44.asServiceRole.connectors.getAccessToken('slack').catch(() => ''),
      base44.asServiceRole.connectors.getAccessToken('notion').catch(() => ''),
      base44.asServiceRole.connectors.getAccessToken('hubspot').catch(() => ''),
    ]);
    const slackConnected = !!slackToken;
    const notionConnected = !!notionToken;
    const hubspotConnected = !!hubspotToken;

    const envKeys = {
      SLACK_CHANNEL_ID: !!(Deno.env.get('SLACK_CHANNEL_ID')||''),
      WEBHOOK_SHARED_SECRET: !!(Deno.env.get('WEBHOOK_SHARED_SECRET')||''),
      FRED_API_KEY: !!(Deno.env.get('FRED_API_KEY')||''),
    };

    // ECB SDW is public; mark available
    const ecbOk = true;

    // Recent blockchain bridge activity (last 30 days)
    let cryptoActivityRecent = false;
    try {
      const now = Date.now();
      const list = await base44.asServiceRole.entities.CryptoBridge.list('-timestamp', 5);
      const recent = (list||[]).some(it => {
        const t = Date.parse(it.timestamp || it.created_date || '');
        return Number.isFinite(t) && (now - t) < 30*24*60*60*1000;
      });
      cryptoActivityRecent = recent;
    } catch (_) { cryptoActivityRecent = false; }

    return Response.json({ 
      slackConnected, notionConnected, hubspotConnected, 
      envKeys, ecbOk, cryptoActivityRecent,
      webhookFunction: 'webhookIngest'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});