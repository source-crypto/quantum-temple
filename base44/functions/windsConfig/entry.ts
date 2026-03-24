import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

function readEnv(name, def = '') {
  const v = Deno.env.get(name);
  return (v ?? def).trim();
}

async function probeRpc(rpcUrl) {
  if (!rpcUrl) return { rpc_ok: false, chain_id_remote: null, error: 'no_rpc' };
  try {
    const payload = {
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_chainId',
      params: []
    };
    const res = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json().catch(() => ({}));
    const hexId = json?.result;
    let chainIdRemote = null;
    if (typeof hexId === 'string' && hexId.startsWith('0x')) {
      try { chainIdRemote = parseInt(hexId, 16); } catch (_) { chainIdRemote = null; }
    }
    return { rpc_ok: !!chainIdRemote, chain_id_remote: chainIdRemote || null };
  } catch (e) {
    return { rpc_ok: false, chain_id_remote: null, error: String(e) };
  }
}

Deno.serve(async (req) => {
  let base44;
  try {
    base44 = createClientFromRequest(req);
  } catch (_) {
    // continue without auth context
  }

  try {
    const rpc_url = readEnv('WINDS_RPC_URL');
    const chainIdStr = readEnv('WINDS_CHAIN_ID');
    const chain_id = (() => { const n = Number(chainIdStr || ''); return Number.isFinite(n) ? n : null; })();

    const configured = {
      rpc_url,
      chain_id,
      qtc_erc20_address: readEnv('WINDS_QTC_ERC20_ADDRESS'),
      router_address: readEnv('WINDS_ROUTER_ADDRESS'),
      quoter_v3_address: readEnv('WINDS_V3_QUOTER_ADDRESS'),
      router_v3_address: readEnv('WINDS_V3_ROUTER_ADDRESS'),
    };

    const healthProbe = await probeRpc(rpc_url);
    const health = {
      target_rpc: rpc_url || null,
      ...healthProbe,
      timestamp: new Date().toISOString(),
    };

    return Response.json({ configured, health }, { status: 200 });
  } catch (error) {
    try {
      if (base44) {
        await base44.asServiceRole.entities.AppLog.create({
          type: 'integration',
          severity: 'error',
          source: 'windsConfig',
          message: 'windsConfig failed',
          details: { error: String(error) },
          timestamp: new Date().toISOString(),
        });
      }
    } catch (_) {}
    return Response.json({ error: (error && error.message) || String(error) }, { status: 500 });
  }
});