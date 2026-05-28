import { useRole } from "@/lib/role";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight, Activity, Clock, AlertTriangle, FileText, CheckCircle, Database,
  Globe, Inbox, ShieldAlert, ThumbsUp, TrendingUp, Sparkles, Building2, Eye,
  Mail, FileSpreadsheet, Link2, RefreshCw, Zap, DollarSign, ArrowUpRight,
  Layers, Filter, ShieldCheck, AlertOctagon, Lock, Radio,
} from "lucide-react";
import { Link } from "wouter";
import { mockPortals, mockBids } from "@/data/mock";
import { useBidStatuses } from "@/lib/bidStatus";
import { AIScorePill } from "@/components/common/AIScorePill";
import { ConfidenceMeter } from "@/components/common/ConfidenceMeter";
import { KpiCard } from "@/components/common/KpiCard";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { toast } from "sonner";

export default function Dashboard() {
  const { role, user } = useRole();
  if (role === "daily") return <DailyDashboard />;
  if (role === "admin") return <AdminDashboard />;
  if (role === "scout") return <ScoutDashboard />;
  return <AEDashboard userName={user.name} />;
}

/* ===================== ADMIN — Daily Bids Operations ===================== */
function AdminDashboard() {
  const latestBid = mockBids[0];

  const intake = [
    {
      key: "email",
      title: "Email Intake",
      icon: Mail,
      accent: "#55A1D3", // Tide
      newCount: 9,
      processed: 7,
      pending: 2,
      failed: 0,
      latest: "3 min ago",
      sourceFilter: "Email" as const,
    },
    {
      key: "excel",
      title: "Excel Intake",
      icon: FileSpreadsheet,
      accent: "#30A566", // Pasture
      newCount: 11,
      processed: 9,
      pending: 1,
      failed: 1,
      latest: "12 min ago",
      sourceFilter: "Excel" as const,
    },
    {
      key: "url",
      title: "External URL Intake",
      icon: Link2,
      accent: "#787877", // Gray — neutral channel
      newCount: 4,
      processed: 3,
      pending: 0,
      failed: 1,
      latest: "27 min ago",
      sourceFilter: "External URL" as const,
    },
  ];

  const actionQueue = [
    {
      label: "Needs Review", count: mockBids.filter(b => b.status === "Needs Review").length,
      icon: AlertTriangle, color: "amber", href: "/monitor?status=Needs Review",
      hint: "AI flagged for human verification",
    },
    {
      label: "Ready for Response", count: mockBids.filter(b => b.status === "Ready for Response").length,
      icon: CheckCircle, color: "green", href: "/monitor?status=Ready for Response",
      hint: "Approved for drafting workbench",
    },
    {
      label: "Pending Approval (AE)", count: mockBids.filter(b => b.status === "Pending Approval").length,
      icon: Clock, color: "purple", href: "/monitor?status=Pending Approval",
      hint: "Awaiting executive sign-off",
    },
    {
      label: "Blocked / Exception", count: mockBids.filter(b => b.status === "Exception" || b.status === "Restricted").length,
      icon: AlertOctagon, color: "red", href: "/monitor?status=Blocked%20%2F%20Exception",
      hint: "Requires manual intervention",
    },
  ];

  const queueColor: Record<string, { border: string; bg: string; icon: string; count: string }> = {
    amber:  { border: "border-neutral-200", bg: "bg-white", icon: "text-neutral-700",          count: "text-neutral-900" },
    green:  { border: "border-neutral-200", bg: "bg-white", icon: "text-[#30A566]",            count: "text-[#1f7a4a]"   },
    purple: { border: "border-neutral-200", bg: "bg-white", icon: "text-neutral-700",          count: "text-neutral-900" },
    red:    { border: "border-[#DA291C]/30", bg: "bg-white", icon: "text-[#DA291C]",           count: "text-[#DA291C]"   },
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Operational Dashboard</h1>
          <p className="text-muted-foreground mt-1">What came in today, what needs attention, and what to do next.</p>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <p>Last refresh</p>
          <p className="font-medium text-foreground">2 minutes ago</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard title="New Bids Today" value={24} icon={Activity} color="blue" trend="+12% vs yesterday" trendUp />
        <KpiCard title="Ready for Review" value={8} icon={CheckCircle} color="green" trend="3 awaiting action" />
        <KpiCard title="Drafts in Progress" value={12} icon={FileText} color="amber" />
        <KpiCard title="Approvals Pending" value={5} icon={Clock} color="purple" trend="2 expiring this week" />
      </div>

      {/* ===== Daily Bids Intake Overview ===== */}
      <section className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Daily Bids Intake Overview</h2>
            <p className="text-sm text-muted-foreground">Ingestion patterns across all channels in the last 24h.</p>
          </div>
          <Link href="/intake">
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
              Open full intake <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {intake.map(card => {
            const Icon = card.icon;
            const total = card.processed + card.pending + card.failed || 1;
            const processedPct = (card.processed / total) * 100;
            const pendingPct = (card.pending / total) * 100;
            const showLatest = card.key === "email";

            return (
              <Card key={card.key} className="shadow-sm border-l-2" style={{ borderLeftColor: card.accent }}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${card.accent}1A` }}>
                        <Icon className="h-5 w-5" style={{ color: card.accent }} />
                      </div>
                      <div>
                        <CardTitle className="text-base">{card.title}</CardTitle>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Latest activity {card.latest}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold tabular-nums leading-none">{card.newCount}</div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">new bids</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-md border border-neutral-200 bg-neutral-50 py-1.5">
                      <div className="text-sm font-bold tabular-nums text-[#1f7a4a]">{card.processed}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Submitted</div>
                    </div>
                    <div className="rounded-md border border-neutral-200 bg-neutral-50 py-1.5">
                      <div className="text-sm font-bold tabular-nums text-neutral-700">{card.pending}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Pending</div>
                    </div>
                    <div className="rounded-md border border-neutral-200 bg-neutral-50 py-1.5">
                      <div className={`text-sm font-bold tabular-nums ${card.failed > 0 ? "text-[#DA291C]" : "text-neutral-400"}`}>{card.failed}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Failed</div>
                    </div>
                  </div>

                  <div className="h-1.5 rounded-full bg-neutral-100 overflow-hidden flex">
                    <div style={{ width: `${processedPct}%`, background: "#30A566" }} />
                    <div style={{ width: `${pendingPct}%`, background: "#C9C7C7" }} />
                  </div>

                  {showLatest && (
                    <div className="rounded-md border bg-neutral-50 p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Latest bid</span>
                        <span className="font-mono text-[10px] text-primary">{latestBid.id}</span>
                      </div>
                      <p className="text-xs font-medium leading-snug line-clamp-2">{latestBid.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5">
                        <Building2 className="h-3 w-3" /> {latestBid.customer}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link href={`/monitor?source=${card.sourceFilter}`}>
                      <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                        <Eye className="h-3.5 w-3.5" /> View Details
                      </Button>
                    </Link>
                    <Button size="sm" className="w-full gap-1.5 text-xs"
                      onClick={() => toast.success(`AI summary generated for latest ${card.title.toLowerCase()} bid`, { description: "Summary ready in Bid Monitor." })}>
                      <Sparkles className="h-3.5 w-3.5" /> Fetch Summary
                    </Button>
                    <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs"
                      onClick={() => toast.success(`Pricing lookup queued`, { description: `Inventory and cost matched for ${card.newCount} new ${card.title.toLowerCase()} bids.` })}>
                      <DollarSign className="h-3.5 w-3.5" /> Fetch Pricing
                    </Button>
                    <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs"
                      onClick={() => toast.success(`${card.title} re-validated`, { description: `${card.pending + card.failed} item(s) rechecked.` })}>
                      <RefreshCw className="h-3.5 w-3.5" /> Re-run
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ===== Action Queue ===== */}
      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Action Queue</h2>
          <p className="text-sm text-muted-foreground">Today's workload by stage. Click any tile to jump into the queue.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {actionQueue.map(q => {
            const Icon = q.icon;
            const qc = queueColor[q.color];
            return (
              <Link key={q.label} href={q.href}>
                <div className={`p-4 rounded-lg border ${qc.border} ${qc.bg} cursor-pointer hover-elevate transition-all h-full`}>
                  <div className="flex items-start justify-between mb-3">
                    <Icon className={`h-5 w-5 ${qc.icon}`} />
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className={`text-3xl font-bold tabular-nums ${qc.count}`}>{q.count}</div>
                  <p className="text-sm font-semibold mt-1">{q.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">{q.hint}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ===== Side glance row ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-sm border-l-2 border-l-[#DA291C] lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-foreground">
              <AlertTriangle className="h-4 w-4 text-[#DA291C]" /> Needs Attention
            </CardTitle>
            <CardDescription>Bids flagged by AI or pricing exceptions in the last 24h</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              {mockBids.filter(b => b.status === "Exception" || b.status === "Needs Review").slice(0, 6).map(b => (
                <li key={b.id}>
                  <Link href={`/evaluation/${b.id}`}>
                    <div className="flex justify-between items-center bg-background p-2.5 rounded border hover-elevate cursor-pointer">
                      <div className="min-w-0 flex-1">
                        <span className="font-mono text-xs font-medium text-primary">{b.id}</span>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{b.customer}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] shrink-0 ml-2 border-[#DA291C]/30 text-[#DA291C] bg-white">{b.status}</Badge>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Today at a Glance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Avg AI confidence</span><span className="font-semibold tabular-nums">87%</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Avg response time</span><span className="font-semibold tabular-nums">4.2h</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Unmatched parts</span><span className="font-semibold tabular-nums">12</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Open exceptions</span><span className="font-semibold tabular-nums text-[#DA291C]">3</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ===================== DAILY BIDS TEAM — Operational Summary ===================== */
function DailyDashboard() {
  const statuses = useBidStatuses();
  const isSubmitted = (id: string) => (statuses[id] ?? "Pending") === "Submitted";

  const bySource = (src: "Email" | "Excel" | "External URL") =>
    mockBids.filter((b) => b.sourceType === src);

  const bucket = (bids: typeof mockBids) => {
    const submitted = bids.filter((b) => isSubmitted(b.id)).length;
    const pending = bids.length - submitted;
    return { newCount: bids.length, pending, submitted };
  };

  const allBids = mockBids;
  const totalNew = allBids.length;
  const totalSubmitted = allBids.filter((b) => isSubmitted(b.id)).length;
  const totalPending = totalNew - totalSubmitted;

  const intake = [
    {
      key: "email",
      title: "Email Intake",
      icon: Mail,
      accent: "#55A1D3",
      source: "Email" as const,
      ...bucket(bySource("Email")),
    },
    {
      key: "excel",
      title: "Excel Intake",
      icon: FileSpreadsheet,
      accent: "#30A566",
      source: "Excel" as const,
      ...bucket(bySource("Excel")),
    },
    {
      key: "url",
      title: "External URL Intake",
      icon: Link2,
      accent: "#787877",
      source: "External URL" as const,
      ...bucket(bySource("External URL")),
    },
  ];

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1500px] mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Today at a Glance</h1>
          <p className="text-muted-foreground mt-1">A quick look at today's bid activity.</p>
        </div>
        <Button
          className="gap-2"
          onClick={() =>
            toast.success("Sync started", {
              description: "Checking Email, Excel, and External URL sources for new bids.",
            })
          }
        >
          <RefreshCw className="h-4 w-4" /> Sync New Bids
        </Button>
      </div>

      {/* Single primary KPI + supporting counts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-sm border-l-4" style={{ borderLeftColor: "#DA291C" }}>
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">New Bids Today</p>
                <p className="text-4xl font-bold tabular-nums mt-1">{totalNew}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Activity className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Pending</p>
                <p className="text-4xl font-bold tabular-nums mt-1 text-neutral-700">{totalPending}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-neutral-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-neutral-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Submitted</p>
                <p className="text-4xl font-bold tabular-nums mt-1 text-[#1f7a4a]">{totalSubmitted}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-[#E8F5EE] flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-[#30A566]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Bids Intake Overview */}
      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Daily Bids Intake Overview</h2>
          <p className="text-sm text-muted-foreground">Bids ingested by channel in the last 24h.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {intake.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.key} className="shadow-sm border-l-2" style={{ borderLeftColor: card.accent }}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: `${card.accent}1A` }}
                    >
                      <Icon className="h-5 w-5" style={{ color: card.accent }} />
                    </div>
                    <CardTitle className="text-base">{card.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-md border border-neutral-200 bg-neutral-50 py-2">
                      <div className="text-lg font-bold tabular-nums text-foreground">{card.newCount}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">New</div>
                    </div>
                    <div className="rounded-md border border-neutral-200 bg-neutral-50 py-2">
                      <div className="text-lg font-bold tabular-nums text-neutral-700">{card.pending}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Pending</div>
                    </div>
                    <div className="rounded-md border border-neutral-200 bg-neutral-50 py-2">
                      <div className="text-lg font-bold tabular-nums text-[#1f7a4a]">{card.submitted}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Submitted</div>
                    </div>
                  </div>

                  <Link href={`/monitor?source=${card.source}`}>
                    <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                      <Eye className="h-3.5 w-3.5" /> View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}

/* ===================== SCOUT — CBT Portal Intelligence ===================== */
function ScoutDashboard() {
  const tiers = [
    {
      tier: "Tier 1", label: "High Signal · High Value", color: "green",
      portals: 38, detected: 412, relevant: 184, signal: 92,
      hint: "Structured RFQ feeds with strong historical match rate.",
    },
    {
      tier: "Tier 2", label: "Moderate Signal", color: "amber",
      portals: 246, detected: 1820, relevant: 312, signal: 58,
      hint: "Mixed-format portals; AI filtering recovers usable bids.",
    },
    {
      tier: "Tier 3", label: "Low Signal · High Noise", color: "slate",
      portals: 742, detected: 9640, relevant: 88, signal: 21,
      hint: "Aggregators and broad public boards. Heavy noise.",
    },
  ];

  const tierColor: Record<string, { hex: string; bar: string; chip: string }> = {
    green: { hex: "#30A566", bar: "bg-[#30A566]", chip: "bg-[#30A566]/10 text-[#1f7a4a] border-[#30A566]/30" },
    amber: { hex: "#787877", bar: "bg-[#787877]", chip: "bg-neutral-100 text-neutral-700 border-neutral-300" },
    slate: { hex: "#C9C7C7", bar: "bg-[#C9C7C7]", chip: "bg-neutral-50 text-neutral-500 border-neutral-200" },
  };

  const aiFilter = [
    { label: "High Confidence",   count: 184, pct: 31, color: "bg-[#30A566]",  text: "text-[#1f7a4a]",  note: "Auto-promoted to Admin queue" },
    { label: "Medium Confidence", count: 312, pct: 53, color: "bg-[#787877]",  text: "text-neutral-700", note: "Held for Scout triage" },
    { label: "Low Confidence",    count: 88,  pct: 16, color: "bg-[#C9C7C7]",  text: "text-neutral-500", note: "Filtered out of pipeline" },
  ];

  const portalHealth = [
    { name: "Structured",     value: 312, fill: "#30A566", icon: ShieldCheck },
    { name: "Login Required", value: 246, fill: "#55A1D3", icon: Lock },
    { name: "High Noise",     value: 412, fill: "#C9C7C7", icon: Radio },
    { name: "Restricted",     value: 56,  fill: "#DA291C", icon: ShieldAlert },
  ];

  // Funnel: 1,026 portals → 11,800 scanned → 584 relevant → 184 shortlisted
  const funnel = [
    { label: "Portals Monitored",      value: 1026,  hex: "#474747", sub: "Active crawlers" },
    { label: "Opportunities Scanned",  value: 11800, hex: "#787877", sub: "Raw items in last 24h" },
    { label: "Relevant After AI",      value: 584,   hex: "#30A566", sub: "Passed relevance filter" },
    { label: "Shortlisted",            value: 184,   hex: "#DA291C", sub: "Ready for Admin handoff" },
  ];
  const funnelMax = funnel[0].value;
  const totalPortals = portalHealth.reduce((s, p) => s + p.value, 0);

  const shortlist = [...mockBids].sort((a, b) => b.aiRelevanceScore - a.aiRelevanceScore).slice(0, 6);

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Central Bid Team · Portal Intelligence</h1>
          <p className="text-muted-foreground mt-1">Aggregated signal across 1,026 monitored portals. Noise filtered, opportunities ranked.</p>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <p>Crawler health</p>
          <p className="font-medium text-green-700">Nominal · 1,022 / 1,026 active</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard title="Portals Monitored" value="1,026" icon={Globe} color="blue" trend="+14 this week" trendUp />
        <KpiCard title="Opportunities Scanned" value="11.8K" icon={Inbox} color="purple" trend="Last 24h" />
        <KpiCard title="Relevant After AI" value={584} icon={Sparkles} color="green" trend="4.9% signal rate" />
        <KpiCard title="Restricted / Blocked" value={4} icon={ShieldAlert} color="red" />
      </div>

      {/* ===== Tiered Portal Overview ===== */}
      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
            <Layers className="h-4 w-4 text-muted-foreground" /> Tiered Portal Overview
          </h2>
          <p className="text-sm text-muted-foreground">Portals grouped by historical signal strength and customer value.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tiers.map(t => {
            const tc = tierColor[t.color];
            const conversion = ((t.relevant / t.detected) * 100).toFixed(1);
            return (
              <Card key={t.tier} className="shadow-sm border-l-2" style={{ borderLeftColor: tc.hex }}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={`${tc.chip} text-[10px] uppercase tracking-wider font-semibold`}>{t.tier}</Badge>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Signal</span>
                      <span className="text-xs font-bold tabular-nums">{t.signal}</span>
                    </div>
                  </div>
                  <CardTitle className="text-base mt-2">{t.label}</CardTitle>
                  <p className="text-xs text-muted-foreground">{t.hint}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <div className="text-xl font-bold tabular-nums">{t.portals}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">Portals</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold tabular-nums text-neutral-700">{t.detected.toLocaleString()}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">Detected</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold tabular-nums text-[#1f7a4a]">{t.relevant.toLocaleString()}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">Relevant</div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-muted-foreground">Signal strength</span>
                      <span className="font-semibold tabular-nums">{conversion}% match</span>
                    </div>
                    <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
                      <div className={`h-full ${tc.bar}`} style={{ width: `${t.signal}%` }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ===== Discovery Funnel ===== */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4 text-muted-foreground" /> Discovery Funnel
          </CardTitle>
          <CardDescription>From 1,000+ monitored portals down to the bids worth Admin attention.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {funnel.map((step, i) => {
              const widthPct = Math.max(8, (step.value / funnelMax) * 100);
              const dropPct = i > 0 ? Math.round((1 - step.value / funnel[i - 1].value) * 100) : null;
              return (
                <div key={step.label} className="grid grid-cols-[180px_1fr_auto] items-center gap-4">
                  <div>
                    <div className="text-xs font-semibold">{step.label}</div>
                    <div className="text-[11px] text-muted-foreground">{step.sub}</div>
                  </div>
                  <div className="relative h-9 bg-neutral-50 rounded-sm overflow-hidden">
                    <div
                      className="h-full flex items-center justify-end px-3 text-xs font-semibold text-white tabular-nums transition-all"
                      style={{ width: `${widthPct}%`, background: step.hex }}
                    >
                      {step.value.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right w-20">
                    {dropPct !== null ? (
                      <span className="text-[11px] text-muted-foreground">−{dropPct}% filtered</span>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">baseline</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ===== AI Filtering Summary ===== */}
        <Card className="shadow-sm lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Filter className="h-4 w-4 text-muted-foreground" /> AI Filtering Summary
                </CardTitle>
                <CardDescription>How AI reduces 11.8K scanned items into 584 actionable opportunities</CardDescription>
              </div>
              <Badge variant="outline" className="bg-neutral-50 border-neutral-200 text-neutral-700 text-[10px]">
                <Sparkles className="h-3 w-3 mr-1" /> Last 24h
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {aiFilter.map(f => (
              <div key={f.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{f.label}</span>
                    <span className="text-[11px] text-muted-foreground">· {f.note}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-lg font-bold tabular-nums ${f.text}`}>{f.count}</span>
                    <span className="text-[11px] text-muted-foreground tabular-nums">{f.pct}%</span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
                  <div className={`h-full ${f.color}`} style={{ width: `${f.pct}%` }} />
                </div>
              </div>
            ))}
            <div className="pt-2 mt-2 border-t flex items-center gap-3">
              <div className="flex-1 flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Signal vs Noise</div>
                  <div className="h-3 rounded-full bg-neutral-100 overflow-hidden flex">
                    <div className="bg-[#30A566]" style={{ width: "31%" }} />
                    <div className="bg-[#787877]" style={{ width: "53%" }} />
                    <div className="bg-[#C9C7C7]" style={{ width: "16%" }} />
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Noise filtered</div>
                <div className="text-lg font-bold tabular-nums text-neutral-700">11,216</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ===== Portal Health ===== */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Portal Health Distribution</CardTitle>
            <CardDescription>Coverage breakdown across {totalPortals.toLocaleString()} portals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={portalHealth} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={42} outerRadius={70} paddingAngle={2}>
                    {portalHealth.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {portalHealth.map(p => {
                const Icon = p.icon;
                return (
                  <div key={p.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{p.name}</span>
                    </div>
                    <span className="font-semibold tabular-nums">{p.value.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ===== Top Shortlisted Opportunities ===== */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Zap className="h-4 w-4 text-[#30A566]" /> Top Shortlisted Opportunities
              </CardTitle>
              <CardDescription>Highest-ranked bids across all monitored portals, ready for Admin assignment</CardDescription>
            </div>
            <Link href="/monitor"><Button variant="outline" size="sm" className="gap-1.5">View all <ArrowRight className="h-3.5 w-3.5" /></Button></Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-[11px] uppercase tracking-wider text-neutral-700">
                <tr>
                  <th className="text-left px-4 py-2 font-semibold">Bid</th>
                  <th className="text-left px-4 py-2 font-semibold">Portal Source</th>
                  <th className="text-left px-4 py-2 font-semibold">AI Score</th>
                  <th className="text-left px-4 py-2 font-semibold">Match Quality</th>
                  <th className="text-left px-4 py-2 font-semibold">Close Date</th>
                  <th className="text-right px-4 py-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shortlist.map(b => {
                  const matchPct = Math.round((b.matchedParts / Math.max(b.totalParts, 1)) * 100);
                  const close = new Date(b.closeDate);
                  const days = Math.max(0, Math.ceil((close.getTime() - Date.now()) / 86400000));
                  return (
                    <tr key={b.id} className="border-t even:bg-neutral-50/60 hover:bg-neutral-100/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-mono text-[11px] text-primary">{b.id}</div>
                        <div className="text-xs font-medium leading-tight line-clamp-1 mt-0.5">{b.title}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{b.portalName}</td>
                      <td className="px-4 py-3"><AIScorePill score={b.aiRelevanceScore} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 w-32">
                          <div className="flex-1 h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                            <div className={`h-full ${matchPct >= 80 ? "bg-[#30A566]" : matchPct >= 50 ? "bg-[#787877]" : "bg-[#DA291C]"}`} style={{ width: `${matchPct}%` }} />
                          </div>
                          <span className="text-[11px] font-semibold tabular-nums w-8 text-right">{matchPct}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs">{close.toLocaleDateString()}</div>
                        <div className={`text-[10px] ${days <= 3 ? "text-[#DA291C] font-semibold" : "text-muted-foreground"}`}>in {days} days</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/evaluation/${b.id}`}>
                            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5"><Eye className="h-3 w-3" /> View</Button>
                          </Link>
                          <Button size="sm" className="h-7 text-xs gap-1.5"
                            onClick={() => toast.success(`${b.id} assigned to Admin`, { description: "Adrian Suarez will be notified." })}>
                            <ArrowUpRight className="h-3 w-3" /> Assign
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ===================== AE — Simplified Executive ===================== */
function AEDashboard({ userName }: { userName: string }) {
  const riskData = [
    { name: "Low", value: 22, fill: "#16a34a" },
    { name: "Medium", value: 9, fill: "#f59e0b" },
    { name: "High", value: 3, fill: "#ef4444" },
  ];
  const queue = mockBids.filter(b => b.pipelineStage === "Respond" || b.status === "Pending Approval").slice(0, 4);

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {userName.split(" ")[0]}</h1>
          <p className="text-muted-foreground mt-1">Executive view of bids awaiting your decision and active in-market.</p>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <p>Portfolio health</p>
          <p className="font-medium text-green-700">Strong · Win rate 64%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard title="Ready for Approval" value={9} icon={CheckCircle} color="green" trend="3 expiring this week" />
        <KpiCard title="High-Value Bids" value={4} icon={TrendingUp} color="purple" trend="$1.8M total" />
        <KpiCard title="Expiring Soon" value={3} icon={Clock} color="amber" trend="≤ 3 days" />
        <KpiCard title="Awaiting Response" value={11} icon={Activity} color="blue" trend="Submitted last 30d" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Awaiting Your Approval</CardTitle>
                  <CardDescription>Top 4 bids ready for executive decision</CardDescription>
                </div>
                <Link href="/approvals"><Button variant="outline" size="sm" className="gap-1.5">View all <ArrowRight className="w-3.5 h-3.5" /></Button></Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {queue.map((b, i) => (
                <div key={b.id} className="border rounded-lg p-4 hover-elevate">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-primary font-medium">{b.id}</span>
                        <Badge variant="outline" className="text-[10px]">{["$50K–$100K", "$100K–$250K", "$250K–$500K", "$500K–$1M"][i % 4]}</Badge>
                      </div>
                      <p className="font-semibold leading-tight line-clamp-1">{b.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5"><Building2 className="w-3 h-3" /> {b.customer}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge className={`mb-2 ${b.goNoGoRecommendation === "Go" ? "bg-[#30A566] hover:bg-[#30A566]" : b.goNoGoRecommendation === "Review" ? "bg-[#787877] hover:bg-[#787877]" : "bg-[#DA291C] hover:bg-[#DA291C]"}`}>{b.goNoGoRecommendation}</Badge>
                      <p className="text-xs text-muted-foreground">Risk: <span className="font-medium text-neutral-700">{b.riskFlags.length > 0 ? "Medium" : "Low"}</span></p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-4">
                    <ConfidenceMeter value={b.confidenceLevel} className="flex-1" />
                    <Link href={`/executive-summary/${b.id}`}>
                      <Button size="sm" className="gap-1.5"><Eye className="w-3.5 h-3.5" /> Open Summary</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: "Portfolio Health", body: "Win rate trending up 8 pts vs last quarter. Pipeline coverage at 3.2x target.", tone: "good" as const },
              { title: "Top Opportunity", body: "BID-2026-001 — Jefferson County chassis. $450K. High strategic value, low risk.", tone: "neutral" as const },
              { title: "Attention Item", body: "3 bids expiring within 72h. Recommend prioritizing approval queue this morning.", tone: "warn" as const },
            ].map((c, i) => (
              <Card key={i} className={`shadow-sm border-l-2 ${c.tone === "warn" ? "border-l-[#DA291C]" : c.tone === "good" ? "border-l-[#30A566]" : "border-l-neutral-300"}`}>
                <CardContent className="p-4">
                  <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">{c.title}</p>
                  <p className="text-sm leading-relaxed">{c.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Risk Overview</CardTitle>
              <CardDescription>All active bids</CardDescription>
            </CardHeader>
            <CardContent className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={riskData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                    {riskData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
            <CardContent className="pt-0 flex justify-around text-xs">
              {riskData.map(r => (
                <div key={r.name} className="text-center">
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: r.fill }} /><span className="text-muted-foreground">{r.name}</span></div>
                  <p className="font-semibold tabular-nums mt-0.5">{r.value}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent Decisions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                { id: "BID-2026-010", action: "Approved", customer: "DART", color: "text-green-700" },
                { id: "BID-2026-012", action: "Approved", customer: "MBTA", color: "text-green-700" },
                { id: "BID-2026-003", action: "Escalated", customer: "SORTA", color: "text-amber-700" },
                { id: "BID-2026-019", action: "Approved", customer: "LA Metro", color: "text-green-700" },
              ].map(d => (
                <div key={d.id} className="flex items-center justify-between border-b last:border-0 pb-2 last:pb-0">
                  <div>
                    <p className="font-mono text-xs text-primary font-medium">{d.id}</p>
                    <p className="text-xs text-muted-foreground">{d.customer}</p>
                  </div>
                  <span className={`text-xs font-semibold ${d.color}`}>{d.action}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
