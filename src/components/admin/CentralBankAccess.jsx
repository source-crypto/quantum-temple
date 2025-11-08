import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Building2, DollarSign, Loader2, CheckCircle, Shield, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

// OPTIONAL Central Bank Network Access for Administration Accounts ONLY
export default function CentralBankAccess({ user }) {
  const [usdAmount, setUsdAmount] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState("federal_reserve");
  const [transactionType, setTransactionType] = useState("usd_contribution");
  const queryClient = useQueryClient();

  const { data: accountTier } = useQuery({
    queryKey: ['accountTier', user?.email],
    queryFn: async () => {
      if (!user) return null;
      const tiers = await base44.entities.AccountTier.filter({ user_email: user.email });
      return tiers.length > 0 ? tiers[0] : null;
    },
    enabled: !!user,
  });

  const { data: protocolFund } = useQuery({
    queryKey: ['protocolFund'],
    queryFn: async () => {
      const funds = await base44.entities.ProtocolFund.filter({ fund_type: 'founding_fathers' });
      if (funds.length > 0) return funds[0];
      
      // Create default protocol fund
      return base44.entities.ProtocolFund.create({
        fund_name: "Founding Fathers Protocol Fund",
        fund_type: "founding_fathers",
        total_balance_usd: 560000000000,
        admin_access_enabled: true,
        central_bank_connected: true,
        founding_fathers: [user.email],
        establishment_date: new Date().toISOString(),
        imf_compliant: true
      });
    },
    enabled: accountTier?.central_bank_access === true,
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['centralBankTransactions', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return base44.entities.CentralBankTransaction.filter(
        { admin_email: user.email },
        '-timestamp',
        20
      );
    },
    initialData: [],
    enabled: accountTier?.central_bank_access === true,
  });

  const contributeMutation = useMutation({
    mutationFn: async (data) => {
      if (!accountTier?.central_bank_access) {
        throw new Error("Central Bank access not available for your account tier");
      }

      const transactionId = `CB-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      const authCode = `AUTH-${Math.random().toString(36).substring(2, 15).toUpperCase()}`;
      
      // Calculate QTC generated (using $560B / total supply ratio)
      const qtcGenerated = data.usdAmount / 100; // Simplified: 1 QTC per $100

      // Create Central Bank transaction
      const transaction = await base44.entities.CentralBankTransaction.create({
        transaction_id: transactionId,
        admin_email: user.email,
        transaction_type: data.transactionType,
        usd_amount: data.usdAmount,
        qtc_generated: qtcGenerated,
        funded_by: 'protocol_fund',
        cost_to_admin: 0, // Always 0 for admin accounts
        protocol_fund_used: data.usdAmount,
        central_bank_network: data.network,
        authorization_code: authCode,
        settlement_status: 'settled',
        imf_bop_code: 'CA-1-1-1', // Current Account - Goods - General Merchandise
        timestamp: new Date().toISOString(),
        settlement_date: new Date().toISOString(),
        notes: `Protocol-funded USD contribution via ${data.network}`
      });

      // Update protocol fund
      if (protocolFund) {
        await base44.entities.ProtocolFund.update(protocolFund.id, {
          allocated_to_admins: (protocolFund.allocated_to_admins || 0) + data.usdAmount,
          total_distributed: (protocolFund.total_distributed || 0) + data.usdAmount,
          last_distribution: new Date().toISOString()
        });
      }

      // Update account tier
      await base44.entities.AccountTier.update(accountTier.id, {
        total_usd_contributed: (accountTier.total_usd_contributed || 0) + data.usdAmount,
        last_central_bank_access: new Date().toISOString()
      });

      // Create currency mint for generated QTC
      const serialNumber = `CB-QTC-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      await base44.entities.CurrencyMint.create({
        serial_number: serialNumber,
        amount: qtcGenerated,
        signature: btoa(`${serialNumber}-${qtcGenerated}-central-bank`).substring(0, 64),
        timestamp: new Date().toISOString(),
        note: `Generated from $${data.usdAmount} Central Bank contribution`,
        quantum_entropy: Math.random().toString(36).substring(2, 15),
        verified: true
      });

      return transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['centralBankTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['protocolFund'] });
      queryClient.invalidateQueries({ queryKey: ['accountTier'] });
      queryClient.invalidateQueries({ queryKey: ['currencyMints'] });
      setUsdAmount("");
      toast.success("Central Bank contribution processed!", {
        description: "Funded by Protocol Fund at no cost to you"
      });
    },
    onError: (error) => {
      toast.error("Contribution failed", {
        description: error.message
      });
    }
  });

  const handleContribute = () => {
    const amount = parseFloat(usdAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (amount > (accountTier?.monthly_usd_contribution_limit || 0)) {
      toast.error("Amount exceeds monthly limit");
      return;
    }

    contributeMutation.mutate({
      usdAmount: amount,
      network: selectedNetwork,
      transactionType: transactionType
    });
  };

  const centralBankNetworks = [
    { id: "federal_reserve", name: "U.S. Federal Reserve", icon: "🇺🇸", swift: "FED-WIRE" },
    { id: "ecb", name: "European Central Bank", icon: "🇪🇺", swift: "TARGET2" },
    { id: "boe", name: "Bank of England", icon: "🇬🇧", swift: "CHAPS" },
    { id: "boj", name: "Bank of Japan", icon: "🇯🇵", swift: "BOJ-NET" },
    { id: "pboc", name: "People's Bank of China", icon: "🇨🇳", swift: "CNAPS" }
  ];

  const transactionTypes = [
    { id: "usd_contribution", name: "USD Contribution" },
    { id: "liquidity_injection", name: "Liquidity Injection" },
    { id: "reserve_funding", name: "Reserve Funding" },
    { id: "protocol_support", name: "Protocol Support" }
  ];

  // Only show for admin accounts with Central Bank access
  if (!accountTier?.central_bank_access) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Access Status */}
      <Card className="bg-gradient-to-br from-red-950/40 to-rose-950/40 border-red-500/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-red-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-red-200">Central Bank Network Access</h3>
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
              <p className="text-sm text-red-300/70 mb-4">
                Administration accounts have free access to Central Bank networks for USD contributions.
                All costs are covered by the Protocol Fund established by the Founding Fathers.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950/50 rounded border border-red-900/30">
                  <div className="text-xs text-red-400/70 mb-1">Protocol Fund Balance</div>
                  <div className="text-lg font-bold text-red-200">
                    ${protocolFund ? (protocolFund.total_balance_usd / 1000000000).toFixed(0) : '560'}B
                  </div>
                </div>
                <div className="p-3 bg-slate-950/50 rounded border border-red-900/30">
                  <div className="text-xs text-red-400/70 mb-1">Your Cost</div>
                  <div className="text-lg font-bold text-green-300">$0</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contribution Interface */}
      <Card className="bg-slate-900/60 border-red-900/40">
        <CardHeader className="border-b border-red-900/30">
          <CardTitle className="flex items-center gap-2 text-red-200">
            <Building2 className="w-5 h-5" />
            Make USD Contribution
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="central-bank" className="text-purple-300">
              Select Central Bank Network
            </Label>
            <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
              <SelectTrigger id="central-bank" className="bg-slate-950/50 border-purple-900/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {centralBankNetworks.map(network => (
                  <SelectItem key={network.id} value={network.id}>
                    <div className="flex items-center gap-2">
                      <span>{network.icon}</span>
                      <span>{network.name}</span>
                      <span className="text-xs text-purple-400/60">({network.swift})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transaction-type" className="text-purple-300">
              Transaction Type
            </Label>
            <Select value={transactionType} onValueChange={setTransactionType}>
              <SelectTrigger id="transaction-type" className="bg-slate-950/50 border-purple-900/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {transactionTypes.map(type => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="usd-amount" className="text-purple-300">
              USD Amount
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
              <Input
                id="usd-amount"
                type="number"
                value={usdAmount}
                onChange={(e) => setUsdAmount(e.target.value)}
                placeholder="0.00"
                className="pl-10 bg-slate-950/50 border-purple-900/30 text-purple-100 text-xl font-semibold"
              />
            </div>
            <p className="text-xs text-purple-400/60">
              Monthly limit: ${(accountTier.monthly_usd_contribution_limit / 1000000).toFixed(0)}M
              • Cost to you: $0 (Protocol funded)
            </p>
          </div>

          {usdAmount && parseFloat(usdAmount) > 0 && (
            <div className="p-4 bg-green-950/30 rounded-lg border border-green-500/30 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-400/70">QTC to Generate</span>
                <span className="text-green-300 font-bold">{(parseFloat(usdAmount) / 100).toFixed(2)} QTC</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-400/70">Funded By</span>
                <span className="text-green-300 font-bold">Protocol Fund</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-400/70">Cost to You</span>
                <span className="text-green-300 font-bold">$0.00</span>
              </div>
            </div>
          )}

          <Button
            onClick={handleContribute}
            disabled={contributeMutation.isPending || !usdAmount || parseFloat(usdAmount) <= 0}
            className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 font-semibold py-6"
          >
            {contributeMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Building2 className="w-5 h-5 mr-2" />
                Contribute USD (Free - Protocol Funded)
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="bg-slate-900/60 border-purple-900/40">
        <CardHeader className="border-b border-purple-900/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-purple-200">Central Bank Transaction History</CardTitle>
            <Badge variant="outline" className="border-purple-500/30 text-purple-300">
              {transactions.length} Transactions
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {transactionsLoading ? (
            <div className="text-center py-8 text-purple-400/60">Loading...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-purple-400/60">
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>No Central Bank transactions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx, index) => (
                <div
                  key={tx.id}
                  className="p-4 bg-slate-950/50 rounded-lg border border-purple-900/30 hover:border-red-500/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <Badge variant="outline" className="border-red-500/30 text-red-300 mb-2 capitalize">
                        {tx.transaction_type.replace(/_/g, ' ')}
                      </Badge>
                      <div className="text-xs text-purple-400/70">
                        {tx.central_bank_network} • {tx.authorization_code}
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                      {tx.settlement_status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="p-2 bg-slate-950/50 rounded border border-purple-900/30">
                      <div className="text-xs text-purple-400/70">USD Amount</div>
                      <div className="font-semibold text-green-300">${tx.usd_amount.toLocaleString()}</div>
                    </div>
                    <div className="p-2 bg-slate-950/50 rounded border border-purple-900/30">
                      <div className="text-xs text-purple-400/70">QTC Generated</div>
                      <div className="font-semibold text-purple-200">{tx.qtc_generated.toFixed(2)}</div>
                    </div>
                    <div className="p-2 bg-slate-950/50 rounded border border-purple-900/30">
                      <div className="text-xs text-purple-400/70">Your Cost</div>
                      <div className="font-semibold text-green-300">$0</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-purple-400/50 pt-2 border-t border-purple-900/30">
                    <span>Funded by: {tx.funded_by.replace(/_/g, ' ')}</span>
                    <span>{format(new Date(tx.timestamp), "MMM d, yyyy HH:mm")}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}