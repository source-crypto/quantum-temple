import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@13.11.0';

Deno.serve(async (req) => {
  const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  if (!stripeSecret || !webhookSecret) {
    return Response.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  const stripe = new Stripe(stripeSecret, { apiVersion: '2023-10-16' });

  let bodyText;
  try {
    bodyText = await req.text();
  } catch (e) {
    return Response.json({ error: 'Invalid body' }, { status: 400 });
  }

  const sig = req.headers.get('stripe-signature');
  if (!sig) return Response.json({ error: 'Missing signature' }, { status: 400 });

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(bodyText, sig, webhookSecret);
  } catch (err) {
    return Response.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 });
  }

  const base44 = createClientFromRequest(req);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        // Record finance sync via AppLog
        await base44.asServiceRole.entities.AppLog.create({
          type: 'integration',
          message: 'Stripe checkout completed',
          source: 'stripeWebhook',
          details: {
            session_id: session.id,
            amount_total: session.amount_total,
            currency: session.currency,
            customer_email: session.customer_details?.email || null,
            metadata: session.metadata || {},
            payment_status: session.payment_status,
          }
        });
        // Attempt to grant AccountTier based on tier/amount
        try {
          const email = session.customer_details?.email || null;
          if (email) {
            let tier = (session.metadata?.tier || '').toLowerCase();
            if (!tier) {
              const amt = Number(session.amount_total || 0);
              if (amt >= 15000) tier = 'oracle';
              else if (amt >= 5000) tier = 'adept';
              else if (amt > 0) tier = 'seed';
            }
            if (tier) {
              const existing = await base44.asServiceRole.entities.AccountTier.filter({ user_email: email });
              if (existing.length) {
                await base44.asServiceRole.entities.AccountTier.update(existing[0].id, { user_email: email, tier });
              } else {
                await base44.asServiceRole.entities.AccountTier.create({ user_email: email, tier });
              }
            }
          }
        } catch (grantErr) {
          await base44.asServiceRole.entities.AppLog.create({
            type: 'warning',
            message: 'Tier grant failed',
            source: 'stripeWebhook',
            details: { error: String(grantErr) }
          });
        }
        break;
      }
      case 'payment_intent.succeeded': {
        const pi = event.data.object;
        await base44.asServiceRole.entities.AppLog.create({
          type: 'integration',
          message: 'Stripe payment succeeded',
          source: 'stripeWebhook',
          details: {
            payment_intent: pi.id,
            amount: pi.amount,
            currency: pi.currency,
            customer: pi.customer,
            metadata: pi.metadata || {},
          }
        });
        break;
      }
      default:
        // Optionally log other events at a lower verbosity
        break;
    }
  } catch (e) {
    // Log errors for easier debugging
    try {
      await base44.asServiceRole.entities.AppLog.create({
        type: 'error',
        message: 'Stripe webhook handler error',
        source: 'stripeWebhook',
        details: { eventType: event?.type, error: String(e) }
      });
    } catch (_) {}
    return Response.json({ received: true, error: String(e) }, { status: 200 });
  }

  return Response.json({ received: true }, { status: 200 });
});