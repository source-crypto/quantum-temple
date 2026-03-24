import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    let userEmail = 'anonymous';
    try {
      const me = await base44.auth.me();
      if (me?.email) userEmail = me.email;
    } catch (_) { /* public allowed */ }

    // Fetch latest index + recent chain metrics
    const [indexes, snapshots] = await Promise.all([
      base44.entities.CurrencyIndex.list('-last_updated', 1),
      base44.entities.BlockchainMetricSnapshot.list('-timestamp', 5)
    ]);

    const index = indexes?.[0] || null;
    const ctxSummary = {
      qtc_price_usd: index?.qtc_unit_price_usd ?? null,
      btc_price_usd: index?.btc_price_usd ?? null,
      eth_price_usd: index?.eth_price_usd ?? null,
      volume_24h_usd: index?.volume_24h_usd ?? null,
      price_change_24h: index?.price_change_24h ?? null,
      snapshots: snapshots?.map(s => ({ chain: s.chain, timestamp: s.timestamp, metrics: s.metrics })) || []
    };

    const schema = {
      type: 'object',
      properties: {
        sentiment_overall: { type: 'string', enum: ['bearish','neutral','bullish'] },
        news_sentiment_score: { type: 'number' },
        social_sentiment_score: { type: 'number' },
        predicted_price_change_24h_pct: { type: 'number' },
        risk_level: { type: 'string', enum: ['low','medium','high'] },
        key_drivers: { type: 'array', items: { type: 'string' } },
        suggested_actions: { type: 'array', items: { type: 'string' } }
      },
      required: ['sentiment_overall','predicted_price_change_24h_pct','risk_level']
    };

    const prompt = `You are a disciplined crypto market analyst. Analyze QTC based on this on-chain/market context and fresh web data. Provide actionable, concrete insights.

Context JSON:\n${JSON.stringify(ctxSummary)}\n
Instructions:
- Incorporate reputable news & social sentiment.
- Predict 24h price move (percentage) for QTC.
- Identify top 3-5 drivers.
- Provide conservative, user-friendly suggested actions.`;

    const ai = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: schema
    });

    return Response.json({ userEmail, context: ctxSummary, insights: ai });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});