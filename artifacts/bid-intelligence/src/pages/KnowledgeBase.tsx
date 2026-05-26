import { useState } from "react";
import { mockKnowledgeArticles } from "@/data/mock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, FileText, Sparkles, Send } from "lucide-react";
import { toast } from "sonner";

const categories = ["All", "Prior Bids", "Win/Loss Notes", "Pricing Guidance", "Customer Terms", "Templates"];

export default function KnowledgeBase() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [question, setQuestion] = useState("");

  const filtered = mockKnowledgeArticles.filter(a => {
    if (category !== "All" && a.category !== category) return false;
    if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = (cat: string) => cat === "All" ? mockKnowledgeArticles.length : mockKnowledgeArticles.filter(a => a.category === cat).length;

  return (
    <div className="p-4 md:p-8 max-w-[1500px] mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
        <p className="text-muted-foreground mt-1">Search prior bids, pricing guidance, and customer terms. AI-summarized.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3 space-y-2">
          <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-3">Categories</p>
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${category === c ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-foreground"}`}
            >
              <span>{c}</span>
              <Badge variant="outline" className="text-[10px] tabular-nums">{counts(c)}</Badge>
            </button>
          ))}
        </div>

        <div className="lg:col-span-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search the knowledge base..."
              className="pl-9"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            {filtered.map(a => (
              <Card key={a.id} className="shadow-sm hover-elevate cursor-pointer transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[10px]">{a.category}</Badge>
                        <span className="text-[11px] text-muted-foreground">KB-{a.id.toString().padStart(3, "0")}</span>
                      </div>
                      <h3 className="font-semibold text-sm">{a.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                        Indexed reference document covering {a.category.toLowerCase()}.
                        Use during drafting and qualification to align with historical positioning.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filtered.length === 0 && (
              <Card><CardContent className="p-12 text-center text-muted-foreground">
                <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                No articles match.
              </CardContent></Card>
            )}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <Card className="shadow-sm border-purple-200 bg-purple-50/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-purple-900">
                <Sparkles className="w-4 h-4 text-purple-600" /> AI Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs leading-relaxed text-purple-950/90 space-y-2">
              <p><strong>{category}</strong> contains {counts(category)} indexed documents.</p>
              <p>Most-referenced themes: pricing positioning for municipal accounts, Buy America compliance, and lead-time exception handling.</p>
              <p className="text-purple-700 pt-2 border-t border-purple-200/50">Last indexed 2h ago.</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3"><CardTitle className="text-sm">Ask a Question</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder="e.g. What was our position on Jefferson County last year?"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                className="min-h-[100px] text-sm"
              />
              <Button
                size="sm"
                className="w-full gap-1.5"
                disabled={!question}
                onClick={() => { toast.success("AI answer generated", { description: "See response panel above." }); setQuestion(""); }}
              >
                <Send className="w-3.5 h-3.5" /> Ask AI
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
