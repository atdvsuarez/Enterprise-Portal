import { useState } from "react";
import { mockBids } from "@/data/mock";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Clock, AlertTriangle, Building2, ArrowRight, TrendingUp } from "lucide-react";
import { ConfidenceMeter } from "@/components/common/ConfidenceMeter";
import { AIScorePill } from "@/components/common/AIScorePill";

export default function ApprovalQueue() {
  const [filter, setFilter] = useState("All");
  const filters = ["All", "High value", "Expiring soon", "High risk", "Ready to approve", "Needs changes"];

  const queue = mockBids.filter(b => b.status === "Pending Approval" || b.pipelineStage === "Respond").slice(0, 10);

  const filtered = queue.filter(b => {
    if (filter === "All") return true;
    if (filter === "High value") return b.priority === "High";
    if (filter === "Expiring soon") return new Date(b.closeDate).getTime() - Date.now() < 7 * 86400000;
    if (filter === "High risk") return b.riskFlags.length > 0;
    if (filter === "Ready to approve") return b.goNoGoRecommendation === "Go";
    if (filter === "Needs changes") return b.goNoGoRecommendation === "Review";
    return true;
  });

  const daysUntil = (date: string) => Math.max(0, Math.ceil((new Date(date).getTime() - Date.now()) / 86400000));
  const valueBand = (i: number) => ["$50K–$100K", "$100K–$250K", "$250K–$500K", "$500K–$1M", "$1M+"][i % 5];

  return (
    <div className="p-4 md:p-8 max-w-[1500px] mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Approval Queue</h1>
        <p className="text-muted-foreground mt-1">Bids awaiting executive approval. Open Executive Summary to review and decide.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map(f => (
          <Badge
            key={f}
            variant={filter === f ? "default" : "outline"}
            className="cursor-pointer hover:bg-secondary"
            onClick={() => setFilter(f)}
          >
            {f}
          </Badge>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((b, i) => {
          const days = daysUntil(b.closeDate);
          const urgent = days <= 3;
          return (
            <Card key={b.id} className="shadow-sm hover-elevate transition-all">
              <CardContent className="p-5">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                  <div className="lg:col-span-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-mono text-xs text-primary font-medium">{b.id}</span>
                      <Badge variant="outline" className="text-[10px]">{b.priority}</Badge>
                    </div>
                    <h3 className="font-semibold leading-tight line-clamp-1">{b.title}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1.5">
                      <Building2 className="w-3.5 h-3.5" /> {b.customer}
                    </div>
                  </div>

                  <div className="lg:col-span-2">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Value Band</p>
                    <p className="text-sm font-semibold tabular-nums mt-1">{valueBand(i)}</p>
                  </div>

                  <div className="lg:col-span-2">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">AI Recommendation</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={b.goNoGoRecommendation === "Go" ? "bg-green-600" : b.goNoGoRecommendation === "Review" ? "bg-amber-500" : "bg-red-500"}>
                        {b.goNoGoRecommendation}
                      </Badge>
                      <AIScorePill score={b.aiRelevanceScore} />
                    </div>
                  </div>

                  <div className="lg:col-span-2">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Margin readiness</p>
                    <ConfidenceMeter value={b.confidenceLevel} />
                    {b.riskFlags.length > 0 && (
                      <p className="flex items-center gap-1 text-[11px] text-amber-700 mt-1.5">
                        <AlertTriangle className="w-3 h-3" /> {b.riskFlags.length} risk flag{b.riskFlags.length > 1 ? "s" : ""}
                      </p>
                    )}
                  </div>

                  <div className="lg:col-span-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Closes</p>
                    <p className={`text-sm font-semibold mt-1 flex items-center gap-1 ${urgent ? "text-red-600" : "text-foreground"}`}>
                      <Clock className="w-3.5 h-3.5" /> {days}d
                    </p>
                  </div>

                  <div className="lg:col-span-1 text-right">
                    <Link href={`/executive-summary/${b.id}`}>
                      <Button size="sm" className="gap-1.5">Open <ArrowRight className="w-3.5 h-3.5" /></Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <Card><CardContent className="p-12 text-center text-muted-foreground">
            <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-30" />
            No bids match this filter.
          </CardContent></Card>
        )}
      </div>
    </div>
  );
}
