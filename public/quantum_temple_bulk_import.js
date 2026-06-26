/**
 * ============================================================
 *  QUANTUM TEMPLE — FULL DATABASE BULK IMPORT SCRIPT
 *  Generated: 2026-06-26
 *  Target: Any Base44-compatible app (or BaaS with bulkCreate)
 *
 *  HOW TO USE:
 *  1. Open your NEW app's browser console (or a Node.js script
 *     with the base44 SDK initialized).
 *  2. Paste this entire file and run importAll().
 *  3. The script imports in dependency order — schemas must
 *     already exist on the target network before running.
 *
 *  RLS NOTE: CryptoWallet, CryptoBridge, CoreMemory,
 *  CurrencyMint and ExchangeRate are user-scoped.
 *  Those records will be created under the currently
 *  authenticated user. Make sure you are logged in as
 *  the correct owner before importing those entities.
 * ============================================================
 */

// ── DATASET ──────────────────────────────────────────────────

const DATA = {

  CurrencyIndex: [
    {
      index_name: "Divine Currency Index (DCI)",
      vqc_total_valuation_usd: 560000000000,
      total_qtc_supply: 599827105725661300000,
      qtc_unit_price_usd: 9.336023575035358e-10,
      btc_price_usd: 43000,
      eth_price_usd: 2250,
      qtc_to_btc_rate: 46058152761077.56,
      qtc_to_eth_rate: 2410019621219.175,
      market_cap_rank: 1,
      total_transactions_24h: 0,
      volume_24h_usd: 0,
      price_change_24h: 0,
      circulating_supply: 599827105725661300000,
      last_updated: "2026-05-25T16:55:59.434Z",
      intervention_active: true
    }
  ],

  StrategyVault: [
    {
      name: "Blue",
      creator_email: "cat177357@gmail.com",
      creator_display: "Blue",
      description: "",
      oracle_allocations: [{ oracle_node: "Alpha Oracle", weight_pct: 100 }],
      risk_level: "medium",
      performance_fee_pct: 10,
      auto_compound: true,
      followers_count: 0,
      total_tvl: 0,
      current_apy: 14.8,
      all_time_return_pct: 0,
      is_public: true,
      status: "active"
    }
  ],

  YieldStake: [
    {
      farm_name: "Gamma Stable Vault",
      staker_email: "cat177357@gmail.com",
      lp_tokens_staked: 380,
      rewards_earned: 0,
      unclaimed_rewards: 0,
      stake_date: "2026-05-25T16:52:38.024Z",
      last_claim_date: null,
      locked_until: null,
      is_active: true
    },
    {
      farm_name: "Beta Growth Vault",
      staker_email: "cat177357@gmail.com",
      lp_tokens_staked: 480,
      rewards_earned: 0,
      unclaimed_rewards: 0,
      stake_date: "2026-05-25T16:52:30.422Z",
      last_claim_date: null,
      locked_until: null,
      is_active: true
    },
    {
      farm_name: "Alpha Conservative Vault",
      staker_email: "cat177357@gmail.com",
      lp_tokens_staked: 580,
      rewards_earned: 0,
      unclaimed_rewards: 0,
      stake_date: "2026-05-25T16:52:13.514Z",
      last_claim_date: null,
      locked_until: null,
      is_active: true
    },
    {
      farm_name: "QuantumSwap QTC/USDC Pool Staking",
      staker_email: "system_agent",
      lp_tokens_staked: 100,
      rewards_earned: 0,
      unclaimed_rewards: 0,
      stake_date: "2026-03-07T19:31:00Z",
      last_claim_date: null,
      locked_until: null,
      is_active: true
    }
  ],

  // ── IMPORTANT: CryptoWallet is RLS-protected. ──
  // Run this section while logged in as each respective owner.
  CryptoWallet: [
    {
      user_email: "cat177357@gmail.com",
      bitcoin_address: "bc1qr46v8z89ywzwv3u59svxrkvmln3d48gg5p4m0h",
      ethereum_address: "0x77D10E1CCb98170C7DaDd51a2Ea1bBD24F2e27cD",
      qtc_wallet_address: "QTC-RECOVERED-1766714917244-TVKYUH1",
      seed_phrase_encrypted: "YWlycG9ydCBhbGFybSBhaXIgYWR2aWNlIGFncmVlIGFiaWxpdHkgYWVyb2JpYyBhYnNvcmIgYWRkaWN0IGFib3V0IGFidXNlIGFjdHJlc3M=",
      seed_phrase_length: 12,
      wallet_type: "hd_wallet",
      derivation_path: "m/44'/0'/0'/0/0",
      wallet_recovered: true,
      last_recovery_attempt: "2025-12-26T02:08:37.244Z",
      btc_balance: 88,
      eth_balance: 8080.000033029095,
      qtc_balance: 8000580,
      total_bridged_btc: 0,
      total_bridged_eth: 77778889,
      wallet_verified: true,
      kyc_completed: false,
      last_bridge_date: "2025-11-08T07:46:13.835Z",
      ledger_entries: [
        {
          type: "wallet_generation",
          timestamp: "2025-12-26T02:08:07.729Z",
          derivation_path: "m/44'/0'/0'/0/0",
          quantum_signature: "UVRDLTE3NjY3MTQ4ODc3MjktS1BUM1FCMlhGUC0xNzY2NzE0ODg3NzMz"
        },
        {
          type: "wallet_recovery",
          timestamp: "2025-12-26T02:08:37.245Z",
          seed_length: 12,
          quantum_signature: "UkVDT1ZFUlktUVRDLVJFQ09WRVJFRC0xNzY2NzE0OTE3MjQ0LVRWS1lVSDEtMTc2NjcxNDkxNzI0NQ=="
        }
      ]
    },
    {
      user_email: "classitfiedcia@gmail.com",
      bitcoin_address: "bc1qr46v8z89ywzwv3u59svxrkvmln3d48gg5p4m0h",
      ethereum_address: "",
      qtc_wallet_address: "QTC-1762496351506-OOH3PE7",
      btc_balance: 213800.8412353772,
      eth_balance: 67778878888888,
      qtc_balance: 0,
      total_bridged_btc: 621092882831606300,
      total_bridged_eth: 1,
      wallet_verified: true,
      kyc_completed: true,
      last_bridge_date: "2025-11-07T08:28:12.441Z",
      ledger_entries: []
    }
  ],

  CryptoBridge: [
    {
      bridge_type: "qtc_to_eth",
      source_chain: "quantum_temple",
      destination_chain: "ethereum",
      user_email: "cat177357@gmail.com",
      source_amount: 77778889,
      destination_amount: 3.302909544261144e-05,
      exchange_rate: 4.2507881026960483e-13,
      source_address: "QTC-1762494986638-WUG18D8",
      destination_address: "0x77D10E1CCb98170C7DaDd51a2Ea1bBD24F2e27cD",
      eth_transaction_hash: "ETH-1762587973572-E9FA22HURJ",
      qtc_transaction_hash: "QTC-1762587973572-U2CG4WF9BR",
      status: "completed",
      confirmations: 6,
      bridge_fee: 77778.889,
      quantum_signature: "QlJJREdFLTE3NjI1ODc5NzM1NzItY2F0MTc3MzU3QGdtYWlsLmNvbS03Nzc3ODg4",
      timestamp: "2025-11-08T07:46:13.572Z",
      completion_date: "2025-11-08T07:46:13.572Z"
    }
  ],

  Proposal: [
    {
      proposal_id: "PROP-1762711276508-K3SF3KR",
      title: "LIQUIDITY",
      description: "Convert money from protocol fund usd change from to ETH AND ADD ITS LIQUIDITY INTO HIS POOL..",
      proposal_type: "treasury_allocation",
      proposer_email: "classitfiedcia@gmail.com",
      status: "active",
      voting_start_date: "2025-11-09T18:01:16.509Z",
      voting_end_date: "2025-11-16T18:01:16.509Z",
      total_votes_for: 0,
      total_votes_against: 585512340008273250000,
      total_votes_abstain: 0,
      quorum_required: 1000000,
      approval_threshold: 0.66,
      requested_amount: 244875,
      requested_currency: "ETH"
    },
    {
      proposal_id: "PROP-1762669971312-UL9PTKJ",
      title: "Reserve Funding",
      description: "boj • Protocol funded",
      proposal_type: "treasury_allocation",
      proposer_email: "classitfiedcia@gmail.com",
      status: "active",
      voting_start_date: "2025-11-09T06:32:51.312Z",
      voting_end_date: "2025-11-16T06:32:51.312Z",
      total_votes_for: 710280986587860600000,
      total_votes_against: 0,
      total_votes_abstain: 0,
      quorum_required: 1000000,
      approval_threshold: 0.66,
      requested_amount: 485,
      requested_currency: "ETH"
    },
    {
      proposal_id: "PROP-1762586483451-NC9XZ3F",
      title: "ProtocolFundDashboard",
      description: "Protocol Fund Dashboard integration",
      proposal_type: "international_integration",
      proposer_email: "cat177357@gmail.com",
      status: "active",
      voting_start_date: "2025-11-08T07:21:23.451Z",
      voting_end_date: "2025-11-15T07:21:23.451Z",
      total_votes_for: 585512340008272660000,
      total_votes_against: 0,
      total_votes_abstain: 710280986587860600000,
      quorum_required: 1000000,
      approval_threshold: 0.66,
      requested_amount: 0,
      requested_currency: "QTC"
    }
  ],

  Vote: [
    {
      proposal_id: "PROP-1762711276508-K3SF3KR",
      voter_email: "cat177357@gmail.com",
      vote_choice: "against",
      voting_power: 585512340008273250000,
      vote_timestamp: "2025-11-11T04:21:59.973Z",
      vote_signature: "UFJPUC0xNzYyNzExMjc2NTA4LUszU0YzS1ItY2F0MTc3MzU3QGdtYWlsLmNvbS1h"
    },
    {
      proposal_id: "PROP-1762669971312-UL9PTKJ",
      voter_email: "classitfiedcia@gmail.com",
      vote_choice: "for",
      voting_power: 710280986587860600000,
      vote_timestamp: "2025-11-09T06:33:22.338Z",
      vote_signature: "UFJPUC0xNzYyNjY5OTcxMzEyLVVMOVBUS0otY2xhc3NpdGZpZWRjaWFAZ21haWwu"
    },
    {
      proposal_id: "PROP-1762586483451-NC9XZ3F",
      voter_email: "classitfiedcia@gmail.com",
      vote_choice: "abstain",
      voting_power: 710280986587860600000,
      vote_timestamp: "2025-11-09T06:25:56.590Z",
      vote_signature: "UFJPUC0xNzYyNTg2NDgzNDUxLU5DOVhaM0YtY2xhc3NpdGZpZWRjaWFAZ21haWwu"
    },
    {
      proposal_id: "PROP-1762586483451-NC9XZ3F",
      voter_email: "cat177357@gmail.com",
      vote_choice: "for",
      voting_power: 585512340008272660000,
      vote_timestamp: "2025-11-08T07:21:41.486Z",
      vote_signature: "UFJPUC0xNzYyNTg2NDgzNDUxLU5DOVhaM0YtY2F0MTc3MzU3QGdtYWlsLmNvbS1m"
    }
  ],

  DivineFavor: [
    {
      staked_amount: 2508,
      favor_level: 25,
      stake_start_date: "2026-02-20T16:51:37.180Z",
      total_rewards_earned: 0,
      unclaimed_rewards: 0,
      total_claimed_qtc: 0,
      interaction_priority: "blessed",
      bonus_multiplier: 1.5,
      last_claim_date: "2026-02-20T16:51:37.180Z",
      last_reward_calculation: "2026-02-20T16:51:37.180Z",
      is_active: true
    },
    {
      staked_amount: 60000,
      favor_level: 100,
      stake_start_date: "2025-12-08T02:42:46.312Z",
      total_rewards_earned: 0,
      unclaimed_rewards: 0,
      total_claimed_qtc: 0,
      interaction_priority: "divine",
      bonus_multiplier: 3,
      last_claim_date: "2025-12-08T02:42:46.312Z",
      last_reward_calculation: "2025-12-08T02:42:46.312Z",
      is_active: true
    },
    {
      staked_amount: 15800,
      favor_level: 100,
      stake_start_date: "2025-11-09T17:26:22.893Z",
      total_rewards_earned: 0,
      unclaimed_rewards: 0,
      total_claimed_qtc: 0,
      interaction_priority: "divine",
      bonus_multiplier: 3,
      last_claim_date: "2025-11-09T17:26:22.896Z",
      last_reward_calculation: "2025-11-09T17:26:22.896Z",
      is_active: true
    },
    {
      staked_amount: 660000,
      favor_level: 100,
      stake_start_date: "2025-11-07T05:59:23.167Z",
      total_rewards_earned: 51480000,
      unclaimed_rewards: 0,
      total_claimed_qtc: 514800,
      interaction_priority: "divine",
      bonus_multiplier: 3,
      last_claim_date: "2025-11-08T08:35:33.987Z",
      last_reward_calculation: "2025-11-08T08:35:33.987Z",
      is_active: false
    }
  ],

  UserBalance: [
    {
      user_email: "cat177357@gmail.com",
      available_balance: 0,
      staked_balance: 0,
      in_escrow: 0,
      total_received: 0,
      total_sent: 0,
      total_minted: 0
    }
  ],

  AccountTier: [
    {
      tier_name: "Genesis",
      tier_level: 1,
      min_balance: 0,
      max_balance: 10000,
      benefits: ["Basic access", "Standard oracle rate"],
      fee_discount_pct: 0,
      is_active: true
    },
    {
      tier_name: "Quantum",
      tier_level: 2,
      min_balance: 10001,
      max_balance: 1000000,
      benefits: ["Priority oracle access", "Reduced fees", "Governance voting"],
      fee_discount_pct: 15,
      is_active: true
    }
  ],

  CoreMemory: [
    {
      payload: { source: "genesis", version: "1.0.0", description: "Quantum Temple Genesis Block" },
      entropy_seed: "qtc-genesis-entropy-2025",
      computed_digest: "genesis-digest-placeholder",
      signature: "genesis-signature-placeholder",
      confirmation_timestamp: "2025-11-07T05:43:33.390Z",
      verified: true,
      note: "Genesis core memory record"
    }
  ],

  Treasury: [
    {
      name: "Quantum Temple Treasury",
      total_usd_value: 0,
      qtc_reserves: 0,
      btc_reserves: 0,
      eth_reserves: 0,
      usdt_reserves: 0,
      is_active: true
    }
  ]
};

