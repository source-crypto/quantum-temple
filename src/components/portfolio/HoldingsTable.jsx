import React from "react";

export default function HoldingsTable({ items }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="text-purple-300/70">
          <tr>
            <th className="text-left p-2">Asset</th>
            <th className="text-right p-2">Quantity</th>
            <th className="text-right p-2">Price (USD)</th>
            <th className="text-right p-2">Value (USD)</th>
          </tr>
        </thead>
        <tbody className="text-purple-100/90">
          {items.map((i) => (
            <tr key={i.id || `${i.asset_symbol}-${i.wallet_address}-${i.quantity}`} className="border-t border-purple-900/30">
              <td className="p-2 font-medium">{i.asset_symbol}</td>
              <td className="p-2 text-right">{Number(i.quantity).toLocaleString()}</td>
              <td className="p-2 text-right">{(i.price_usd || 0).toLocaleString(undefined,{ style:'currency', currency:'USD'})}</td>
              <td className="p-2 text-right">{(i.value_usd || 0).toLocaleString(undefined,{ style:'currency', currency:'USD'})}</td>
            </tr>
          ))}
          {!items.length && (
            <tr>
              <td className="p-3 text-purple-400/70" colSpan={4}>No holdings yet. Import a CSV to get started.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}