import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "wouter";
import { getBidById, mockBids } from "@/data/mock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sparkles, ArrowLeft, Paperclip, FileSpreadsheet, Inbox, ExternalLink, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { MatchedPartsTable } from "@/components/common/MatchedPartsTable";
import {
  buildWorkbenchRows,
  resolvedLead,
  type WorkbenchRow,
} from "@/lib/workbenchRows";

export default function ResponseWorkbench() {
  const { id } = useParams();
  const bidId = id || "BID-2026-001";
  const bid = getBidById(bidId) || mockBids[0];

  const initialRows = useMemo<WorkbenchRow[]>(() => buildWorkbenchRows(bid), [bid]);

  const [rows, setRows] = useState<WorkbenchRow[]>(initialRows);

  // Reset grid state when navigating to a different bid (initialRows only
  // changes identity when `bid` changes, so in-row edits are preserved otherwise).
  useEffect(() => setRows(initialRows), [initialRows]);

  const updateRow = (idx: number, patch: Partial<WorkbenchRow>) =>
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

  const items = rows;
  const total = items.reduce((s, i) => s + i.price * i.qtyRequested, 0);
  const mismatchCount = items.filter((r) => r.matchKind === "mismatch").length;

  const itemsCsv = useMemo(() => {
    const header =
      "Email Bid Part,Cummins Found Part,Source,Pack Qty,Qty Requested,Unit Price,Lead Time,Inventory Status";
    const csvRows = rows.map((r) =>
      [
        r.emailBidPart,
        r.cumminsFoundPart,
        r.source,
        r.packQty,
        r.qtyRequested,
        `$${r.price.toFixed(2)}`,
        resolvedLead(r),
        r.inventoryStatus,
      ].join(",")
    );
    return [header, ...csvRows].join("\n");
  }, [rows]);

  const attachmentName = `${bid.rfqId}-line-items.csv`;
  const attachmentSizeKb = Math.max(1, Math.round(itemsCsv.length / 1024));

  const defaultBody = useMemo(
    () =>
      `Dear Procurement Team,

Thank you for the opportunity to quote on ${bid.rfqId}. Cummins is pleased to submit our response for ${bid.title}.

Our full line-item response — including part numbers, quantities, unit pricing, and lead times — is attached as ${attachmentName}.

Please reply to this email if you require any clarifications.

Best regards,
${bid.assignedAE || "Cummins Sales Representative"}
Cummins Aftermarket`,
    [bid, attachmentName]
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
  const [draftGenerated, setDraftGenerated] = useState(false);

  const customerDomain = `${bid.customer.toLowerCase().replace(/[^a-z0-9]/g, "")}.gov`;
  const to = `procurement@${customerDomain}`;
  const subject = `Response to ${bid.rfqId} — ${bid.title}`;

  const buyerName = "Janet Whitman";
  const buyerEmail = `procurement@${customerDomain}`;
  const originalSubject = `RFQ ${bid.rfqId} — ${bid.title}`;
  const originalDate = new Date(bid.createdDate).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const originalBody = `Hello Cummins Aftermarket Team,

Please find attached our request for quote (RFQ ${bid.rfqId}) covering ${items.length} line items for ${bid.title}. ${bid.customer} is seeking pricing, availability, and lead times for the parts listed in the attached schedule.

Key requirements:
• Quotes are due no later than ${new Date(bid.closeDate).toLocaleDateString()}.
• Pricing should be firm for 30 days from submission.
• Delivery to our central depot, FOB destination.
• Please reference RFQ ${bid.rfqId} on all correspondence and pricing sheets.

Let me know if you have any questions or need clarification on any line item.

Best regards,
${buyerName}
Procurement Specialist
${bid.customer}
${buyerEmail}`;

  const sendInOutlook = () => {
    // Build an RFC-822 .eml so Outlook opens a draft with the CSV already attached.
    const boundary = `----=_BidIntel_${Date.now()}`;
    const csvBase64 = btoa(unescape(encodeURIComponent(itemsCsv)));
    const chunked = csvBase64.match(/.{1,76}/g)?.join("\r\n") ?? csvBase64;
    const date = new Date().toUTCString();
    const eml = [
      `Date: ${date}`,
      `From: bids@cummins.com`,
      `To: ${to}`,
      `Subject: ${subject}`,
      `X-Unsent: 1`,
      `MIME-Version: 1.0`,
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      ``,
      `--${boundary}`,
      `Content-Type: text/plain; charset=UTF-8`,
      `Content-Transfer-Encoding: 7bit`,
      ``,
      body,
      ``,
      `--${boundary}`,
      `Content-Type: text/csv; name="${attachmentName}"`,
      `Content-Transfer-Encoding: base64`,
      `Content-Disposition: attachment; filename="${attachmentName}"`,
      ``,
      chunked,
      ``,
      `--${boundary}--`,
      ``,
    ].join("\r\n");

    const blob = new Blob([eml], { type: "message/rfc822" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${bid.rfqId}-response.eml`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    toast.success("Draft opened in Outlook", {
      description: `${attachmentName} is attached to the draft.`,
    });
  };

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
                <span><strong className="text-foreground">Customer:</strong> {bid.customer}</span>
                <span><strong className="text-foreground">Assigned to:</strong> {bid.assignedAdmin ?? "Adrian Suarez"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary: matched parts table (left) · Secondary: draft response (right) */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-6 p-6 max-w-[1600px] w-full mx-auto items-start">
        {/* PRIMARY — AI-Matched Bid Parts Table */}
        <Card className="shadow-sm xl:col-span-8">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI-Matched Bid Parts Table ({items.length})
              </CardTitle>
              <div className="flex items-center gap-3 text-xs">
                {mismatchCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-[#DA291C] font-medium">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {mismatchCount} part {mismatchCount === 1 ? "mismatch" : "mismatches"} to review
                  </span>
                )}
                <span className="text-muted-foreground tabular-nums">
                  Total ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <MatchedPartsTable rows={items} onUpdate={updateRow} />
          </CardContent>
        </Card>

        {/* SECONDARY — Draft Email Response */}
        <div className="xl:col-span-4 xl:sticky xl:top-6">
          {!draftGenerated ? (
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Draft Email Response
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="rounded-lg border border-dashed bg-muted/20 px-4 py-6 text-center">
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#DA291C]/10">
                    <Sparkles className="h-5 w-5 text-[#DA291C]" />
                  </div>
                  <p className="text-sm font-medium">Ready when you are</p>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    Review the matched parts, pricing, inventory, and lead times first. When the bid looks
                    right, generate a customer-ready email draft with the line items attached.
                  </p>
                  <Button className="mt-4 gap-1.5 w-full" onClick={() => setDraftGenerated(true)}>
                    <Sparkles className="h-4 w-4" /> Generate Draft Email
                  </Button>
                </div>
                <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Paperclip className="h-3 w-3" /> {items.length} line items will be attached
                  </span>
                  <button
                    type="button"
                    onClick={() => setEmailOpen(true)}
                    className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    <Inbox className="h-3 w-3" /> View original
                  </button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Draft Email Response
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setEmailOpen(true)}>
                      <Inbox className="h-4 w-4" /> View Email
                    </Button>
                    <Button size="sm" className="gap-1.5" onClick={sendInOutlook}>
                      <ExternalLink className="h-4 w-4" /> Send in Outlook
                    </Button>
                  </div>
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
                  className="min-h-[360px] rounded-none border-0 font-sans text-sm leading-relaxed focus-visible:ring-0 resize-y"
                />
                <div className="px-4 py-3 border-t bg-muted/10">
                  <div className="flex items-center gap-2 mb-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                    <Paperclip className="h-3 w-3" /> Attachment
                  </div>
                  <AttachmentChip onDownload={downloadCsv} />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Original Customer Email Dialog */}
      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Inbox className="h-4 w-4" /> Original Customer Email
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="border rounded-md bg-muted/20 px-4 py-3 text-sm space-y-1">
              <div className="flex gap-3">
                <span className="text-muted-foreground w-16 shrink-0">From</span>
                <span className="font-medium truncate">{buyerName} &lt;{buyerEmail}&gt;</span>
              </div>
              <div className="flex gap-3">
                <span className="text-muted-foreground w-16 shrink-0">To</span>
                <span className="font-medium truncate">bids@cummins.com</span>
              </div>
              <div className="flex gap-3">
                <span className="text-muted-foreground w-16 shrink-0">Date</span>
                <span className="font-medium">{originalDate}</span>
              </div>
              <div className="flex gap-3">
                <span className="text-muted-foreground w-16 shrink-0">Subject</span>
                <span className="font-medium truncate">{originalSubject}</span>
              </div>
            </div>
            <div className="border rounded-md bg-background p-4 max-h-[360px] overflow-auto">
              <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed">{originalBody}</pre>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                <Paperclip className="h-3 w-3" /> Attachment from Customer
              </div>
              <div className="inline-flex items-center gap-2 rounded-md border bg-card px-3 py-2">
                <FileSpreadsheet className="h-5 w-5 text-[#1f7a4a]" />
                <span className="flex flex-col">
                  <span className="text-xs font-medium">{bid.rfqId}-RFQ.xlsx</span>
                  <span className="text-[10px] text-muted-foreground">Excel · {items.length} line items requested</span>
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailOpen(false)}>Close</Button>
            <Button
              className="gap-1.5"
              onClick={() => {
                setEmailOpen(false);
                sendInOutlook();
              }}
            >
              <ExternalLink className="h-4 w-4" /> Reply in Outlook
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