// ── IMPORT ENGINE ─────────────────────────────────────────────

async function importEntity(entityName, records) {
  if (!records || records.length === 0) {
    console.log(`⏭  ${entityName}: no records, skipping.`);
    return { skipped: true };
  }

  console.log(`⏳ Importing ${entityName} (${records.length} records)...`);
  try {
    // Chunk into batches of 50 to avoid payload limits
    const chunkSize = 50;
    let imported = 0;
    for (let i = 0; i < records.length; i += chunkSize) {
      const chunk = records.slice(i, i + chunkSize);
      await base44.entities[entityName].bulkCreate(chunk);
      imported += chunk.length;
    }
    console.log(`✅ ${entityName}: ${imported} records imported.`);
    return { success: true, count: imported };
  } catch (err) {
    console.error(`❌ ${entityName} FAILED:`, err.message);
    return { success: false, error: err.message };
  }
}

// Import order matters — reference entities first
const IMPORT_ORDER = [
  'CurrencyIndex',
  'StrategyVault',
  'YieldStake',
  'CryptoWallet',
  'CryptoBridge',
  'Proposal',
  'Vote',
  'DivineFavor',
  'UserBalance',
  'AccountTier',
  'Treasury',
  'CoreMemory'
];

export async function importAll() {
  console.log('🚀 Starting Quantum Temple full database import...\n');
  const results = {};

  for (const entityName of IMPORT_ORDER) {
    if (DATA[entityName]) {
      results[entityName] = await importEntity(entityName, DATA[entityName]);
    }
  }

  console.log('\n════════════════════════════════');
  console.log('📦 IMPORT COMPLETE — Summary:');
  console.log('════════════════════════════════');
  for (const [name, result] of Object.entries(results)) {
    if (result.skipped)  console.log(`  ⏭  ${name}: skipped (empty)`);
    else if (result.success) console.log(`  ✅ ${name}: ${result.count} records`);
    else console.log(`  ❌ ${name}: FAILED — ${result.error}`);
  }
  console.log('════════════════════════════════\n');
  return results;
}

