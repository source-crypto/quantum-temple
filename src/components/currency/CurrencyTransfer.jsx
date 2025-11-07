import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftRight, Send, Loader2, CheckCircle, User, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";

export default function CurrencyTransfer({ totalSupply }) {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['currencyTransactions'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const allTransactions = await base44.entities.CurrencyTransaction.list('-created_date', 50);
      return allTransactions.filter(t => 
        t.from_user === user.email || t.to_user === user.email
      );
    },
    initialData: [],
  });

  const { data: balance } = useQuery({
    queryKey: ['userBalance'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const balances = await base44.entities.UserBalance.filter({ user_email: user.email });
      if (balances.length > 0) return balances[0];
      
      // Create initial balance if doesn't exist
      return base44.entities.UserBalance.create({
        user_email: user.email,
        available_balance: totalSupply,
        wallet_address: `QTC-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
      });
    },
  });

  const transferMutation = useMutation({
    mutationFn: async (data) => {
      const currentUser = await base44.auth.me();
      
      if (data.amount > (balance?.available_balance || totalSupply)) {
        throw new Error("Insufficient balance");
      }

      if (data.recipientEmail === currentUser.email) {
        throw new Error("Cannot transfer to yourself");
      }

      const transactionHash = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 15).toUpperCase()}`;
      const signature = btoa(`${transactionHash}-${data.amount}-${currentUser.email}-${data.recipientEmail}`).substring(0, 64);

      // Create transaction record
      const transaction = await base44.entities.CurrencyTransaction.create({
        transaction_type: "peer_to_peer",
        from_user: currentUser.email,
        to_user: data.recipientEmail,
        amount: data.amount,
        transaction_fee: 0,
        status: "completed",
        note: data.note,
        transaction_hash: transactionHash,
        timestamp: new Date().toISOString(),
        quantum_signature: signature
      });

      // Update sender balance
      if (balance) {
        await base44.entities.UserBalance.update(balance.id, {
          available_balance: (balance.available_balance || totalSupply) - data.amount,
          total_sent: (balance.total_sent || 0) + data.amount,
          last_transaction_date: new Date().toISOString()
        });
      }

      // Update or create recipient balance
      const recipientBalances = await base44.entities.UserBalance.filter({ user_email: data.recipientEmail });
      if (recipientBalances.length > 0) {
        const recipientBalance = recipientBalances[0];
        await base44.entities.UserBalance.update(recipientBalance.id, {
          available_balance: (recipientBalance.available_balance || 0) + data.amount,
          total_received: (recipientBalance.total_received || 0) + data.amount,
          last_transaction_date: new Date().toISOString()
        });
      } else {
        await base44.entities.UserBalance.create({
          user_email: data.recipientEmail,
          available_balance: data.amount,
          total_received: data.amount,
          wallet_address: `QTC-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          last_transaction_date: new Date().toISOString()
        });
      }

      return transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currencyTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['userBalance'] });
      setRecipientEmail("");
      setAmount("");
      setNote("");
      toast.success("Transfer successful!", {
        description: "Currency has been sent to recipient"
      });
    },
    onError: (error) => {
      toast.error("Transfer failed", {
        description: error.message
      });
    }
  });

  const handleTransfer = () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Invalid amount");
      return;
    }
    if (!recipientEmail || !recipientEmail.includes('@')) {
      toast.error("Invalid recipient email");
      return;
    }

    transferMutation.mutate({
      recipientEmail,
      amount: amt,
      note: note || "Divine currency transfer"
    });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Transfer Form */}
      <div className="space-y-6">
        <Card className="bg-slate-900/60 border-cyan-900/40 backdrop-blur-sm">
          <CardHeader className="border-b border-cyan-900/30">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-cyan-200">
                <Send className="w-5 h-5" />
                Send Currency
              </CardTitle>
              <Badge variant="outline" className="border-amber-500/30 text-amber-300">
                {(balance?.available_balance || totalSupply).toLocaleString()} Available
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {balance?.wallet_address && (
              <div className="p-3 bg-slate-950/50 rounded-lg border border-cyan-900/30">
                <div className="text-xs text-cyan-400/70 mb-1">Your Wallet Address</div>
                <div className="text-xs text-cyan-300 font-mono break-all">
                  {balance.wallet_address}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="recipient" className="text-purple-300">
                Recipient Email Address
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-500" />
                <Input
                  id="recipient"
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="recipient@example.com"
                  className="pl-10 bg-slate-950/50 border-purple-900/30 text-purple-100"
                />
              </div>
              <p className="text-xs text-purple-400/60">
                Enter the email of any registered user
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transfer-amount" className="text-purple-300">
                Amount to Send
              </Label>
              <div className="relative">
                <ArrowLeftRight className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-500" />
                <Input
                  id="transfer-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount..."
                  className="pl-10 bg-slate-950/50 border-purple-900/30 text-purple-100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transfer-note" className="text-purple-300">
                Transfer Note (Optional)
              </Label>
              <Textarea
                id="transfer-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a message..."
                className="bg-slate-950/50 border-purple-900/30 text-purple-100 min-h-20"
              />
            </div>

            <Button
              onClick={handleTransfer}
              disabled={transferMutation.isPending || !amount || !recipientEmail}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold py-6"
            >
              {transferMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing Transfer...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Send Currency
                </>
              )}
            </Button>

            <div className="pt-4 border-t border-purple-900/30 space-y-2 text-xs text-purple-400/60">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-1.5" />
                <span>Instant peer-to-peer transfers with zero fees</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-1.5" />
                <span>All transactions recorded on quantum ledger</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-1.5" />
                <span>Global distribution with no restrictions</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Balance Summary */}
        {balance && (
          <Card className="bg-slate-900/60 border-purple-900/40 backdrop-blur-sm">
            <CardHeader className="border-b border-purple-900/30">
              <CardTitle className="text-purple-200">Balance Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-purple-400/70 text-sm">Available Balance:</span>
                <span className="text-xl font-bold text-purple-200">
                  {(balance.available_balance || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-purple-400/70 text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  Total Received:
                </span>
                <span className="text-green-300 font-semibold">
                  {(balance.total_received || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-purple-400/70 text-sm flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-amber-400" />
                  Total Sent:
                </span>
                <span className="text-amber-300 font-semibold">
                  {(balance.total_sent || 0).toLocaleString()}
                </span>
              </div>
              {balance.staked_balance > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-purple-400/70 text-sm">Staked:</span>
                  <span className="text-violet-300 font-semibold">
                    {balance.staked_balance.toLocaleString()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Transaction History */}
      <Card className="bg-slate-900/60 border-purple-900/40 backdrop-blur-sm">
        <CardHeader className="border-b border-purple-900/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-purple-200">Transaction History</CardTitle>
            <Badge variant="outline" className="border-purple-500/30 text-purple-300">
              {transactions.length} Transactions
            </Badge>
          </div>
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
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-purple-400/60">
              <ArrowLeftRight className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>No transactions yet</p>
              <p className="text-sm mt-1">Your transfers will appear here</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {transactions.map((txn, index) => {
                const isSent = txn.from_user === user?.email;
                
                return (
                  <motion.div
                    key={txn.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 bg-slate-950/50 rounded-lg border border-purple-900/30 hover:border-purple-700/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isSent ? 'bg-amber-500/20' : 'bg-green-500/20'
                        }`}>
                          {isSent ? (
                            <TrendingDown className="w-4 h-4 text-amber-400" />
                          ) : (
                            <TrendingUp className="w-4 h-4 text-green-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-purple-200 text-sm">
                            {isSent ? 'Sent' : 'Received'}
                          </div>
                          <div className="text-xs text-purple-400/60">
                            {isSent ? `To: ${txn.to_user}` : `From: ${txn.from_user}`}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${isSent ? 'text-amber-300' : 'text-green-300'}`}>
                          {isSent ? '-' : '+'}{txn.amount.toLocaleString()}
                        </div>
                        <Badge variant="outline" className="border-green-500/30 text-green-300 bg-green-950/30 text-xs mt-1">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {txn.status}
                        </Badge>
                      </div>
                    </div>

                    {txn.note && (
                      <div className="text-xs text-purple-300/80 italic mb-2">
                        "{txn.note}"
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-purple-400/50 pt-2 border-t border-purple-900/30">
                      <span className="font-mono">{txn.transaction_hash?.substring(0, 20)}...</span>
                      <span>{format(new Date(txn.timestamp), "MMM d, HH:mm")}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}