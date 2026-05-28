import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "wouter";
import { getBidById, mockBids } from "@/data/mock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ArrowLeft, CheckCircle2, XCircle, Link2, FileText, Sparkles, UploadCloud,
  Loader2, AlertTriangle, Download, FileCheck2, Paperclip, ExternalLink, FileSpreadsheet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { MatchedPartsTable } from "@/components/common/MatchedPartsTable";
import { buildWorkbenchRows, resolvedLead, type WorkbenchRow } from "@/lib/workbenchRows";
import type { Bid } from "@/data/types";

type Scenario = "happy" | "manual";

function portalUrlFor(bid: Bid): string {
  const portal = (bid.portalName || "PlanetBids").toLowerCase().replace(/[^a-z0-9]/g, "");
  return `https://${portal}.com/portal/bids/${bid.rfqId}`;
}

/* ---- Status header ---- */
function StatusRow({ ok, label, okText, failText }: { ok: boolean; label: string; okText: string; failText: string }) {
  return (
    <div className="flex items-center gap-3">
      {ok ? (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1f7a4a]/10 shrink-0">
          <CheckCircle2 className="h-4.5 w-4.5 text-[#1f7a4a]" />
        </span>
      ) : (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#DA291C]/10 shrink-0">
          <XCircle className="h-4.5 w-4.5 text-[#DA291C]" />
        </span>
      )}
      <div className="min-w-0">
        <p className="text-sm font-medium leading-tight">{label}</p>
        <p className={cn("text-xs leading-tight mt-0.5", ok ? "text-[#1f7a4a]" : "text-[#DA291C]")}>
          {ok ? okText : failText}
        </p>
      </div>
    </div>
  );
}

