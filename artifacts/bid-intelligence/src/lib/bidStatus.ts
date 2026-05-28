import { useSyncExternalStore } from "react";
import { mockBids } from "@/data/mock";

export type SimpleStatus = "Pending" | "Submitted";

export function simplifyStatus(status: string): SimpleStatus {
  return status === "Submitted" ? "Submitted" : "Pending";
}

const STORAGE_KEY = "bid-intel-statuses";

function loadInitial(): Record<string, SimpleStatus> {
  const base: Record<string, SimpleStatus> = Object.fromEntries(
    mockBids.map((b) => [b.id, simplifyStatus(b.status)])
  );
  if (typeof window === "undefined") return base;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Record<string, SimpleStatus>;
    return { ...base, ...parsed };
  } catch {
    return base;
  }
}

let statuses: Record<string, SimpleStatus> = loadInitial();
const listeners = new Set<() => void>();

function emit() {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses));
    } catch {
      /* ignore */
    }
  }
  listeners.forEach((l) => l());
}

export function getStatuses(): Record<string, SimpleStatus> {
  return statuses;
}

export function getStatus(id: string): SimpleStatus {
  return statuses[id] ?? "Pending";
}

export function setBidStatus(id: string, status: SimpleStatus) {
  if (statuses[id] === status) return;
  statuses = { ...statuses, [id]: status };
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useBidStatuses(): Record<string, SimpleStatus> {
  return useSyncExternalStore(subscribe, getStatuses, getStatuses);
}
