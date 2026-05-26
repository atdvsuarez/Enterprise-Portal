import { useParams, Link } from "wouter";
import { getBidById, mockBids } from "@/data/mock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ConfidenceMeter } from "@/components/common/ConfidenceMeter";
import { Building2, Calendar, FileText, Sparkles, AlertTriangle, Download, CheckCircle2, Clock, TrendingUp, Target } from "lucide-react";
import { toast } from "sonner";

export default function ExecutiveSummary() {
  const { id } = useParams();
  const bid = (id && getBidById(id)) || mockBids[0];
  const daysUntil = Math.max(0, Math.ceil((new Date(bid.closeDate).getTime() - Date.now()) / 86400000));
  const matchPct = Math.round((bid.matchedParts / Math.max(1, bid.totalParts)) * 100);

  const decide = (action: string, tone: "success" | "warning" | "error") => {
    if (tone === "success") toast.success(`${action} recorded`, { description: `Decision logged for ${bid.id}.` });
    else if (tone === "warning") toast.warning(`${action} requested`, { description: `Sent back to Admin team for ${bid.id}.` });
    else toast.error(`${action} recorded`, { description: `Bid ${bid.id} closed.` });
  };

  if (!id) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Executive Summary</h1>
        <p className="text-muted-foreground">Select a bid from the Approval Queue to view its executive summary.</p>
        <Link href="/approvals"><Button>Go to Approval Queue</Button></Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 pb-32">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-lg p-8 shadow-md">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="bg-white/10 text-white border-white/20 font-mono text-xs">{bid.id}</Badge>
              <Badge className={bid.goNoGoRecommendation === "Go" ? "bg-green-600" : bid.goNoGoRecommendation === "Review" ? "bg-amber-500" : "bg-red-500"}>
                AI Recommends: {bid.goNoGoRecommendation}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight leading-tight">{bid.title}</h1>
            <div className="flex items-center gap-5 mt-3 text-sm text-slate-300">
              <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4" /> {bid.customer}</span>
              <span className="flex items-center gap-1.5"><FileText className="w-4 h-4" /> {bid.rfqId}</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Closes {new Date(bid.closeDate).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs uppercase tracking-wider text-slate-400">Closes in</p>
            <p className="text-4xl font-bold tabular-nums mt-1">{daysUntil}<span className="text-lg font-normal text-slate-400 ml-1">days</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-3"><CardTitle className="text-base">Opportunity Summary</CardTitle></CardHeader>
            <CardContent className="text-sm leading-relaxed text-foreground/90">
              {bid.customer} has released {bid.rfqId} covering {bid.totalParts} line items across the {bid.title.toLowerCase()} category.
              Our catalog coverage is strong with {bid.matchedParts} of {bid.totalParts} items directly matched ({matchPct}%).
              This opportunity aligns with our existing relationship and quarterly pipeline targets.
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Target className="w-4 h-4 text-primary" /> Why This Bid Matters</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2.5 text-sm">
                <li className="flex gap-3"><span className="text-primary font-bold">·</span>Strategic municipal account with multi-year recurring potential.</li>
                <li className="flex gap-3"><span className="text-primary font-bold">·</span>Aligns with FY26 aftermarket parts growth target.</li>
                <li className="flex gap-3"><span className="text-primary font-bold">·</span>Strong historical win rate ({Math.floor(60 + matchPct / 4)}%) with this customer segment.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-purple-200 bg-purple-50/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-purple-900">
                <Sparkles className="w-4 h-4 text-purple-600" /> AI Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={`text-base px-3 py-1 ${bid.goNoGoRecommendation === "Go" ? "bg-green-600" : bid.goNoGoRecommendation === "Review" ? "bg-amber-500" : "bg-red-500"}`}>
                  {bid.goNoGoRecommendation}
                </Badge>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Confidence</p>
                  <p className="text-2xl font-bold tabular-nums">{bid.confidenceLevel}%</p>
                </div>
              </div>
              <ConfidenceMeter value={bid.confidenceLevel} />
              <ul className="space-y-2 text-sm pt-2 border-t border-purple-200/50">
                <li className="flex gap-2"><span className="text-purple-600 font-bold">•</span>Catalog match strength ({matchPct}%) above {matchPct > 80 ? "favorable" : "minimum"} threshold.</li>
                <li className="flex gap-2"><span className="text-purple-600 font-bold">•</span>Inventory status: {bid.inventoryStatus}. Lead time: {bid.leadTimeStatus}.</li>
                <li className="flex gap-2"><span className="text-purple-600 font-bold">•</span>Pricing window: {bid.pricingStatus}. {bid.riskFlags.length > 0 ? "Review risk flags before approval." : "No outstanding flags."}</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3"><CardTitle className="text-base">Suggested Response Position</CardTitle></CardHeader>
            <CardContent className="text-sm leading-relaxed text-foreground/90">
              Submit a fully compliant bid at standard margin tier. Highlight inventory availability and {bid.assignedAE} relationship.
              Lead with matched-catalog coverage and propose alternate parts for the {bid.unmatchedParts} unmatched item{bid.unmatchedParts === 1 ? "" : "s"}.
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Pricing & Inventory</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-muted-foreground">Total Value</p><p className="text-xl font-bold tabular-nums">$234K</p></div>
                <div><p className="text-xs text-muted-foreground">Est. Margin</p><p className="text-xl font-bold tabular-nums text-green-700">22%</p></div>
                <div><p className="text-xs text-muted-foreground">Matched</p><p className="text-xl font-bold tabular-nums">{matchPct}%</p></div>
                <div><p className="text-xs text-muted-foreground">Inventory</p><p className="text-xl font-bold tabular-nums">{bid.inventoryStatus === "Clear" ? "100%" : bid.inventoryStatus === "At Risk" ? "85%" : "60%"}</p></div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-600" /> Risks & Exceptions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {bid.riskFlags.length === 0 ? (
                <p className="text-sm text-green-700 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> No outstanding risks.</p>
              ) : bid.riskFlags.map((r, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-foreground/90">{r}</span>
                  <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200 text-[10px]">Medium</Badge>
                </div>
              ))}
              {bid.unmatchedParts > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span>{bid.unmatchedParts} unmatched part{bid.unmatchedParts === 1 ? "" : "s"}</span>
                  <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200 text-[10px]">Review</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3"><CardTitle className="text-base">Key Documents</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {[...bid.documents, "AI_Summary.pdf", "Pricing_Sheet.xlsx"].slice(0, 4).map((d, i) => (
                <div key={i} className="flex items-center justify-between text-sm p-2 rounded hover:bg-muted/50 cursor-pointer">
                  <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-blue-500" /> {d}</span>
                  <Download className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Clock className="w-4 h-4" /> Timeline</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                {[
                  { label: "Intake", date: "May 24", done: true },
                  { label: "Qualified", date: "May 25", done: true },
                  { label: "Drafted", date: "May 26", done: true },
                  { label: "Pending Approval", date: "Today", done: false, current: true },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.done ? "bg-green-500" : s.current ? "bg-amber-500 ring-4 ring-amber-200" : "bg-slate-300"}`} />
                    <span className={`flex-1 ${s.current ? "font-semibold" : ""}`}>{s.label}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">{s.date}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sticky decision bar */}
      <div className="fixed bottom-0 left-64 right-0 bg-card border-t shadow-2xl p-4 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="text-sm">
            <span className="text-muted-foreground">Awaiting your decision · </span>
            <span className="font-semibold">{bid.id}</span>
          </div>
          <div className="flex gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">Reject</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reject this bid?</AlertDialogTitle>
                  <AlertDialogDescription>This will close {bid.id} and notify the Admin team. This action cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => decide("Reject", "error")} className="bg-red-600 hover:bg-red-700">Confirm reject</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button variant="outline" className="text-slate-700" onClick={() => decide("Escalate", "warning")}>Escalate</Button>
            <Button variant="outline" className="text-amber-700 border-amber-200 hover:bg-amber-50" onClick={() => decide("Request Changes", "warning")}>Request Changes</Button>
            <Button className="bg-green-600 hover:bg-green-700 gap-1.5" onClick={() => decide("Approve", "success")}>
              <CheckCircle2 className="w-4 h-4" /> Approve & Submit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
