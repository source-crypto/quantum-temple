
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Repeat, ArrowRightLeft, Loader2, CheckCircle, Bitcoin, Wallet, TrendingUp, Link as LinkIcon, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format }                       from "date-fns";

export default function CryptoExchange({ totalSupply }) {
  const [bridgeDirection, setBridgeDirection] = useState("to_qtc");
  const [sourceAmount, setSourceAmount] = useState("");
  const [sourceCurrency, setSourceCurrency] = useState("BTC");
  const [btcAddress, setBtcAddress] = useState("");
  const [ethAddress, setEthAddress] = useState("");
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: cryptoWallet } = useQuery({
    queryKey: ['cryptoWallet'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const wallets = await base44.entities.CryptoWallet.filter({ user_email: user.email });
      if (wallets.length > 0) return wallets[0];
      
      return base44.entities.CryptoWallet.create({
        user_email: user.email,
        qtc_wallet_address: `QTC-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        bitcoin_address: "",
        ethereum_address: ""
      });
    },
  });

  const { data: liquidityPools, isLoading: poolsLoading } = useQuery({
    queryKey: ['liquidityPools'],
    queryFn: async () => {
      // Get currency index for accurate rates
      const indices = await base44.entities.CurrencyIndex.list();
      let index;
      
      if (indices.length > 0) {
        index = indices[0];
      } else {
        // Create index if doesn't exist
        const safeTotalSupply = totalSupply && totalSupply > 0 ? totalSupply : 1; // Ensure totalSupply is not zero or undefined
        const vqcValuation = 560000000000;
        const qtcUnitPrice = vqcValuation / safeTotalSupply;
        const btcPrice = 43000;
        const ethPrice = 2250;
        
        index = await base44.entities.CurrencyIndex.create({
          index_name: "Divine Currency Index (DCI)",
          vqc_total_valuation_usd: vqcValuation,
          total_qtc_supply: safeTotalSupply,
          qtc_unit_price_usd: qtcUnitPrice,
          btc_price_usd: btcPrice,
          eth_price_usd: ethPrice,
          qtc_to_btc_rate: qtcUnitPrice / btcPrice, // QTC per BTC
          qtc_to_eth_rate: qtcUnitPrice / ethPrice, // QTC per ETH
          market_cap_rank: 1,
          circulating_supply: safeTotalSupply,
          last_updated: new Date().toISOString(),
          intervention_active: true
        });
      }
      
      // Get or create liquidity pools with index-based rates
      let pools = await base44.entities.CrossChainLiquidity.filter({ pool_status: "active" });
      
      const btcPoolRate = index.qtc_to_btc_rate !== 0 ? (1 / index.qtc_to_btc_rate) : 0; // BTC per QTC
      const ethPoolRate = index.qtc_to_eth_rate !== 0 ? (1 / index.qtc_to_eth_rate) : 0; // ETH per QTC

      if (pools.length === 0) {
        const btcPool = await base44.entities.CrossChainLiquidity.create({
          pool_name: "QTC/BTC Liquidity Pool",
          currency_pair: "QTC/BTC",
          qtc_liquidity: 1000000,
          paired_liquidity: 25.5,
          current_exchange_rate: btcPoolRate,
          pool_status: "active",
          last_updated: new Date().toISOString()
        });
        
        const ethPool = await base44.entities.CrossChainLiquidity.create({
          pool_name: "QTC/ETH Liquidity Pool",
          currency_pair: "QTC/ETH",
          qtc_liquidity: 1000000,
          paired_liquidity: 385.2,
          current_exchange_rate: ethPoolRate,
          pool_status: "active",
          last_updated: new Date().toISOString()
        });
        
        pools = [btcPool, ethPool];
      } else {
        // Update pools with index-based rates
        for (const pool of pools) {
          const rate = pool.currency_pair === "QTC/BTC" 
            ? btcPoolRate 
            : ethPoolRate;
          
          await base44.entities.CrossChainLiquidity.update(pool.id, {
            current_exchange_rate: rate,
            last_updated: new Date().toISOString()
          });
        }
        
        // Refetch with updated rates
        pools = await base44.entities.CrossChainLiquidity.filter({ pool_status: "active" });
      }
      
      return pools;
    },
    initialData: [],
  });

  const { data: bridges, isLoading: bridgesLoading } = useQuery({
    queryKey: ['cryptoBridges'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.CryptoBridge.filter({ user_email: user.email }, '-created_date', 20);
    },
    initialData: [],
  });

  const currentPool = liquidityPools.find(p => 
    p.currency_pair === `QTC/${sourceCurrency}`
  );

  const calculateDestinationAmount = () => {
    if (!sourceAmount || !currentPool || currentPool.current_exchange_rate === 0) return 0;
    const amt = parseFloat(sourceAmount);
    if (isNaN(amt)) return 0;
    
    // Applying 0.1% bridge fee
    const fee = 0.001; // 0.1%
    
    if (bridgeDirection === "to_qtc") {
      // Source is BTC/ETH, destination is QTC
      // current_exchange_rate is (BTC/ETH per QTC), so 1 QTC = X BTC/ETH
      // To get QTC from BTC/ETH, we do amt / (current_exchange_rate)
      // Destination amount = (amount of BTC/ETH) / (BTC/ETH per QTC) = (amount of QTC)
      const grossAmount = amt / currentPool.current_exchange_rate;
      return grossAmount - (grossAmount * fee);
    } else {
      // Source is QTC, destination is BTC/ETH
      // Destination amount = (amount of QTC) * (BTC/ETH per QTC)
      const grossAmount = amt * currentPool.current_exchange_rate;
      return grossAmount - (grossAmount * fee);
    }
  };

  const destinationAmount = calculateDestinationAmount();

  const bridgeMutation = useMutation({
    mutationFn: async (data) => {
      const currentUser = await base44.auth.me();
      
      if (!currentPool || currentPool.current_exchange_rate === 0) {
        throw new Error("Liquidity pool not available or rate is zero.");
      }

      const bridgeType = data.direction === "to_qtc" 
        ? `${data.sourceCurrency.toLowerCase()}_to_qtc`
        : `qtc_to_${data.sourceCurrency.toLowerCase()}`;

      const sourceChain = data.direction === "to_qtc" 
        ? data.sourceCurrency.toLowerCase() === "btc" ? "bitcoin" : "ethereum"
        : "quantum_temple";

      const destChain = data.direction === "to_qtc"
        ? "quantum_temple"
        : data.sourceCurrency.toLowerCase() === "btc" ? "bitcoin" : "ethereum";

      const sourceAddr = data.direction === "to_qtc"
        ? (data.sourceCurrency === "BTC" ? data.btcAddress : data.ethAddress)
        : cryptoWallet?.qtc_wallet_address;

      const destAddr = data.direction === "to_qtc"
        ? cryptoWallet?.qtc_wallet_address
        : (data.sourceCurrency === "BTC" ? data.btcAddress : data.ethAddress);

      const signature = btoa(
        `BRIDGE-${Date.now()}-${currentUser.email}-${data.sourceAmount}`
      ).substring(0, 64);

      const qtcTxHash = `QTC-${Date.now()}-${Math.random().toString(36).substring(2, 15).toUpperCase()}`;
      const btcTxHash = data.sourceCurrency === "BTC" 
        ? `BTC-${Date.now()}-${Math.random().toString(36).substring(2, 15).toUpperCase()}`
        : undefined;
      const ethTxHash = data.sourceCurrency === "ETH"
        ? `ETH-${Date.now()}-${Math.random().toString(36).substring(2, 15).toUpperCase()}`
        : undefined;

      const feeAmount = data.sourceAmount * 0.001; // 0.1% fee on source amount

      const bridge = await base44.entities.CryptoBridge.create({
        bridge_type: bridgeType,
        source_chain: sourceChain,
        destination_chain: destChain,
        user_email: currentUser.email,
        source_amount: data.sourceAmount,
        destination_amount: data.destinationAmount,
        exchange_rate: currentPool.current_exchange_rate,
        source_address: sourceAddr,
        destination_address: destAddr,
        btc_transaction_hash: btcTxHash,
        eth_transaction_hash: ethTxHash,
        qtc_transaction_hash: qtcTxHash,
        status: "completed",
        confirmations: 6,
        bridge_fee: feeAmount,
        quantum_signature: signature,
        timestamp: new Date().toISOString(),
        completion_date: new Date().toISOString()
      });

      if (data.direction === "to_qtc") {
        const balances = await base44.entities.UserBalance.filter({ user_email: currentUser.email });
        if (balances.length > 0) {
          await base44.entities.UserBalance.update(balances[0].id, {
            available_balance: (balances[0].available_balance || 0) + data.destinationAmount,
            total_received: (balances[0].total_received || 0) + data.destinationAmount
          });
        }
      }

      if (cryptoWallet) {
        const updates = {
          last_bridge_date: new Date().toISOString()
        };
        
        if (data.sourceCurrency === "BTC") {
          updates.total_bridged_btc = (cryptoWallet.total_bridged_btc || 0) + data.sourceAmount;
          // In 'to_qtc' direction, BTC is spent from an external wallet, not cryptoWallet.btc_balance
          // In 'from_qtc' direction, BTC is received into cryptoWallet.btc_balance
          if (data.direction === "from_qtc") {
            updates.btc_balance = (cryptoWallet.btc_balance || 0) + data.destinationAmount;
          }
        } else if (data.sourceCurrency === "ETH") {
          updates.total_bridged_eth = (cryptoWallet.total_bridged_eth || 0) + data.sourceAmount;
          // Same logic for ETH
          if (data.direction === "from_qtc") {
            updates.eth_balance = (cryptoWallet.eth_balance || 0) + data.destinationAmount;
          }
        }
        
        await base44.entities.CryptoWallet.update(cryptoWallet.id, updates);
      }

      await base44.entities.CrossChainLiquidity.update(currentPool.id, {
        total_volume_24h: (currentPool.total_volume_24h || 0) + data.destinationAmount,
        total_transactions: (currentPool.total_transactions || 0) + 1,
        last_updated: new Date().toISOString()
      });

      return bridge;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cryptoBridges'] });
      queryClient.invalidateQueries({ queryKey: ['cryptoWallet'] });
      queryClient.invalidateQueries({ queryKey: ['liquidityPools'] });
      queryClient.invalidateQueries({ queryKey: ['userBalance'] });
      setSourceAmount("");
      toast.success("Bridge completed!", {
        description: "Cross-chain transaction successful"
      });
    },
    onError: (error) => {
      toast.error("Bridge failed", {
        description: error.message
      });
    }
  });

  const saveWalletMutation = useMutation({
    mutationFn: async (addresses) => {
      if (!cryptoWallet) throw new Error("Wallet not initialized");
      
      return base44.entities.CryptoWallet.update(cryptoWallet.id, {
        bitcoin_address: addresses.btcAddress,
        ethereum_address: addresses.ethAddress,
        wallet_verified: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cryptoWallet'] });
      toast.success("Wallets connected!", {
        description: "Your crypto addresses have been saved"
      });
    }
  });

  const handleBridge = () => {
    const amt = parseFloat(sourceAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Invalid amount");
      return;
    }

    if (!currentPool || currentPool.current_exchange_rate === 0) {
      toast.error("Liquidity pool not ready or rate is zero. Please try again later.");
      return;
    }

    if (bridgeDirection === "to_qtc") {
      if (sourceCurrency === "BTC" && !btcAddress) {
        toast.error("Bitcoin address required for bridging FROM Bitcoin.");
        return;
      }
      if (sourceCurrency === "ETH" && !ethAddress) {
        toast.error("Ethereum address required for bridging FROM Ethereum.");
        return;
      }
    } else { // from_qtc
      if (sourceCurrency === "BTC" && !btcAddress) {
        toast.error("Bitcoin address required to receive funds.");
        return;
      }
      if (sourceCurrency === "ETH" && !ethAddress) {
        toast.error("Ethereum address required to receive funds.");
        return;
      }
    }

    bridgeMutation.mutate({
      direction: bridgeDirection,
      sourceCurrency,
      sourceAmount: amt,
      destinationAmount,
      btcAddress,
      ethAddress
    });
  };

  const handleSaveWallets = () => {
    if (!btcAddress && !ethAddress) {
      toast.error("Please enter at least one address");
      return;
    }
    saveWalletMutation.mutate({ btcAddress, ethAddress });
  };

  const cryptoCurrencies = [
    { id: "BTC", name: "Bitcoin", icon: "₿", color: "from-orange-500 to-amber-500" },
    { id: "ETH", name: "Ethereum", icon: "Ξ", color: "from-blue-500 to-indigo-500" }
  ];

  return (
    <div className="space-y-6">
      {/* Index Info Banner */}
      <div className="p-4 bg-gradient-to-r from-indigo-950/40 to-purple-950/40 rounded-lg border border-indigo-500/30">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-indigo-200 mb-1">Index-Based Exchange Rates</h4>
            <p className="text-sm text-indigo-300/70">
              All cross-chain rates are calculated from the $560 billion VQC index valuation, 
              ensuring consistent pricing across Bitcoin, Ethereum, and Quantum Temple Currency networks.
            </p>
          </div>
        </div>
      </div>

      {/* Liquidity Pools Overview */}
      <div className="grid md:grid-cols-2 gap-4">
        {liquidityPools.map((pool, index) => (
          <motion.div
            key={pool.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-slate-900/60 border-orange-900/40 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Repeat className="w-5 h-5 text-orange-400" />
                    <span className="font-semibold text-orange-200">{pool.currency_pair}</span>
                  </div>
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                    Active
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2 bg-slate-950/50 rounded border border-orange-900/30">
                    <div className="text-xs text-orange-400/70">Rate</div>
                    <div className="text-sm font-semibold text-orange-300">
                      {pool.current_exchange_rate.toFixed(8)}
                      {pool.currency_pair.includes("BTC") ? " BTC/QTC" : " ETH/QTC"}
                    </div>
                  </div>
                  <div className="p-2 bg-slate-950/50 rounded border border-orange-900/30">
                    <div className="text-xs text-orange-400/70">24h Volume</div>
                    <div className="text-sm font-semibold text-orange-300">
                      {pool.total_volume_24h?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || 0} QTC
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Wallet Setup */}
        <Card className="bg-slate-900/60 border-orange-900/40 backdrop-blur-sm">
          <CardHeader className="border-b border-orange-900/30">
            <CardTitle className="flex items-center gap-2 text-orange-200">
              <Wallet className="w-5 h-5" />
              Connect Crypto Wallets
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {cryptoWallet?.qtc_wallet_address && (
              <div className="p-3 bg-purple-950/30 rounded-lg border border-purple-500/30">
                <div className="text-xs text-purple-400/70 mb-1 flex items-center gap-2">
                  <Badge className="bg-purple-500/20 text-purple-300">QTC</Badge>
                  Your Quantum Wallet
                </div>
                <div className="text-xs text-purple-300 font-mono break-all">
                  {cryptoWallet.qtc_wallet_address}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="btc-address" className="text-purple-300 flex items-center gap-2">
                <span className="text-orange-400">₿</span>
                Bitcoin Address
              </Label>
              <Input
                id="btc-address"
                value={btcAddress}
                onChange={(e) => setBtcAddress(e.target.value)}
                placeholder="bc1q... or 1... or 3..."
                className="bg-slate-950/50 border-purple-900/30 text-purple-100 font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eth-address" className="text-purple-300 flex items-center gap-2">
                <span className="text-blue-400">Ξ</span>
                Ethereum Address
              </Label>
              <Input
                id="eth-address"
                value={ethAddress}
                onChange={(e) => setEthAddress(e.target.value)}
                placeholder="0x..."
                className="bg-slate-950/50 border-purple-900/30 text-purple-100 font-mono text-sm"
              />
            </div>

            <Button
              onClick={handleSaveWallets}
              disabled={saveWalletMutation.isPending}
              className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white"
            >
              {saveWalletMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Save Wallet Addresses
                </>
              )}
            </Button>

            {cryptoWallet?.wallet_verified && (
              <div className="flex items-center gap-2 text-sm text-green-300 p-3 bg-green-950/30 rounded-lg border border-green-500/30">
                <CheckCircle className="w-4 h-4" />
                <span>Wallets connected and verified</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bridge Interface */}
        <Card className="bg-slate-900/60 border-orange-900/40 backdrop-blur-sm">
          <CardHeader className="border-b border-orange-900/30">
            <CardTitle className="flex items-center gap-2 text-orange-200">
              <Repeat className="w-5 h-5" />
              Cross-Chain Bridge
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-3">
              <Label className="text-purple-300">Bridge Direction</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setBridgeDirection("to_qtc")}
                  className={`p-4 rounded-lg border transition-all ${
                    bridgeDirection === "to_qtc"
                      ? 'bg-gradient-to-br from-orange-500/20 to-amber-500/20 border-orange-500/50'
                      : 'bg-slate-950/50 border-purple-900/30 hover:border-purple-700/50'
                  }`}
                >
                  <ArrowRightLeft className={`w-5 h-5 mx-auto mb-2 ${
                    bridgeDirection === "to_qtc" ? 'text-orange-200' : 'text-purple-400/70'
                  }`} />
                  <div className={`text-sm font-medium ${
                    bridgeDirection === "to_qtc" ? 'text-orange-100' : 'text-purple-300/70'
                  }`}>
                    To QTC
                  </div>
                </button>
                <button
                  onClick={() => setBridgeDirection("from_qtc")}
                  className={`p-4 rounded-lg border transition-all ${
                    bridgeDirection === "from_qtc"
                      ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/50'
                      : 'bg-slate-950/50 border-purple-900/30 hover:border-purple-700/50'
                  }`}
                >
                  <ArrowRightLeft className={`w-5 h-5 mx-auto mb-2 rotate-180 ${
                    bridgeDirection === "from_qtc" ? 'text-blue-200' : 'text-purple-400/70'
                  }`} />
                  <div className={`text-sm font-medium ${
                    bridgeDirection === "from_qtc" ? 'text-blue-100' : 'text-purple-300/70'
                  }`}>
                    From QTC
                  </div>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-purple-300">Select Cryptocurrency</Label>
              <div className="grid grid-cols-2 gap-3">
                {cryptoCurrencies.map(crypto => (
                  <button
                    key={crypto.id}
                    onClick={() => setSourceCurrency(crypto.id)}
                    className={`p-3 rounded-lg border transition-all ${
                      sourceCurrency === crypto.id
                        ? `bg-gradient-to-br ${crypto.color} bg-opacity-20 border-orange-500/50`
                        : 'bg-slate-950/50 border-purple-900/30 hover:border-purple-700/50'
                    }`}
                  >
                    <div className="text-2xl mb-1">{crypto.icon}</div>
                    <div className={`text-sm font-medium ${
                      sourceCurrency === crypto.id ? 'text-orange-100' : 'text-purple-300/70'
                    }`}>
                      {crypto.id}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bridge-amount" className="text-purple-300">
                Amount to Bridge
              </Label>
              <Input
                id="bridge-amount"
                type="number"
                min="0"
                step="0.00000001"
                value={sourceAmount}
                onChange={(e) => setSourceAmount(e.target.value)}
                placeholder="0.00000000"
                className="bg-slate-950/50 border-purple-900/30 text-purple-100 text-lg"
              />
              <div className="text-xs text-purple-400/60">
                {bridgeDirection === "to_qtc" ? `${sourceCurrency} → QTC` : `QTC → ${sourceCurrency}`}
              </div>
            </div>

            {destinationAmount > 0 && (
              <div className="p-4 bg-orange-950/30 rounded-lg border border-orange-500/30">
                <div className="text-sm text-orange-400/70 mb-1">You will receive</div>
                <div className="text-3xl font-bold text-orange-200">
                  {destinationAmount.toLocaleString(undefined, { maximumFractionDigits: 8 })}
                </div>
                <div className="text-sm text-orange-300/70 mt-1">
                  {bridgeDirection === "to_qtc" ? "QTC" : sourceCurrency}
                </div>
                <div className="mt-3 pt-3 border-t border-orange-500/30 text-xs text-orange-400/60">
                  Exchange Rate: 1 {bridgeDirection === "to_qtc" ? sourceCurrency : "QTC"} = {
                    currentPool?.current_exchange_rate !== 0 ? 
                      (bridgeDirection === "to_qtc" 
                        ? (1 / currentPool?.current_exchange_rate).toFixed(2) + " QTC"
                        : (currentPool?.current_exchange_rate).toFixed(8) + ` ${sourceCurrency}`
                      ) : "N/A"
                  }
                  <br />
                  Bridge Fee: 0.1%
                </div>
              </div>
            )}

            <Button
              onClick={handleBridge}
              disabled={bridgeMutation.isPending || !sourceAmount || destinationAmount === 0}
              className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold py-6"
            >
              {bridgeMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Bridging...
                </>
              ) : (
                <>
                  <Repeat className="w-5 h-5 mr-2" />
                  Execute Bridge
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Bridge History */}
      <Card className="bg-slate-900/60 border-purple-900/40 backdrop-blur-sm">
        <CardHeader className="border-b border-purple-900/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-purple-200">Bridge History</CardTitle>
            <Badge variant="outline" className="border-purple-500/30 text-purple-300">
              {bridges.length} Transactions
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {bridgesLoading ? (
            <div className="space-y-3">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="p-4 bg-slate-950/50 rounded-lg animate-pulse">
                  <div className="h-4 bg-purple-900/20 rounded mb-2" />
                  <div className="h-3 bg-purple-900/20 rounded" />
                </div>
              ))}
            </div>
          ) : bridges.length === 0 ? (
            <div className="text-center py-8 text-purple-400/60">
              <Repeat className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>No bridge transactions yet</p>
              <p className="text-sm mt-1">Start bridging assets across chains</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bridges.map((bridge, index) => (
                <motion.div
                  key={bridge.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 bg-slate-950/50 rounded-lg border border-purple-900/30 hover:border-orange-500/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <Badge variant="outline" className="border-orange-500/30 text-orange-300 mb-2 capitalize">
                        {bridge.bridge_type.replace(/_/g, ' ')}
                      </Badge>
                      <div className="flex items-center gap-2 text-sm text-purple-400/70">
                        <span className="capitalize">{bridge.source_chain}</span>
                        <ArrowRightLeft className="w-3 h-3" />
                        <span className="capitalize">{bridge.destination_chain}</span>
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {bridge.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="p-2 bg-slate-950/50 rounded border border-purple-900/30">
                      <div className="text-xs text-purple-400/70">Sent</div>
                      <div className="text-sm font-semibold text-purple-200">
                        {bridge.source_amount.toFixed(8)}
                      </div>
                    </div>
                    <div className="p-2 bg-slate-950/50 rounded border border-purple-900/30">
                      <div className="text-xs text-purple-400/70">Received</div>
                      <div className="text-sm font-semibold text-green-300">
                        {bridge.destination_amount.toLocaleString(undefined, { maximumFractionDigits: 8 })}
                      </div>
                    </div>
                    <div className="p-2 bg-slate-950/50 rounded border border-purple-900/30">
                      <div className="text-xs text-purple-400/70">Confirms</div>
                      <div className="text-sm font-semibold text-purple-200">
                        {bridge.confirmations}/6
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-purple-400/50 pt-2 border-t border-purple-900/30">
                    <span className="font-mono">{bridge.qtc_transaction_hash?.substring(0, 20)}...</span>
                    <span>{format(new Date(bridge.timestamp), "MMM d, HH:mm")}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
