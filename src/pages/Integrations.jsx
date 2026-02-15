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
  const { data: status, refetch } = useQuery({
    queryKey: ['integrationsStatus'],
    queryFn: async () => (await base44.functions.invoke('integrationsStatus', {})).data,
    initialData: { slackConnected: false, envKeys: {} },
    refetchInterval: 20000,
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
            {[
              {name:'Slack', key:'slackConnected', desc:'Notifications channel for audits and alerts'},
              {name:'Notion', key:'notionConnected', desc:'Workspace docs & dashboards'},
              {name:'HubSpot', key:'hubspotConnected', desc:'CRM contacts & deals'},
            ].map((c)=> (
              <div key={c.name} className='p-3 rounded border border-purple-900/30 bg-slate-950/50 flex items-center justify-between'>
                <div>
                  <div className='text-purple-200 font-semibold'>{c.name}</div>
                  <div className='text-xs text-purple-400/70'>{c.desc}</div>
                </div>
                <div className='flex items-center gap-2'>
                  <Badge className={status?.[c.key]? 'bg-green-500/20 text-green-300 border-green-500/30':'bg-amber-500/20 text-amber-300 border-amber-500/30'}>
                    {status?.[c.key]? 'Connected':'Not Connected'}
                  </Badge>
                  <Button size='sm' variant='outline' onClick={()=>toast.info('Re-authentication is managed by the app builder. If needed, we can initiate it here — just ask in chat.')}>Re-auth</Button>
                </div>
              </div>
            ))}
            <div className='text-right'>
              <Button size='sm' variant='outline' onClick={()=>refetch()}>Re-check Status</Button>
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
              {['SLACK_CHANNEL_ID','WEBHOOK_SHARED_SECRET','FRED_API_KEY'].map((k)=> (
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
            <CardTitle className='text-purple-200 flex items-center gap-2'><Bell className='w-5 h-5'/> Connections Health</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='grid md:grid-cols-3 gap-3'>
              <div className='p-3 rounded border border-purple-900/30 bg-slate-950/50'>
                <div className='text-sm text-purple-200'>ECB SDW</div>
                <Badge className={status?.ecbOk? 'bg-green-500/20 text-green-300 border-green-500/30':'bg-red-500/20 text-red-300 border-red-500/30'}>
                  {status?.ecbOk? 'Online':'Unavailable'}
                </Badge>
              </div>
              <div className='p-3 rounded border border-purple-900/30 bg-slate-950/50'>
                <div className='text-sm text-purple-200'>FRED</div>
                <Badge className={status?.envKeys?.FRED_API_KEY? 'bg-green-500/20 text-green-300 border-green-500/30':'bg-amber-500/20 text-amber-300 border-amber-500/30'}>
                  {status?.envKeys?.FRED_API_KEY? 'Configured':'API key missing'}
                </Badge>
              </div>
              <div className='p-3 rounded border border-purple-900/30 bg-slate-950/50'>
                <div className='text-sm text-purple-200'>Blockchain Activity</div>
                <Badge className={status?.cryptoActivityRecent? 'bg-green-500/20 text-green-300 border-green-500/30':'bg-amber-500/20 text-amber-300 border-amber-500/30'}>
                  {status?.cryptoActivityRecent? 'Recent':'No recent activity'}
                </Badge>
              </div>
            </div>
            <div className='text-right'>
              <Button size='sm' variant='outline' onClick={()=>refetch()}>Refresh</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}