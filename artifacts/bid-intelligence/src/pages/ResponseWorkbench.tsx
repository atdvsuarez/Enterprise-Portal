import { useMemo, useState } from "react";
import { useParams, Link } from "wouter";
import { getBidById, mockBids } from "@/data/mock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sparkles, Mail, ArrowLeft, CheckCircle2, Send, Paperclip, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

function StatusChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E8F5EE] text-[#1f7a4a] text-xs font-medium">
      <CheckCircle2 className="h-3.5 w-3.5" />
      {children}
    </span>
  );
}

export default function ResponseWorkbench() {
  const { id } = useParams();
  const bidId = id || "BID-2026-001";
  const bid = getBidById(bidId) || mockBids[0];

  const items = useMemo(
    () =>
      bid.lineItems.map((li, idx) => ({
        partNumber: li.matchedPart || li.partNumber,
        description: li.description,
        quantity: li.quantity,
        price: li.price ?? 100 + (idx * 37) % 900,
        leadTime: li.leadTime || `${(idx % 4) + 1} weeks`,
      })),
    [bid]
  );

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  const itemsCsv = useMemo(() => {
    const header = "Part Number,Description,Quantity,Unit Price,Lead Time";
    const rows = items.map(
      (i) =>
        `${i.partNumber},"${i.description}",${i.quantity},$${i.price.toFixed(2)},${i.leadTime}`
    );
    return [header, ...rows].join("\n");
  }, [items]);

  const attachmentName = `${bid.rfqId}-line-items.csv`;
  const attachmentSizeKb = Math.max(1, Math.round(itemsCsv.length / 1024));

  const defaultBody = useMemo(
    () =>
      `Dear Procurement Team,

Thank you for the opportunity to quote on ${bid.rfqId}. Cummins is pleased to submit our response for ${bid.title}.

All ${items.length} requested line items have been matched to OEM components and are available with current pricing. Please see the attached file (${attachmentName}) for the full line-item summary, including part numbers, quantities, unit pricing, and lead times.

Total quoted value: $${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

Please reply to this email if you require any clarifications.

Best regards,
${bid.assignedAE || "Cummins Sales Representative"}
Cummins Aftermarket`,
    [bid, items, attachmentName, total]
  );

  const downloadCsv = () => {
    const blob = new Blob([itemsCsv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = attachmentName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const AttachmentChip = ({ onDownload }: { onDownload?: () => void }) => (
    <button
      type="button"
      onClick={onDownload}
      className="inline-flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-left hover:bg-muted/50 transition-colors"
    >
      <FileSpreadsheet className="h-5 w-5 text-[#1f7a4a]" />
      <span className="flex flex-col">
        <span className="text-xs font-medium">{attachmentName}</span>
        <span className="text-[10px] text-muted-foreground">CSV · {attachmentSizeKb} KB · {items.length} line items</span>
      </span>
    </button>
  );

  const [body, setBody] = useState(defaultBody);
  const [emailOpen, setEmailOpen] = useState(false);

  const to = `procurement@${bid.customer.toLowerCase().replace(/[^a-z0-9]/g, "")}.gov`;
  const subject = `Response to ${bid.rfqId} — ${bid.title}`;

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="border-b bg-card px-6 py-4 shrink-0">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3 min-w-0">
            <Link href="/monitor">
              <Button variant="ghost" size="icon" className="h-8 w-8 mt-0.5">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="min-w-0">
              <h1 className="font-bold text-xl truncate">{bid.title}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                <span><strong className="text-foreground">RFQ:</strong> {bid.rfqId}</span>
                <span><strong className="text-foreground">Customer:</strong> {bid.customer}</span>
                <span><strong className="text-foreground">Close:</strong> {new Date(bid.closeDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusChip>All parts matched</StatusChip>
            <StatusChip>Pricing available</StatusChip>
            <StatusChip>Ready for response</StatusChip>
          </div>
        </div>
      </div>

      {/* Two-section layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-w-[1600px] w-full mx-auto">
        {/* LEFT — AI Drafted Response */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Drafted Response
                </CardTitle>
                <Button size="sm" className="gap-1.5" onClick={() => setEmailOpen(true)}>
                  <Mail className="h-4 w-4" /> View Email
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="px-4 py-3 border-b bg-muted/20 text-sm space-y-1">
                <div className="flex gap-3">
                  <span className="text-muted-foreground w-16 shrink-0">To</span>
                  <span className="font-medium truncate">{to}</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-muted-foreground w-16 shrink-0">Subject</span>
                  <span className="font-medium truncate">{subject}</span>
                </div>
              </div>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="min-h-[380px] rounded-none border-0 font-sans text-sm leading-relaxed focus-visible:ring-0 resize-y"
              />
              <div className="px-4 py-3 border-t bg-muted/10">
                <div className="flex items-center gap-2 mb-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                  <Paperclip className="h-3 w-3" /> Attachment
                </div>
                <AttachmentChip onDownload={downloadCsv} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT — Line Items Table */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Line Items ({items.length})</span>
                <span className="text-xs font-normal text-muted-foreground tabular-nums">
                  Total ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="w-[120px]">Part #</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right w-[60px]">Qty</TableHead>
                    <TableHead className="text-right w-[90px]">Price</TableHead>
                    <TableHead className="text-right w-[90px]">Lead Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((i, idx) => (
                    <TableRow key={idx} className="even:bg-neutral-50/60">
                      <TableCell className="font-mono text-xs text-primary py-2.5">{i.partNumber}</TableCell>
                      <TableCell className="text-xs py-2.5">{i.description}</TableCell>
                      <TableCell className="text-right tabular-nums text-xs py-2.5">{i.quantity}</TableCell>
                      <TableCell className="text-right tabular-nums text-xs py-2.5">${i.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground py-2.5">{i.leadTime}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* View Email Dialog */}
      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> Email Preview
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="border rounded-md bg-muted/20 px-4 py-3 text-sm space-y-1">
              <div className="flex gap-3"><span className="text-muted-foreground w-16">To</span><span className="font-medium">{to}</span></div>
              <div className="flex gap-3"><span className="text-muted-foreground w-16">Subject</span><span className="font-medium">{subject}</span></div>
            </div>
            <div className="border rounded-md bg-background p-4 max-h-[360px] overflow-auto">
              <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed">{body}</pre>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                <Paperclip className="h-3 w-3" /> Attachment
              </div>
              <AttachmentChip onDownload={downloadCsv} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailOpen(false)}>Close</Button>
            <Button
              className="gap-1.5"
              onClick={() => {
                setEmailOpen(false);
                toast.success("Email sent", { description: `Response for ${bid.rfqId} delivered to ${bid.customer}.` });
              }}
            >
              <Send className="h-4 w-4" /> Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
