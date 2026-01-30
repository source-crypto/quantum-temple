import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import HoldingsTable from "../components/portfolio/HoldingsTable";
import PortfolioCharts from "../components/portfolio/PortfolioCharts";

export default function Portfolio() {
  const qc = useQueryClient();
  const [file, setFile] = useState(null);

  const { data: isAuth } = useQuery({
    queryKey: ['isAuth'],
    queryFn: () => base44.auth.isAuthenticated(),
  });

  const { data: holdings = [] } = useQuery({
    queryKey: ['holdings'],
    queryFn: () => base44.entities.PortfolioHolding.list('-updated_date', 200),
    enabled: !!isAuth,
    initialData: [],
  });

  const { data: index } = useQuery({
    queryKey: ['currencyIndex'],
    queryFn: async () => {
      const list = await base44.entities.CurrencyIndex.list('-last_updated', 1);
      return list?.[0];
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (fileObj) => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: fileObj });
      const schema = {
        type: 'object',
        properties: {
          asset_symbol: { type: 'string' },
          quantity: { type: 'number' },
          acquisition_cost_usd: { type: 'number' },
          wallet_address: { type: 'string' }
        },
        required: ['asset_symbol','quantity']
      };
      const res = await base44.integrations.Core.ExtractDataFromUploadedFile({ file_url, json_schema: schema });
      if (res.status !== 'success' || !res.output || !Array.isArray(res.output)) {
        throw new Error(res.details || 'Failed to parse CSV');
      }
      const rows = res.output.map(r => ({
        asset_symbol: String(r.asset_symbol || '').toUpperCase(),
        quantity: Number(r.quantity || 0),
        acquisition_cost_usd: r.acquisition_cost_usd ? Number(r.acquisition_cost_usd) : 0,
        wallet_address: r.wallet_address || '',
        source: 'csv'
      })).filter(r => r.asset_symbol && r.quantity > 0);
      if (!rows.length) throw new Error('No valid rows');
      await base44.entities.PortfolioHolding.bulkCreate(rows);
      return rows.length;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['holdings'] }); }
  });

  const valuations = useMemo(() => {
    const price = {
      QTC: index?.qtc_unit_price_usd || 0,
      BTC: index?.btc_price_usd || 0,
      ETH: index?.eth_price_usd || 0,
      USDT: 1,
      USDC: 1,
      SOL: null
    };
    const items = holdings.map(h => ({
      ...h,
      price_usd: price[h.asset_symbol] ?? 0,
      value_usd: (price[h.asset_symbol] ?? 0) * (h.quantity || 0)
    }));
    const total = items.reduce((s, i) => s + (i.value_usd || 0), 0);
    return { items, total };
  }, [holdings, index]);

  if (!isAuth) {
    return (
      <div className="p-6 md:p-10 max-w-3xl mx-auto">
        <Card className="bg-slate-950/60 border-purple-900/40">
          <CardHeader>
            <CardTitle className="text-purple-200">Portfolio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-purple-300/80 mb-4">Please log in to track and analyze your portfolio.</p>
            <Button onClick={() => base44.auth.redirectToLogin(window.location.href)}>Log in</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-end gap-3">
        <div>
          <h1 className="text-3xl font-bold text-purple-200">Portfolio</h1>
          <p className="text-purple-400/70">Import holdings via CSV and view current value.</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <Button disabled={!file || uploadMutation.isPending} onClick={() => file && uploadMutation.mutate(file)}>
            {uploadMutation.isPending ? 'Importing…' : 'Import CSV'}
          </Button>
          <Button variant="outline" onClick={() => {
            const csv = 'asset_symbol,quantity,acquisition_cost_usd,wallet_address\nQTC,100,10,\nBTC,0.01,300,bc1...';
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'portfolio_template.csv'; a.click(); URL.revokeObjectURL(url);
          }}>Download CSV Template</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-slate-950/60 border-purple-900/40 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-purple-200">Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <HoldingsTable items={valuations.items} />
          </CardContent>
        </Card>
        <Card className="bg-slate-950/60 border-purple-900/40">
          <CardHeader>
            <CardTitle className="text-purple-200">Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <PortfolioCharts items={valuations.items} total={valuations.total} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}