import { useState, useEffect, useRef } from 'react';

export function useCEXWebSocket(exchanges = ['binance', 'coinbase']) {
  const [prices, setPrices] = useState({});
  const [priceChanges, setPriceChanges] = useState({});
  const wsConnections = useRef({});

  useEffect(() => {
    // Mock WebSocket simulation for demo (in production, use actual exchange WebSocket APIs)
    const simulateWebSocket = (exchange, pair) => {
      const key = `${exchange}-${pair}`;
      const basePrice = prices[key]?.price || 102000 + Math.random() * 1000;
      
      const interval = setInterval(() => {
        const change = (Math.random() - 0.48) * 50; // Slight upward bias
        const newPrice = Math.max(basePrice + change, 1000);
        const percentChange = ((newPrice - basePrice) / basePrice) * 100;
        
        setPrices(prev => ({
          ...prev,
          [key]: {
            price: newPrice,
            volume: 10000000 + Math.random() * 40000000,
            timestamp: Date.now()
          }
        }));

        setPriceChanges(prev => ({
          ...prev,
          [key]: {
            direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
            percent: percentChange,
            timestamp: Date.now()
          }
        }));
      }, 2000 + Math.random() * 1000); // Random interval between 2-3 seconds

      return interval;
    };

    // Simulate connections for multiple pairs
    const pairs = ['QTC/USDT', 'QTC/BTC', 'QTC/ETH'];
    const intervals = [];

    exchanges.forEach(exchange => {
      pairs.forEach(pair => {
        intervals.push(simulateWebSocket(exchange, pair));
      });
    });

    // Cleanup
    return () => {
      intervals.forEach(interval => clearInterval(interval));
    };
  }, [exchanges]);

  return { prices, priceChanges };
}