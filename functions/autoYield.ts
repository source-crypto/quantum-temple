import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

function pickPercent(risk) {
  if (risk === 'low') return 0.2;
  if (risk === 'high') return 0.7;
  return 0.4; // medium
}

function strategyAllows(strategy, pair) {
  if (!pair) return false;
  if (strategy === 'stable_only') return /USDT|USDC/.test(pair);
  if (strategy === 'balanced') return /USDT|USDC|ETH/.test(pair) && !/BTC/.test(pair);
  return true; // aggressive
}

async function bestPoolForUser(base44, user, ci) {
  const pools = await base44.asServiceRole.entities.LiquidityPool.filter({ is_active: true }, '-apy', 50);
  if (!Array.isArray(pools) || pools.length === 0) return null;

  const priceChange = Number(ci?.price_change_24h || 0);
  const riskAdj = user.auto_yield_risk === 'low' ? 0.9 : user.auto_yield_risk === 'high' ? 1.15 : 1.0;

  let best = null;
  for (const p of pools) {
    if (!strategyAllows(user.auto_yield_strategy || 'balanced', p.currency_pair)) continue;
    const apy = Number(p.apy || 0);
    const vol = Number(p.total_volume_24h || 0);
    // fetch recent snapshot for volatility penalty
    let volPenalty = 1.0;
    try {
      const snaps = await base44.asServiceRole.entities.DexLiquiditySnapshot.filter({ pair: p.currency_pair }, '-timestamp', 1);
      const ch = Number(snaps?.[0]?.change24h_percent || 0);
      volPenalty = Math.max(0.5, 1 - Math.min(0.5, Math.abs(ch) / 100));
    } catch (_) {}
    const ciAdj = 1 + Math.max(-0.1, Math.min(0.1, priceChange / 100));
    const score = apy * riskAdj * volPenalty * ciAdj + (vol / 1_000_000) * 0.01;
    if (!best || score > best.score) best = { pool: p, score, estApy: apy * riskAdj * volPenalty * ciAdj };
  }
  return best;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    let payload = {};
    try { payload = await req.json(); } catch {}

    const me = await base44.auth.me();
    const scopeMe = payload?.scope === 'me';

    const ciList = await base44.asServiceRole.entities.CurrencyIndex.list('-last_updated', 1);
    const ci = ciList?.[0] || null;

    const results = [];

    async function processUser(u) {
      const email = u.email;
      const risk = u.auto_yield_risk || 'medium';
      const pct = pickPercent(risk);

      let ub = (await base44.asServiceRole.entities.UserBalance.filter({ user_email: email }, '-updated_date', 1))?.[0] || null;
      if (!ub) {
        ub = await base44.asServiceRole.entities.UserBalance.create({ user_email: email, available_balance: 0, staked_balance: 0, in_escrow: 0 });
      }
      const available = Number(ub.available_balance || 0);
      if (!u.auto_yield_enabled) {
        results.push({ email, status: 'skipped', reason: 'disabled' });
        return;
      }
      if (available <= 0) {
        results.push({ email, status: 'skipped', reason: 'no_funds' });
        return;
      }

      const choice = await bestPoolForUser(base44, u, ci);
      if (!choice) {
        results.push({ email, status: 'skipped', reason: 'no_pool' });
        return;
      }

      const amount = Math.max(0, Math.floor(available * pct));
      if (amount <= 0) {
        results.push({ email, status: 'skipped', reason: 'amount_zero' });
        return;
      }

      await base44.asServiceRole.entities.UserBalance.update(ub.id, {
        available_balance: available - amount,
        staked_balance: Number(ub.staked_balance || 0) + amount,
        last_transaction_date: new Date().toISOString(),
      });

      // record execution
      try {
        await base44.asServiceRole.entities.AutoYieldExecution.create({
          user_email: email,
          strategy: u.auto_yield_strategy || 'balanced',
          risk_tolerance: risk,
          selected_pool: choice.pool.currency_pair,
          estimated_apy: choice.estApy || 0,
          amount_deposited: amount,
          status: 'executed',
          timestamp: new Date().toISOString(),
        });
      } catch (_) {}

      results.push({ email, status: 'executed', amount, pool: choice.pool.currency_pair, estApy: choice.estApy });
    }

    if (scopeMe) {
      if (!me) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      await processUser(me);
    } else {
      // scheduled or admin-triggered batch
      const users = await base44.asServiceRole.entities.User.filter({ auto_yield_enabled: true }, '-updated_date', 200);
      for (const u of users) {
        await processUser(u);
      }
    }

    return Response.json({ success: true, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});