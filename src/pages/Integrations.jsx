import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Copy, Link as LinkIcon, Bell, PlugZap, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function Integrations() {
  const { data: status } = useQuery({
    queryKey: ['integrationsStatus'],
    queryFn: async () => {
      const res = await base44.functions.invoke('integrationsStatus', {});
      return res.data;
    },
    initialData: { slackConnected: false, envKeys: {} }
  });

  return (
    <div className='min-h-screen p-6'>
      <div className='max-w-5xl mx-auto space-y-6'>
        <div className='flex items-center justify-between'>
          <h1 className='text-3xl font-bold text-purple-100'>Integrations Hub</h1>
        </div>

        <Card className='bg-slate-900/60 border-purple-900/40'>
          <CardHeader>
            <CardTitle className='text-purple-200 flex items-center gap-2'><PlugZap className='w-5 h-5'/> Connectors</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='p-3 rounded border border-purple-900/30 bg-slate-950/50 flex items-center justify-between'>
              <div>
                <div className='text-purple-200 font-semibold'>Slack</div>
                <div className='text-xs text-purple-400/70'>Notifications channel for audits and alerts</div>
              </div>
              <div className='flex items-center gap-2'>
                <Badge className={status?.slackConnected? 'bg-green-500/20 text-green-300 border-green-500/30':'bg-amber-500/20 text-amber-300 border-amber-500/30'}>
                  {status?.slackConnected? 'Connected':'Not Connected'}
                </Badge>
                <Button size='sm' variant='outline' onClick={()=>toast.info('Slack authorization is handled by the builder. Ask Base44 to connect Slack in this chat.')}>Connect</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-slate-900/60 border-purple-900/40'>
          <CardHeader>
            <CardTitle className='text-purple-200 flex items-center gap-2'><Shield className='w-5 h-5'/> API Keys</CardTitle>
          </CardHeader>
          <CardContent className='space-y-2'>
            <div className='text-xs text-purple-400/70'>Keys are stored as environment variables for security. Set them in the dashboard Settings → Environment.</div>
            <div className='grid md:grid-cols-2 gap-3'>
              {['SLACK_CHANNEL_ID','WEBHOOK_SHARED_SECRET'].map((k)=> (
                <div key={k} className='p-3 rounded border border-purple-900/30 bg-slate-950/50 flex items-center justify-between'>
                  <div className='text-sm text-purple-200'>{k}</div>
                  <Badge className={status?.envKeys?.[k]? 'bg-green-500/20 text-green-300 border-green-500/30':'bg-amber-500/20 text-amber-300 border-amber-500/30'}>
                    {status?.envKeys?.[k]? 'Set':'Missing'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className='bg-slate-900/60 border-purple-900/40'>
          <CardHeader>
            <CardTitle className='text-purple-200 flex items-center gap-2'><Bell className='w-5 h-5'/> Webhook Endpoint</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='text-xs text-purple-400/70'>Use the function "webhookIngest" as your webhook endpoint. Copy the endpoint URL from Dashboard → Code → Functions → webhookIngest.</div>
            <div className='p-3 rounded border border-purple-900/30 bg-slate-950/50 text-xs text-purple-300/80'>
{`POST /webhookIngest?secret=YOUR_SECRET
{
  "type": "schema_audit" | "intent_node_update" | "manifestation_event",
  // fields per type
}`}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}