import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Use service role for scheduled execution (no end-user context)
    const latestIndex = await base44.asServiceRole.entities.CurrencyIndex.list('-updated_date', 1);
    const idx = latestIndex?.[0];
    const price = Math.max(0, Number(idx?.qtc_unit_price_usd || 0));

    if (!price) {
      return Response.json({ success: true, message: 'No price available' });
    }

    // Fetch active orders
    const activeOrders = await base44.asServiceRole.entities.TradingOrder.filter({ status: 'active' }, '-created_date', 500);

    const fills = [];
    for (const order of activeOrders) {
      const side = order.side; // 'buy' | 'sell'
      const type = order.order_type; // 'stop_loss' | 'take_profit' | 'limit' | 'market'
      const stop = Number(order.stop_price || order.trigger_price || 0);

      let shouldFill = false;
      if (type === 'stop_loss') {
        if (side === 'sell') shouldFill = price <= stop && stop > 0;
        else if (side === 'buy') shouldFill = price >= stop && stop > 0;
      } else if (type === 'take_profit') {
        if (side === 'sell') shouldFill = price >= stop && stop > 0;
        else if (side === 'buy') shouldFill = price <= stop && stop > 0;
      }

      if (shouldFill) {
        const filled = {
          status: 'filled',
          filled_amount: order.amount,
          average_fill_price: price,
          filled_date: new Date().toISOString(),
        };
        await base44.asServiceRole.entities.TradingOrder.update(order.id, filled);

        // Record trade in CurrencyTransaction for history
        const tx = {
          transaction_type: 'trade',
          from_user: order.user_email,
          to_user: 'dex@system',
          amount: order.amount,
          transaction_fee: 0,
          status: 'completed',
          note: `${type.toUpperCase()} ${side} ${order.market_id} @ ${price}`,
          transaction_hash: `tx_${Date.now()}_${Math.floor(Math.random()*100000)}`,
          timestamp: new Date().toISOString(),
        };
        await base44.asServiceRole.entities.CurrencyTransaction.create(tx);

        fills.push({ order_id: order.order_id, price });
      }
    }

    return Response.json({ success: true, fills, price });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});