// ── INDIVIDUAL ENTITY IMPORTERS (run separately if needed) ────

export const importStrategyVaults = () => importEntity('StrategyVault', DATA.StrategyVault);
export const importYieldStakes    = () => importEntity('YieldStake', DATA.YieldStake);
export const importCurrencyIndex  = () => importEntity('CurrencyIndex', DATA.CurrencyIndex);
export const importWallets        = () => importEntity('CryptoWallet', DATA.CryptoWallet);
export const importBridges        = () => importEntity('CryptoBridge', DATA.CryptoBridge);
export const importProposals      = () => importEntity('Proposal', DATA.Proposal);
export const importVotes          = () => importEntity('Vote', DATA.Vote);
export const importDivineFavor    = () => importEntity('DivineFavor', DATA.DivineFavor);
export const importTreasury       = () => importEntity('Treasury', DATA.Treasury);
export const importCoreMemory     = () => importEntity('CoreMemory', DATA.CoreMemory);

// ── SCHEMA REFERENCE ──────────────────────────────────────────
//
//  Before running this script, ensure these entities exist
//  on the target network with the following required fields:
//
//  StrategyVault  : name*, creator_email*, risk_level, status
//  YieldStake     : farm_name*, staker_email*, lp_tokens_staked*
//  CurrencyIndex  : index_name*, vqc_total_valuation_usd*, total_qtc_supply*, qtc_unit_price_usd*
//  CryptoWallet   : user_email*  [RLS: owner only]
//  CryptoBridge   : bridge_type*, source_chain*, destination_chain*, user_email*, source_amount*, destination_amount*  [RLS]
//  Proposal       : proposal_id*, title*, description*, proposal_type*, proposer_email*
//  Vote           : proposal_id*, voter_email*, vote_choice*, voting_power*
//  DivineFavor    : staked_amount*, favor_level*, stake_start_date*
//  UserBalance    : user_email*
//  AccountTier    : tier_name*, tier_level*
//  Treasury       : name*
//  CoreMemory     : payload*, entropy_seed*, computed_digest*, signature*, confirmation_timestamp*  [RLS]
//
//  Fields marked * are required (will fail without them).
//
// ── END OF SCRIPT ─────────────────────────────────────────────
