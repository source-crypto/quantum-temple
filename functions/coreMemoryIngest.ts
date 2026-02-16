import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Helper: stable stringify to avoid key-order issues
function stableStringify(obj) {
  if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) return '[' + obj.map(stableStringify).join(',') + ']';
  const keys = Object.keys(obj).sort();
  const entries = keys.map(k => JSON.stringify(k) + ':' + stableStringify(obj[k]));
  return '{' + entries.join(',') + '}';
}

async function sha256Hex(input) {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const bytes = new Uint8Array(hash);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // Public app: authentication optional; allow service/automations too
    await base44.auth.me().catch(() => null);

    const body = await req.json().catch(() => ({}));
    const { payload, entropySeed, sealed, confirm, expected_digest, note } = body || {};

    if (!payload || !entropySeed) {
      return Response.json({ error: 'payload and entropySeed are required' }, { status: 400 });
    }

    const normalized = stableStringify(payload);
    const computedDigest = await sha256Hex(`${normalized}|${entropySeed}`);

    if (!confirm) {
      // Preview step only: return digest and whether sealed matches
      return Response.json({
        mode: 'preview',
        computed_digest: computedDigest,
        matches_sealed: sealed ? String(sealed).toLowerCase() === computedDigest : null,
        message: 'Call again with confirm=true to persist. Optionally include expected_digest to enforce consistency.'
      });
    }

    // Confirmation path
    if (expected_digest && expected_digest !== computedDigest) {
      return Response.json({ error: 'expected_digest mismatch' }, { status: 409 });
    }

    const ts = new Date().toISOString();
    const signature = await sha256Hex(`${computedDigest}|${ts}`);
    const verified = sealed ? String(sealed).toLowerCase() === computedDigest : true;

    const record = await base44.asServiceRole.entities.CoreMemory.create({
      payload,
      entropy_seed: entropySeed,
      sealed: sealed || null,
      computed_digest: computedDigest,
      signature,
      verified,
      confirmation_timestamp: ts,
      note: note || null,
    });

    return Response.json({ mode: 'confirm', id: record.id, verified, signature, confirmation_timestamp: ts });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});