import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { agent_name, amount_usd, reason = 'N/A', metadata = {} } = body || {};

    if (!agent_name || !amount_usd || amount_usd <= 0) {
      return Response.json({ error: 'agent_name and positive amount_usd are required' }, { status: 400 });
    }

    const today = new Date().toISOString().slice(0, 10);

    // Fetch budget (service role to avoid user RLS limitations)
    const budgets = await base44.asServiceRole.entities.AgentBudget.filter({ agent_name }, '-updated_date', 1);
    const budget = budgets?.[0];

    if (!budget) {
      return Response.json({ error: `No pre-approved budget configured for agent ${agent_name}` }, { status: 400 });
    }

    // Reset if day changed
    let remaining = Number(budget.remaining_today_usd ?? budget.daily_budget_usd ?? 0);
    if (budget.last_reset_date !== today) {
      remaining = Number(budget.daily_budget_usd || 0);
    }

    if (amount_usd > remaining) {
      return Response.json({ error: 'Spending cap exceeded for today', remaining_today_usd: remaining }, { status: 403 });
    }

    // Update budget remaining and last_reset_date
    const newRemaining = Number((remaining - amount_usd).toFixed(2));
    await base44.asServiceRole.entities.AgentBudget.update(budget.id, {
      remaining_today_usd: newRemaining,
      last_reset_date: today,
    });

    const timestamp = new Date().toISOString();

    // Attempt to create a TreasuryTransaction record (best-effort)
    let txRecord = null;
    try {
      txRecord = await base44.asServiceRole.entities.TreasuryTransaction.create({
        transaction_type: 'debit',
        amount: amount_usd,
        note: `Agent ${agent_name}: ${reason}`,
        status: 'completed',
        timestamp,
        source: 'agent',
        agent_name,
        metadata,
      });
    } catch (_e) {
      // Continue even if TreasuryTransaction schema differs
    }

    // Log to AppLog
    await base44.asServiceRole.entities.AppLog.create({
      type: 'audit',
      message: `Treasury spend by ${agent_name}: $${amount_usd.toFixed(2)}`,
      severity: 'info',
      source: 'treasurySpend',
      details: { agent_name, amount_usd, reason, metadata, tx_id: txRecord?.id ?? null, remaining_after: newRemaining },
      timestamp,
    });

    // Notify admins via email
    let admins = [];
    try {
      admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' }, '-created_date', 100);
    } catch (_e) {
      // fallback attempt
      const allUsers = await base44.asServiceRole.entities.User.list();
      admins = (allUsers || []).filter(u => u.role === 'admin');
    }

    const subject = `[Treasury] ${agent_name} spent $${amount_usd.toFixed(2)} (remaining $${newRemaining.toFixed(2)})`;
    const bodyHtml = `Agent <b>${agent_name}</b> executed a treasury spend.<br/>`+
      `Amount: <b>$${amount_usd.toFixed(2)}</b><br/>`+
      `Reason: ${reason}<br/>`+
      `Remaining today: <b>$${newRemaining.toFixed(2)}</b><br/>`+
      `Time: ${timestamp}`;

    for (const a of admins) {
      if (!a?.email) continue;
      await base44.asServiceRole.integrations.Core.SendEmail({ to: a.email, subject, body: bodyHtml });
    }

    return Response.json({ success: true, remaining_today_usd: newRemaining, tx_id: txRecord?.id ?? null });
  } catch (error) {
    // Also log the error for debugging
    try {
      const base44 = createClientFromRequest(req);
      await base44.asServiceRole.entities.AppLog.create({
        type: 'error',
        message: 'treasurySpend failed',
        severity: 'error',
        source: 'treasurySpend',
        details: { error: String(error?.message || error) },
        timestamp: new Date().toISOString(),
      });
    } catch (_) {}
    return Response.json({ error: error.message }, { status: 500 });
  }
});