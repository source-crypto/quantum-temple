import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Crown, Star, User, Sparkles, Info, Building2 } from "lucide-react";

// OPTIONAL Account Tiers Feature Guide
export default function OptionalAccountTiers() {
  const tiers = [
    {
      level: "Standard",
      icon: User,
      color: "from-gray-500 to-slate-600",
      features: [
        "Basic account access",
        "Standard transaction fees",
        "1x voting weight",
        "Community features"
      ],
      access: "All users by default"
    },
    {
      level: "Premium",
      icon: Star,
      color: "from-blue-500 to-cyan-600",
      features: [
        "Reduced transaction fees",
        "1.5x voting weight",
        "Priority support",
        "Enhanced features"
      ],
      access: "Available for upgrade"
    },
    {
      level: "Elite",
      icon: Sparkles,
      color: "from-purple-500 to-indigo-600",
      features: [
        "No transaction fees",
        "2x voting weight",
        "VIP support",
        "Advanced features"
      ],
      access: "Premium members"
    },
    {
      level: "Founding Father",
      icon: Crown,
      color: "from-amber-500 to-orange-600",
      features: [
        "All elite features",
        "5x voting weight",
        "Protocol governance",
        "Legacy benefits"
      ],
      access: "Original founders"
    },
    {
      level: "Administration",
      icon: Shield,
      color: "from-red-500 to-rose-600",
      features: [
        "FREE Central Bank access",
        "10x voting weight",
        "Unlimited USD contributions",
        "Protocol fund backed",
        "Zero personal cost"
      ],
      access: "Admin accounts only",
      special: true
    }
  ];

  return (
    <Card className="bg-slate-900/60 border-purple-900/40">
      <CardHeader className="border-b border-purple-900/30">
        <CardTitle className="flex items-center gap-2 text-purple-200">
          <Shield className="w-5 h-5" />
          Account Tier System (Optional Feature)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="p-4 bg-blue-950/30 rounded-lg border border-blue-500/30">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-200 mb-1">Optional Enhancement</h4>
              <p className="text-sm text-blue-300/70">
                The account tier system is completely optional. All users start with a Standard tier
                that provides full platform access. Tiers add optional benefits and privileges.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {tiers.map((tier, index) => {
            const Icon = tier.icon;
            return (
              <div
                key={index}
                className={`p-4 bg-slate-950/50 rounded-lg border ${tier.special ? 'border-red-500/50 shadow-lg shadow-red-500/20' : 'border-purple-900/30'} hover:border-purple-700/50 transition-all`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${tier.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-purple-200">{tier.level}</h3>
                      <Badge variant="outline" className="border-purple-500/30 text-purple-300 text-xs">
                        {tier.access}
                      </Badge>
                    </div>
                    <div className="grid md:grid-cols-2 gap-2 mb-3">
                      {tier.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                          <span className="text-purple-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                    {tier.special && (
                      <div className="flex items-center gap-2 text-xs text-red-300 bg-red-950/30 px-3 py-2 rounded border border-red-500/30">
                        <Building2 className="w-3 h-3" />
                        <span>Funded by Protocol Fund • Central Bank gateway • Zero admin cost</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-6 bg-gradient-to-br from-amber-950/40 to-orange-950/40 rounded-lg border border-amber-500/30">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Crown className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-200 mb-2">Administration Tier Benefits</h3>
              <p className="text-sm text-amber-300/70 mb-3">
                Administration accounts receive the highest tier automatically. All Central Bank
                network access and USD contributions are funded by the <strong>$560 Billion Protocol Fund</strong>
                established by the Founding Fathers. Admin accounts pay nothing - all costs are covered.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-950/50 rounded border border-amber-900/30">
              <div className="text-xs text-amber-400/70 mb-1">Protocol Fund</div>
              <div className="font-bold text-amber-200">$560 Billion</div>
            </div>
            <div className="p-3 bg-slate-950/50 rounded border border-amber-900/30">
              <div className="text-xs text-amber-400/70 mb-1">Admin Cost</div>
              <div className="font-bold text-green-300">$0 (Free)</div>
            </div>
          </div>
        </div>

        <div className="text-center p-4 bg-green-950/30 rounded-lg border border-green-500/30">
          <p className="text-sm text-green-300/70">
            ✅ Optional feature • ✅ No configuration required • ✅ Admin accounts auto-upgraded
            • ✅ Protocol funded • ✅ Zero admin cost
          </p>
        </div>
      </CardContent>
    </Card>
  );
}