import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Coins, Sparkles, Infinity } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export default function CurrencyStats({ totalSupply, totalMints, isLoading }) {
  const stats = [
    {
      label: "Total Supply",
      value: isLoading ? "—" : totalSupply.toLocaleString(),
      icon: Coins,
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-500/10"
    },
    {
      label: "Total Mints",
      value: isLoading ? "—" : totalMints.toLocaleString(),
      icon: Sparkles,
      color: "from-purple-500 to-indigo-500",
      bgColor: "bg-purple-500/10"
    },
    {
      label: "Minting Capacity",
      value: "∞",
      icon: Infinity,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10"
    },
    {
      label: "Authentication",
      value: "VQC",
      icon: TrendingUp,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/10"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="bg-slate-900/60 border-purple-900/30 backdrop-blur-sm hover:border-purple-500/40 transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-sm text-purple-400/70 mb-1">{stat.label}</div>
              {isLoading && stat.value === "—" ? (
                <Skeleton className="h-8 bg-purple-900/20" />
              ) : (
                <div className="text-2xl font-bold text-purple-100">{stat.value}</div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}