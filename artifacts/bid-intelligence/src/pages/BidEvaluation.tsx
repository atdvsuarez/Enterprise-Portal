import { useParams, Link } from "wouter";
import { getBidById, mockBids } from "@/data/mock";
import { StatusBadge } from "@/components/common/StatusBadge";
import { AIScorePill } from "@/components/common/AIScorePill";
import { ConfidenceMeter } from "@/components/common/ConfidenceMeter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRole } from "@/lib/role";
import { FileText, Download, AlertTriangle, ArrowRight, Check, X, Building2, Calendar, FileBox } from "lucide-react";
import { toast } from "sonner";

export default function BidEvaluation() {
  const { id } = useParams();
  const { role } = useRole();
  const bid = id ? getBidById(id) : null;

  if (!id || !bid) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Bid Evaluation</h1>
          <p className="text-muted-foreground mt-1">Select a bid to evaluate.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockBids.slice(0, 9).map(b => (
            <Link key={b.id} href={`/evaluation/${b.id}`}>
              <Card className="cursor-pointer hover:border-primary/50 transition-colors shadow-sm hover-elevate">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-mono font-medium text-primary">{b.id}</span>
                    <StatusBadge status={b.status} />
                  </div>
                  <CardTitle className="text-base line-clamp-1 mt-2">{b.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{b.customer}</p>
                  <div className="mt-4 flex justify-between items-center text-xs">
                    <div className="flex gap-2 items-center">
                      <span className="font-medium text-green-600">{b.matchedParts} matched</span>
                      <span className="text-muted-foreground">·</span>
                      <span className={b.unmatchedParts > 0 ? "text-amber-600 font-medium" : "text-muted-foreground"}>{b.unmatchedParts} unmatched</span>
                    </div>
                    <AIScorePill score={b.aiRelevanceScore} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  const handleAction = (action: string) => {
    toast.success(`${action} successful`);
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Column */}
        <div className="flex-1 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold tracking-tight">{bid.title}</h1>
                <StatusBadge status={bid.status} className="text-sm px-2.5 py-0.5" />
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4" /> {bid.customer}</span>
                <span className="flex items-center gap-1.5"><FileBox className="w-4 h-4" /> {bid.rfqId}</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Closes: {new Date(bid.closeDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-muted/30 border-none shadow-none">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Source</p>
                <p className="font-medium">{bid.sourceType}</p>
                {bid.portalName && <p className="text-xs text-muted-foreground mt-0.5">{bid.portalName}</p>}
              </CardContent>
            </Card>
            <Card className="bg-muted/30 border-none shadow-none">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Priority</p>
                <Badge variant={bid.priority === "High" ? "destructive" : "secondary"}>{bid.priority}</Badge>
              </CardContent>
            </Card>
            <Card className="bg-muted/30 border-none shadow-none">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Created</p>
                <p className="font-medium">{new Date(bid.createdDate).toLocaleDateString()}</p>
              </CardContent>
            </Card>
            <Card className="bg-muted/30 border-none shadow-none">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Assigned Scout</p>
                <p className="font-medium">{bid.assignedScout}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Line Items</CardTitle>
                  <CardDescription className="mt-1">
                    {bid.totalParts} total parts · <span className="text-green-600 font-medium">{bid.matchedParts} matched</span> · <span className={bid.unmatchedParts > 0 ? "text-amber-600 font-medium" : ""}>{bid.unmatchedParts} unmatched</span>
                  </CardDescription>
                </div>
                {role === "admin" && (
                  <Button variant="outline" size="sm" onClick={() => handleAction("Edit Line Items")}>Edit Items</Button>
                )}
              </div>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-12 text-center">#</TableHead>
                  <TableHead>Requested Part</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead>Matched Part</TableHead>
                  <TableHead>Match Confidence</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bid.lineItems.map(item => (
                  <TableRow key={item.lineNumber} className={item.exceptionFlag ? "bg-red-50/50 dark:bg-red-900/10" : ""}>
                    <TableCell className="text-center font-medium text-muted-foreground">{item.lineNumber}</TableCell>
                    <TableCell className="font-mono text-xs">{item.partNumber}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={item.description}>{item.description}</TableCell>
                    <TableCell className="text-center tabular-nums">{item.quantity}</TableCell>
                    <TableCell>
                      {item.matchedPart ? (
                        <span className="font-mono text-xs text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded">{item.matchedPart}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No Match</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.matchedPart ? <ConfidenceMeter value={item.sourceConfidence} className="w-24" /> : "—"}
                    </TableCell>
                    <TableCell>
                      {item.exceptionFlag ? (
                        <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">Flagged</Badge>
                      ) : item.matchedPart ? (
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Clear</Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Review</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                {bid.documents.map((doc, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 border rounded-md bg-card w-64 hover:border-primary/40 cursor-pointer transition-colors group">
                    <FileText className="w-8 h-8 text-blue-500 bg-blue-50 p-1.5 rounded" />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-medium truncate">{doc}</p>
                      <p className="text-xs text-muted-foreground">PDF Document</p>
                    </div>
                    <Download className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Rail */}
        <div className="w-full lg:w-80 shrink-0 space-y-6">
          <Card className="shadow-sm border-purple-200 bg-purple-50/30 dark:bg-purple-900/10 dark:border-purple-900/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-purple-800 dark:text-purple-300 flex items-center gap-2">
                  AI Recommendation
                </CardTitle>
                <Badge className={bid.goNoGoRecommendation === "Go" ? "bg-green-500" : bid.goNoGoRecommendation === "Review" ? "bg-amber-500" : "bg-red-500"}>
                  {bid.goNoGoRecommendation}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Relevance Score</p>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-foreground">{bid.aiRelevanceScore}</span>
                  <span className="text-sm text-muted-foreground">/ 100</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Confidence Level</p>
                <ConfidenceMeter value={bid.confidenceLevel} />
              </div>

              {bid.riskFlags.length > 0 && (
                <div className="mt-4 pt-4 border-t border-purple-200/50 dark:border-purple-800/50">
                  <p className="text-xs font-semibold uppercase tracking-wider text-purple-800 dark:text-purple-300 mb-2">Risk Flags</p>
                  <ul className="space-y-2">
                    {bid.riskFlags.map((flag, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {flag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Similar Prior Bids</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {bid.knowledgePackLinks.map((kb, i) => (
                <div key={i} className="text-sm border-b pb-2 last:border-0 last:pb-0">
                  <Link href="/knowledge"><a className="font-medium text-primary hover:underline">{kb}</a></Link>
                  <p className="text-xs text-muted-foreground mt-0.5">Jefferson County 2024 Chassis</p>
                  <Badge variant="outline" className="mt-1 text-[10px] text-green-600 bg-green-50">Won</Badge>
                </div>
              ))}
              {bid.knowledgePackLinks.length === 0 && (
                <p className="text-sm text-muted-foreground italic">No historical matches found.</p>
              )}
            </CardContent>
          </Card>

          <div className="space-y-3 pt-4">
            {role === "admin" && (
              <>
                <Link href={`/workbench/${bid.id}`}>
                  <Button className="w-full gap-2">Send to Response Workbench <ArrowRight className="w-4 h-4" /></Button>
                </Link>
                <Button variant="outline" className="w-full text-destructive" onClick={() => handleAction("Mark Blocked")}>Mark Blocked / Exception</Button>
              </>
            )}
            {role === "scout" && (
              <>
                <Button className="w-full gap-2 bg-green-600 hover:bg-green-700" onClick={() => handleAction("Shortlist")}><Check className="w-4 h-4" /> Shortlist</Button>
                <Button variant="outline" className="w-full" onClick={() => handleAction("Handoff to Admin")}>Handoff to Admin</Button>
                <Button variant="ghost" className="w-full text-destructive" onClick={() => handleAction("Discard")}><X className="w-4 h-4" /> Discard</Button>
              </>
            )}
            {role === "ae" && (
              <Link href={`/executive-summary/${bid.id}`}>
                <Button className="w-full gap-2" variant="default">View Executive Summary <ArrowRight className="w-4 h-4" /></Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
