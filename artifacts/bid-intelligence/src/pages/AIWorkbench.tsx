import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Upload, Send, User, MessageSquare, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type ChatSession = {
  id: string;
  title: string;
  updatedAt: number;
  messages: ChatMessage[];
};

const SUGGESTED_PROMPTS = [
  "Summarize this bid",
  "Extract part numbers and quantities",
  "Show pricing insights",
  "Highlight risks",
];

const SAMPLE_RESPONSES: Record<string, string> = {
  "Summarize this bid":
    "This RFQ requests 12 line items of OEM aftermarket components for a municipal fleet operator. Response is due in 9 business days. All requested parts are matched to current Cummins SKUs with active pricing. Estimated quoted value: ~$320K. No restricted-party flags detected.",
  "Extract part numbers and quantities":
    "Top line items extracted:\n• CUM-MATCH-0 — Cummins Engine Component 1 — Qty 1\n• CUM-MATCH-1 — Cummins Engine Component 2 — Qty 15\n• CUM-MATCH-2 — Cummins Engine Component 3 — Qty 11\n• CUM-MATCH-3 — Cummins Engine Component 4 — Qty 10\n• CUM-MATCH-4 — Cummins Engine Component 5 — Qty 4\n…and 7 additional matched lines. Full list available in the response workbench.",
  "Show pricing insights":
    "Pricing analysis:\n• Average unit price across matched parts: $23,840\n• 3 line items priced 8–12% above last-quarter benchmark — consider margin review\n• 2 line items qualify for volume tier discount (qty ≥ 10)\n• No items currently flagged below floor pricing.",
  "Highlight risks":
    "Risk flags:\n• Close date is 9 business days out — within standard SLA but tight for approval review\n• 1 part (CUM-MATCH-7) has expedited lead time (4+ weeks) that may not meet stated delivery\n• Customer is a new buyer this fiscal year — recommend credit check before submission\n• No compliance or restricted-party issues detected.",
};

function generateReply(prompt: string): string {
  if (SAMPLE_RESPONSES[prompt]) return SAMPLE_RESPONSES[prompt];
  const lower = prompt.toLowerCase();
  if (lower.includes("summar")) return SAMPLE_RESPONSES["Summarize this bid"];
  if (lower.includes("part") || lower.includes("quantit")) return SAMPLE_RESPONSES["Extract part numbers and quantities"];
  if (lower.includes("price") || lower.includes("pricing") || lower.includes("cost")) return SAMPLE_RESPONSES["Show pricing insights"];
  if (lower.includes("risk") || lower.includes("flag")) return SAMPLE_RESPONSES["Highlight risks"];
  return `Here's what I found based on the active bid context:\n\nYour question — "${prompt}" — touches on details from the uploaded documents and matched catalog data. Based on the current bid, all parts are matched, pricing is available, and the response is on track for on-time submission. Ask a more specific question (parts, pricing, risks, timeline) to drill in further.`;
}

const STORAGE_KEY = "bid-intel-chat-sessions";

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi — I'm your bid assistant. Upload a document or ask me anything about the active bid. Try one of the suggested prompts below to get started.",
};

