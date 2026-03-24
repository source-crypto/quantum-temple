import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Advances CrossChainBridge records through lifecycle states.
// Intended for scheduled automation. Uses service role; no end-user auth required.
// Optional payload: { limit?: number }
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json().catch(() => ({}));
    const limit = Math.max(1, Math.min(Number(payload?.limit) || 25, 100));

    // Fetch recently updated bridges and filter to active statuses in memory
    const recent = await base44.asServiceRole.entities.CrossChainBridge.list('-updated_date', 200);

    const activeStatuses = new Set(['initiated', 'escrow_locked', 'confirming', 'releasing']);
    const candidates = recent.filter((b) => activeStatuses.has(b.status)).slice(0, limit);

    const results = [];
    let updatedCount = 0;

    for (const b of candidates) {
      const nowIso = new Date().toISOString();
      let update = null;

      if (b.status === 'initiated') {
        // Move to escrow_locked and set an estimated completion if not present
        const minutes = Number(b.estimated_time_minutes) || 15;
        const est = new Date(Date.now() + minutes * 60 * 1000).toISOString();
        update = {
          status: 'escrow_locked',
          confirmations: 0,
          estimated_completion: b.estimated_completion || est,
        };
      } else if (b.status === 'escrow_locked' || b.status === 'confirming') {
        // Increment confirmations until required, then move to releasing
        const reqConfs = Number(b.required_confirmations) || 6;
        const newConfs = (Number(b.confirmations) || 0) + 1;
        update = {
          confirmations: newConfs,
          status: newConfs >= reqConfs ? 'releasing' : 'confirming',
        };
      } else if (b.status === 'releasing') {
        // Mark completed
        update = {
          status: 'completed',
          completed_at: nowIso,
        };
      }

      if (update) {
        await base44.asServiceRole.entities.CrossChainBridge.update(b.id, update);
        updatedCount += 1;
        results.push({ id: b.id, from: b.status, to: update.status, confirmations: update.confirmations ?? b.confirmations });

        // Log to AppLog (non-fatal if fails)
        try {
          await base44.asServiceRole.entities.AppLog.create({
            type: 'integration',
            message: 'Bridge advanced',
            severity: 'info',
            source: 'advanceCrossChainBridges',
            details: { id: b.id, from: b.status, ...update },
            timestamp: nowIso,
          });
        } catch (_) { /* ignore log errors */ }
      }
    }

    return Response.json({ processed: candidates.length, updated: updatedCount, results });
  } catch (error) {
    // Log error for easier debugging
    try {
      const base44 = createClientFromRequest(req);
      await base44.asServiceRole.entities.AppLog.create({
        type: 'error',
        message: 'advanceCrossChainBridges failed',
        severity: 'error',
        source: 'advanceCrossChainBridges',
        details: { error: String(error?.message || error) },
        timestamp: new Date().toISOString(),
      });
    } catch (_) { /* ignore log errors */ }
    return Response.json({ error: error.message }, { status: 500 });
  }
});