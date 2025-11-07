import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Store, TrendingUp, Loader2, DollarSign, ShoppingCart, Globe, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";

export default function GlobalMarketplace({ totalSupply }) {
  const [offerType, setOfferType] = useState("sell");
  const [amount, setAmount] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [listingNote, setListingNote] = useState("");
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: offers, isLoading } = useQuery({
    queryKey: ['tradeOffers'],
    queryFn: () => base44.entities.TradeOffer.filter({ status: "active" }, '-created_date', 50),
    initialData: [],
  });

  const { data: myBalance } = useQuery({
    queryKey: ['userBalance'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const balances = await base44.entities.UserBalance.filter({ user_email: user.email });
      return balances.length > 0 ? balances[0] : null;
    },
  });

  const createOfferMutation = useMutation({
    mutationFn: async (data) => {
      const currentUser = await base44.auth.me();
      
      if (data.offerType === "sell" && data.amount > (myBalance?.available_balance || totalSupply)) {
        throw new Error("Insufficient balance to create sell offer");
      }

      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 30); // 30 days expiration

      return base44.entities.TradeOffer.create({
        offer_type: data.offerType,
        amount_offered: data.amount,
        price_per_unit: data.pricePerUnit,
        total_value: data.amount * data.pricePerUnit,
        currency_pair: "QTC/USD",
        status: "active",
        seller_email: currentUser.email,
        expiration_date: expirationDate.toISOString(),
        listing_note: data.listingNote,
        quantum_escrow: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tradeOffers'] });
      setAmount("");
      setPricePerUnit("");
      setListingNote("");
      toast.success("Listing created!", {
        description: "Your offer is now live on the global marketplace"
      });
    },
    onError: (error) => {
      toast.error("Listing failed", {
        description: error.message
      });
    }
  });

  const executeTradeM = useMutation({
    mutationFn: async (offer) => {
      const currentUser = await base44.auth.me();
      
      if (offer.seller_email === currentUser.email) {
        throw new Error("Cannot buy your own listing");
      }

      // Update offer status
      await base44.entities.TradeOffer.update(offer.id, {
        status: "completed",
        buyer_email: currentUser.email
      });

      // Create transaction record
      const transactionHash = `TRADE-${Date.now()}-${Math.random().toString(36).substring(2, 15).toUpperCase()}`;
      
      await base44.entities.CurrencyTransaction.create({
        transaction_type: "trade",
        from_user: offer.seller_email,
        to_user: currentUser.email,
        amount: offer.amount_offered,
        transaction_fee: 0,
        status: "completed",
        note: `Marketplace trade: ${offer.amount_offered} QTC @ ${offer.price_per_unit} USD`,
        transaction_hash: transactionHash,
        timestamp: new Date().toISOString(),
        quantum_signature: btoa(transactionHash).substring(0, 48)
      });

      // Update balances
      const sellerBalances = await base44.entities.UserBalance.filter({ user_email: offer.seller_email });
      if (sellerBalances.length > 0) {
        const sellerBalance = sellerBalances[0];
        await base44.entities.UserBalance.update(sellerBalance.id, {
          available_balance: (sellerBalance.available_balance || 0) - offer.amount_offered,
          in_escrow: (sellerBalance.in_escrow || 0) - offer.amount_offered,
          total_sent: (sellerBalance.total_sent || 0) + offer.amount_offered
        });
      }

      const buyerBalances = await base44.entities.UserBalance.filter({ user_email: currentUser.email });
      if (buyerBalances.length > 0) {
        const buyerBalance = buyerBalances[0];
        await base44.entities.UserBalance.update(buyerBalance.id, {
          available_balance: (buyerBalance.available_balance || 0) + offer.amount_offered,
          total_received: (buyerBalance.total_received || 0) + offer.amount_offered
        });
      } else {
        await base44.entities.UserBalance.create({
          user_email: currentUser.email,
          available_balance: offer.amount_offered,
          total_received: offer.amount_offered,
          wallet_address: `QTC-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
        });
      }

      return offer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tradeOffers'] });
      queryClient.invalidateQueries({ queryKey: ['userBalance'] });
      toast.success("Trade executed!", {
        description: "Currency has been transferred to your wallet"
      });
    },
    onError: (error) => {
      toast.error("Trade failed", {
        description: error.message
      });
    }
  });

  const handleCreateOffer = () => {
    const amt = parseFloat(amount);
    const price = parseFloat(pricePerUnit);
    
    if (isNaN(amt) || amt <= 0) {
      toast.error("Invalid amount");
      return;
    }
    if (isNaN(price) || price <= 0) {
      toast.error("Invalid price");
      return;
    }

    createOfferMutation.mutate({
      offerType,
      amount: amt,
      pricePerUnit: price,
      listingNote: listingNote || "Divine currency for sale"
    });
  };

  const offerTypes = [
    { id: "sell", label: "Sell", icon: DollarSign, color: "from-green-500 to-emerald-500" },
    { id: "buy", label: "Buy", icon: ShoppingCart, color: "from-blue-500 to-cyan-500" },
  ];

  const totalVolume = offers.reduce((sum, o) => sum + (o.total_value || 0), 0);
  const avgPrice = offers.length > 0 
    ? offers.reduce((sum, o) => sum + (o.price_per_unit || 0), 0) / offers.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Market Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-slate-900/60 border-purple-900/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-purple-400/70 mb-1">Active Listings</div>
                <div className="text-2xl font-bold text-purple-200">{offers.length}</div>
              </div>
              <Store className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-purple-900/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-purple-400/70 mb-1">Avg Price</div>
                <div className="text-2xl font-bold text-amber-300">${avgPrice.toFixed(2)}</div>
              </div>
              <TrendingUp className="w-8 h-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-purple-900/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-purple-400/70 mb-1">Total Volume</div>
                <div className="text-2xl font-bold text-green-300">${totalVolume.toLocaleString()}</div>
              </div>
              <Globe className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-purple-900/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-purple-400/70 mb-1">Market Cap</div>
                <div className="text-2xl font-bold text-cyan-300">∞</div>
              </div>
              <Zap className="w-8 h-8 text-cyan-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Create Listing */}
        <Card className="bg-slate-900/60 border-green-900/40 backdrop-blur-sm">
          <CardHeader className="border-b border-green-900/30">
            <CardTitle className="flex items-center gap-2 text-green-200">
              <Store className="w-5 h-5" />
              Create Listing
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-3">
              <Label className="text-purple-300">Listing Type</Label>
              <div className="grid grid-cols-2 gap-3">
                {offerTypes.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setOfferType(type.id)}
                    className={`p-4 rounded-lg border transition-all ${
                      offerType === type.id
                        ? `bg-gradient-to-br ${type.color} bg-opacity-20 border-green-500/50`
                        : 'bg-slate-950/50 border-purple-900/30 hover:border-purple-700/50'
                    }`}
                  >
                    <type.icon className={`w-5 h-5 mx-auto mb-2 ${
                      offerType === type.id ? 'text-green-200' : 'text-purple-400/70'
                    }`} />
                    <div className={`text-sm font-medium ${
                      offerType === type.id ? 'text-green-100' : 'text-purple-300/70'
                    }`}>
                      {type.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="offer-amount" className="text-purple-300">
                Amount (QTC)
              </Label>
              <Input
                id="offer-amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount..."
                className="bg-slate-950/50 border-purple-900/30 text-purple-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price" className="text-purple-300">
                Price per Unit (USD)
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={pricePerUnit}
                  onChange={(e) => setPricePerUnit(e.target.value)}
                  placeholder="0.00"
                  className="pl-9 bg-slate-950/50 border-purple-900/30 text-purple-100"
                />
              </div>
            </div>

            {amount && pricePerUnit && (
              <div className="p-3 bg-green-950/30 rounded-lg border border-green-500/30">
                <div className="text-sm text-green-400/70 mb-1">Total Value</div>
                <div className="text-2xl font-bold text-green-300">
                  ${(parseFloat(amount) * parseFloat(pricePerUnit)).toFixed(2)}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="listing-note" className="text-purple-300">
                Listing Note (Optional)
              </Label>
              <Textarea
                id="listing-note"
                value={listingNote}
                onChange={(e) => setListingNote(e.target.value)}
                placeholder="Add details about your listing..."
                className="bg-slate-950/50 border-purple-900/30 text-purple-100 min-h-20"
              />
            </div>

            <Button
              onClick={handleCreateOffer}
              disabled={createOfferMutation.isPending || !amount || !pricePerUnit}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold py-6"
            >
              {createOfferMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating Listing...
                </>
              ) : (
                <>
                  <Store className="w-5 h-5 mr-2" />
                  List on Marketplace
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Active Listings */}
        <Card className="bg-slate-900/60 border-purple-900/40 backdrop-blur-sm">
          <CardHeader className="border-b border-purple-900/30">
            <CardTitle className="text-purple-200">Global Marketplace</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="space-y-3">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="p-4 bg-slate-950/50 rounded-lg animate-pulse">
                    <div className="h-4 bg-purple-900/20 rounded mb-2" />
                    <div className="h-3 bg-purple-900/20 rounded" />
                  </div>
                ))}
              </div>
            ) : offers.length === 0 ? (
              <div className="text-center py-8 text-purple-400/60">
                <Store className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>No active listings</p>
                <p className="text-sm mt-1">Be the first to list on the marketplace</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {offers.map((offer, index) => (
                  <motion.div
                    key={offer.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 bg-slate-950/50 rounded-lg border border-purple-900/30 hover:border-green-500/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <Badge 
                          variant="outline" 
                          className={`mb-2 capitalize ${
                            offer.offer_type === 'sell' 
                              ? 'border-green-500/30 text-green-300 bg-green-950/30'
                              : 'border-blue-500/30 text-blue-300 bg-blue-950/30'
                          }`}
                        >
                          {offer.offer_type}
                        </Badge>
                        <div className="text-sm text-purple-400/70">
                          Seller: {offer.seller_email}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-200">
                          {offer.amount_offered.toLocaleString()}
                        </div>
                        <div className="text-xs text-purple-400/60">QTC</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="p-2 bg-slate-950/50 rounded border border-purple-900/30">
                        <div className="text-xs text-purple-400/70">Price/Unit</div>
                        <div className="text-sm font-semibold text-amber-300">
                          ${offer.price_per_unit?.toFixed(2)}
                        </div>
                      </div>
                      <div className="p-2 bg-slate-950/50 rounded border border-purple-900/30">
                        <div className="text-xs text-purple-400/70">Total Value</div>
                        <div className="text-sm font-semibold text-green-300">
                          ${offer.total_value?.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {offer.listing_note && (
                      <div className="text-xs text-purple-300/80 italic mb-3">
                        "{offer.listing_note}"
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-purple-900/30">
                      <div className="text-xs text-purple-400/50">
                        Expires {format(new Date(offer.expiration_date), "MMM d")}
                      </div>
                      {offer.seller_email !== user?.email && (
                        <Button
                          size="sm"
                          onClick={() => executeTradeM.mutate(offer)}
                          disabled={executeTradeM.isPending}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white h-7 text-xs"
                        >
                          {executeTradeM.isPending ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            "Buy Now"
                          )}
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}