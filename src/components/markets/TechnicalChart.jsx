import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, BarChart3, TrendingUp, Activity } from "lucide-react";
import { LineChart as RechartsLine, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { motion } from "framer-motion";

export default function TechnicalChart({ market }) {
  const [timeframe, setTimeframe] = useState("1D");
  const [indicators, setIndicators] = useState({ sma: true, rsi: false, volume: true });

  // Generate mock price data with technical indicators
  const generateChartData = () => {
    const currentPrice = market?.current_price || 0.5;
    const volatility = 0.05;
    const dataPoints = timeframe === "1H" ? 60 : timeframe === "4H" ? 48 : timeframe === "1D" ? 24 : timeframe === "7D" ? 168 : 720;
    
    let data = [];
    let price = currentPrice * (0.9 + Math.random() * 0.2);
    let volume = 1000;
    
    for (let i = 0; i < Math.min(dataPoints, 100); i++) {
      const change = (Math.random() - 0.5) * volatility;
      price = price * (1 + change);
      volume = volume * (0.8 + Math.random() * 0.4);
      
      data.push({
        time: i,
        price: price,
        volume: volume
      });
    }

    // Calculate SMA (20-period)
    if (indicators.sma) {
      data = data.map((point, i) => {
        if (i < 19) return { ...point, sma: null };
        const sum = data.slice(i - 19, i + 1).reduce((acc, p) => acc + p.price, 0);
        return { ...point, sma: sum / 20 };
      });
    }

    // Calculate RSI (14-period)
    if (indicators.rsi) {
      data = data.map((point, i) => {
        if (i < 14) return { ...point, rsi: 50 };
        
        let gains = 0, losses = 0;
        for (let j = i - 13; j <= i; j++) {
          const change = data[j].price - data[j - 1].price;
          if (change > 0) gains += change;
          else losses += Math.abs(change);
        }
        
        const avgGain = gains / 14;
        const avgLoss = losses / 14;
        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        const rsi = 100 - (100 / (1 + rs));
        
        return { ...point, rsi };
      });
    }

    return data;
  };

  const chartData = generateChartData();

  const timeframes = ["1H", "4H", "1D", "7D", "30D"];

  const toggleIndicator = (indicator) => {
    setIndicators(prev => ({ ...prev, [indicator]: !prev[indicator] }));
  };

  return (
    <Card className="bg-slate-900/60 border-purple-900/40">
      <CardHeader className="border-b border-purple-900/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-purple-200 flex items-center gap-2">
            <LineChart className="w-5 h-5" />
            Technical Analysis
          </CardTitle>
          <div className="flex items-center gap-2">
            {timeframes.map(tf => (
              <Button
                key={tf}
                size="sm"
                variant={timeframe === tf ? "default" : "outline"}
                onClick={() => setTimeframe(tf)}
                className={timeframe === tf 
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                  : "border-purple-500/30 text-purple-300 hover:bg-purple-900/20"
                }
              >
                {tf}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Technical Indicators Toggle */}
        <div className="flex flex-wrap gap-2">
          <Badge 
            className={`cursor-pointer transition-all ${indicators.sma ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'bg-slate-950 text-purple-400/50 border-purple-900/30'}`}
            onClick={() => toggleIndicator('sma')}
          >
            <TrendingUp className="w-3 h-3 mr-1" />
            SMA(20)
          </Badge>
          <Badge 
            className={`cursor-pointer transition-all ${indicators.rsi ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-slate-950 text-purple-400/50 border-purple-900/30'}`}
            onClick={() => toggleIndicator('rsi')}
          >
            <Activity className="w-3 h-3 mr-1" />
            RSI(14)
          </Badge>
          <Badge 
            className={`cursor-pointer transition-all ${indicators.volume ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-slate-950 text-purple-400/50 border-purple-900/30'}`}
            onClick={() => toggleIndicator('volume')}
          >
            <BarChart3 className="w-3 h-3 mr-1" />
            Volume
          </Badge>
        </div>

        {/* Price Chart */}
        <div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#a855f7" opacity={0.1} />
              <XAxis dataKey="time" stroke="#a855f7" fontSize={12} />
              <YAxis stroke="#a855f7" fontSize={12} domain={['dataMin', 'dataMax']} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #a855f7', borderRadius: '8px' }}
                formatter={(value) => `$${value.toFixed(3)}`}
              />
              <Area type="monotone" dataKey="price" stroke="#06b6d4" fill="url(#colorPrice)" strokeWidth={2} />
              {indicators.sma && (
                <Line type="monotone" dataKey="sma" stroke="#a855f7" strokeWidth={2} dot={false} />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* RSI Chart */}
        {indicators.rsi && (
          <div>
            <h4 className="text-sm font-semibold text-purple-200 mb-2">RSI (Relative Strength Index)</h4>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#a855f7" opacity={0.1} />
                <XAxis dataKey="time" stroke="#a855f7" fontSize={10} />
                <YAxis domain={[0, 100]} stroke="#a855f7" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #a855f7', borderRadius: '8px' }}
                  formatter={(value) => value.toFixed(2)}
                />
                <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" />
                <ReferenceLine y={30} stroke="#10b981" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="rsi" stroke="#a855f7" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex justify-between text-xs text-purple-400/70 mt-2">
              <span>Oversold (&lt;30)</span>
              <span>Neutral (30-70)</span>
              <span>Overbought (&gt;70)</span>
            </div>
          </div>
        )}

        {/* Volume Chart */}
        {indicators.volume && (
          <div>
            <h4 className="text-sm font-semibold text-purple-200 mb-2">Trading Volume</h4>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#a855f7" opacity={0.1} />
                <XAxis dataKey="time" stroke="#a855f7" fontSize={10} />
                <YAxis stroke="#a855f7" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #a855f7', borderRadius: '8px' }}
                  formatter={(value) => value.toFixed(0)}
                />
                <Bar dataKey="volume" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}