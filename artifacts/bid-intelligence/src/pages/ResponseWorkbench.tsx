import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "wouter";
import { getBidById, mockBids } from "@/data/mock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sparkles, ArrowLeft, Paperclip, FileSpreadsheet, Inbox, ExternalLink, AlertTriangle, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const WAREHOUSES = ["Dallas WH", "Chicago WH", "Memphis WH", "Atlanta WH", "Seattle WH"];
const LEAD_TIME_PRESETS = ["4 days", "2 weeks", "3 weeks"];
const PACK_QUANTITIES = ["1", "5", "10"];
const INVENTORY_STATUSES = [
  "Completely Available",
  "Partially Available",
  "Not Available / Need to check GOMS",
] as const;
type InventoryStatus = (typeof INVENTORY_STATUSES)[number];

type MatchKind = "exact" | "superseded" | "mismatch";

type WorkbenchRow = {
  emailBidPart: string;
  cumminsFoundPart: string;
  matchKind: MatchKind;
  source: string;
  supersededFrom?: string;
  packQty: string;
  qtyRequested: number;
  price: number;
  leadTime: string;
  customLead: string;
  inventory: { wh: string; qty: number }[];
  inventoryStatus: InventoryStatus;
};

export default function ResponseWorkbench() {
  const { id } = useParams();
  const bidId = id || "BID-2026-001";
  const bid = getBidById(bidId) || mockBids[0];

  const initialRows = useMemo<WorkbenchRow[]>(() => {
    return bid.lineItems.map((li, idx) => {
      const emailBidPart = li.partNumber;
      const qtyRequested = li.quantity;
      const price = li.price ?? 100 + ((idx * 37) % 900);

      // Deterministic match classification per row
      const m = idx % 6;
      let matchKind: MatchKind = "exact";
      if (m === 2) matchKind = "mismatch";
      else if (m === 3) matchKind = "superseded";

      let cumminsFoundPart = emailBidPart;
      let source = "Exact Match";
      let supersededFrom: string | undefined;

      if (matchKind === "mismatch") {
        // Cummins catalog returned a different candidate — needs human review
        cumminsFoundPart = `CUM-${5200 + idx}-${(idx % 9) + 1}`;
        source = "Fuzzy Match";
      } else if (matchKind === "superseded") {
        // Email referenced an obsolete part; resolved to its replacement
        supersededFrom = emailBidPart;
        cumminsFoundPart = `CUM-${6100 + idx}-R`;
        source = "Supersession";
      }

      // Deterministic inventory / status
      const s = idx % 4;
      let inventoryStatus: InventoryStatus = "Completely Available";
      let inventory: { wh: string; qty: number }[];
      if (s === 1) {
        // split fulfillment across two warehouses
        inventoryStatus = "Partially Available";
        const a = Math.max(1, Math.floor(qtyRequested * 0.6));
        inventory = [
          { wh: WAREHOUSES[idx % WAREHOUSES.length], qty: a },
          { wh: WAREHOUSES[(idx + 2) % WAREHOUSES.length], qty: Math.max(1, qtyRequested - a) },
        ];
      } else if (s === 3) {
        inventoryStatus = "Not Available / Need to check GOMS";
        inventory = [];
      } else {
        inventory = [{ wh: WAREHOUSES[idx % WAREHOUSES.length], qty: qtyRequested + (idx % 5) }];
      }

      return {
        emailBidPart,
        cumminsFoundPart,
        matchKind,
        source,
        supersededFrom,
        packQty: PACK_QUANTITIES[idx % PACK_QUANTITIES.length],
        qtyRequested,
        price,
        leadTime: LEAD_TIME_PRESETS[idx % LEAD_TIME_PRESETS.length],
        customLead: "",
        inventory,
        inventoryStatus,
      };
    });
  }, [bid]);

  const [rows, setRows] = useState<WorkbenchRow[]>(initialRows);

  // Reset grid state when navigating to a different bid (initialRows only
  // changes identity when `bid` changes, so in-row edits are preserved otherwise).
  useEffect(() => setRows(initialRows), [initialRows]);

  const updateRow = (idx: number, patch: Partial<WorkbenchRow>) =>
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

  const resolvedLead = (r: WorkbenchRow) =>
    r.leadTime === "Custom" ? r.customLead || "—" : r.leadTime;

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
            <div className="overflow-x-auto">
              <Table className="min-w-[1100px]">
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="w-[150px]">Email Bid Part #</TableHead>
                    <TableHead className="w-[170px]">Cummins Found Part #</TableHead>
                    <TableHead className="w-[110px]">Match Type</TableHead>
                    <TableHead className="text-right w-[90px]">Pack Qty</TableHead>
                    <TableHead className="text-right w-[90px]">Qty Req.</TableHead>
                    <TableHead className="text-right w-[90px]">Price</TableHead>
                    <TableHead className="w-[150px]">Lead Time</TableHead>
                    <TableHead className="w-[190px]">Inventory Details</TableHead>
                    <TableHead className="w-[150px]">Inventory Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((r, idx) => {
                    const isMismatch = r.matchKind === "mismatch";
                    const isSuperseded = r.matchKind === "superseded";
                    return (
                      <TableRow
                        key={idx}
                        className={cn(
                          "align-top",
                          isMismatch && "bg-[#DA291C]/[0.05] hover:bg-[#DA291C]/[0.08]",
                          !isMismatch && "even:bg-neutral-50/60"
                        )}
                      >
                        {/* Email Bid Part # */}
                        <TableCell
                          className={cn(
                            "font-mono text-xs py-2.5",
                            isMismatch && "border-l-2 border-l-[#DA291C]"
                          )}
                        >
                          {r.emailBidPart}
                        </TableCell>

                        {/* Cummins Found Part # */}
                        <TableCell className="font-mono text-xs py-2.5">
                          <div className="flex items-center gap-1.5">
                            {isMismatch ? (
                              <AlertTriangle className="h-3.5 w-3.5 text-[#DA291C] shrink-0" />
                            ) : (
                              <CheckCircle2 className="h-3.5 w-3.5 text-[#1f7a4a] shrink-0" />
                            )}
                            <span className={cn(isMismatch ? "text-[#DA291C] font-medium" : "text-primary")}>
                              {r.cumminsFoundPart}
                            </span>
                          </div>
                          {isMismatch && (
                            <span className="block text-[10px] text-[#DA291C] mt-0.5 pl-5">Does not match — review</span>
                          )}
                        </TableCell>

                        {/* Source */}
                        <TableCell className="py-2.5">
                          <span
                            className={cn(
                              "inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium",
                              isMismatch && "bg-[#DA291C]/10 text-[#DA291C]",
                              isSuperseded && "bg-amber-100 text-amber-700",
                              !isMismatch && !isSuperseded && "bg-muted text-muted-foreground"
                            )}
                          >
                            {r.source}
                          </span>
                        </TableCell>

                        {/* Pack Quantity (static) */}
                        <TableCell className="text-right tabular-nums text-xs py-2.5">{r.packQty}</TableCell>

                        {/* Qty Requested */}
                        <TableCell className="text-right tabular-nums text-xs py-2.5">{r.qtyRequested}</TableCell>

                        {/* Price */}
                        <TableCell className="text-right tabular-nums text-xs py-2.5">${r.price.toFixed(2)}</TableCell>

                        {/* Lead Time */}
                        <TableCell className="py-2">
                          <Select
                            value={r.leadTime}
                            onValueChange={(v) => updateRow(idx, { leadTime: v })}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {LEAD_TIME_PRESETS.map((p) => (
                                <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>
                              ))}
                              <SelectItem value="Custom" className="text-xs">Custom…</SelectItem>
                            </SelectContent>
                          </Select>
                          {r.leadTime === "Custom" && (
                            <Input
                              value={r.customLead}
                              onChange={(e) => updateRow(idx, { customLead: e.target.value })}
                              placeholder="e.g. 10 days"
                              className="h-7 text-xs mt-1"
                            />
                          )}
                        </TableCell>

                        {/* Inventory Details */}
                        <TableCell className="text-xs py-2.5">
                          {r.inventory.length === 0 ? (
                            <span className="text-muted-foreground italic">No stock on hand</span>
                          ) : (
                            <div className="space-y-0.5">
                              {r.inventory.map((w) => (
                                <div key={w.wh} className="tabular-nums">
                                  {w.wh}: <span className="font-medium">{w.qty}</span>
                                </div>
                              ))}
                              {r.inventory.length > 1 && (
                                <div className="text-[10px] text-muted-foreground">Split fulfillment</div>
                              )}
                            </div>
                          )}
                          {isSuperseded && r.supersededFrom && (
                            <div className="text-[10px] text-amber-700 mt-1">
                              Superseded from Part {r.supersededFrom}
                            </div>
                          )}
                        </TableCell>

                        {/* Inventory Status */}
                        <TableCell className="py-2">
                          <Select
                            value={r.inventoryStatus}
                            onValueChange={(v) => updateRow(idx, { inventoryStatus: v as InventoryStatus })}
                          >
                            <SelectTrigger
                              className={cn(
                                "h-8 text-xs border-0 font-medium",
                                r.inventoryStatus === "Completely Available" && "bg-[#1f7a4a]/10 text-[#1f7a4a]",
                                r.inventoryStatus === "Partially Available" && "bg-amber-100 text-amber-700",
                                r.inventoryStatus === "Not Available / Need to check GOMS" && "bg-[#DA291C]/10 text-[#DA291C]"
                              )}
                            >
                              <span className="flex items-center gap-1 truncate">
                                {r.inventoryStatus === "Completely Available" && <CheckCircle2 className="h-3 w-3 shrink-0" />}
                                {r.inventoryStatus === "Partially Available" && <AlertCircle className="h-3 w-3 shrink-0" />}
                                {r.inventoryStatus === "Not Available / Need to check GOMS" && <XCircle className="h-3 w-3 shrink-0" />}
                                <SelectValue />
                              </span>
                            </SelectTrigger>
                            <SelectContent>
                              {INVENTORY_STATUSES.map((s) => (
                                <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
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
