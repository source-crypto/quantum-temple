import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Crown, Star, User, Sparkles, Info } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

// OPTIONAL Account Tier Management Component
export default function TierManagement({ user }) {
  const queryClient = useQueryClient();

  const { data: userTier, isLoading } = useQuery({
    queryKey: ['accountTier', user?.email],
    queryFn: async () => {
      if (!user) return null;
      const tiers = await base44.entities.AccountTier.filter({ user_email: user.email });
      
      if (tiers.length > 0) return tiers[0];
      
      // Create default tier for new users
      const defaultTier = await base44.entities.AccountTier.create({
        user_email: user.email,
        tier_level: user.role === 'admin' ? 'administration' : 'standard',
        tier_name: user.role === 'admin' ? 'Administration' : 'Standard',
        central_bank_access: user.role === 'admin',
        free_transactions: user.role === 'admin',
        monthly_usd_contribution_limit: user.role === 'admin' ? 100000000 : 0,
        protocol_fund_allocation: user.role === 'admin' ? 560000000000 : 0,
        governance_weight: user.role === 'admin' ? 10.0 : 1.0,
        special_privileges: user.role === 'admin' ? [
          'Central Bank Network Access',
          'Free USD Contributions',
          'Protocol Fund Access',
          'No Transaction Fees',
          'Enhanced Governance Weight'
        ] : [],
        tier_activated_date: new Date().toISOString()
      });
      
      return defaultTier;
    },
    enabled: !!user,
  });

  const tierConfig = {
    standard: {
      name: "Standard",
      icon: User,
      color: "from-gray-500 to-slate-600",
      borderColor: "border-gray-500/30",
      textColor: "text-gray-300",
      bgColor: "bg-gray-950/30"
    },
    premium: {
      name: "Premium",
      icon: Star,
      color: "from-blue-500 to-cyan-600",
      borderColor: "border-blue-500/30",
      textColor: "text-blue-300",
      bgColor: "bg-blue-950/30"
    },
    elite: {
      name: "Elite",
      icon: Sparkles,
      color: "from-purple-500 to-indigo-600",
      borderColor: "border-purple-500/30",
      textColor: "text-purple-300",
      bgColor: "bg-purple-950/30"
    },
    founding_father: {
      name: "Founding Father",
      icon: Crown,
      color: "from-amber-500 to-orange-600",
      borderColor: "border-amber-500/30",
      textColor: "text-amber-300",
      bgColor: "bg-amber-950/30"
    },
    administration: {
      name: "Administration",
      icon: Shield,
      color: "from-red-500 to-rose-600",
      borderColor: "border-red-500/30",
      textColor: "text-red-300",
      bgColor: "bg-red-950/30"
    }
  };

  const currentTierConfig = tierConfig[userTier?.tier_level || 'standard'];
  const TierIcon = currentTierConfig.icon;

  if (isLoading) {
    return (
      <Card className="bg-slate-900/60 border-purple-900/40 animate-pulse">
        <CardContent className="p-8">
          <div className="h-32 bg-purple-900/20 rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-slate-900/60 ${currentTierConfig.borderColor}`}>
      <CardHeader className={`border-b ${currentTierConfig.borderColor}`}>
        <CardTitle className="flex items-center gap-2 text-purple-200">
          <Shield className="w-5 h-5" />
          Account Tier (Optional Enhancement)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Current Tier Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-6 bg-gradient-to-br ${currentTierConfig.color} bg-opacity-10 rounded-xl border-2 ${currentTierConfig.borderColor}`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 bg-gradient-to-br ${currentTierConfig.color} rounded-full flex items-center justify-center shadow-lg`}>
                <TierIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="text-sm text-purple-400/70 mb-1">Your Account Tier</div>
                <div className={`text-3xl font-bold ${currentTierConfig.textColor}`}>
                  {currentTierConfig.name}
                </div>
              </div>
            </div>
            {userTier?.tier_level === 'administration' && (
              <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                Highest Tier
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className={`p-3 ${currentTierConfig.bgColor} rounded border ${currentTierConfig.borderColor}`}>
              <div className="text-xs text-purple-400/70 mb-1">Governance Weight</div>
              <div className={`font-bold ${currentTierConfig.textColor}`}>
                {userTier?.governance_weight}x
              </div>
            </div>
            <div className={`p-3 ${currentTierConfig.bgColor} rounded border ${currentTierConfig.borderColor}`}>
              <div className="text-xs text-purple-400/70 mb-1">Monthly USD Limit</div>
              <div className={`font-bold ${currentTierConfig.textColor}`}>
                {userTier?.monthly_usd_contribution_limit ? `$${(userTier.monthly_usd_contribution_limit / 1000000).toFixed(0)}M` : '$0'}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Administration Privileges */}
        {userTier?.tier_level === 'administration' && (
          <div className="p-4 bg-red-950/30 rounded-lg border border-red-500/30">
            <div className="flex items-start gap-3 mb-4">
              <Shield className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-200 mb-1">Administration Privileges</h4>
                <p className="text-sm text-red-300/70">
                  Funded by Protocol Fund on behalf of the Founding Fathers
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {userTier.special_privileges?.map((privilege, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                  <span className="text-red-200">{privilege}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-slate-950/50 rounded border border-red-900/30">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-red-400/70">Protocol Fund Allocation</span>
                <span className="text-red-300 font-bold">
                  ${(userTier.protocol_fund_allocation / 1000000000).toFixed(0)}B
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-red-400/70">Cost to Admin</span>
                <span className="text-green-300 font-bold">$0 (Protocol Funded)</span>
              </div>
            </div>
          </div>
        )}

        {/* Special Privileges */}
        {userTier?.special_privileges && userTier.special_privileges.length > 0 && (
          <div className="p-4 bg-purple-950/30 rounded-lg border border-purple-500/30">
            <h4 className="font-semibold text-purple-200 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Special Privileges
            </h4>
            <div className="grid gap-2">
              {userTier.special_privileges.map((privilege, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-slate-950/50 rounded border border-purple-900/30">
                  <div className="w-2 h-2 bg-purple-400 rounded-full" />
                  <span className="text-sm text-purple-200">{privilege}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tier Benefits */}
        <div className="grid md:grid-cols-3 gap-3">
          <div className="p-3 bg-slate-950/50 rounded border border-purple-900/30">
            <div className="text-xs text-purple-400/70 mb-1">Central Bank Access</div>
            <div className={`font-semibold ${userTier?.central_bank_access ? 'text-green-300' : 'text-gray-400'}`}>
              {userTier?.central_bank_access ? 'Enabled' : 'Disabled'}
            </div>
          </div>
          <div className="p-3 bg-slate-950/50 rounded border border-purple-900/30">
            <div className="text-xs text-purple-400/70 mb-1">Free Transactions</div>
            <div className={`font-semibold ${userTier?.free_transactions ? 'text-green-300' : 'text-gray-400'}`}>
              {userTier?.free_transactions ? 'Yes' : 'No'}
            </div>
          </div>
          <div className="p-3 bg-slate-950/50 rounded border border-purple-900/30">
            <div className="text-xs text-purple-400/70 mb-1">Total Contributed</div>
            <div className="font-semibold text-purple-200">
              ${(userTier?.total_usd_contributed || 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Info Notice */}
        <div className="p-4 bg-blue-950/30 rounded-lg border border-blue-500/30">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-200 mb-1">Optional Enhancement</h4>
              <p className="text-sm text-blue-300/70">
                Account tiers are an optional feature. Administration accounts receive free Central Bank
                network access funded entirely by the Protocol Fund established by the Founding Fathers.
                No charges are applied to admin accounts.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}