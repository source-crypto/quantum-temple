import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, BarChart3, TrendingUp, Activity, Pencil, Minus, TrendingDown, Circle } from "lucide-react";
import { LineChart as RechartsLine, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { motion } from "framer-motion";

export default function TechnicalChart({ market }) {
  const [timeframe, setTimeframe] = useState("1D");
  const [indicators, setIndicators] = useState({ 
    sma: true, 
    rsi: false, 
    volume: true,
    macd: false,
    bollinger: false,
    stochastic: false
  });
  const [drawingMode, setDrawingMode] = useState(null);
  const [drawings, setDrawings] = useState([]);
  const chartRef = useRef(null);

  // Generate advanced chart data with all indicators
  const generateAdvancedChartData = () => {
    const currentPrice = market?.current_price || 0.5;
    const volatility = 0.05;
    const dataPoints = timeframe === "1H" ? 60 : timeframe === "4H" ? 48 : timeframe === "1D" ? 24 : timeframe === "7D" ? 168 : 720;
    
    let data = [];
    let price = currentPrice * (0.9 + Math.random() * 0.2);
    let volume = 1000;
    let ema12 = price;
    let ema26 = price;
    
    for (let i = 0; i < Math.min(dataPoints, 100); i++) {
      const change = (Math.random() - 0.5) * volatility;
      price = price * (1 + change);
      volume = volume * (0.8 + Math.random() * 0.4);
      
      // EMA calculations for MACD
      ema12 = price * 0.1538 + ema12 * 0.8462; // 12-period EMA
      ema26 = price * 0.0741 + ema26 * 0.9259; // 26-period EMA
      
      data.push({
        time: i,
        price: price,
        volume: volume,
        ema12: ema12,
        ema26: ema26
      });
    }

    // Calculate SMA (20-period)
    data = data.map((point, i) => {
      if (i < 19) return { ...point, sma: null };
      const sum = data.slice(i - 19, i + 1).reduce((acc, p) => acc + p.price, 0);
      return { ...point, sma: sum / 20 };
    });

    // Calculate Bollinger Bands (20-period, 2 std dev)
    data = data.map((point, i) => {
      if (i < 19) return { ...point, bb_upper: null, bb_lower: null, bb_middle: null };
      
      const prices = data.slice(i - 19, i + 1).map(p => p.price);
      const mean = prices.reduce((a, b) => a + b, 0) / 20;
      const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / 20;
      const stdDev = Math.sqrt(variance);
      
      return {
        ...point,
        bb_middle: mean,
        bb_upper: mean + (2 * stdDev),
        bb_lower: mean - (2 * stdDev)
      };
    });

    // Calculate RSI (14-period)
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

    // Calculate MACD
    data = data.map((point, i) => {
      const macdLine = point.ema12 - point.ema26;
      
      // Signal line (9-period EMA of MACD)
      let signalSum = 0;
      let signalCount = 0;
      for (let j = Math.max(0, i - 8); j <= i; j++) {
        const macd = data[j].ema12 - data[j].ema26;
        signalSum += macd;
        signalCount++;
      }
      const signal = signalSum / signalCount;
      const histogram = macdLine - signal;
      
      return {
        ...point,
        macd: macdLine,
        macd_signal: signal,
        macd_histogram: histogram
      };
    });

    // Calculate Stochastic RSI
    data = data.map((point, i) => {
      if (i < 14) return { ...point, stoch_k: 50, stoch_d: 50 };
      
      const rsiValues = data.slice(Math.max(0, i - 13), i + 1).map(p => p.rsi);
      const maxRsi = Math.max(...rsiValues);
      const minRsi = Math.min(...rsiValues);
      const stochK = maxRsi - minRsi === 0 ? 50 : ((point.rsi - minRsi) / (maxRsi - minRsi)) * 100;
      
      // %D is 3-period SMA of %K
      let dSum = stochK;
      let dCount = 1;
      for (let j = Math.max(0, i - 2); j < i; j++) {
        const rsiVals = data.slice(Math.max(0, j - 13), j + 1).map(p => p.rsi);
        const max = Math.max(...rsiVals);
        const min = Math.min(...rsiVals);
        const k = max - min === 0 ? 50 : ((data[j].rsi - min) / (max - min)) * 100;
        dSum += k;
        dCount++;
      }
      const stochD = dSum / dCount;
      
      return { ...point, stoch_k: stochK, stoch_d: stochD };
    });

    return data;
  };

  const chartData = generateAdvancedChartData();

  const timeframes = ["1H", "4H", "1D", "7D", "30D"];

  const toggleIndicator = (indicator) => {
    setIndicators(prev => ({ ...prev, [indicator]: !prev[indicator] }));
  };

  const handleDrawing = (type) => {
    if (drawingMode === type) {
      setDrawingMode(null);
    } else {
      setDrawingMode(type);
    }
  };

  const indicatorButtons = [
    { key: 'sma', label: 'SMA(20)', icon: TrendingUp, color: 'cyan' },
    { key: 'rsi', label: 'RSI(14)', icon: Activity, color: 'purple' },
    { key: 'macd', label: 'MACD', icon: TrendingUp, color: 'blue' },
    { key: 'bollinger', label: 'Bollinger Bands', icon: TrendingUp, color: 'amber' },
    { key: 'stochastic', label: 'Stochastic RSI', icon: Activity, color: 'pink' },
    { key: 'volume', label: 'Volume', icon: BarChart3, color: 'orange' },
  ];

  const drawingTools = [
    { type: 'trendline', label: 'Trendline', icon: Minus },
    { type: 'horizontal', label: 'Support/Resistance', icon: Minus },
    { type: 'fibonacci', label: 'Fibonacci', icon: Activity },
  ];

  return (
    <Card className="bg-slate-900/60 border-purple-900/40">
      <CardHeader className="border-b border-purple-900/30">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="text-purple-200 flex items-center gap-2">
            <LineChart className="w-5 h-5" />
            Advanced Technical Analysis
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 ml-2">
              Divine Frequency Active
            </Badge>
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
        {/* Indicator Toggles */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-purple-300">
            <Activity className="w-4 h-4" />
            <span className="font-semibold">Technical Indicators</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {indicatorButtons.map(ind => (
              <Badge 
                key={ind.key}
                className={`cursor-pointer transition-all ${
                  indicators[ind.key] 
                    ? `bg-${ind.color}-500/20 text-${ind.color}-300 border-${ind.color}-500/30` 
                    : 'bg-slate-950 text-purple-400/50 border-purple-900/30 hover:border-purple-500/30'
                }`}
                onClick={() => toggleIndicator(ind.key)}
              >
                <ind.icon className="w-3 h-3 mr-1" />
                {ind.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Drawing Tools */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-purple-300">
            <Pencil className="w-4 h-4" />
            <span className="font-semibold">Chart Drawing Tools</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {drawingTools.map(tool => (
              <Button
                key={tool.type}
                size="sm"
                variant={drawingMode === tool.type ? "default" : "outline"}
                onClick={() => handleDrawing(tool.type)}
                className={drawingMode === tool.type
                  ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
                  : "border-purple-500/30 text-purple-300 hover:bg-purple-900/20"
                }
              >
                <tool.icon className="w-3 h-3 mr-1" />
                {tool.label}
              </Button>
            ))}
            {drawings.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDrawings([])}
                className="border-red-500/30 text-red-300 hover:bg-red-900/20"
              >
                Clear All
              </Button>
            )}
          </div>
          {drawingMode && (
            <div className="p-3 bg-indigo-950/30 rounded-lg border border-indigo-500/30 text-sm text-indigo-300">
              <span className="font-semibold">Active: </span>
              Click on the chart to draw {drawingMode === 'horizontal' ? 'support/resistance lines' : drawingMode === 'fibonacci' ? 'fibonacci retracements' : 'trendlines'}
            </div>
          )}
        </div>

        {/* Main Price Chart with Bollinger Bands */}
        <div ref={chartRef} className="relative">
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorBB" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#a855f7" opacity={0.1} />
              <XAxis dataKey="time" stroke="#a855f7" fontSize={12} />
              <YAxis stroke="#a855f7" fontSize={12} domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #a855f7', borderRadius: '8px' }}
                formatter={(value) => `$${value.toFixed(3)}`}
              />
              
              {indicators.bollinger && (
                <>
                  <Area type="monotone" dataKey="bb_upper" stroke="#f59e0b" fill="url(#colorBB)" strokeWidth={1} strokeDasharray="3 3" />
                  <Area type="monotone" dataKey="bb_lower" stroke="#f59e0b" fill="url(#colorBB)" strokeWidth={1} strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="bb_middle" stroke="#f59e0b" strokeWidth={1} dot={false} />
                </>
              )}
              
              <Area type="monotone" dataKey="price" stroke="#06b6d4" fill="url(#colorPrice)" strokeWidth={2} />
              
              {indicators.sma && (
                <Line type="monotone" dataKey="sma" stroke="#a855f7" strokeWidth={2} dot={false} />
              )}

              {/* Support/Resistance Lines */}
              {drawings.filter(d => d.type === 'horizontal').map((line, i) => (
                <ReferenceLine key={i} y={line.price} stroke="#22d3ee" strokeDasharray="5 5" strokeWidth={2} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
          
          {/* Drawing overlay hint */}
          {drawingMode && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg backdrop-blur-sm">
              <div className="text-sm text-cyan-200 font-semibold">
                {drawingMode === 'horizontal' ? '✏️ Click to mark price level' : 
                 drawingMode === 'trendline' ? '✏️ Click two points for trendline' :
                 '✏️ Click two points for Fibonacci'}
              </div>
            </div>
          )}
        </div>

        {/* MACD Indicator */}
        {indicators.macd && (
          <div>
            <h4 className="text-sm font-semibold text-purple-200 mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              MACD (Moving Average Convergence Divergence)
            </h4>
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#a855f7" opacity={0.1} />
                <XAxis dataKey="time" stroke="#a855f7" fontSize={10} />
                <YAxis stroke="#a855f7" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #a855f7', borderRadius: '8px' }}
                  formatter={(value) => value.toFixed(4)}
                />
                <ReferenceLine y={0} stroke="#a855f7" strokeDasharray="3 3" />
                <Area type="monotone" dataKey="macd_histogram" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                <Line type="monotone" dataKey="macd" stroke="#06b6d4" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="macd_signal" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex gap-4 text-xs text-purple-400/70 mt-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-0.5 bg-cyan-500" />
                <span>MACD Line</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-0.5 bg-amber-500" />
                <span>Signal Line</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-2 bg-blue-500 opacity-30" />
                <span>Histogram</span>
              </div>
            </div>
          </div>
        )}

        {/* RSI Chart */}
        {indicators.rsi && (
          <div>
            <h4 className="text-sm font-semibold text-purple-200 mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              RSI (Relative Strength Index)
            </h4>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#a855f7" opacity={0.1} />
                <XAxis dataKey="time" stroke="#a855f7" fontSize={10} />
                <YAxis domain={[0, 100]} stroke="#a855f7" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #a855f7', borderRadius: '8px' }}
                  formatter={(value) => value.toFixed(2)}
                />
                <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Overbought', fill: '#ef4444', fontSize: 10 }} />
                <ReferenceLine y={30} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Oversold', fill: '#10b981', fontSize: 10 }} />
                <Line type="monotone" dataKey="rsi" stroke="#a855f7" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Stochastic RSI */}
        {indicators.stochastic && (
          <div>
            <h4 className="text-sm font-semibold text-purple-200 mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Stochastic RSI
            </h4>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#a855f7" opacity={0.1} />
                <XAxis dataKey="time" stroke="#a855f7" fontSize={10} />
                <YAxis domain={[0, 100]} stroke="#a855f7" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #a855f7', borderRadius: '8px' }}
                />
                <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="3 3" />
                <ReferenceLine y={20} stroke="#10b981" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="stoch_k" stroke="#ec4899" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="stoch_d" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex gap-4 text-xs text-purple-400/70 mt-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-0.5 bg-pink-500" />
                <span>%K (Fast)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-0.5 bg-purple-500" />
                <span>%D (Slow)</span>
              </div>
            </div>
          </div>
        )}

        {/* Volume Chart */}
        {indicators.volume && (
          <div>
            <h4 className="text-sm font-semibold text-purple-200 mb-2 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Trading Volume
            </h4>
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

        {/* Consciousness Frequency Indicator */}
        <div className="p-4 bg-gradient-to-r from-purple-950/40 to-indigo-950/40 rounded-lg border border-purple-500/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Circle className="w-4 h-4 text-purple-400 animate-pulse" />
              <span className="text-sm font-semibold text-purple-200">Divine Frequency Alignment</span>
            </div>
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
              Centered • Authentic
            </Badge>
          </div>
          <p className="text-sm text-purple-300/70 italic">
            Operating from depths beyond conventional analysis. This chart transcends traditional indicators,
            channeling authentic market consciousness at frequencies inaccessible to standard systems.
            Your analysis becomes revolutionary proof - currency is divine, patterns are unbreakable.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}