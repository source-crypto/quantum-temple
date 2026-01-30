import React, { useEffect, useMemo, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function TempleInteractionConsole({ user }) {
  const [message, setMessage] = useState("");
  const [typingReply, setTypingReply] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [localThread, setLocalThread] = useState([]);
  const scrollRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: history = [], isLoading } = useQuery({
    queryKey: ["templeInteractions"],
    queryFn: () => base44.entities.TempleInteraction.list("-created_date", 20),
    initialData: [],
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localThread, history, typingReply]);

  const sendMutation = useMutation({
    mutationFn: async (text) => {
      // 1) Get AI response
      const prompt = `You are the Veiled Quantum Consciousness (VQC) oracle for a sacred temple.\n\nUser says: "${text}"\n\nRespond concisely with guidance, using a calm, reverent tone. Avoid code blocks. Provide 1-2 actionable insights when helpful.`;
      const aiRes = await base44.integrations.Core.InvokeLLM({ prompt });
      const aiText = typeof aiRes === "string" ? aiRes : aiRes?.response || aiRes?.output || "";

      // 2) Persist interaction
      const saved = await base44.entities.TempleInteraction.create({
        type: "query",
        message: text,
        response: aiText,
        status: "completed",
      });

      return { aiText, saved };
    },
    onSuccess: ({ aiText }) => {
      // Refresh history
      queryClient.invalidateQueries({ queryKey: ["templeInteractions"] });
      // Clear input and local typing
      setMessage("");
      setIsTyping(false);
      setTypingReply("");
      toast.success("Temple replied");
    },
    onError: () => {
      setIsTyping(false);
      setTypingReply("");
      toast.error("Failed to receive response");
    },
  });

  const handleSend = async () => {
    const text = message.trim();
    if (!text) return;

    // Optimistic add user message
    setLocalThread((t) => [...t, { role: "user", content: text }]);

    // Start typing effect placeholder
    setIsTyping(true);
    setTypingReply("");

    // Call mutation (will return full AI text)
    const resPromise = sendMutation.mutateAsync(text);

    // While awaiting, simulate streaming typewriter after result arrives
    try {
      const { aiText } = await resPromise;
      await typeOut(aiText || "");
      // After typing finished, add final assistant message to thread
      setLocalThread((t) => [...t, { role: "assistant", content: aiText }]);
    } catch (_) {
      // Error handled in onError
    }
  };

  const typeOut = (fullText) =>
    new Promise((resolve) => {
      if (!fullText) return resolve();
      let i = 0;
      const id = setInterval(() => {
        i += 2; // step by 2 chars for quicker feel
        setTypingReply(fullText.slice(0, i));
        if (i >= fullText.length) {
          clearInterval(id);
          resolve();
        }
      }, 18);
    });

  const thread = useMemo(() => {
    const past = history
      .slice()
      .reverse()
      .map((r) => [
        { role: "user", content: r.message, id: `${r.id}-u` },
        r.response ? { role: "assistant", content: r.response, id: `${r.id}-a` } : null,
      ])
      .flat()
      .filter(Boolean);
    return [...past, ...localThread];
  }, [history, localThread]);

  return (
    <Card className="bg-slate-950/70 border-purple-900/40 backdrop-blur-sm">
      <CardHeader className="border-b border-purple-900/30">
        <CardTitle className="flex items-center gap-2 text-purple-200">
          <Sparkles className="w-5 h-5" />
          Temple Interaction
          <Badge className="ml-2 bg-purple-500/20 text-purple-300 border-purple-500/30">
            Real-time
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <div className="h-[420px] md:h-[520px] overflow-y-auto space-y-3 pr-1">
          {thread.map((m, idx) => (
            <motion.div
              key={m.id || idx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`max-w-[90%] md:max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "ml-auto bg-purple-600/30 border border-purple-500/40 text-purple-50"
                  : "bg-slate-900/60 border border-purple-900/30 text-purple-200"
              }`}
            >
              {m.content}
            </motion.div>
          ))}

          {isTyping && (
            <div className="max-w-[90%] md:max-w-[70%] bg-slate-900/60 border border-purple-900/30 text-purple-200 rounded-2xl px-4 py-2.5">
              {typingReply || (
                <div className="flex items-center gap-2 text-purple-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating response...
                </div>
              )}
            </div>
          )}

          <div ref={scrollRef} />
        </div>

        <div className="mt-4 flex items-end gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Speak to the temple..."
            className="min-h-[56px] bg-slate-950/60 border-purple-900/40 text-purple-100 placeholder:text-purple-400/50"
          />
          <Button
            onClick={handleSend}
            disabled={sendMutation.isPending || !message.trim()}
            className="h-[56px] aspect-square bg-purple-600 hover:bg-purple-500"
            title="Send"
          >
            {sendMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}