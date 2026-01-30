import * as React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";

export default function InAppAnnouncementBar() {
  const [hidden, setHidden] = React.useState(false);
  const { data: items = [] } = useQuery({
    queryKey: ['broadcastBar'],
    queryFn: () => base44.entities.Broadcast.list('-created_date', 1),
    initialData: [],
    refetchInterval: 60000,
  });

  const b = items[0];
  const isRecent = b && b.status === 'sent' && (!b.schedule_time || (Date.now() - new Date(b.schedule_time).getTime()) < 1000*60*60*24);

  if (!b || !isRecent || hidden || !(b.channels||[]).includes('in_app')) return null;

  return (
    <div className="sticky top-0 z-30 bg-gradient-to-r from-purple-800/80 to-indigo-800/80 text-purple-50 border-b border-purple-500/30">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-3">
        <div className="font-semibold">{b.title}</div>
        <div className="opacity-90 text-sm">{b.message}</div>
        <button onClick={()=>setHidden(true)} className="ml-auto p-1 hover:opacity-80">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}