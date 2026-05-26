import { useParams } from "wouter";
import { getBidById, mockBids } from "@/data/mock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Trash2, Mail, Download, RefreshCw, Send, ArrowLeft, Check } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function ResponseWorkbench() {
  const { id } = useParams();
  // Default to BID-2026-001 if no ID provided, just for preview purposes
  const bidId = id || "BID-2026-001";
  const bid = getBidById(bidId) || mockBids[0];

  const handleGenerateDraft = () => {
    toast.success("AI Draft generated successfully", { description: "Email template updated with pricing." });
  };

  const handleMarkApproval = () => {
    toast.success("Bid marked ready for approval", { description: "Added to AE's approval queue." });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Top Header Strip */}
      <div className="border-b bg-card px-6 py-4 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <Link href={`/evaluation/${bid.id}`}>
              <Button variant="ghost" size="icon" className="h-6 w-6"><ArrowLeft className="w-4 h-4" /></Button>
            </Link>
            <h1 className="font-bold text-xl">{bid.title}</h1>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{bid.status}</Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground ml-9">
            <span><strong>RFQ:</strong> {bid.rfqId}</span>
            <span><strong>Customer:</strong> {bid.customer}</span>
            <span><strong>Close Date:</strong> {new Date(bid.closeDate).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => toast.info("CSV Export started")}><Download className="w-4 h-4 mr-2" /> Export CSV</Button>
          <Button onClick={handleMarkApproval} className="bg-green-600 hover:bg-green-700 text-white"><Check className="w-4 h-4 mr-2" /> Mark Ready for Approval</Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* LEFT COLUMN: Line Items */}
        <div className="col-span-1 lg:col-span-7 border-r bg-background overflow-y-auto p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              Line Items ({bid.totalParts})
              <span className="text-sm font-normal text-muted-foreground ml-2">
                — <span className="text-green-600 font-medium">{bid.matchedParts} Matched</span> · <span className={bid.unmatchedParts > 0 ? "text-amber-600 font-medium" : ""}>{bid.unmatchedParts} Unmatched</span>
              </span>
            </h2>
          </div>

          <div className="border rounded-md shadow-sm bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-[40px] text-center"><Checkbox /></TableHead>
                  <TableHead className="w-[60px] text-center">Line</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Part From Document</TableHead>
                  <TableHead>Matched Item Desc</TableHead>
                  <TableHead>Product Code</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bid.lineItems.filter(li => li.matchedPart).map(item => (
                  <TableRow key={item.lineNumber} className="group h-12">
                    <TableCell className="text-center"><Checkbox defaultChecked /></TableCell>
                    <TableCell className="text-center text-muted-foreground">{item.lineNumber}</TableCell>
                    <TableCell><Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Matched</Badge></TableCell>
                    <TableCell className="font-mono text-xs">{item.partNumber}</TableCell>
                    <TableCell className="text-sm max-w-[150px] truncate" title={item.description}>{item.description}</TableCell>
                    <TableCell className="font-mono text-xs text-primary">{item.matchedPart}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {bid.lineItems.some(li => !li.matchedPart) && (
            <div className="mt-8">
              <h3 className="text-md font-semibold text-amber-700 flex items-center gap-2 mb-3">
                Unmatched Parts Requires Manual Mapping
              </h3>
              <div className="border border-amber-200 rounded-md bg-amber-50/30 overflow-hidden shadow-sm">
                <Table>
                  <TableBody>
                    {bid.lineItems.filter(li => !li.matchedPart).map(item => (
                      <TableRow key={item.lineNumber} className="group h-12">
                        <TableCell className="w-[40px] text-center"><Checkbox /></TableCell>
                        <TableCell className="w-[60px] text-center text-muted-foreground">{item.lineNumber}</TableCell>
                        <TableCell><Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Unmatched</Badge></TableCell>
                        <TableCell className="font-mono text-xs">{item.partNumber}</TableCell>
                        <TableCell className="text-sm">{item.description}</TableCell>
                        <TableCell className="w-[120px]">
                          <Button size="sm" variant="outline" className="w-full text-xs h-7 border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100">Search Catalog</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: AI Draft Response */}
        <div className="col-span-1 lg:col-span-5 bg-slate-50 dark:bg-slate-900/50 overflow-y-auto flex flex-col">
          <div className="p-4 border-b bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800/50 flex items-center justify-between">
            <h2 className="font-semibold text-purple-900 dark:text-purple-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" /> AI Draft Response
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleGenerateDraft} className="bg-white dark:bg-black h-8 text-xs border-purple-200">
                <RefreshCw className="w-3 h-3 mr-2" /> Regenerate
              </Button>
            </div>
          </div>
          
          <div className="p-6 flex-1">
            <Card className="shadow-md h-full flex flex-col border-muted">
              <CardHeader className="border-b bg-muted/20 py-3 px-4 flex flex-row items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Email Preview</span>
              </CardHeader>
              <CardContent className="p-0 flex-1 flex flex-col">
                <div className="p-4 border-b space-y-2 text-sm">
                  <div className="flex gap-4">
                    <span className="text-muted-foreground w-12 text-right">To:</span>
                    <span className="font-medium">procurement@{bid.customer.toLowerCase().replace(/[^a-z0-9]/g, '')}.gov</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-muted-foreground w-12 text-right">Subject:</span>
                    <span className="font-medium">Response to {bid.rfqId} - {bid.title}</span>
                  </div>
                </div>
                <div className="p-6 flex-1 text-sm font-sans leading-relaxed whitespace-pre-wrap text-foreground/90">
                  <p>Dear Procurement Team,</p>
                  <br/>
                  <p>Thank you for the opportunity to quote on {bid.rfqId}. Cummins is pleased to submit our response for the requested {bid.title}.</p>
                  <br/>
                  <p>We are able to fully fulfill <strong>{bid.matchedParts} of the {bid.totalParts}</strong> requested line items with direct OEM components. Based on your required delivery schedule, all matched parts are currently in stock and can meet the stated lead times.</p>
                  <br/>
                  <p>Please find attached our formal pricing schedule and detailed spec sheets. Total quoted value for matched parts is <strong>$234,500.00</strong>.</p>
                  <br/>
                  <p>We look forward to your review.</p>
                  <br/>
                  <p>Best regards,</p>
                  <p className="font-medium text-muted-foreground">{bid.assignedAE || "Cummins Sales Representative"}</p>
                </div>
                <div className="p-4 border-t bg-muted/10 flex justify-end gap-2">
                  <Button variant="outline" size="sm">Save as Draft</Button>
                  <Button size="sm" className="gap-2"><Send className="w-3 h-3" /> Export to Outlook</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

