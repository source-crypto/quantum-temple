import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json().catch(()=>({}));
    const { id } = payload || {};
    if (!id) return Response.json({ error: 'Missing id' }, { status: 400 });
    const rec = await base44.asServiceRole.entities.CrossChainBridge.get(id);
    return Response.json({ bridge: rec });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});