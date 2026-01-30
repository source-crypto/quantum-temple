import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Use service role to manage bridges across all users (scheduled job)
    const pending = await base44.asServiceRole.entities.CrossChainBridge.filter({
      status: ['initiated', 'escrow_locked', 'confirming', 'releasing']
    }, '-initiated_at', 500);

    let updated = 0;
    for (const b of pending) {
      const now = new Date();
      const patch = {};

      if (b.status === 'initiated') {
        patch.status = 'escrow_locked';
        patch.confirmations = 0;
        patch.transaction_hash = b.transaction_hash || `${b.source_chain}-${b.bridge_id}-${Math.random().toString(36).slice(2,10)}`;
      } else if (b.status === 'escrow_locked' || b.status === 'confirming') {
        const inc = Math.max(1, Math.floor(Math.random() * 3));
        const next = Math.min((b.confirmations || 0) + inc, b.required_confirmations || 6);
        patch.confirmations = next;
        patch.status = next >= (b.required_confirmations || 6) ? 'releasing' : 'confirming';
      } else if (b.status === 'releasing') {
        patch.status = 'completed';
        patch.completed_at = now.toISOString();
      }

      if (Object.keys(patch).length) {
        await base44.asServiceRole.entities.CrossChainBridge.update(b.id, patch);
        updated += 1;
      }
    }

    return Response.json({ processed: pending.length, updated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});