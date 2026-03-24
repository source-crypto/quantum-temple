import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

async function postToSlack(accessToken, channel, text) {
  if (!channel) throw new Error('Missing Slack channel');
  const res = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ channel, text })
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'Slack API error');
  return data;
}

async function postToLinkedIn(accessToken, targetUrn, text) {
  if (!targetUrn) throw new Error('Missing LinkedIn URN');
  // Simple member/org text post via UGC API
  const body = {
    author: targetUrn,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text },
        shareMediaCategory: 'NONE'
      }
    },
    visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "CONNECTIONS" }
  };
  const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const errTxt = await res.text();
    throw new Error(`LinkedIn error: ${res.status} ${errTxt}`);
  }
  return await res.json();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow scheduled runs (no user), but enforce admin on manual invocations
    let user = null;
    try { user = await base44.auth.me(); } catch (_) { /* scheduled invocations may lack user */ }
    const isManualCall = req.method !== 'GET';
    if (isManualCall && user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const nowIso = new Date().toISOString();
    const broadcasts = await base44.asServiceRole.entities.Broadcast.filter({ status: 'scheduled' }, '-schedule_time', 100);

    const results = [];
    for (const b of broadcasts) {
      const due = !b.schedule_time || new Date(b.schedule_time) <= new Date();
      if (!due) continue;

      const text = `${b.title}\n\n${b.message}`;
      const stats = { slack: null, linkedin: null, email: null, in_app: null };
      const errors = [];

      // Slack
      if (b.channels?.includes('slack')) {
        try {
          const token = await base44.asServiceRole.connectors.getAccessToken('slack');
          const resp = await postToSlack(token, b.slack_channel, text);
          stats.slack = { ok: true, ts: resp.ts };
        } catch (e) { stats.slack = { ok: false, error: String(e?.message || e) }; errors.push(`slack:${String(e?.message||e)}`); }
      }

      // LinkedIn
      if (b.channels?.includes('linkedin')) {
        try {
          const token = await base44.asServiceRole.connectors.getAccessToken('linkedin');
          const resp = await postToLinkedIn(token, b.linkedin_urn, text);
          stats.linkedin = { ok: true, id: resp?.id || null };
        } catch (e) { stats.linkedin = { ok: false, error: String(e?.message || e) }; errors.push(`linkedin:${String(e?.message||e)}`); }
      }

      // Email
      if (b.channels?.includes('email') && Array.isArray(b.email_recipients) && b.email_recipients.length) {
        const sent = [];
        for (const to of b.email_recipients) {
          try {
            await base44.asServiceRole.integrations.Core.SendEmail({ to, subject: b.title, body: b.message });
            sent.push({ to, ok: true });
          } catch (e) {
            sent.push({ to, ok: false, error: String(e?.message||e) });
            errors.push(`email:${to}:${String(e?.message||e)}`);
          }
        }
        stats.email = { sent };
      }

      // In-app: handled by clients reading recent sent broadcasts; nothing to call
      if (b.channels?.includes('in_app')) {
        stats.in_app = { ok: true, activated_at: nowIso };
      }

      const newStatus = errors.length ? 'failed' : 'sent';
      const updated = await base44.asServiceRole.entities.Broadcast.update(b.id, { status: newStatus, stats, processed_at: nowIso });
      results.push({ id: b.id, status: newStatus, stats });
    }

    return Response.json({ processed: results.length, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});