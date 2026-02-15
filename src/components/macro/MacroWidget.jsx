import React, { useMemo, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import FredKeySettings from './FredKeySettings';
import { RefreshCcw, Plus, Trash2, Settings } from 'lucide-react';

const DEFAULT_ECB_SERIES = [
  { flowRef: 'FM', key: 'M.U2.EUR.4F.KR.MRR_FR.LEV', label: 'ECB MRO (Main Refinancing Rate)' },
  { flowRef: 'FM', key: 'M.U2.EUR.4F.KR.DF.LEV', label: 'ECB Deposit Facility Rate' },
  { flowRef: 'FM', key: 'M.U2.EUR.4F.KR.MLF.LEV', label: 'ECB Marginal Lending Facility' },
  { flowRef: 'ILM', key: 'W.U2.C.T000000.Z5.Z01', label: 'Eurosystem Total Assets (weekly)' },
  { flowRef: 'ICP', key: 'M.U2.N.CP00.4.ANR', label: 'HICP YoY (Headline)' },
  { flowRef: 'ICP', key: 'M.U2.N.XEFG.4.ANR', label: 'HICP YoY (Core: ex energy & unproc. food)' },
  { flowRef: 'ICP', key: 'M.U2.N.CP01.4.ANR', label: 'HICP YoY - Food & non-alcoholic bev.' },
  { flowRef: 'ICP', key: 'M.U2.N.CP04.4.ANR', label: 'HICP YoY - Housing & utilities' },
  { flowRef: 'ICP', key: 'M.U2.N.CP07.4.ANR', label: 'HICP YoY - Transport' },
];

const NCB_LIST = [
  { code: 'DE', name: 'Bundesbank (DE)' },
  { code: 'FR', name: 'Banque de France (FR)' },
  { code: 'IT', name: 'Banca d’\u2019Italia (IT)' },
  { code: 'ES', name: 'Banco de España (ES)' },
  { code: 'NL', name: 'De Nederlandsche Bank (NL)' },
  { code: 'BE', name: 'National Bank of Belgium (BE)' },
  { code: 'AT', name: 'OeNB (AT)' },
  { code: 'IE', name: 'Central Bank of Ireland (IE)' },
  { code: 'PT', name: 'Banco de Portugal (PT)' },
  { code: 'FI', name: 'Bank of Finland (FI)' },
  { code: 'GR', name: 'Bank of Greece (GR)' },
  { code: 'LU', name: 'Banque centrale du Luxembourg (LU)' },
  { code: 'CY', name: 'Central Bank of Cyprus (CY)' },
  { code: 'MT', name: 'Central Bank of Malta (MT)' },
  { code: 'SI', name: 'Bank of Slovenia (SI)' },
  { code: 'SK', name: 'National Bank of Slovakia (SK)' },
  { code: 'EE', name: 'Eesti Pank (EE)' },
  { code: 'LV', name: 'Latvijas Banka (LV)' },
  { code: 'LT', name: 'Lietuvos bankas (LT)' },
];

export default function MacroWidget() {
  const [chartType, setChartType] = useState('line'); // 'line' | 'area' | 'column'
  const [currency, setCurrency] = useState('USD'); // 'EUR' | 'USD'
  const [showSettings, setShowSettings] = useState(false);
  const [activeSeries, setActiveSeries] = useState(() => DEFAULT_ECB_SERIES.map((s) => ({ ...s, enabled: true })));
  const [customFlowRef, setCustomFlowRef] = useState('');
  const [customKey, setCustomKey] = useState('');
  const [customLabel, setCustomLabel] = useState('');

  const enabledInputs = activeSeries.filter((s) => s.enabled).map(({ flowRef, key, label }) => ({ flowRef, key, label }));

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['ecb-macro', enabledInputs, currency],
    queryFn: async () => {
      const { data: res } = await base44.functions.invoke('getEcbMacroData', { series: enabledInputs, lastN: 300, currency });
      return res;
    },
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });

  const { series: chartSeries, categories } = useMemo(() => {
    const results = data?.results || [];
    // Build a sorted set of time categories
    const catSet = new Set();
    results.forEach((r) => r.points.forEach((p) => catSet.add(p.t)));
    const cats = Array.from(catSet).sort();

    const series = results.map((r) => {
      const map = new Map(r.points.map((p) => [p.t, p.v]));
      const values = cats.map((c) => (map.has(c) ? map.get(c) : null));
      return {
        name: r.label || `${r.flowRef}/${r.key}`,
        type: chartType,
        data: values,
        tooltip: { valueDecimals: 2 },
      };
    });

    return { series, categories: cats };
  }, [data, chartType]);

  const options = useMemo(() => ({
    title: { text: 'Macro Dashboard (ECB: Policy Rates, HICP, Balance Sheet)' },
    chart: { backgroundColor: 'transparent' },
    xAxis: {
      categories,
      tickInterval: Math.ceil(categories.length / 8),
      labels: { style: { color: '#cbd5e1' } },
    },
    yAxis: {
      title: { text: null },
      labels: { style: { color: '#cbd5e1' } },
      gridLineColor: 'rgba(148, 163, 184, 0.15)'
    },
    legend: { itemStyle: { color: '#e2e8f0' } },
    tooltip: { shared: true, crosshairs: true },
    plotOptions: {
      series: {
        marker: { enabled: chartType !== 'column' },
      },
      area: { fillOpacity: 0.2 },
      column: { pointPadding: 0.1, borderWidth: 0 },
    },
    credits: { enabled: false },
    series: chartSeries,
  }), [categories, chartSeries, chartType]);

  const toggleSeries = (idx) => {
    setActiveSeries((prev) => prev.map((s, i) => (i === idx ? { ...s, enabled: !s.enabled } : s)));
  };

  const addCustom = () => {
    if (!customFlowRef || !customKey) return;
    setActiveSeries((prev) => [
      ...prev,
      { flowRef: customFlowRef.trim(), key: customKey.trim(), label: customLabel.trim() || `${customFlowRef}/${customKey}` , enabled: true },
    ]);
    setCustomFlowRef('');
    setCustomKey('');
    setCustomLabel('');
  };

  const addNcbContributions = (codes = NCB_LIST.map(n => n.code)) => {
    const build = (code) => ({
      flowRef: 'ILM',
      key: `W.${code}.N.T000000.Z5.Z01`,
      label: `${(NCB_LIST.find(n => n.code === code)?.name) || code} – Total Assets (NCB)`,
    });
    setActiveSeries((prev) => {
      const existing = new Set(prev.map(s => `${s.flowRef}/${s.key}`));
      const toAdd = codes
        .map(build)
        .filter(s => !existing.has(`${s.flowRef}/${s.key}`))
        .map(s => ({ ...s, enabled: true }));
      return [...prev, ...toAdd];
    });
  };

   const removeSeries = (idx) => {
    setActiveSeries((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-4">
      <Card className="bg-slate-900/60 border-purple-900/30">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <CardTitle className="text-slate-200">Macro Widget</CardTitle>
          <div className="flex flex-wrap gap-2 items-center">
            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger className="w-36 bg-slate-800/60 text-slate-200 border-purple-900/30">
                <SelectValue placeholder="Chart type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">Line</SelectItem>
                <SelectItem value="area">Area</SelectItem>
                <SelectItem value="column">Bar</SelectItem>
              </SelectContent>
            </Select>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="w-28 bg-slate-800/60 text-slate-200 border-purple-900/30">
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2 border-purple-900/30" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCcw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} /> Refresh
            </Button>
            <Button variant="outline" className="gap-2 border-purple-900/30" onClick={() => setShowSettings((s) => !s)}>
              <Settings className="w-4 h-4" /> Settings
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-2">
            {activeSeries.map((s, idx) => (
              <div key={`${s.flowRef}/${s.key}`} className={`flex items-center gap-2 px-2 py-1 rounded-md border ${s.enabled ? 'bg-purple-900/30 text-purple-200 border-purple-700/40' : 'bg-slate-800/50 text-slate-400 border-slate-700/40'}`}>
                <button onClick={() => toggleSeries(idx)} className={`w-2 h-2 rounded-full ${s.enabled ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                <span className="text-xs">{s.label || `${s.flowRef}/${s.key}`}</span>
                <button onClick={() => removeSeries(idx)} className="text-slate-400 hover:text-red-300">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-2">
            <Button variant="secondary" className="gap-2" onClick={() => addNcbContributions()}>
              <Plus className="w-4 h-4" /> Add NCB Contributions (Total Assets)
            </Button>
            <span className="text-xs text-slate-400">Loads ILM.W.&lt;REF_AREA&gt;.N.T000000.Z5.Z01 per NCB</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
            <Input value={customFlowRef} onChange={(e) => setCustomFlowRef(e.target.value)} placeholder="flowRef (e.g. FM, ICP)" className="md:col-span-2 bg-slate-800/60 text-slate-200 border-purple-900/30" />
            <Input value={customKey} onChange={(e) => setCustomKey(e.target.value)} placeholder="key (e.g. M.U2.EUR.4F.KR.DF.LEV)" className="md:col-span-7 bg-slate-800/60 text-slate-200 border-purple-900/30" />
            <Input value={customLabel} onChange={(e) => setCustomLabel(e.target.value)} placeholder="Label (optional)" className="md:col-span-2 bg-slate-800/60 text-slate-200 border-purple-900/30" />
            <Button onClick={addCustom} className="md:col-span-1 bg-purple-600 hover:bg-purple-700 gap-2"><Plus className="w-4 h-4" /> Add</Button>
          </div>

          {showSettings && (
            <div className="mb-4">
              <FredKeySettings />
            </div>
          )}

          <div className="rounded-lg overflow-hidden bg-slate-900/40 p-2">
            {isLoading ? (
              <div className="text-slate-400 text-sm">Loading ECB data…</div>
            ) : (
              <HighchartsReact highcharts={Highcharts} options={options} />
            )}
          </div>

          <div className="mt-3 text-xs text-slate-400">
            US series (FRED) will appear once a FRED API key is saved in Settings. Currently showing ECB data only.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}