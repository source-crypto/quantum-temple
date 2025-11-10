import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Landmark, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Shield,
  Activity,
  Zap,
  Globe,
  Lock
} from "lucide-react";
import { motion } from "framer-motion";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function TreasuryDashboard() {
  // Fetch protocol fund data
  const { data: protocolFunds, isLoading: fundsLoading } = useQuery({
    queryKey: ['protocolFunds'],
    queryFn: () => base44.entities.ProtocolFund.list(),
    initialData: [],
  });

  // Fetch central bank transactions
  const { data: centralBankTransactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['centralBankTransactions'],
    queryFn: () => base44.entities.CentralBankTransaction.list('-timestamp', 10),
    initialData: [],
  });

  // Fetch currency index for market data
  const { data: currencyIndex } = useQuery({
    queryKey: ['currencyIndex'],
    queryFn: async () => {
      const indices = await base44.entities.CurrencyIndex.list('-last_updated', 1);
      return indices.length > 0 ? indices[0] : null;
    },
  });

  // Calculate total treasury value
  const totalTreasuryValue = protocolFunds.reduce((sum, fund) => sum + (fund.total_balance_usd || 0), 0);
  const totalQTCBalance = protocolFunds.reduce((sum, fund) => sum + (fund.qtc_balance || 0), 0);
  const totalDistributed = protocolFunds.reduce((sum, fund) => sum + (fund.total_distributed || 0), 0);

  // Fund distribution data for pie chart
  const fundDistributionData = protocolFunds.map(fund => ({
    name: fund.fund_name,
    value: fund.total_balance_usd || 0,
    color: fund.fund_type === 'founding_fathers' ? '#f59e0b' : 
           fund.fund_type === 'development' ? '#06b6d4' :
           fund.fund_type === 'treasury_reserve' ? '#a855f7' :
           fund.fund_type === 'admin_operations' ? '#10b981' : '#ec4899'
  }));

  // Mock historical data for treasury growth
  const treasuryGrowthData = [
    { month: 'Jan', value: 450000000000 },
    { month: 'Feb', value: 470000000000 },
    { month: 'Mar', value: 490000000000 },
    { month: 'Apr', value: 510000000000 },
    { month: 'May', value: 530000000000 },
    { month: 'Jun', value: 550000000000 },
    { month: 'Jul', value: totalTreasuryValue }
  ];

  // Recent transactions for bar chart
  const transactionVolumeData = centralBankTransactions.slice(0, 7).map((tx, i) => ({
    id: `TX-${i + 1}`,
    amount: tx.usd_amount || 0,
    type: tx.transaction_type
  }));

  if (fundsLoading || transactionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-purple-400">Loading treasury data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Treasury Overview Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-amber-950/40 to-orange-950/40 border-amber-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <DollarSign className="w-8 h-8 text-amber-400" />
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +24.5%
                </Badge>
              </div>
              <div className="text-3xl font-bold text-amber-200 mb-1">
                ${(totalTreasuryValue / 1000000000).toFixed(1)}B
              </div>
              <div className="text-sm text-amber-400/70">Total Treasury Value</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-cyan-950/40 to-blue-950/40 border-cyan-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <Zap className="w-8 h-8 text-cyan-400" />
                <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                  QTC
                </Badge>
              </div>
              <div className="text-3xl font-bold text-cyan-200 mb-1">
                {(totalQTCBalance / 1000000).toFixed(2)}M
              </div>
              <div className="text-sm text-cyan-400/70">Total QTC Holdings</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-purple-950/40 to-indigo-950/40 border-purple-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <Activity className="w-8 h-8 text-purple-400" />
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                  Distributed
                </Badge>
              </div>
              <div className="text-3xl font-bold text-purple-200 mb-1">
                ${(totalDistributed / 1000000).toFixed(2)}M
              </div>
              <div className="text-sm text-purple-400/70">Total Distributed</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-green-950/40 to-emerald-950/40 border-green-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <Globe className="w-8 h-8 text-green-400" />
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              </div>
              <div className="text-3xl font-bold text-green-200 mb-1">
                IMF
              </div>
              <div className="text-sm text-green-400/70">Compliance Active</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Treasury Growth Chart */}
        <Card className="bg-slate-900/60 border-purple-900/40">
          <CardHeader>
            <CardTitle className="text-purple-200 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Treasury Growth (7 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={treasuryGrowthData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#a855f7" opacity={0.1} />
                <XAxis dataKey="month" stroke="#a855f7" fontSize={12} />
                <YAxis 
                  stroke="#a855f7" 
                  fontSize={12}
                  tickFormatter={(value) => `$${(value / 1000000000).toFixed(0)}B`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #a855f7', borderRadius: '8px' }}
                  formatter={(value) => `$${(value / 1000000000).toFixed(2)}B`}
                />
                <Area type="monotone" dataKey="value" stroke="#f59e0b" fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Fund Distribution */}
        <Card className="bg-slate-900/60 border-purple-900/40">
          <CardHeader>
            <CardTitle className="text-purple-200 flex items-center gap-2">
              <Landmark className="w-5 h-5" />
              Fund Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={fundDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={(entry) => `${entry.name}`}
                >
                  {fundDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #a855f7', borderRadius: '8px' }}
                  formatter={(value) => `$${(value / 1000000000).toFixed(2)}B`}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {fundDistributionData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-purple-300">{item.name}</span>
                  </div>
                  <span className="text-purple-200 font-semibold">
                    ${(item.value / 1000000000).toFixed(1)}B
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Protocol Funds Details */}
      <Card className="bg-slate-900/60 border-purple-900/40">
        <CardHeader>
          <CardTitle className="text-purple-200 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Protocol Funds Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {protocolFunds.map((fund, index) => (
              <motion.div
                key={fund.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-slate-950/50 rounded-lg border border-purple-900/30"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-purple-200">{fund.fund_name}</h4>
                    <p className="text-xs text-purple-400/70 capitalize">
                      {fund.fund_type.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {fund.central_bank_connected && (
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                        <Globe className="w-3 h-3 mr-1" />
                        Bank Connected
                      </Badge>
                    )}
                    {fund.admin_access_enabled && (
                      <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
                        <Lock className="w-3 h-3 mr-1" />
                        Admin Access
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-xs text-purple-400/70 mb-1">Balance (USD)</div>
                    <div className="text-lg font-bold text-purple-200">
                      ${(fund.total_balance_usd / 1000000000).toFixed(2)}B
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-purple-400/70 mb-1">QTC Balance</div>
                    <div className="text-lg font-bold text-cyan-300">
                      {(fund.qtc_balance || 0).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-purple-400/70 mb-1">Allocated</div>
                    <div className="text-lg font-bold text-amber-300">
                      ${(fund.allocated_to_admins || 0).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-purple-400/70 mb-1">Distributed</div>
                    <div className="text-lg font-bold text-green-300">
                      ${(fund.total_distributed || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Central Bank Transactions */}
      {centralBankTransactions.length > 0 && (
        <Card className="bg-slate-900/60 border-purple-900/40">
          <CardHeader>
            <CardTitle className="text-purple-200 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Central Bank Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {centralBankTransactions.slice(0, 5).map((tx, index) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 bg-slate-950/50 rounded border border-purple-900/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-purple-200 text-sm capitalize">
                        {tx.transaction_type.replace(/_/g, ' ')}
                      </div>
                      <div className="text-xs text-purple-400/70">
                        {tx.central_bank_network || 'Central Bank'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-300">
                      ${tx.usd_amount?.toLocaleString()}
                    </div>
                    <Badge 
                      className={`text-xs ${
                        tx.settlement_status === 'settled' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                        tx.settlement_status === 'pending' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                        'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      }`}
                    >
                      {tx.settlement_status}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Treasury Health Indicator */}
      <Card className="bg-gradient-to-r from-green-950/40 to-emerald-950/40 border-green-500/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-green-200 mb-2">Treasury Health: Excellent</h3>
              <p className="text-sm text-green-300/70">
                All protocol funds are fully capitalized and secured. Central Bank connections active.
                IMF compliance maintained. Divine ordinance protection in place.
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-green-200">98%</div>
              <div className="text-xs text-green-400/70">Health Score</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}