import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Load preferences and current index
    const [prefs, indexes] = await Promise.all([
      base44.entities.AlertPreference.list(),
      base44.entities.CurrencyIndex.list('-last_updated', 1)
    ]);
    const index = indexes?.[0];
    if (!index) return Response.json({ created: 0, reason: 'no-index' });

    const alertsToCreate = [];

    for (const pref of prefs) {
      if (!pref.is_active) continue;
      const assets = Array.isArray(pref.assets) && pref.assets.length ? pref.assets : ['QTC'];
      const threshold = Math.abs(pref.price_change_threshold_percent || 5);

      for (const asset of assets) {
        let pct = null;
        if (asset === 'QTC') pct = typeof index.price_change_24h === 'number' ? index.price_change_24h : null;
        if (pct === null) continue;
        if (Math.abs(pct) >= threshold) {
          const message = `QTC 24h change ${pct.toFixed(2)}% exceeded your ${threshold}% threshold.`;
          alertsToCreate.push({
            user_email: pref.user_email || pref.created_by,
            asset_symbol: asset,
            type: 'price_change',
            message,
            severity: Math.abs(pct) >= threshold * 2 ? 'warning' : 'info',
            triggered_value: pct,
            threshold,
            timestamp: new Date().toISOString()
          });

          // Optional email channel
          if (Array.isArray(pref.alert_channels) && pref.alert_channels.includes('email') && (pref.user_email || pref.created_by)) {
            await base44.integrations.Core.SendEmail({
              to: pref.user_email || pref.created_by,
              subject: `QTC Alert: ${pct.toFixed(2)}% in 24h`,
              body: message
            });
          }
        }
      }
    }

    if (alertsToCreate.length) {
      await base44.entities.AlertEvent.bulkCreate(alertsToCreate);
    }

    return Response.json({ created: alertsToCreate.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});