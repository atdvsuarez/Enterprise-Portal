import type { Bid } from "@/data/types";

export const WAREHOUSES = ["Dallas WH", "Chicago WH", "Memphis WH", "Atlanta WH", "Seattle WH"];
export const LEAD_TIME_PRESETS = ["4 days", "2 weeks", "3 weeks"];
export const PACK_QUANTITIES = ["1", "5", "10"];
export const INVENTORY_STATUSES = [
  "Completely Available",
  "Partially Available",
  "Not Available / Need to check GOMS",
] as const;
export type InventoryStatus = (typeof INVENTORY_STATUSES)[number];

export type MatchKind = "exact" | "superseded" | "mismatch";

export type WorkbenchRow = {
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

/**
 * Deterministically derive the operational validation grid for a bid's line
 * items. Shared by the Response Workbench and the Portal Bid Review flow so
 * both surfaces present the identical AI-matched parts table.
 */
export function buildWorkbenchRows(bid: Bid): WorkbenchRow[] {
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
      cumminsFoundPart = `CUM-${5200 + idx}-${(idx % 9) + 1}`;
      source = "Fuzzy Match";
    } else if (matchKind === "superseded") {
      supersededFrom = emailBidPart;
      cumminsFoundPart = `CUM-${6100 + idx}-R`;
      source = "Supersession";
    }

    // Deterministic inventory / status
    const s = idx % 4;
    let inventoryStatus: InventoryStatus = "Completely Available";
    let inventory: { wh: string; qty: number }[];
    if (s === 1) {
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
}

export const resolvedLead = (r: WorkbenchRow) =>
  r.leadTime === "Custom" ? r.customLead || "—" : r.leadTime;
