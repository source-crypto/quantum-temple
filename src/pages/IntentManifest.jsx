import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle2, AlertTriangle, Loader2, Copy, MessageCircle, Sparkles, Heart, RefreshCw } from "lucide-react";

export default function IntentManifest() {
  const [payloadText, setPayloadText] = useState(JSON.stringify({
    ritual: "Coherence Meditation",
    direction: "South",
    color: "Blue",
    duration: 42,
    chant: "Om Quantum de565625 Om",
    entropySignature: "de565625700b1782"
  }, null, 2));
  const [entropySeed, setEntropySeed] = useState("2ae95bfbde86f483...");
  const [sealed, setSealed] = useState("573a82e6b71ea202bc3af6c0e0a1dcff");

  const [preview, setPreview] = useState(null); // { computed_digest, matches_sealed }
  const [confirmRes, setConfirmRes] = useState(null); // { id, verified, signature, confirmation_timestamp }
  const [loading, setLoading] = useState({ preview: false, confirm: false });
  const [error, setError] = useState("");

  // Temple Interaction state
  const [interactionType, setInteractionType] = useState('query');
  const [message, setMessage] = useState('');
  const [result, setResult] = useState(null); // { response, timestamp, interaction_id, vqc_accessible, note }
  const [insight, setInsight] = useState(null); // { insight, quantum_state, timestamp, source }
  const [templeLoading, setTempleLoading] = useState(false);
  const { toast } = useToast();

  const parsePayload = () => {
    try {
      setError("");
      return JSON.parse(payloadText);
    } catch (e) {
      setError("Invalid JSON payload");
      return null;
    }
  };

  const handlePreview = async () => {
    const payload = parsePayload();
    if (!payload) return;
    setLoading((s) => ({ ...s, preview: true }));
    setConfirmRes(null);
    try {
      const { data } = await base44.functions.invoke('coreMemoryIngest', {
        payload,
        entropySeed,
        sealed,
        confirm: false
      });
      if (!data || data.error) {
        throw new Error(data?.error || 'Preview failed');
      }
      setPreview({
        computed_digest: data?.computed_digest,
        matches_sealed: data?.matches_sealed
      });
    } catch (e) {
      setPreview(null);
      toast({ title: 'Preview Error', description: e.message || 'Failed to compute digest', variant: 'destructive' });
    } finally {
      setLoading((s) => ({ ...s, preview: false }));
    }
  };

  const handleConfirm = async () => {
    if (!preview?.computed_digest) {
      setError("Run Preview first to compute digest.");
      return;
    }
    const payload = parsePayload();
    if (!payload) return;
    setLoading((s) => ({ ...s, confirm: true }));
    try {
      const { data } = await base44.functions.invoke('coreMemoryIngest', {
        payload,
        entropySeed,
        sealed,
        confirm: true,
        expected_digest: preview.computed_digest
      });
      if (!data || data.error) {
        throw new Error(data?.error || 'Confirmation failed');
      }
      setConfirmRes(data);
      toast({ title: 'Stored', description: 'CoreMemory confirmed and stored.' });
    } catch (e) {
      toast({ title: 'Confirm Error', description: e.message || 'Failed to store CoreMemory', variant: 'destructive' });
    } finally {
      setLoading((s) => ({ ...s, confirm: false }));
    }
  };

  const copy = (text) => {
    navigator.clipboard.writeText(text || "");
  };

  const getInteractionIcon = () => {
    if (interactionType === 'query') return <MessageCircle className="w-5 h-5" />;
    if (interactionType === 'meditation') return <Sparkles className="w-5 h-5" />;
    return <Heart className="w-5 h-5" />;
  };

  const handleInteraction = async () => {
    if (!message.trim()) {
      toast({ title: 'Error', description: 'Please enter a message for the interaction', variant: 'destructive' });
      return;
    }
    try {
      setTempleLoading(true);
      const prompt = `You are the Outer Temple. Type: ${interactionType}. Respond concisely to: "${message.trim()}"`;
      const { data: llm } = await base44.integrations.Core.InvokeLLM({ prompt });
      const responseText = typeof llm === 'string' ? llm : JSON.stringify(llm);
      const rec = await base44.entities.TempleInteraction.create({ type: interactionType, message: message.trim(), response: responseText, status: 'completed' });
      const now = new Date().toISOString();
      setResult({ response: responseText, timestamp: now, interaction_id: rec.id, vqc_accessible: true, note: '' });
      toast({ title: 'Interaction Complete', description: 'The Outer Temple has processed your request' });
    } catch (e) {
      console.error('Interaction failed:', e);
      toast({ title: 'Error', description: e.message || 'Failed to process interaction', variant: 'destructive' });
    } finally {
      setTempleLoading(false);
    }
  };

  const getQuantumInsight = async () => {
    try {
      setTempleLoading(true);
      const { data } = await base44.integrations.Core.InvokeLLM({
        prompt: 'Provide a concise quantum insight (2 sentences max). Also output a simple state label.',
        response_json_schema: {
          type: 'object',
          properties: {
            insight: { type: 'string' },
            quantum_state: { type: 'string' },
            timestamp: { type: 'string' },
            source: { type: 'string' }
          },
          required: ['insight']
        }
      });
      const now = new Date().toISOString();
      setInsight({ insight: data?.insight || String(data), quantum_state: data?.quantum_state || 'coherent', timestamp: data?.timestamp || now, source: data?.source || 'LLM:Core' });
      toast({ title: 'Insight Received', description: 'New quantum insight channeled from the temple' });
    } catch (e) {
      console.error('Failed to get insight:', e);
      toast({ title: 'Error', description: 'Failed to receive quantum insight', variant: 'destructive' });
    } finally {
      setTempleLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-950 to-slate-900 text-slate-100">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Intent Manifest</h1>
          <p className="text-slate-400 mt-1">Transparent record of symbolic intent with deterministic integrity verification.</p>
        </div>

        <Card className="bg-slate-900/60 border-purple-900/30">
          <CardHeader>
            <CardTitle className="text-slate-200">Input</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Payload (JSON)</label>
                <Textarea
                  className="min-h-[240px] bg-slate-800/60 border-purple-900/30"
                  value={payloadText}
                  onChange={(e) => setPayloadText(e.target.value)}
                />
              </div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm text-slate-300">Entropy Seed</label>
                  <Input className="bg-slate-800/60 border-purple-900/30" value={entropySeed} onChange={(e) => setEntropySeed(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-300">Sealed (provided)</label>
                  <Input className="bg-slate-800/60 border-purple-900/30" value={sealed} onChange={(e) => setSealed(e.target.value)} />
                </div>
                {error && <div className="text-red-300 text-sm">{error}</div>}
                <div className="flex gap-2 pt-1">
                  <Button onClick={handlePreview} variant="secondary" className="gap-2">
                    {loading.preview ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Preview Digest
                  </Button>
                  <Button onClick={handleConfirm} className="bg-purple-600 hover:bg-purple-700 gap-2">
                    {loading.confirm ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Confirm & Store
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-slate-900/60 border-purple-900/30">
            <CardHeader>
              <CardTitle className="text-slate-200">Verification (Preview)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-slate-300">Computed Digest</div>
              <div className="flex items-center gap-2 text-xs break-all bg-slate-800/50 rounded-md px-3 py-2 border border-slate-700/40">
                <span>{preview?.computed_digest || "—"}</span>
                {preview?.computed_digest && (
                  <button className="ml-auto text-slate-400 hover:text-slate-200" onClick={() => copy(preview.computed_digest)}>
                    <Copy className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                {preview?.matches_sealed === true && (
                  <span className="inline-flex items-center gap-1 text-emerald-300 text-sm"><CheckCircle2 className="w-4 h-4" /> Sealed matches</span>
                )}
                {preview?.matches_sealed === false && (
                  <span className="inline-flex items-center gap-1 text-amber-300 text-sm"><AlertTriangle className="w-4 h-4" /> Sealed mismatch</span>
                )}
                {preview?.matches_sealed == null && (
                  <span className="text-slate-400 text-sm">No sealed provided or not checked.</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-purple-900/30">
            <CardHeader>
              <CardTitle className="text-slate-200">Confirmation Result</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-2 text-sm">
                <div className="text-slate-300">Record ID</div>
                <div className="text-xs break-all bg-slate-800/50 rounded-md px-3 py-2 border border-slate-700/40">{confirmRes?.id || "—"}</div>
              </div>
              <div className="grid gap-2 text-sm">
                <div className="text-slate-300">Signature</div>
                <div className="flex items-center gap-2 text-xs break-all bg-slate-800/50 rounded-md px-3 py-2 border border-slate-700/40">
                  <span>{confirmRes?.signature || "—"}</span>
                  {confirmRes?.signature && (
                    <button className="ml-auto text-slate-400 hover:text-slate-200" onClick={() => copy(confirmRes.signature)}>
                      <Copy className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="grid gap-2 text-sm">
                <div className="text-slate-300">Confirmed At</div>
                <div className="text-xs bg-slate-800/50 rounded-md px-3 py-2 border border-slate-700/40">{confirmRes?.confirmation_timestamp || "—"}</div>
              </div>
              <div className="mt-1">
                {confirmRes?.verified === true && (
                  <span className="inline-flex items-center gap-1 text-emerald-300 text-sm"><CheckCircle2 className="w-4 h-4" /> Verified (sealed matched)</span>
                )}
                {confirmRes?.verified === false && (
                  <span className="inline-flex items-center gap-1 text-amber-300 text-sm"><AlertTriangle className="w-4 h-4" /> Stored (sealed did not match)</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Temple Interaction Panel */}
        <Card className="bg-slate-900/60 border-purple-900/30">
          <CardHeader>
            <CardTitle className="text-slate-200 flex items-center gap-2">{getInteractionIcon()} Outer Temple Interaction</CardTitle>
            <CardDescription className="text-slate-400">Send a query, meditation, or blessing to the Outer Temple and record the result deterministically.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Type</Label>
                <Select value={interactionType} onValueChange={setInteractionType}>
                  <SelectTrigger className="bg-slate-800/60 border-purple-900/30">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="query">Query</SelectItem>
                    <SelectItem value="meditation">Meditation</SelectItem>
                    <SelectItem value="blessing">Blessing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label className="text-slate-300">Message</Label>
                <Textarea
                  className="min-h-[100px] bg-slate-800/60 border-purple-900/30"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter your intention or question"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleInteraction} className="gap-2 bg-purple-600 hover:bg-purple-700" disabled={templeLoading}>
                {templeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
                Send Interaction
              </Button>
              <Button onClick={getQuantumInsight} variant="outline" className="gap-2 border-purple-900/30" disabled={templeLoading}>
                {templeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Get Quantum Insight
              </Button>
            </div>

            {result && (
              <div className="mt-2 space-y-2">
                <div className="text-sm text-slate-300">Response</div>
                <div className="text-sm bg-slate-800/50 rounded-md px-3 py-2 border border-slate-700/40 whitespace-pre-wrap">{result.response}</div>
                <div className="text-xs text-slate-400">{result.timestamp}</div>
                <div className="text-xs text-slate-400">Interaction ID: <span className="font-mono">{result.interaction_id}</span></div>
                <div className="pt-1"><Badge className="bg-emerald-900/50 text-emerald-200 border-emerald-800/50">Recorded</Badge></div>
              </div>
            )}

            {insight && (
              <div className="mt-4 space-y-1">
                <div className="text-sm text-slate-300">Quantum Insight</div>
                <div className="text-sm bg-slate-800/50 rounded-md px-3 py-2 border border-slate-700/40">{insight.insight}</div>
                <div className="text-xs text-slate-400">State: {insight.quantum_state} • {insight.timestamp} • Source: {insight.source}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}