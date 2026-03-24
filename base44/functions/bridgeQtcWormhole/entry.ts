import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json().catch(()=>({}));
    const { source_chain, destination_chain, amount, destination_address } = payload || {};

    if (!source_chain || !destination_chain || !amount) {
      return Response.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const ETH_RPC_URL = Deno.env.get('ETH_RPC_URL');
    const SOLANA_RPC_URL = Deno.env.get('SOLANA_RPC_URL');
    const QTC_ERC20_ADDRESS = Deno.env.get('QTC_ERC20_ADDRESS');
    const QTC_SOL_MINT = Deno.env.get('QTC_SOL_MINT');

    const ready = !!ETH_RPC_URL && !!SOLANA_RPC_URL && (!!QTC_ERC20_ADDRESS || !!QTC_SOL_MINT);

    // Create bridge record (initiated)
    const record = await base44.asServiceRole.entities.CrossChainBridge.create({
      bridge_id: `qtc_${Date.now()}`,
      user_email: (await base44.auth.me())?.email || 'anonymous',
      source_chain: source_chain,
      destination_chain: destination_chain,
      source_currency: 'QTC',
      destination_currency: 'QTC',
      source_amount: Number(amount),
      destination_amount: 0,
      exchange_rate: 1,
      gas_fee_native: 0,
      gas_fee_usd: 0,
      estimated_time_minutes: 10,
      status: ready ? 'confirming' : 'initiated',
      source_address: undefined,
      destination_address: destination_address,
      initiated_at: new Date().toISOString(),
      note: 'Pending on-chain integration (Wormhole/LayerZero)'
    });

    if (!ready) {
      return Response.json({ status: 'config_required', bridge: record });
    }

    // TODO: Wire Wormhole/LayerZero here using ETH_RPC_URL/SOLANA_RPC_URL + contracts
    // For now, return the created record
    return Response.json({ status: 'in_progress', bridge: record });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});