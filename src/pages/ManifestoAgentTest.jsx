import React, { useEffect, useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import { Shield, Bot, Send, Loader2 } from "lucide-react";

export default function ManifestoAgentTest() {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [creating, setCreating] = useState(false);
  const unsubRef = useRef(null);

  useEffect(() => {
    const boot = async () => {
      setCreating(true);
      const conv = await base44.agents.createConversation({
        agent_name: "manifesto_guardian",
        metadata: { name: "Manifesto Guardian Test", description: "Read-only alignment audits" },
      });
      setConversation(conv);
      setMessages(conv.messages || []);
      if (unsubRef.current) unsubRef.current();
      unsubRef.current = base44.agents.subscribeToConversation(conv.id, (data) => {
        setMessages(data.messages || []);
      });
      setCreating(false);
    };
    boot();
    return () => { if (unsubRef.current) unsubRef.current(); };
  }, []);

  const send = async () => {
    if (!text.trim() || !conversation) return;
    const content = text.trim();
    setText("");
    await base44.agents.addMessage(conversation, { role: "user", content });
  };

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-3xl mx-auto space-y-4">
        <Card className="bg-slate-900/60 border-purple-900/40">
          <CardHeader className="border-b border-purple-900/30">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-300" />
              <CardTitle className="text-purple-200">Manifesto Guardian (Read-only)</CardTitle>
            </div>
            <div className="text-xs text-purple-400/70 mt-1">
              Preserves the database: performs analyses only; logs audits in AppLog when summarizing findings.
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[60vh] overflow-auto p-4 space-y-3">
              {creating && (
                <div className="flex items-center gap-2 text-purple-400/70 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" /> Creating test conversation...
                </div>
              )}
              {messages.map((m, idx) => (
                <div key={idx} className={`p-3 rounded-lg ${m.role === 'user' ? 'bg-slate-950/60 border border-purple-900/30' : 'bg-purple-950/30 border border-purple-900/40'}`}>
                  <div className="flex items-center gap-2 mb-1 text-sm">
                    {m.role === 'user' ? (
                      <span className="text-purple-300 font-medium">You</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-purple-200 font-medium">
                        <Bot className="w-4 h-4" /> Guardian
                      </span>
                    )}
                  </div>
                  {m.content && (
                    <ReactMarkdown className="prose prose-invert prose-sm max-w-none">{m.content}</ReactMarkdown>
                  )}
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-purple-900/30 flex gap-2">
              <Input
                placeholder="Ask the Guardian to assess alignment, e.g. 'Compare QTC supply vs manifesto goals'"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
                className="bg-slate-950/50 border-purple-900/30 text-purple-100"
              />
              <Button onClick={send} className="bg-purple-600 hover:bg-purple-700">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}