import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import BroadcastForm from "../components/admin/BroadcastForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });
  const { data: broadcasts = [], refetch } = useQuery({
    queryKey: ['broadcasts'],
    queryFn: () => base44.entities.Broadcast.list('-created_date', 50),
    initialData: [],
  });

  const processNow = async () => {
    const res = await base44.functions.invoke('processBroadcasts');
    if (res?.data?.error) toast.error(res.data.error); else toast.success(`Processed ${res.data.processed} broadcasts`);
    refetch();
  };

  if (user?.role !== 'admin') {
    return (
      <div className="p-8 text-center text-red-300">Admin access required.</div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-purple-200">Admin Dashboard</h1>

        <BroadcastForm />

        <div className="flex gap-2 flex-wrap">
          <Button onClick={async () => { const { data } = await base44.functions.invoke('syncHubspotContacts', { dryRun: true, limit: 50 }); if (data?.error) toast.error(data.error); else toast.success(`Dry run: would sync ${data?.summary?.dryRunCount || 0} contacts`); }}>HubSpot Dry Run</Button>
          <Button className="bg-emerald-600 hover:bg-emerald-500" onClick={async () => { const { data } = await base44.functions.invoke('syncHubspotContacts', { limit: 500 }); if (data?.error) toast.error(data.error); else toast.success(`HubSpot sync complete: created ${data?.summary?.created || 0}, updated ${data?.summary?.updated || 0}`); }}>Sync HubSpot Contacts</Button>
          <Button variant="outline" onClick={async () => { const res = await base44.functions.invoke('exportFinanceCsv'); const csv = typeof res?.data === 'string' ? res.data : ''; const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'finance-export.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); toast.success('Finance CSV downloaded'); }}>Download Finance CSV</Button>
          <Button variant="outline" className="bg-purple-600/10 hover:bg-purple-600/20" onClick={async () => { const { data } = await base44.functions.invoke('exportFinanceCsv', { mode: 'upload' }); if (data?.error) toast.error(data.error); else toast.success(`Finance CSV uploaded (${data?.rows || 0} rows)`); }}>Run Finance Export (Upload)</Button>
        </div>

        <Card className="bg-slate-950/70 border-purple-900/40">
          <CardHeader>
            <CardTitle className="text-purple-200">Scheduled & Recent Broadcasts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end mb-3">
              <Button onClick={processNow} className="bg-purple-600 hover:bg-purple-500">Process Pending Now</Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-purple-300">Title</TableHead>
                  <TableHead className="text-purple-300">Channels</TableHead>
                  <TableHead className="text-purple-300">Schedule</TableHead>
                  <TableHead className="text-purple-300">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {broadcasts.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="text-purple-100">{b.title}</TableCell>
                    <TableCell className="text-purple-100">{Array.isArray(b.channels) ? b.channels.join(', ') : ''}</TableCell>
                    <TableCell className="text-purple-100">{b.schedule_time || 'now'}</TableCell>
                    <TableCell className="text-purple-100">{b.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}