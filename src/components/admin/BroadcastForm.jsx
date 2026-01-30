import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Calendar, Send } from "lucide-react";
import { toast } from "sonner";

export default function BroadcastForm() {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    title: "",
    message: "",
    channels: { linkedin: true, slack: true, email: false, in_app: true },
    schedule_time: "",
    target_regions: "",
    target_groups: "",
    slack_channel: "",
    linkedin_urn: "",
    email_recipients: ""
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title,
        message: form.message,
        channels: Object.entries(form.channels).filter(([,v]) => v).map(([k]) => k),
        schedule_time: form.schedule_time || new Date().toISOString(),
        status: 'scheduled',
        target_regions: form.target_regions ? form.target_regions.split(',').map(s => s.trim()).filter(Boolean) : [],
        target_groups: form.target_groups ? form.target_groups.split(',').map(s => s.trim()).filter(Boolean) : [],
        slack_channel: form.slack_channel || null,
        linkedin_urn: form.linkedin_urn || null,
        email_recipients: form.email_recipients ? form.email_recipients.split(',').map(s => s.trim()).filter(Boolean) : []
      };
      return base44.entities.Broadcast.create(payload);
    },
    onSuccess: () => {
      toast.success('Broadcast scheduled');
      qc.invalidateQueries({ queryKey: ['broadcasts'] });
      setForm({ ...form, title: '', message: '', email_recipients: '' });
    },
  });

  return (
    <Card className="bg-slate-950/70 border-purple-900/40">
      <CardHeader>
        <CardTitle className="text-purple-200">Broadcast Activation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <Label className="text-purple-300">Title</Label>
            <Input value={form.title} onChange={(e)=>setForm(f=>({...f,title:e.target.value}))} placeholder="Major Update: Global Activation" className="bg-slate-900 border-purple-900/40 text-purple-100" />
          </div>
          <div>
            <Label className="text-purple-300">Schedule (ISO)</Label>
            <Input value={form.schedule_time} onChange={(e)=>setForm(f=>({...f,schedule_time:e.target.value}))} placeholder="2026-02-01T14:00:00" className="bg-slate-900 border-purple-900/40 text-purple-100" />
          </div>
        </div>
        <div>
          <Label className="text-purple-300">Message</Label>
          <Textarea value={form.message} onChange={(e)=>setForm(f=>({...f,message:e.target.value}))} rows={5} placeholder="Announcing our 'Major locally globally' rollout..." className="bg-slate-900 border-purple-900/40 text-purple-100" />
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-purple-300">Channels</Label>
            {['linkedin','slack','email','in_app'].map((ch)=> (
              <label key={ch} className="flex items-center gap-2 text-purple-200">
                <Checkbox checked={form.channels[ch]} onCheckedChange={(v)=>setForm(f=>({...f,channels:{...f.channels,[ch]:!!v}}))} />
                <span className="capitalize">{ch}</span>
              </label>
            ))}
          </div>
          <div className="space-y-2">
            <Label className="text-purple-300">Targeting</Label>
            <Input value={form.target_regions} onChange={(e)=>setForm(f=>({...f,target_regions:e.target.value}))} placeholder="Regions (comma-separated)" className="bg-slate-900 border-purple-900/40 text-purple-100" />
            <Input value={form.target_groups} onChange={(e)=>setForm(f=>({...f,target_groups:e.target.value}))} placeholder="Groups (comma-separated)" className="bg-slate-900 border-purple-900/40 text-purple-100" />
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <Label className="text-purple-300">Slack Channel ID</Label>
            <Input value={form.slack_channel} onChange={(e)=>setForm(f=>({...f,slack_channel:e.target.value}))} placeholder="C01234567" className="bg-slate-900 border-purple-900/40 text-purple-100" />
          </div>
          <div>
            <Label className="text-purple-300">LinkedIn Author URN</Label>
            <Input value={form.linkedin_urn} onChange={(e)=>setForm(f=>({...f,linkedin_urn:e.target.value}))} placeholder="urn:li:person:..." className="bg-slate-900 border-purple-900/40 text-purple-100" />
          </div>
          <div>
            <Label className="text-purple-300">Email Recipients</Label>
            <Input value={form.email_recipients} onChange={(e)=>setForm(f=>({...f,email_recipients:e.target.value}))} placeholder="alice@x.com,bob@y.com" className="bg-slate-900 border-purple-900/40 text-purple-100" />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={()=>createMutation.mutate()} disabled={createMutation.isPending} className="bg-purple-600 hover:bg-purple-500">
            <Send className="w-4 h-4 mr-2" /> Schedule Broadcast
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}