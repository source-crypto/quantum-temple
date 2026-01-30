import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Sync Quantum Temple members (app users) to HubSpot contacts
// Admin-only: verifies the caller is an admin before proceeding
// Optional payload: { limit?: number, dryRun?: boolean }
// - limit: max users to process (default 500)
// - dryRun: if true, does not write to HubSpot, only reports intended actions
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me();

    if (!me) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (me.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    let payload = {};
    try {
      payload = await req.json();
    } catch (_) {
      // no body provided
      payload = {};
    }

    const limit = typeof payload.limit === 'number' && payload.limit > 0 ? Math.min(payload.limit, 2000) : 500;
    const dryRun = Boolean(payload.dryRun);

    // Get HubSpot access token via app connector
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('hubspot');
    if (!accessToken) {
      return Response.json({ error: 'HubSpot connector not authorized' }, { status: 400 });
    }

    // Fetch users (members). Using service role to bypass per-user RLS while already admin-checked.
    const users = await base44.asServiceRole.entities.User.list('-created_date', limit);

    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    const results = [];

    const splitName = (full) => {
      if (!full || typeof full !== 'string') return { firstname: '', lastname: '' };
      const parts = full.trim().split(/\s+/);
      if (parts.length === 1) return { firstname: parts[0], lastname: '' };
      return { firstname: parts[0], lastname: parts.slice(1).join(' ') };
    };

    for (const u of users) {
      const email = u?.email?.trim();
      if (!email) {
        results.push({ email: null, action: 'skipped', reason: 'missing_email' });
        continue;
      }

      const { firstname, lastname } = splitName(u.full_name || '');

      // Search by email
      const searchBody = {
        filterGroups: [
          {
            filters: [
              { propertyName: 'email', operator: 'EQ', value: email }
            ]
          }
        ],
        properties: ['email']
      };

      let existingId = null;
      try {
        const searchRes = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
          method: 'POST',
          headers,
          body: JSON.stringify(searchBody)
        });
        if (!searchRes.ok) {
          const txt = await searchRes.text();
          results.push({ email, action: 'error', step: 'search', status: searchRes.status, details: txt });
          continue;
        }
        const searchJson = await searchRes.json();
        existingId = (searchJson?.results?.[0]?.id) || null;
      } catch (e) {
        results.push({ email, action: 'error', step: 'search', details: String(e) });
        continue;
      }

      // Prepare contact payload
      const contactProps = {
        email,
        firstname,
        lastname,
      };

      if (dryRun) {
        results.push({ email, action: existingId ? 'would_update' : 'would_create', contactId: existingId });
        continue;
      }

      if (existingId) {
        // Update
        try {
          const updRes = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${existingId}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ properties: contactProps })
          });
          if (!updRes.ok) {
            const txt = await updRes.text();
            results.push({ email, action: 'error', step: 'update', status: updRes.status, details: txt, contactId: existingId });
            continue;
          }
          const updJson = await updRes.json();
          results.push({ email, action: 'updated', contactId: updJson?.id || existingId });
        } catch (e) {
          results.push({ email, action: 'error', step: 'update', details: String(e), contactId: existingId });
        }
      } else {
        // Create
        try {
          const crtRes = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
            method: 'POST',
            headers,
            body: JSON.stringify({ properties: contactProps })
          });
          if (!crtRes.ok) {
            const txt = await crtRes.text();
            results.push({ email, action: 'error', step: 'create', status: crtRes.status, details: txt });
            continue;
          }
          const crtJson = await crtRes.json();
          results.push({ email, action: 'created', contactId: crtJson?.id || null });
        } catch (e) {
          results.push({ email, action: 'error', step: 'create', details: String(e) });
        }
      }
    }

    const summary = results.reduce((acc, r) => {
      acc.total++;
      if (r.action === 'created') acc.created++;
      else if (r.action === 'updated') acc.updated++;
      else if (r.action === 'skipped') acc.skipped++;
      else if (r.action?.startsWith('would_')) acc.dryRunCount++;
      else if (r.action === 'error') acc.errors++;
      return acc;
    }, { total: 0, created: 0, updated: 0, skipped: 0, errors: 0, dryRunCount: 0 });

    return Response.json({ ok: true, summary, results, dryRun });
  } catch (error) {
    return Response.json({ error: error?.message || String(error) }, { status: 500 });
  }
});