import { useState } from "react";
import { mockPortals, mockBids } from "@/data/mock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PortalTypeBadge } from "@/components/common/PortalTypeBadge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { AIScorePill } from "@/components/common/AIScorePill";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Globe, Clock, AlertCircle, CheckCircle2, RefreshCw, FileText, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function PortalManager() {
  const [selectedId, setSelectedId] = useState<string | null>(mockPortals[0].id);
  const selected = mockPortals.find(p => p.id === selectedId);
  const portalBids = selected ? mockBids.filter(b => b.portalName === selected.name) : [];

  const statusDot = (s: string) => {
    if (s === "Healthy") return <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />;
    if (s === "Degraded") return <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />;
    return <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />;
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Portal Manager</h1>
        <p className="text-muted-foreground mt-1">Monitor connection health and triage incoming opportunities across your 5 sourced portals.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {mockPortals.map(p => (
          <Card
            key={p.id}
            onClick={() => setSelectedId(p.id)}
            className={`cursor-pointer transition-all shadow-sm hover-elevate ${selectedId === p.id ? "ring-2 ring-primary" : ""}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="w-9 h-9 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                  {p.name.charAt(0)}
                </div>
                {statusDot(p.status)}
              </div>
              <CardTitle className="text-base mt-3 leading-tight">{p.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <PortalTypeBadge type={p.type} />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Bids</span>
                <span className="font-semibold tabular-nums">{p.bidCount}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Last sync</span>
                <span className="text-foreground">{p.lastSync}</span>
              </div>
              <Button
                size="sm"
                className="w-full"
                variant={p.status === "Blocked" ? "outline" : "default"}
                onClick={(e) => { e.stopPropagation(); toast.success(`${p.primaryCta}: ${p.name}`, { description: "Operation queued." }); }}
              >
                {p.primaryCta}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {selected && (
        <Card className="shadow-sm">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-muted-foreground" />
                <CardTitle className="text-lg">{selected.name}</CardTitle>
                <PortalTypeBadge type={selected.type} />
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  {statusDot(selected.status)} {selected.status}
                </span>
              </div>
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Synced {selected.lastSync}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="bids" className="w-full">
              <TabsList className="m-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="bids">Bids Table</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="log">Sync Log</TabsTrigger>
                <TabsTrigger value="ai">AI Filter Summary</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="px-6 pb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-md bg-muted/40">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Active Bids</p>
                    <p className="text-2xl font-bold mt-1 tabular-nums">{selected.bidCount}</p>
                  </div>
                  <div className="p-4 rounded-md bg-muted/40">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Customers</p>
                    <p className="text-sm mt-1 leading-tight">{selected.customers.join(", ")}</p>
                  </div>
                  <div className="p-4 rounded-md bg-muted/40">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Type</p>
                    <p className="text-sm mt-1 font-medium">{selected.type}</p>
                  </div>
                  <div className="p-4 rounded-md bg-muted/40">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Status</p>
                    <p className="text-sm mt-1 font-medium">{selected.status}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="bids" className="px-0 pb-4">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>RFQ ID</TableHead>
                      <TableHead>External ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Closes</TableHead>
                      <TableHead className="text-center">Relevance</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {portalBids.slice(0, 8).map(b => (
                      <TableRow key={b.id} className="h-11">
                        <TableCell className="font-mono text-xs font-medium text-primary">{b.rfqId}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{b.externalId}</TableCell>
                        <TableCell className="max-w-[260px] truncate text-sm" title={b.title}>{b.title}</TableCell>
                        <TableCell className="text-sm">{b.customer}</TableCell>
                        <TableCell><StatusBadge status={b.status} /></TableCell>
                        <TableCell className="text-xs text-muted-foreground tabular-nums">{new Date(b.createdDate).toLocaleDateString()}</TableCell>
                        <TableCell className="text-xs text-muted-foreground tabular-nums">{new Date(b.closeDate).toLocaleDateString()}</TableCell>
                        <TableCell className="text-center"><AIScorePill score={b.aiRelevanceScore} /></TableCell>
                        <TableCell className="text-right">
                          <Link href={`/evaluation/${b.id}`}>
                            <Button size="sm" variant="ghost" className="h-7 text-xs">Review</Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                    {portalBids.length === 0 && (
                      <TableRow><TableCell colSpan={9} className="h-20 text-center text-muted-foreground text-sm">No bids currently sourced from this portal.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="documents" className="px-6 pb-6 space-y-2">
                {["Portal_Catalog_2026.pdf", "Vendor_Onboarding.docx", "API_Integration_Guide.pdf"].map((d, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-md bg-card">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium">{d}</span>
                    </div>
                    <Button size="sm" variant="ghost">Download</Button>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="log" className="px-6 pb-6">
                <div className="bg-slate-950 text-slate-300 rounded-md p-4 font-mono text-xs space-y-2 max-h-80 overflow-auto">
                  <div className="flex gap-4"><span className="text-slate-500">10:42</span><span className="text-green-400">OK</span><span>Sync complete · 142 bids indexed</span></div>
                  <div className="flex gap-4"><span className="text-slate-500">09:38</span><span className="text-green-400">OK</span><span>Authentication renewed</span></div>
                  <div className="flex gap-4"><span className="text-slate-500">08:15</span><span className="text-amber-400">WARN</span><span>Rate limit threshold at 78%</span></div>
                  <div className="flex gap-4"><span className="text-slate-500">07:00</span><span className="text-green-400">OK</span><span>Sync complete · 3 new bids found</span></div>
                  <div className="flex gap-4"><span className="text-slate-500">06:00</span><span className="text-green-400">OK</span><span>Daily filter refresh applied</span></div>
                </div>
              </TabsContent>

              <TabsContent value="ai" className="px-6 pb-6">
                <Card className="border-purple-200 bg-purple-50/40">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2 text-purple-800">
                      <Sparkles className="w-4 h-4" /> AI Filter Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Total scraped (24h)</span><span className="font-semibold tabular-nums">684</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Relevant after filter</span><span className="font-semibold tabular-nums text-green-700">{selected.bidCount}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Noise rejected</span><span className="font-semibold tabular-nums text-muted-foreground">{684 - selected.bidCount}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Avg relevance</span><span className="font-semibold tabular-nums">76</span></div>
                    <div className="pt-2 border-t border-purple-200/50 text-xs text-purple-900">
                      {selected.status === "Healthy" ? <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Signal quality strong. No filter adjustment recommended.</span>
                        : <span className="flex items-center gap-1.5 text-amber-700"><AlertCircle className="w-3.5 h-3.5" /> Connection health degraded. Review credentials.</span>}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
