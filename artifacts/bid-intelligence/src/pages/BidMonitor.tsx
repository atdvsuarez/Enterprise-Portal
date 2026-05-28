import { useEffect, useMemo, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { mockBids } from "@/data/mock";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, ExternalLink, UserPlus, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const DEFAULT_USERS = [
  "Adrian Suarez",
  "Priya Iyer",
  "Marcus Chen",
  "Jordan Park",
  "Sam Rivera",
];

type SimpleStatus = "Pending" | "Submitted";

function simplify(status: string): SimpleStatus {
  return status === "Submitted" ? "Submitted" : "Pending";
}

function sourceLabel(s: string): string {
  if (s === "External URL") return "URL";
  if (s === "Portal") return "URL";
  return s;
}

function StatusSelect({
  value,
  onChange,
}: {
  value: SimpleStatus;
  onChange: (v: SimpleStatus) => void;
}) {
  const isSubmitted = value === "Submitted";
  return (
    <Select value={value} onValueChange={(v) => onChange(v as SimpleStatus)}>
      <SelectTrigger
        className={cn(
          "h-7 w-[120px] rounded-full border-0 px-2.5 text-xs font-medium gap-1.5 focus:ring-1 focus:ring-offset-0",
          isSubmitted
            ? "bg-[#E8F5EE] text-[#1f7a4a] hover:bg-[#dbeee3]"
            : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
        )}
      >
        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", isSubmitted ? "bg-[#30A566]" : "bg-neutral-400")} />
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="start">
        <SelectItem value="Pending">Pending</SelectItem>
        <SelectItem value="Submitted">Submitted</SelectItem>
      </SelectContent>
    </Select>
  );
}

function AssigneeSelect({
  value,
  users,
  onChange,
  onAddUser,
}: {
  value: string;
  users: string[];
  onChange: (v: string) => void;
  onAddUser: (name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

  const commitNew = () => {
    const name = newName.trim();
    if (!name) return;
    onAddUser(name);
    onChange(name);
    setNewName("");
    setAdding(false);
    setOpen(false);
    toast.success(`Added ${name} and assigned this bid.`);
  };

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setAdding(false); }}>
      <PopoverTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className="text-xs px-2 py-1 rounded border border-transparent hover:border-border hover:bg-muted/60 transition-colors text-left w-full max-w-[160px] truncate"
        >
          {value || <span className="text-muted-foreground italic">Unassigned</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-0" align="start" onClick={(e) => e.stopPropagation()}>
        {adding ? (
          <div className="p-2 space-y-2">
            <Input
              autoFocus
              placeholder="New user name…"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitNew();
                if (e.key === "Escape") { setAdding(false); setNewName(""); }
              }}
              className="h-8 text-xs"
            />
            <div className="flex gap-1 justify-end">
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setAdding(false); setNewName(""); }}>
                Cancel
              </Button>
              <Button size="sm" className="h-7 text-xs" onClick={commitNew}>
                Add & Assign
              </Button>
            </div>
          </div>
        ) : (
          <Command>
            <CommandInput placeholder="Search users…" className="h-9" />
            <CommandList>
              <CommandEmpty>No users found.</CommandEmpty>
              <CommandGroup>
                {users.map((u) => (
                  <CommandItem
                    key={u}
                    value={u}
                    onSelect={() => { onChange(u); setOpen(false); }}
                    className="text-xs"
                  >
                    <Check className={cn("mr-2 h-3 w-3", value === u ? "opacity-100" : "opacity-0")} />
                    {u}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem onSelect={() => setAdding(true)} className="text-xs text-primary">
                  <UserPlus className="mr-2 h-3 w-3" />
                  Add new user…
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        )}
      </PopoverContent>
    </Popover>
  );
}

const FILTERS: ("All" | SimpleStatus)[] = ["All", "Pending", "Submitted"];
const SOURCE_FILTERS: { value: "All" | "Email" | "Excel" | "External URL"; label: string }[] = [
  { value: "All", label: "All Sources" },
  { value: "Email", label: "Email" },
  { value: "Excel", label: "Excel" },
  { value: "External URL", label: "URL" },
];

export default function BidMonitor() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const params = useMemo(() => new URLSearchParams(searchString), [searchString]);

  const [filter, setFilter] = useState<"All" | SimpleStatus>("All");
  const [sourceFilter, setSourceFilter] = useState<"All" | "Email" | "Excel" | "External URL">(
    () => {
      const s = params.get("source");
      return s === "Email" || s === "Excel" || s === "External URL" ? s : "All";
    }
  );
  const [search, setSearch] = useState("");

  useEffect(() => {
    const s = params.get("source");
    setSourceFilter(s === "Email" || s === "Excel" || s === "External URL" ? s : "All");
  }, [params]);

  const updateSource = (v: "All" | "Email" | "Excel" | "External URL") => {
    setSourceFilter(v);
    if (v === "All") setLocation("/monitor");
    else setLocation(`/monitor?source=${encodeURIComponent(v)}`);
  };

  const clearFilters = () => {
    setFilter("All");
    setSearch("");
    setSourceFilter("All");
    setLocation("/monitor");
  };

  const filtersActive = filter !== "All" || sourceFilter !== "All" || search.length > 0;
  const [users, setUsers] = useState<string[]>(DEFAULT_USERS);
  const [assignments, setAssignments] = useState<Record<string, string>>(() =>
    Object.fromEntries(mockBids.map((b) => [b.id, b.assignedAdmin ?? "Adrian Suarez"]))
  );
  const [statuses, setStatuses] = useState<Record<string, SimpleStatus>>(() =>
    Object.fromEntries(mockBids.map((b) => [b.id, simplify(b.status)]))
  );

  const rows = useMemo(() => {
    return mockBids
      .map((b) => ({
        id: b.id,
        title: b.title,
        customer: b.customer,
        source: sourceLabel(b.sourceType),
        rawSource: b.sourceType,
        portal: b.sourceType === "External URL" ? (b.portalName || "—") : "N/A",
        status: statuses[b.id] ?? simplify(b.status),
        assignee: assignments[b.id] ?? "",
      }))
      .filter((r) => {
        if (filter !== "All" && r.status !== filter) return false;
        if (sourceFilter !== "All" && r.rawSource !== sourceFilter) return false;
        if (search) {
          const q = search.toLowerCase();
          if (!r.title.toLowerCase().includes(q) && !r.customer.toLowerCase().includes(q)) return false;
        }
        return true;
      });
  }, [assignments, statuses, filter, sourceFilter, search]);

  const setAssignee = (id: string, name: string) => {
    setAssignments((prev) => ({ ...prev, [id]: name }));
    toast.success(`Assigned to ${name}.`);
  };

  const setStatus = (id: string, status: SimpleStatus) => {
    setStatuses((prev) => ({ ...prev, [id]: status }));
    toast.success(`Marked ${status}.`);
  };

  const addUser = (name: string) => {
    setUsers((prev) => (prev.includes(name) ? prev : [...prev, name]));
  };

  const counts = useMemo(() => {
    const ids = mockBids.map((b) => b.id);
    const pending = ids.filter((id) => (statuses[id] ?? "Pending") === "Pending").length;
    const submitted = ids.length - pending;
    return { pending, submitted, total: ids.length };
  }, [statuses]);

  return (
    <div className="p-4 md:p-8 max-w-[1500px] mx-auto space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Bid Monitor</h1>
          <p className="text-muted-foreground mt-1">Today's working queue — scan, assign, and process.</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">Total <span className="font-semibold text-foreground tabular-nums">{counts.total}</span></span>
          <span className="text-muted-foreground">Pending <span className="font-semibold text-foreground tabular-nums">{counts.pending}</span></span>
          <span className="text-muted-foreground">Submitted <span className="font-semibold text-foreground tabular-nums">{counts.submitted}</span></span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mr-1">Status</span>
          {FILTERS.map((f) => (
            <Badge
              key={f}
              variant={filter === f ? "default" : "outline"}
              className="cursor-pointer hover:bg-secondary transition-colors px-3 py-1"
              onClick={() => setFilter(f)}
            >
              {f}
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mr-1">Source</span>
            {SOURCE_FILTERS.map((s) => (
              <Badge
                key={s.value}
                variant={sourceFilter === s.value ? "default" : "outline"}
                className="cursor-pointer hover:bg-secondary transition-colors px-3 py-1"
                onClick={() => updateSource(s.value)}
              >
                {s.label}
              </Badge>
            ))}
            {filtersActive && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1 ml-1"
                onClick={clearFilters}
              >
                <X className="h-3 w-3" /> Clear filters
              </Button>
            )}
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search bids…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="border rounded-md bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[320px]">Bid Title</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="w-[90px]">Source</TableHead>
              <TableHead>Portal</TableHead>
              <TableHead className="w-[110px]">Status</TableHead>
              <TableHead className="w-[180px]">Assigned To</TableHead>
              <TableHead className="text-right w-[120px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow
                key={r.id}
                className="even:bg-neutral-50/60 hover:bg-neutral-100/70 transition-colors"
              >
                <TableCell className="font-medium py-3 truncate max-w-[320px]" title={r.title}>
                  {r.title}
                </TableCell>
                <TableCell className="py-3">{r.customer}</TableCell>
                <TableCell className="py-3">
                  <span className="text-xs bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded">{r.source}</span>
                </TableCell>
                <TableCell className="py-3 text-xs">
                  {r.portal === "N/A" ? (
                    <span className="text-muted-foreground italic">N/A</span>
                  ) : (
                    <span className="text-muted-foreground">{r.portal}</span>
                  )}
                </TableCell>
                <TableCell className="py-3">
                  <StatusSelect value={r.status} onChange={(v) => setStatus(r.id, v)} />
                </TableCell>
                <TableCell className="py-3">
                  <AssigneeSelect
                    value={r.assignee}
                    users={users}
                    onChange={(v) => setAssignee(r.id, v)}
                    onAddUser={addUser}
                  />
                </TableCell>
                <TableCell className="py-3 text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-3 text-xs gap-1"
                    onClick={() => setLocation(`/workbench/${r.id}`)}
                  >
                    <ExternalLink className="h-3 w-3" /> Open
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No bids match the current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
