import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Repeat, ArrowDown, Settings, Info, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SwapInterface() {
  const [fromToken, setFromToken] = useState("QTC");
  const [toToken, setToToken] = useState("USD");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [slippage, setSlippage] = useState("0.5");
  const [showSettings, setShowSettings] = useState(false);

  // Fetch real-time price data from CurrencyIndex
  const { data: currencyIndex } = useQuery({
    queryKey: ['currencyIndex'],
    queryFn: async () => {
      const indices = await base44.entities.CurrencyIndex.list('-last_updated', 1);
      return indices.length > 0 ? indices[0] : null;
    },
    refetchInterval: 5000, // Update every 5 seconds
  });

  // Fetch liquidity pools for exchange rates
  const { data: liquidityPools } = useQuery({
    queryKey: ['liquidityPools'],
    queryFn: () => base44.entities.CrossChainLiquidity.list(),
    initialData: [],
    refetchInterval: 10000,
  });

  const tokens = [
    { 
      symbol: "QTC", 
      name: "Quantum Temple Currency", 
      icon: "◈",
      price: currencyIndex?.qtc_unit_price_usd || 0,
      change24h: currencyIndex?.price_change_24h || 0
    },
    { 
      symbol: "USD", 
      name: "US Dollar", 
      icon: "$",
      price: 1,
      change24h: 0
    },
    { 
      symbol: "BTC", 
      name: "Bitcoin", 
      icon: "₿",
      price: currencyIndex?.btc_price_usd || 0,
      change24h: 0
    },
    { 
      symbol: "ETH", 
      name: "Ethereum", 
      icon: "Ξ",
      price: currencyIndex?.eth_price_usd || 0,
      change24h: 0
    }
  ];

  const getToken = (symbol) => tokens.find(t => t.symbol === symbol);
  const fromTokenData = getToken(fromToken);
  const toTokenData = getToken(toToken);

  // Calculate exchange rate
  const calculateExchangeRate = () => {
    if (!fromTokenData || !toTokenData) return 0;
    if (fromTokenData.price === 0) return 0;
    return toTokenData.price / fromTokenData.price;
  };

  const exchangeRate = calculateExchangeRate();

  // Auto-calculate toAmount when fromAmount changes
  useEffect(() => {
    if (fromAmount && !isNaN(parseFloat(fromAmount))) {
      const calculatedAmount = parseFloat(fromAmount) * exchangeRate;
      setToAmount(calculatedAmount.toFixed(6));
    } else {
      setToAmount("");
    }
  }, [fromAmount, exchangeRate]);

  // Calculate swap details
  const calculateFee = () => {
    if (!fromAmount || isNaN(parseFloat(fromAmount))) return 0;
    return parseFloat(fromAmount) * 0.003; // 0.3% fee
  };

  const calculateMinReceived = () => {
    if (!toAmount || isNaN(parseFloat(toAmount))) return 0;
    const slippageDecimal = parseFloat(slippage) / 100;
    return parseFloat(toAmount) * (1 - slippageDecimal);
  };

  const calculatePriceImpact = () => {
    // Find relevant pool
    const pool = liquidityPools.find(p => 
      p.currency_pair === `${fromToken}/${toToken}` || 
      p.currency_pair === `${toToken}/${fromToken}`
    );
    
    if (!pool || !fromAmount) return 0;
    
    // Simplified price impact calculation
    const tradeSize = parseFloat(fromAmount) * fromTokenData.price;
    const poolSize = pool.qtc_liquidity * fromTokenData.price;
    
    if (poolSize === 0) return 0;
    return ((tradeSize / poolSize) * 100).toFixed(2);
  };

  const swapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount(toAmount);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Real-Time Market Stats */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {tokens.map((token, index) => (
          <motion.div
            key={token.symbol}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="p-3 bg-slate-950/50 rounded-lg border border-cyan-900/30"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{token.icon}</span>
              <span className="text-xs font-semibold text-cyan-300">{token.symbol}</span>
            </div>
            <div className="text-sm font-bold text-cyan-200">
              ${token.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
            {token.change24h !== 0 && (
              <div className={`flex items-center gap-1 text-xs ${token.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {token.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>{Math.abs(token.change24h).toFixed(2)}%</span>
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Main Swap Card */}
      <Card className="bg-slate-900/60 border-cyan-900/40">
        <CardHeader className="border-b border-cyan-900/30">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-cyan-200">
              <Repeat className="w-5 h-5" />
              Token Swap
            </CardTitle>
            <Button 
              size="icon" 
              variant="ghost" 
              className="text-cyan-400 hover:bg-cyan-900/20"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {/* Settings Panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 bg-slate-950/50 rounded-lg border border-cyan-900/30 space-y-3"
              >
                <div>
                  <label className="text-xs text-cyan-400/70 mb-2 block">Slippage Tolerance</label>
                  <div className="flex gap-2">
                    {["0.1", "0.5", "1.0"].map(value => (
                      <button
                        key={value}
                        onClick={() => setSlippage(value)}
                        className={`flex-1 px-3 py-2 rounded text-sm font-semibold transition-colors ${
                          slippage === value
                            ? 'bg-cyan-600 text-white'
                            : 'bg-slate-900/50 text-cyan-400 hover:bg-slate-900'
                        }`}
                      >
                        {value}%
                      </button>
                    ))}
                    <Input
                      type="number"
                      value={slippage}
                      onChange={(e) => setSlippage(e.target.value)}
                      className="w-20 bg-slate-900/50 border-cyan-900/30 text-cyan-100 text-center"
                      step="0.1"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* From Token */}
          <div className="p-4 bg-slate-950/50 rounded-lg border border-cyan-900/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-cyan-400/70">From</span>
              <div className="text-xs text-cyan-400/50">
                <span>Price: ${fromTokenData?.price.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Select value={fromToken} onValueChange={setFromToken}>
                <SelectTrigger className="w-32 bg-slate-900/50 border-cyan-900/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tokens.map(token => (
                    <SelectItem key={token.symbol} value={token.symbol}>
                      <div className="flex items-center gap-2">
                        <span>{token.icon}</span>
                        <span>{token.symbol}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                placeholder="0.0"
                className="bg-slate-900/50 border-cyan-900/30 text-cyan-100 text-xl font-semibold"
              />
            </div>
            {fromAmount && fromTokenData && (
              <div className="mt-2 text-xs text-cyan-400/60">
                ≈ ${(parseFloat(fromAmount) * fromTokenData.price).toFixed(2)} USD
              </div>
            )}
          </div>

          {/* Swap Arrow */}
          <div className="flex justify-center">
            <button 
              onClick={swapTokens}
              className="p-2 bg-slate-900 rounded-full border-2 border-cyan-900/30 hover:border-cyan-500/50 transition-all hover:rotate-180 duration-300"
            >
              <ArrowDown className="w-5 h-5 text-cyan-400" />
            </button>
          </div>

          {/* To Token */}
          <div className="p-4 bg-slate-950/50 rounded-lg border border-cyan-900/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-cyan-400/70">To</span>
              <div className="text-xs text-cyan-400/50">
                <span>Price: ${toTokenData?.price.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Select value={toToken} onValueChange={setToToken}>
                <SelectTrigger className="w-32 bg-slate-900/50 border-cyan-900/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tokens.map(token => (
                    <SelectItem key={token.symbol} value={token.symbol}>
                      <div className="flex items-center gap-2">
                        <span>{token.icon}</span>
                        <span>{token.symbol}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex-1 p-3 bg-slate-900/50 rounded border border-cyan-900/30 text-cyan-300 text-xl font-semibold">
                {toAmount || "0.0"}
              </div>
            </div>
            {toAmount && toTokenData && (
              <div className="mt-2 text-xs text-cyan-400/60">
                ≈ ${(parseFloat(toAmount) * toTokenData.price).toFixed(2)} USD
              </div>
            )}
          </div>

          {/* Swap Details */}
          {fromAmount && parseFloat(fromAmount) > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-slate-950/50 rounded-lg border border-cyan-900/30 space-y-2"
            >
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-semibold text-cyan-300">Swap Details</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-cyan-400/70">Exchange Rate</span>
                <span className="text-cyan-300 font-semibold">
                  1 {fromToken} = {exchangeRate.toFixed(6)} {toToken}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-cyan-400/70">Price Impact</span>
                <span className={`font-semibold ${parseFloat(calculatePriceImpact()) > 1 ? 'text-amber-400' : 'text-green-400'}`}>
                  {calculatePriceImpact()}%
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-cyan-400/70">Min. Received</span>
                <span className="text-cyan-300 font-semibold">
                  {calculateMinReceived().toFixed(6)} {toToken}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-cyan-400/70">Fee (0.3%)</span>
                <span className="text-cyan-300 font-semibold">
                  {calculateFee().toFixed(6)} {fromToken}
                </span>
              </div>
            </motion.div>
          )}

          <div className="p-4 bg-blue-950/30 rounded-lg border border-blue-500/30">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-200 mb-1">Live Price Feeds</h4>
                <p className="text-sm text-blue-300/70">
                  Exchange rates update every 5 seconds based on real liquidity pools and the $560B
                  Quantum Temple Currency Index. Slippage protection ensures fair trades.
                </p>
              </div>
            </div>
          </div>

          <Button
            disabled={!fromAmount || parseFloat(fromAmount) <= 0}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 font-semibold py-6 disabled:opacity-50"
          >
            {fromAmount && parseFloat(fromAmount) > 0 ? 'Swap Tokens' : 'Enter Amount'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}