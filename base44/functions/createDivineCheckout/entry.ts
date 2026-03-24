import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@13.11.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecret) {
      return Response.json({ error: 'Stripe secret key not configured' }, { status: 500 });
    }
    const stripe = new Stripe(stripeSecret, { apiVersion: '2023-10-16' });

    let body = {};
    try { body = await req.json(); } catch { body = {}; }

    const appId = Deno.env.get('BASE44_APP_ID') || 'unknown_app';

    const TIERS = {
      seed: { label: 'Seed', amount_cents: 1000 },      // $10.00
      adept: { label: 'Adept', amount_cents: 5000 },    // $50.00
      oracle: { label: 'Oracle', amount_cents: 15000 }, // $150.00
    };

    const tierKey = (body.tier || '').toLowerCase();
    let amountCents = Number(body.amount_usd_cents || 0);

    if (tierKey && TIERS[tierKey]) {
      amountCents = TIERS[tierKey].amount_cents;
    }

    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      return Response.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Guard: if running inside the app preview iframe, frontend must block redirect. Still allow session creation.
    const origin = body.origin || req.headers.get('origin') || 'https://app.base44.dev';
    const successUrl = `${origin}/Checkout?status=success`;
    const cancelUrl = `${origin}/Checkout?status=cancelled`;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: body.description || 'Divine Currency' },
            unit_amount: Math.round(amountCents),
          },
          quantity: 1,
        },
      ],
      metadata: {
        base44_app_id: appId,
        tier: tierKey || 'custom',
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    // Log intent in AppLog (service role)
    try {
      await base44.asServiceRole.entities.AppLog.create({
        type: 'integration',
        message: 'Stripe checkout session created',
        source: 'createDivineCheckout',
        details: { amount_cents: amountCents, tier: tierKey || 'custom', session_id: session.id },
      });
    } catch (_) { /* non-fatal */ }

    return Response.json({ url: session.url, id: session.id });
  } catch (error) {
    return Response.json({ error: error?.message || String(error) }, { status: 500 });
  }
});