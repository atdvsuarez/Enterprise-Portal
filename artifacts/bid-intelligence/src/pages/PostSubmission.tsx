import { useState } from "react";
import { mockSubmissions } from "@/data/mock";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Clock, CheckCircle2, MessageSquare, AlertTriangle } from "lucide-react";

export default function PostSubmission() {
  const [selected, setSelected] = useState<(typeof mockSubmissions)[0] | null>(null);
  const [filter, setFilter] = useState("All");

  const statuses = ["All", "Submitted", "Customer Follow-up", "Clarification Requested", "Won", "Lost", "No Response", "Escalated"];
  const filtered = mockSubmissions.filter(s => filter === "All" || s.status === filter);

  return (
    <div className="p-4 md:p-8 max-w-[1500px] mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Post-Submission Tracker</h1>
        <p className="text-muted-foreground mt-1">Monitor outcomes and follow-ups for bids you've already submitted.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Submitted (open)", value: mockSubmissions.filter(s => s.status === "Submitted").length, color: "text-blue-600", icon: Clock },
          { label: "Won (last 90d)", value: mockSubmissions.filter(s => s.status === "Won").length, color: "text-green-600", icon: CheckCircle2 },
          { label: "Awaiting clarification", value: mockSubmissions.filter(s => s.status === "Clarification Requested" || s.status === "Customer Follow-up").length, color: "text-amber-600", icon: MessageSquare },
          { label: "Escalated / Lost", value: mockSubmissions.filter(s => s.status === "Escalated" || s.status === "Lost").length, color: "text-red-600", icon: AlertTriangle },
        ].map((k, i) => {
          const Icon = k.icon;
          return (
            <Card key={i} className="p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{k.label}</p>
                  <p className="text-2xl font-bold tabular-nums mt-1">{k.value}</p>
                </div>
                <Icon className={`w-5 h-5 ${k.color}`} />
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        {statuses.map(s => (
          <Badge key={s} variant={filter === s ? "default" : "outline"} className="cursor-pointer" onClick={() => setFilter(s)}>
            {s}
          </Badge>
        ))}
      </div>

      <Card className="shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Bid ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Outcome</TableHead>
              <TableHead>Tags</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(s => (
              <TableRow key={s.id} className="cursor-pointer hover:bg-muted/40" onClick={() => setSelected(s)}>
                <TableCell className="font-mono text-xs text-primary font-medium">{s.id}</TableCell>
                <TableCell>{s.customer}</TableCell>
                <TableCell className="text-xs text-muted-foreground tabular-nums">{s.submittedDate}</TableCell>
                <TableCell><StatusBadge status={s.status} /></TableCell>
                <TableCell className="text-sm">{s.owner}</TableCell>
                <TableCell className="text-sm">{s.outcome}</TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {s.tags.map((t, i) => <Badge key={i} variant="outline" className="text-[10px]">{t}</Badge>)}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="font-mono text-primary">{selected.id}</SheetTitle>
                <SheetDescription>{selected.customer}</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">Status</p>
                  <StatusBadge status={selected.status} />
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">Timeline</p>
                  <div className="space-y-3 text-sm border-l-2 border-muted pl-4 ml-1">
                    <div className="relative">
                      <span className="absolute -left-[21px] top-1.5 w-3 h-3 bg-green-500 rounded-full ring-4 ring-background" />
                      <p className="font-medium">Submitted</p>
                      <p className="text-xs text-muted-foreground">{selected.submittedDate}</p>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-[21px] top-1.5 w-3 h-3 bg-blue-500 rounded-full ring-4 ring-background" />
                      <p className="font-medium">Acknowledged by customer</p>
                      <p className="text-xs text-muted-foreground">+2 days</p>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-[21px] top-1.5 w-3 h-3 bg-amber-500 rounded-full ring-4 ring-background" />
                      <p className="font-medium">{selected.status}</p>
                      <p className="text-xs text-muted-foreground">Current</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">Outcome Notes</p>
                  <p className="text-sm leading-relaxed bg-muted/40 p-3 rounded">{selected.outcomeNotes}</p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">Owner</p>
                  <p className="text-sm">{selected.owner}</p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">Tags</p>
                  <div className="flex gap-1 flex-wrap">
                    {selected.tags.length === 0
                      ? <span className="text-xs text-muted-foreground italic">None</span>
                      : selected.tags.map((t, i) => <Badge key={i} variant="outline">{t}</Badge>)}
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button size="sm" variant="outline">Add follow-up</Button>
                  <Button size="sm" variant="outline">Log activity</Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
