import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function MyPositions({ user }) {
  const { data: positions, isLoading } = useQuery({
    queryKey: ['myPositions'],
    queryFn: async () => {
      if (!user) return [];
      return base44.entities.MarketBet.filter({ user_email: user.email }, '-timestamp', 50);
    },
    enabled: !!user,
    initialData: [],
  });

  // Calculate portfolio summary
  const summary = positions.reduce((acc, pos) => {
    acc.total += pos.amount || 0;
    acc.pnl += pos.pnl || 0;
    if (pos.status === 'active') acc.active++;
    if (pos.status === 'won') acc.won++;
    if (pos.status === 'lost') acc.lost++;
    return acc;
  }, { total: 0, pnl: 0, active: 0, won: 0, lost: 0 });

  if (!user) {
    return (
      <Card className="bg-slate-900/60 border-purple-900/40">
        <CardContent className="p-12 text-center">
          <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-purple-400/40" />
          <p className="text-purple-400/60">Please log in to view your positions</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return <div className="text-center text-purple-400">Loading positions...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-950/40 to-indigo-950/40 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-purple-400/70">Total Invested</span>
            </div>
            <div className="text-2xl font-bold text-purple-200">
              ${summary.total.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${summary.pnl >= 0 ? 'from-green-950/40 to-emerald-950/40 border-green-500/30' : 'from-red-950/40 to-rose-950/40 border-red-500/30'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              {summary.pnl >= 0 ? <TrendingUp className="w-4 h-4 text-green-400" /> : <TrendingDown className="w-4 h-4 text-red-400" />}
              <span className={`text-xs ${summary.pnl >= 0 ? 'text-green-400/70' : 'text-red-400/70'}`}>Total P/L</span>
            </div>
            <div className={`text-2xl font-bold ${summary.pnl >= 0 ? 'text-green-200' : 'text-red-200'}`}>
              {summary.pnl >= 0 ? '+' : ''}${summary.pnl.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-950/40 to-blue-950/40 border-cyan-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-cyan-400/70">Active</span>
            </div>
            <div className="text-2xl font-bold text-cyan-200">
              {summary.active}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-950/40 to-orange-950/40 border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-amber-400/70">Win Rate</span>
            </div>
            <div className="text-2xl font-bold text-amber-200">
              {summary.won + summary.lost > 0 ? ((summary.won / (summary.won + summary.lost)) * 100).toFixed(1) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Positions List */}
      <Card className="bg-slate-900/60 border-purple-900/40">
        <CardHeader>
          <CardTitle className="text-purple-200 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Your Positions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {positions.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-purple-400/40" />
              <p className="text-purple-400/60">No positions yet</p>
              <p className="text-sm text-purple-500/50">Place your first bet to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {positions.map((position, index) => {
                const isProfitable = (position.pnl || 0) >= 0;
                
                return (
                  <motion.div
                    key={position.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 bg-slate-950/50 rounded-lg border border-purple-900/30"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-xs">
                            {position.outcome}
                          </Badge>
                          <Badge className={`text-xs ${
                            position.status === 'active' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                            position.status === 'won' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                            position.status === 'lost' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                            'bg-gray-500/20 text-gray-300 border-gray-500/30'
                          }`}>
                            {position.status}
                          </Badge>
                          <Badge variant="outline" className="border-purple-500/30 text-purple-300 text-xs">
                            {position.bet_type.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm text-purple-300/70">
                          Market ID: {position.market_id}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xl font-bold ${isProfitable ? 'text-green-300' : 'text-red-300'}`}>
                          {isProfitable ? '+' : ''}${(position.pnl || 0).toFixed(2)}
                        </div>
                        <div className="text-xs text-purple-400/70">P/L</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-xs text-purple-400/70 mb-1">Amount</div>
                        <div className="font-semibold text-purple-200">${position.amount.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-purple-400/70 mb-1">Entry</div>
                        <div className="font-semibold text-purple-200">${position.entry_price.toFixed(3)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-purple-400/70 mb-1">Current</div>
                        <div className="font-semibold text-purple-200">${(position.current_value || position.entry_price).toFixed(3)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-purple-400/70 mb-1">Potential</div>
                        <div className="font-semibold text-green-300">${position.potential_payout.toFixed(2)}</div>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-purple-400/60">
                      Placed: {format(new Date(position.timestamp), "MMM d, yyyy HH:mm")}
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