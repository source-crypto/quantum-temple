import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Save, Shield } from 'lucide-react';

export default function FredKeySettings() {
  const [fredKey, setFredKey] = useState('');
  const [status, setStatus] = useState('');
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const authed = await base44.auth.isAuthenticated();
        setIsAuthed(authed);
        if (authed) {
          const me = await base44.auth.me();
          const k = me?.fred_api_key || '';
          if (k) setFredKey(k);
        } else {
          const k = localStorage.getItem('fred_api_key') || '';
          if (k) setFredKey(k);
        }
      } catch (_) {}
    })();
  }, []);

  const save = async () => {
    setStatus('');
    try {
      if (isAuthed) {
        await base44.auth.updateMe({ fred_api_key: fredKey.trim() });
        setStatus('Saved securely to your profile.');
      } else {
        localStorage.setItem('fred_api_key', fredKey.trim());
        setStatus('Saved for this browser (no login).');
      }
    } catch (e) {
      setStatus(`Error: ${e.message}`);
    }
  };

  return (
    <Card className="bg-slate-900/60 border-purple-900/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-200">
          <Shield className="w-4 h-4" /> FRED API Key
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-slate-400">Provide your FRED API key to enable US data in the Macro Widget.</p>
        <div className="flex gap-2">
          <Input value={fredKey} onChange={(e) => setFredKey(e.target.value)} placeholder="Enter FRED API key" className="bg-slate-800/60 text-slate-200 border-purple-900/30" />
          <Button onClick={save} className="gap-2 bg-purple-600 hover:bg-purple-700"><Save className="w-4 h-4" /> Save</Button>
        </div>
        {status && <div className="text-xs text-slate-400">{status}</div>}
      </CardContent>
    </Card>
  );
}