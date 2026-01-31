import React, { useEffect, useRef } from "react";

export default function TradingViewWidget({ symbol = "BINANCE:BTCUSDT", interval = "60", height = 420 }) {
  const container = useRef(null);

  useEffect(() => {
    const scriptId = "tv-script";
    const load = () => {
      if (!window.TradingView) return;
      if (!container.current) return;
      // Clear previous widget if any
      container.current.innerHTML = "";
      // eslint-disable-next-line no-new
      new window.TradingView.widget({
        autosize: true,
        symbol,
        interval,
        timezone: "Etc/UTC",
        theme: "dark",
        style: "1",
        locale: "en",
        toolbar_bg: "#0f172a",
        hide_side_toolbar: false,
        enable_publishing: false,
        withdateranges: true,
        range: "1D",
        container_id: "tv_widget_container",
      });
    };

    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://s3.tradingview.com/tv.js";
      script.type = "text/javascript";
      script.onload = load;
      document.body.appendChild(script);
    } else {
      load();
    }

    return () => {
      if (container.current) container.current.innerHTML = "";
    };
  }, [symbol, interval]);

  return (
    <div style={{ height }} className="rounded-lg overflow-hidden border border-purple-900/30 bg-slate-900/60">
      <div id="tv_widget_container" ref={container} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}