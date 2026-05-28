import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Upload, FileText, FileSpreadsheet, Send, User, X } from "lucide-react";
import { toast } from "sonner";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type UploadedDoc = {
  id: string;
  name: string;
  kind: "pdf" | "excel" | "other";
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

function inferKind(name: string): UploadedDoc["kind"] {
  const lower = name.toLowerCase();
  if (lower.endsWith(".pdf")) return "pdf";
  if (lower.endsWith(".xlsx") || lower.endsWith(".xls") || lower.endsWith(".csv")) return "excel";
  return "other";
}

function generateReply(prompt: string): string {
  if (SAMPLE_RESPONSES[prompt]) return SAMPLE_RESPONSES[prompt];
  const lower = prompt.toLowerCase();
  if (lower.includes("summar")) return SAMPLE_RESPONSES["Summarize this bid"];
  if (lower.includes("part") || lower.includes("quantit")) return SAMPLE_RESPONSES["Extract part numbers and quantities"];
  if (lower.includes("price") || lower.includes("pricing") || lower.includes("cost")) return SAMPLE_RESPONSES["Show pricing insights"];
  if (lower.includes("risk") || lower.includes("flag")) return SAMPLE_RESPONSES["Highlight risks"];
  return `Here's what I found based on the active bid context:\n\nYour question — "${prompt}" — touches on details from the uploaded documents and matched catalog data. Based on the current bid, all parts are matched, pricing is available, and the response is on track for on-time submission. Ask a more specific question (parts, pricing, risks, timeline) to drill in further.`;
}

export default function AIWorkbench() {
  const [docs, setDocs] = useState<UploadedDoc[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi — I'm your bid assistant. Upload a document or ask me anything about the active bid. Try one of the suggested prompts below to get started.",
    },
  ]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const next: UploadedDoc[] = Array.from(files).map((f) => ({
      id: `${Date.now()}-${f.name}`,
      name: f.name,
      kind: inferKind(f.name),
    }));
    setDocs((prev) => [...next, ...prev]);
    toast.success(`${next.length} document${next.length > 1 ? "s" : ""} ingested`, {
      description: next.map((d) => d.name).join(", "),
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeDoc = (id: string) => setDocs((prev) => prev.filter((d) => d.id !== id));

  const sendPrompt = (raw: string) => {
    const prompt = raw.trim();
    if (!prompt || pending) return;
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", content: prompt };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setPending(true);
    window.setTimeout(() => {
      const reply: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: generateReply(prompt),
      };
      setMessages((prev) => [...prev, reply]);
      setPending(false);
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

        {/* Light context panel */}
        <Card className="lg:col-span-3 shadow-sm">
          <CardContent className="p-4 space-y-3">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
              Uploaded Documents
            </div>
            {docs.length === 0 ? (
              <div className="text-xs text-muted-foreground italic">No documents uploaded yet.</div>
            ) : (
              <ul className="space-y-1.5">
                {docs.map((d) => (
                  <li
                    key={d.id}
                    className="flex items-center gap-2 text-xs bg-muted/30 rounded-md px-2 py-1.5 group"
                  >
                    {d.kind === "excel" ? (
                      <FileSpreadsheet className="h-4 w-4 text-[#1f7a4a] shrink-0" />
                    ) : (
                      <FileText className="h-4 w-4 text-primary shrink-0" />
                    )}
                    <span className="truncate flex-1" title={d.name}>{d.name}</span>
                    <button
                      type="button"
                      onClick={() => removeDoc(d.id)}
                      className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100"
                      aria-label="Remove"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