function newSessionId() {
  return `s-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function loadSessions(): ChatSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ChatSession[];
  } catch {
    return [];
  }
}

function saveSessions(sessions: ChatSession[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    /* ignore */
  }
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function AIWorkbench() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => loadSessions());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  const sortedSessions = useMemo(
    () => [...sessions].sort((a, b) => b.updatedAt - a.updatedAt),
    [sessions]
  );

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const names = Array.from(files).map((f) => f.name);
    toast.success(`${names.length} document${names.length > 1 ? "s" : ""} ingested`, {
      description: names.join(", "),
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const startNewChat = () => {
    setActiveId(null);
    setMessages([WELCOME_MESSAGE]);
    setInput("");
  };

  const loadSession = (id: string) => {
    const s = sessions.find((x) => x.id === id);
    if (!s) return;
    setActiveId(id);
    setMessages(s.messages);
    setInput("");
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeId === id) startNewChat();
    toast.success("Chat deleted");
  };

  const sendPrompt = (raw: string) => {
    const prompt = raw.trim();
    if (!prompt || pending) return;
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", content: prompt };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setPending(true);

    window.setTimeout(() => {
      const reply: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: generateReply(prompt),
      };
      const finalMessages = [...nextMessages, reply];
      setMessages(finalMessages);
      setPending(false);

      // Persist to session
      const title = prompt.length > 48 ? prompt.slice(0, 48) + "…" : prompt;
      const now = Date.now();
      if (activeId) {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeId ? { ...s, messages: finalMessages, updatedAt: now } : s
          )
        );
      } else {
        const id = newSessionId();
        setActiveId(id);
        setSessions((prev) => [
          { id, title, updatedAt: now, messages: finalMessages },
          ...prev,
        ]);
      }
    }, 650);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendPrompt(input);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Insights Chat</h1>
          <p className="text-muted-foreground mt-1">
            Ask questions about the active bid — summaries, part extraction, pricing, and risks.
          </p>
        </div>
      </div>

      {/* Manual ingestion */}
      <Card className="shadow-sm">
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Upload className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-semibold">Manually Ingest Documents</div>
              <div className="text-xs text-muted-foreground">Excel and PDF only.</div>
            </div>
          </div>
          <Button onClick={handleUploadClick} className="gap-2">
            <Upload className="h-4 w-4" /> Upload Document
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.xlsx,.xls,.csv,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chat — primary */}
        <Card className="lg:col-span-9 shadow-sm flex flex-col h-[640px]">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                    m.role === "user" ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                  }`}
                >
                  {m.role === "user" ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                </div>
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/60 text-foreground"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {pending && (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full flex items-center justify-center bg-primary/10 text-primary shrink-0">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="rounded-lg px-4 py-2.5 bg-muted/60 text-sm text-muted-foreground">
                  <span className="inline-flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse [animation-delay:300ms]" />
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Suggested prompts */}
          <div className="px-4 py-2 border-t flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => sendPrompt(p)}
                disabled={pending}
                className="text-xs px-3 py-1.5 rounded-full border bg-card hover:bg-muted transition-colors disabled:opacity-50"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Composer */}
          <div className="border-t p-3 flex items-end gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask about this bid…"
              className="min-h-[44px] max-h-32 resize-none"
            />
            <Button
              onClick={() => sendPrompt(input)}
              disabled={!input.trim() || pending}
              className="gap-1.5 shrink-0"
            >
              <Send className="h-4 w-4" /> Send
            </Button>
          </div>
        </Card>

        {/* Chat History */}
        <Card className="lg:col-span-3 shadow-sm flex flex-col h-[640px]">
          <div className="p-3 border-b flex items-center justify-between gap-2">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
              Chat History
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={startNewChat}
              className="h-7 gap-1 text-xs"
            >
              <Plus className="h-3.5 w-3.5" /> New
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {sortedSessions.length === 0 ? (
              <div className="text-xs text-muted-foreground italic px-2 py-3 text-center">
                No past chats yet. Send a message to start your first conversation.
              </div>
            ) : (
              <ul className="space-y-1">
                {sortedSessions.map((s) => {
                  const isActive = s.id === activeId;
                  const preview = s.messages.find((m) => m.role === "user")?.content ?? "";
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => loadSession(s.id)}
                        className={cn(
                          "group w-full text-left rounded-md px-2.5 py-2 text-xs transition-colors flex items-start gap-2",
                          isActive
                            ? "bg-primary/10 text-foreground"
                            : "hover:bg-muted/70 text-foreground/90"
                        )}
                      >
                        <MessageSquare
                          className={cn(
                            "h-3.5 w-3.5 mt-0.5 shrink-0",
                            isActive ? "text-primary" : "text-muted-foreground"
                          )}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate" title={s.title}>
                            {s.title}
                          </div>
                          <div className="flex items-center justify-between gap-2 mt-0.5">
                            <span className="text-[10px] text-muted-foreground truncate" title={preview}>
                              {preview || "—"}
                            </span>
                            <span className="text-[10px] text-muted-foreground shrink-0">
                              {timeAgo(s.updatedAt)}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => deleteSession(s.id, e)}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                          aria-label="Delete chat"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
