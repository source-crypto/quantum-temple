import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const today = new Date().toISOString().slice(0, 10);

    const budgets = await base44.asServiceRole.entities.AgentBudget.list('-updated_date', 1000);
    let resetCount = 0;

    for (const b of (budgets || [])) {
      const shouldReset = b.last_reset_date !== today;
      if (shouldReset) {
        await base44.asServiceRole.entities.AgentBudget.update(b.id, {
          remaining_today_usd: Number(b.daily_budget_usd || 0),
          last_reset_date: today,
        });
        resetCount += 1;
      }
    }

    // Log summary
    await base44.asServiceRole.entities.AppLog.create({
      type: 'audit',
      message: `Agent budgets reset for ${resetCount} agents`,
      severity: 'info',
      source: 'resetAgentBudgets',
      details: { resetCount },
      timestamp: new Date().toISOString(),
    });

    return Response.json({ success: true, resetCount });
  } catch (error) {
    try {
      const base44 = createClientFromRequest(req);
      await base44.asServiceRole.entities.AppLog.create({
        type: 'error',
        message: 'resetAgentBudgets failed',
        severity: 'error',
        source: 'resetAgentBudgets',
        details: { error: String(error?.message || error) },
        timestamp: new Date().toISOString(),
      });
    } catch (_) {}
    return Response.json({ error: error.message }, { status: 500 });
  }
});