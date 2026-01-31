import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    createClientFromRequest(req); // ensure request is valid
    const env = {
      ETH_RPC_URL: !!Deno.env.get('ETH_RPC_URL'),
      SOLANA_RPC_URL: !!Deno.env.get('SOLANA_RPC_URL'),
      QTC_ERC20_ADDRESS: !!Deno.env.get('QTC_ERC20_ADDRESS'),
      GOVERNOR_ADDRESS_ETH: !!Deno.env.get('GOVERNOR_ADDRESS_ETH'),
      QTC_SOL_MINT: !!Deno.env.get('QTC_SOL_MINT'),
      REALM_PUBKEY_SOL: !!Deno.env.get('REALM_PUBKEY_SOL'),
    };
    const ready = env.ETH_RPC_URL && env.SOLANA_RPC_URL && (env.QTC_ERC20_ADDRESS || env.QTC_SOL_MINT) && (env.GOVERNOR_ADDRESS_ETH || env.REALM_PUBKEY_SOL);
    return Response.json({ ready, env });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});