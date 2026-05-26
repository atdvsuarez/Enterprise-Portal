import { useEffect, useMemo, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { mockBids } from "@/data/mock";
import { StatusBadge } from "@/components/common/StatusBadge";
import { AIScorePill } from "@/components/common/AIScorePill";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const SOURCES = ["All", "Email", "Excel", "External URL", "Portal"] as const;
const FILTERS = ["All", "New", "Needs Review", "Ready for Response", "Pending Approval", "Submitted", "Blocked / Exception"] as const;

export default function BidMonitor() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const params = useMemo(() => new URLSearchParams(searchString), [searchString]);

  const initialStatus = params.get("status") ?? "All";
  const initialSource = params.get("source") ?? "All";

  const [filter, setFilter] = useState<string>(initialStatus);
  const [sourceFilter, setSourceFilter] = useState<string>(initialSource);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setFilter(params.get("status") ?? "All");
    setSourceFilter(params.get("source") ?? "All");
  }, [params]);

  const filteredBids = mockBids.filter(bid => {
    if (filter !== "All") {
      if (filter === "Blocked / Exception") {
        if (bid.status !== "Exception" && bid.status !== "Restricted") return false;
      } else if (bid.status !== filter) return false;
    }
    if (sourceFilter !== "All" && bid.sourceType !== sourceFilter) return false;
    if (search && !bid.title.toLowerCase().includes(search.toLowerCase()) && !bid.customer.toLowerCase().includes(search.toLowerCase()) && !bid.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const activeFilters = (filter !== "All" || sourceFilter !== "All");
  const clearFilters = () => {
    setFilter("All");
    setSourceFilter("All");
    setLocation("/monitor");
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Bid Monitor</h1>
        <p className="text-muted-foreground mt-1">Track and manage all bids across the pipeline.</p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mr-1">Status</span>
          {FILTERS.map(f => (
            <Badge
              key={f}
              variant={filter === f ? "default" : "outline"}
              className="cursor-pointer hover:bg-secondary transition-colors"
              onClick={() => setFilter(f)}
            >
              {f}
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mr-1">Source</span>
          {SOURCES.map(s => (
            <Badge
              key={s}
              variant={sourceFilter === s ? "default" : "outline"}
              className="cursor-pointer hover:bg-secondary transition-colors"
              onClick={() => setSourceFilter(s)}
            >
              {s}
            </Badge>
          ))}
          {activeFilters && (
            <Button variant="ghost" size="sm" className="h-6 text-xs gap-1 ml-2" onClick={clearFilters}>
              <X className="h-3 w-3" /> Clear filters
            </Button>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <div className="relative w-full sm:w-72 shrink-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search bids..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-md bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[120px]">Bid ID</TableHead>
              <TableHead className="w-[250px]">Title</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Portal</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead className="text-center">AI Score</TableHead>
              <TableHead className="text-center">Parts (M/U)</TableHead>
              <TableHead>Assigned</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBids.map((bid) => (
              <TableRow 
                key={bid.id} 
                className="h-10 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setLocation(`/evaluation/${bid.id}`)}
              >
                <TableCell className="font-mono text-xs font-medium text-primary">{bid.id}</TableCell>
                <TableCell className="truncate max-w-[250px]" title={bid.title}>{bid.title}</TableCell>
                <TableCell>{bid.customer}</TableCell>
                <TableCell><span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{bid.sourceType}</span></TableCell>
                <TableCell className="text-xs text-muted-foreground">{bid.portalName || "—"}</TableCell>
                <TableCell className="text-xs">{bid.pipelineStage}</TableCell>
                <TableCell className="text-center"><AIScorePill score={bid.aiRelevanceScore} /></TableCell>
                <TableCell className="text-center tabular-nums text-xs">
                  <span className="text-green-600 font-medium">{bid.matchedParts}</span>
                  <span className="text-muted-foreground mx-1">/</span>
                  <span className={bid.unmatchedParts > 0 ? "text-amber-600 font-medium" : "text-muted-foreground"}>{bid.unmatchedParts}</span>
                </TableCell>
                <TableCell className="text-xs">{bid.assignedAdmin}</TableCell>
                <TableCell><StatusBadge status={bid.status} /></TableCell>
              </TableRow>
            ))}
            {filteredBids.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                  No bids found matching the current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
