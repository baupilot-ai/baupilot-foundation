import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { aiChatSend } from "@/lib/ai.functions";
import { listConversations, listMessages, deleteConversation, renameConversation } from "@/lib/ai-client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Markdown, CopyButton } from "@/components/ai/markdown";
import { MessageSquarePlus, Send, Trash2, Loader2, RefreshCw, User2, Sparkles, Square } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/ai/")({
  component: AIChatPage,
});

const EXAMPLES = [
  "Zeige alle offenen Mängel",
  "Fasse die letzten Bautagesberichte zusammen",
  "Welche Projekte sind kritisch?",
  "Welche Meilensteine sind verspätet?",
];

function AIChatPage() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const sendFn = useServerFn(aiChatSend);
  const qc = useQueryClient();
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [] } = useQuery({ queryKey: ["ai_conversations"], queryFn: listConversations });
  const { data: messages = [] } = useQuery({
    queryKey: ["ai_messages", conversationId],
    queryFn: () => (conversationId ? listMessages(conversationId) : Promise.resolve([])),
    enabled: !!conversationId,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  async function send(text: string) {
    if (!text.trim() || sending) return;
    setSending(true);
    setInput("");
    abortRef.current = new AbortController();
    try {
      const res = await sendFn({ data: { conversationId, message: text } });
      setConversationId(res.conversationId);
      await qc.invalidateQueries({ queryKey: ["ai_messages"] });
      await qc.invalidateQueries({ queryKey: ["ai_conversations"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Fehler bei KI-Anfrage");
    } finally {
      setSending(false);
      abortRef.current = null;
    }
  }

  async function newChat() {
    setConversationId(null);
  }

  async function regenerate() {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (lastUser) await send(lastUser.content);
  }

  return (
    <div className="grid gap-3 lg:grid-cols-[260px_1fr]">
      {/* Sidebar */}
      <Card className="hidden max-h-[calc(100vh-220px)] flex-col overflow-hidden p-2 lg:flex">
        <Button onClick={newChat} className="mb-2 w-full justify-start gap-2" size="sm">
          <MessageSquarePlus className="h-4 w-4" /> Neue Unterhaltung
        </Button>
        <div className="flex-1 space-y-0.5 overflow-y-auto">
          {conversations.length === 0 && (
            <div className="p-3 text-xs text-muted-foreground">Noch keine Unterhaltungen</div>
          )}
          {conversations.map((c) => (
            <div
              key={c.id}
              className={cn(
                "group flex items-center gap-1 rounded-md px-2 py-1.5 text-xs hover:bg-muted",
                conversationId === c.id && "bg-muted font-medium",
              )}
            >
              <button className="flex-1 truncate text-left" onClick={() => setConversationId(c.id)}>
                {c.title}
              </button>
              <button
                className="opacity-0 group-hover:opacity-100"
                onClick={async () => {
                  if (!confirm("Unterhaltung löschen?")) return;
                  await deleteConversation(c.id);
                  if (conversationId === c.id) setConversationId(null);
                  await qc.invalidateQueries({ queryKey: ["ai_conversations"] });
                }}
              >
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Main */}
      <Card className="flex h-[calc(100vh-220px)] flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <div className="text-sm font-medium">
            {conversations.find((c) => c.id === conversationId)?.title ?? "Neue Unterhaltung"}
          </div>
          <div className="flex gap-1 lg:hidden">
            <Button size="sm" variant="ghost" onClick={newChat} className="h-8 gap-1 text-xs">
              <MessageSquarePlus className="h-3.5 w-3.5" /> Neu
            </Button>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-3 sm:p-4">
          {messages.length === 0 && !sending && (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              <div>
                <div className="text-lg font-semibold">Wie kann ich helfen?</div>
                <div className="text-xs text-muted-foreground">Frage BauPilot AI zu Baustellen, Aufgaben, Mängeln, Berichten.</div>
              </div>
              <div className="grid w-full max-w-lg gap-2 sm:grid-cols-2">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => send(ex)}
                    className="rounded-lg border bg-card p-3 text-left text-xs hover:border-primary hover:bg-primary/5"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id} className={cn("flex gap-2 sm:gap-3", m.role === "user" && "flex-row-reverse")}>
              <div
                className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-full",
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
                )}
              >
                {m.role === "user" ? <User2 className="h-4 w-4" /> : <Sparkles className="h-4 w-4 text-primary" />}
              </div>
              <div className={cn("group max-w-[85%] rounded-2xl px-3 py-2", m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted/50")}>
                {m.role === "assistant" ? <Markdown content={m.content} /> : <div className="whitespace-pre-wrap text-sm">{m.content}</div>}
                {m.role === "assistant" && (
                  <div className="mt-1 flex justify-end opacity-0 group-hover:opacity-100">
                    <CopyButton text={m.content} />
                  </div>
                )}
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex gap-2">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-muted">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Denke nach…
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t p-2 sm:p-3">
          {messages.length > 0 && !sending && (
            <div className="mb-2 flex justify-center">
              <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={regenerate}>
                <RefreshCw className="h-3 w-3" /> Neu generieren
              </Button>
            </div>
          )}
          <div className="flex items-end gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Frage BauPilot AI…"
              rows={1}
              className="min-h-[40px] resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              disabled={sending}
            />
            {sending ? (
              <Button size="icon" variant="secondary" onClick={() => abortRef.current?.abort()}>
                <Square className="h-4 w-4" />
              </Button>
            ) : (
              <Button size="icon" onClick={() => send(input)} disabled={!input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
