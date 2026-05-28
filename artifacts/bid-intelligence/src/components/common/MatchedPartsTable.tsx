import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  INVENTORY_STATUSES,
  LEAD_TIME_PRESETS,
  type InventoryStatus,
  type WorkbenchRow,
} from "@/lib/workbenchRows";

type Props = {
  rows: WorkbenchRow[];
  onUpdate: (idx: number, patch: Partial<WorkbenchRow>) => void;
};

/**
 * The operational AI-Matched Bid Parts table. Shared by the Response Workbench
 * and the Portal Bid Review flow so both render an identical 9-column grid with
 * match validation, inventory detail, and editable lead time / status.
 */
export function MatchedPartsTable({ rows, onUpdate }: Props) {
  return (
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
          {rows.map((r, idx) => {
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

                {/* Match Type */}
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
                    onValueChange={(v) => onUpdate(idx, { leadTime: v })}
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
                      onChange={(e) => onUpdate(idx, { customLead: e.target.value })}
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
                    onValueChange={(v) => onUpdate(idx, { inventoryStatus: v as InventoryStatus })}
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
  );
}