/* ---- AI summary: bid name + extracted parts/quantities as a table ---- */
function AiSummary({ bid }: { bid: Bid }) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" /> AI Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-5">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
            <FileText className="h-3.5 w-3.5" /> Bid Name
          </div>
          <p className="text-sm font-medium leading-snug">{bid.title}</p>
          <p className="text-xs text-muted-foreground">{bid.rfqId} · {bid.customer}</p>
        </div>

        <div className="space-y-2">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
            Extracted Part IDs &amp; Quantities ({bid.lineItems.length})
          </div>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Part ID</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right w-24">Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bid.lineItems.map((li, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-muted-foreground tabular-nums">{li.lineNumber}</TableCell>
                    <TableCell className="font-mono text-xs">{li.partNumber}</TableCell>
                    <TableCell className="text-muted-foreground">{li.description}</TableCell>
                    <TableCell className="text-right tabular-nums">{li.quantity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ---- Inline PDF preview (rendered mock of the retrieved bid document) ---- */
function PdfPreview({ bid, retrievedLabel }: { bid: Bid; retrievedLabel: string }) {
  const fileName = `${bid.rfqId}-bid-document.pdf`;
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#DA291C]" /> PDF Preview
          </CardTitle>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono">{fileName}</span>
            <Button size="sm" variant="outline" className="gap-1.5 h-7" onClick={() => toast.success("Downloading", { description: fileName })}>
              <Download className="h-3.5 w-3.5" /> Download
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5 bg-neutral-100">
        {/* Paper sheet */}
        <div className="mx-auto max-w-[680px] bg-white shadow-md border border-neutral-200 rounded-sm px-10 py-8 text-[13px] leading-relaxed text-neutral-800">
          <div className="flex items-start justify-between border-b border-neutral-300 pb-4 mb-4">
            <div>
              <p className="text-lg font-bold tracking-tight">REQUEST FOR QUOTATION</p>
              <p className="text-xs text-neutral-500 mt-0.5">Issued via {bid.portalName}</p>
            </div>
            <div className="text-right text-xs text-neutral-500">
              <p className="font-mono font-medium text-neutral-700">{bid.rfqId}</p>
              <p>External ID: {bid.externalId}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs mb-5">
            <p><span className="text-neutral-500">Solicitation:</span> <span className="font-medium">{bid.title}</span></p>
            <p><span className="text-neutral-500">Buyer:</span> <span className="font-medium">{bid.customer}</span></p>
            <p><span className="text-neutral-500">Issued:</span> {new Date(bid.createdDate).toLocaleDateString()}</p>
            <p><span className="text-neutral-500">Due:</span> {new Date(bid.closeDate).toLocaleDateString()}</p>
          </div>

          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">Line Items Requested</p>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-y border-neutral-300 text-neutral-500">
                <th className="text-left py-1.5 font-medium w-10">#</th>
                <th className="text-left py-1.5 font-medium">Part Number</th>
                <th className="text-left py-1.5 font-medium">Description</th>
                <th className="text-right py-1.5 font-medium w-16">Qty</th>
              </tr>
            </thead>
            <tbody>
              {bid.lineItems.map((li, i) => (
                <tr key={i} className="border-b border-neutral-100">
                  <td className="py-1.5 text-neutral-400 tabular-nums">{li.lineNumber}</td>
                  <td className="py-1.5 font-mono">{li.partNumber}</td>
                  <td className="py-1.5 text-neutral-600">{li.description}</td>
                  <td className="py-1.5 text-right tabular-nums">{li.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-6 pt-4 border-t border-neutral-300 text-[11px] text-neutral-500">
            <p>Terms: Pricing firm 30 days. FOB destination. Reference {bid.rfqId} on all correspondence.</p>
            <p className="mt-3 text-neutral-400">Page 1 of 1 · {retrievedLabel}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ---- Draft Email Response (mirrors Response Workbench) ---- */
function DraftEmailResponse({ bid, rows }: { bid: Bid; rows: WorkbenchRow[] }) {
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

  const customerDomain = `${bid.customer.toLowerCase().replace(/[^a-z0-9]/g, "")}.gov`;
  const to = `procurement@${customerDomain}`;
  const subject = `Response to ${bid.rfqId} — ${bid.title}`;

  const defaultBody = useMemo(
    () =>
      `Dear Procurement Team,

Thank you for the opportunity to quote on ${bid.rfqId} via ${bid.portalName}. Cummins is pleased to submit our response for ${bid.title}.

Our full line-item response — including part numbers, quantities, unit pricing, and lead times — is attached as ${attachmentName}.

Please reply to this email if you require any clarifications.

Best regards,
${bid.assignedAE || "Cummins Sales Representative"}
Cummins Aftermarket`,
    [bid, attachmentName]
  );

  const [body, setBody] = useState(defaultBody);
  const [draftGenerated, setDraftGenerated] = useState(false);
  useEffect(() => setBody(defaultBody), [defaultBody]);

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

  const sendInOutlook = () => {
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

  const AttachmentChip = () => (
    <button
      type="button"
      onClick={downloadCsv}
      className="inline-flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-left hover:bg-muted/50 transition-colors"
    >
      <FileSpreadsheet className="h-5 w-5 text-[#1f7a4a]" />
      <span className="flex flex-col">
        <span className="text-xs font-medium">{attachmentName}</span>
        <span className="text-[10px] text-muted-foreground">CSV · {attachmentSizeKb} KB · {rows.length} line items</span>
      </span>
    </button>
  );

  if (!draftGenerated) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> Draft Email Response
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="rounded-lg border border-dashed bg-muted/20 px-4 py-6 text-center max-w-xl mx-auto">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#DA291C]/10">
              <Sparkles className="h-5 w-5 text-[#DA291C]" />
            </div>
            <p className="text-sm font-medium">Ready when you are</p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Review the matched parts, pricing, inventory, and lead times above. When the bid looks
              right, generate a customer-ready email draft with the line items attached.
            </p>
            <Button className="mt-4 gap-1.5" onClick={() => setDraftGenerated(true)}>
              <Sparkles className="h-4 w-4" /> Generate Draft Email
            </Button>
            <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
              <Paperclip className="h-3 w-3" /> {rows.length} line items will be attached
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> Draft Email Response
          </CardTitle>
          <Button size="sm" className="gap-1.5" onClick={sendInOutlook}>
            <ExternalLink className="h-4 w-4" /> Send in Outlook
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
          className="min-h-[280px] rounded-none border-0 font-sans text-sm leading-relaxed focus-visible:ring-0 resize-y"
        />
        <div className="px-4 py-3 border-t bg-muted/10">
          <div className="flex items-center gap-2 mb-2 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
            <Paperclip className="h-3 w-3" /> Attachment
          </div>
          <AttachmentChip />
        </div>
      </CardContent>
    </Card>
  );
}

export default function PortalBidReview() {
  const { id } = useParams();
  const bidId = id || "BID-2026-007";
  const bid = getBidById(bidId) || mockBids[0];

  const [scenario, setScenario] = useState<Scenario>("happy");

  // Manual-path state
  const [uploadedName, setUploadedName] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset manual state whenever the scenario changes
  useEffect(() => {
    setUploadedName(null);
    setProcessing(false);
    setProcessed(false);
  }, [scenario]);

  // Shared matched-parts grid
  const initialRows = useMemo<WorkbenchRow[]>(() => buildWorkbenchRows(bid), [bid]);
  const [rows, setRows] = useState<WorkbenchRow[]>(initialRows);
  useEffect(() => setRows(initialRows), [initialRows]);
  const updateRow = (idx: number, patch: Partial<WorkbenchRow>) =>
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

  const mismatchCount = rows.filter((r) => r.matchKind === "mismatch").length;
  const portalUrl = portalUrlFor(bid);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("PDF only", { description: "Please upload the bid document as a PDF file." });
      return;
    }
    setUploadedName(file.name);
    setProcessing(true);
    setProcessed(false);
    setTimeout(() => {
      setProcessing(false);
      setProcessed(true);
      toast.success("PDF processed", { description: `Extracted ${bid.lineItems.length} line items from ${file.name}.` });
    }, 1800);
  };

  const MatchedTableCard = (
    <Card className="shadow-sm">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> AI-Matched Bid Parts Table ({rows.length})
          </CardTitle>
          {mismatchCount > 0 && (
            <span className="inline-flex items-center gap-1 text-[#DA291C] font-medium text-xs">
              <AlertTriangle className="h-3.5 w-3.5" />
              {mismatchCount} part {mismatchCount === 1 ? "mismatch" : "mismatches"} to review
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <MatchedPartsTable rows={rows} onUpdate={updateRow} />
      </CardContent>
    </Card>
  );

  // Processed output, shared by both scenarios:
  // PDF preview first → AI summary → matched table → draft email last.
  const ProcessedOutput = (retrievedLabel: string) => (
    <>
      <PdfPreview bid={bid} retrievedLabel={retrievedLabel} />
      <AiSummary bid={bid} />
      {MatchedTableCard}
      <DraftEmailResponse bid={bid} rows={rows} />
    </>
  );

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
              <h1 className="font-bold text-xl truncate">Portal Bid Review</h1>
              <p className="text-xs text-muted-foreground mt-1">
                Process a bid that originated from a portal URL.
              </p>
            </div>
          </div>

          {/* Demo scenario switcher */}
          <div className="inline-flex rounded-md border bg-muted/30 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setScenario("happy")}
              className={cn(
                "px-3 py-1.5 rounded-[5px] font-medium transition-colors",
                scenario === "happy" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              PDF retrieved
            </button>
            <button
              type="button"
              onClick={() => setScenario("manual")}
              className={cn(
                "px-3 py-1.5 rounded-[5px] font-medium transition-colors",
                scenario === "manual" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Retrieval failed
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-6 p-6 max-w-[1100px] w-full mx-auto">
        {/* STATUS HEADER */}
        <Card className="shadow-sm">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-2 rounded-md bg-muted/40 px-3 py-2 text-xs">
              <Link2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground shrink-0">Portal URL</span>
              <span className="font-mono truncate text-foreground">{portalUrl}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatusRow ok label="Portal URL" okText="Portal URL identified" failText="" />
              {scenario === "happy" ? (
                <StatusRow ok label="Bid PDF" okText="PDF retrieved successfully" failText="" />
              ) : (
                <StatusRow ok={false} label="Bid PDF" okText="" failText="PDF retrieval unsuccessful" />
              )}
            </div>
          </CardContent>
        </Card>

        {scenario === "happy" ? (
          ProcessedOutput(`Retrieved automatically from ${bid.portalName}`)
        ) : (
          <>
            {/* Manual path notification */}
            <div className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <AlertTriangle className="h-4.5 w-4.5 mt-0.5 shrink-0 text-amber-600" />
              <p>
                Portal URL identified, but the bid PDF could not be retrieved automatically. Please
                download the PDF from the portal and upload it below to continue processing.
              </p>
            </div>

            {/* MANUAL PDF UPLOAD */}
            {!processed && (
              <Card className="shadow-sm">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-base flex items-center gap-2">
                    <UploadCloud className="h-4 w-4 text-primary" /> Manual PDF Upload
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files?.[0])}
                  />
                  <div
                    onClick={() => !processing && fileInputRef.current?.click()}
                    className={cn(
                      "rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors",
                      processing ? "opacity-70" : "cursor-pointer hover:bg-muted/40 border-muted-foreground/25"
                    )}
                  >
                    {processing ? (
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                        <p className="text-sm font-medium">Processing {uploadedName}…</p>
                        <p className="text-xs text-muted-foreground">Extracting line items and matching against the Cummins catalog</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#DA291C]/10">
                          <UploadCloud className="h-6 w-6 text-[#DA291C]" />
                        </div>
                        <p className="text-sm font-medium">Click to upload the bid PDF</p>
                        <p className="text-xs text-muted-foreground">PDF only · up to 25 MB</p>
                        <Button className="mt-3 gap-1.5" type="button">
                          <UploadCloud className="h-4 w-4" /> Upload PDF
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AFTER UPLOAD — same processed output as the happy path */}
            {processed && (
              <>
                <div className="flex items-center gap-2 rounded-md border border-[#1f7a4a]/30 bg-[#1f7a4a]/5 px-4 py-2.5 text-sm text-[#1f7a4a]">
                  <FileCheck2 className="h-4 w-4 shrink-0" />
                  <span><span className="font-medium">{uploadedName}</span> uploaded and processed successfully.</span>
                </div>
                {ProcessedOutput(`Uploaded manually${uploadedName ? ` · ${uploadedName}` : ""}`)}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
