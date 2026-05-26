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
import { AIScorePill } from "@/components/common/AIScorePill";
import { ConfidenceMeter } from "@/components/common/ConfidenceMeter";
import { KpiCard } from "@/components/common/KpiCard";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { toast } from "sonner";

export default function Dashboard() {
  const { role, user } = useRole();
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
      color: "blue",
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
      color: "green",
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
      color: "purple",
      newCount: 4,
      processed: 3,
      pending: 0,
      failed: 1,
      latest: "27 min ago",
      sourceFilter: "External URL" as const,
    },
  ];

  const colorMap: Record<string, { bg: string; text: string; ring: string; bar: string }> = {
    blue:   { bg: "bg-blue-50",   text: "text-blue-600",   ring: "ring-blue-100",   bar: "bg-blue-600"   },
    green:  { bg: "bg-green-50",  text: "text-green-600",  ring: "ring-green-100",  bar: "bg-green-600"  },
    purple: { bg: "bg-purple-50", text: "text-purple-600", ring: "ring-purple-100", bar: "bg-purple-600" },
  };

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
    amber:  { border: "border-amber-200",  bg: "bg-amber-50/60",  icon: "text-amber-600",  count: "text-amber-700" },
    green:  { border: "border-green-200",  bg: "bg-green-50/60",  icon: "text-green-600",  count: "text-green-700" },
    purple: { border: "border-purple-200", bg: "bg-purple-50/60", icon: "text-purple-600", count: "text-purple-700" },
    red:    { border: "border-red-200",    bg: "bg-red-50/60",    icon: "text-red-600",    count: "text-red-700"   },
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
            const c = colorMap[card.color];
            const total = card.processed + card.pending + card.failed || 1;
            const processedPct = (card.processed / total) * 100;
            const pendingPct = (card.pending / total) * 100;
            const showLatest = card.key === "email";

            return (
              <Card key={card.key} className="shadow-sm border-l-4" style={{ borderLeftColor: card.color === "blue" ? "#2563eb" : card.color === "green" ? "#16a34a" : "#9333ea" }}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${c.bg} ring-1 ${c.ring} flex items-center justify-center`}>
                        <Icon className={`h-5 w-5 ${c.text}`} />
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
                    <div className="rounded-md bg-green-50/60 border border-green-100 py-1.5">
                      <div className="text-sm font-bold tabular-nums text-green-700">{card.processed}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Processed</div>
                    </div>
                    <div className="rounded-md bg-amber-50/60 border border-amber-100 py-1.5">
                      <div className="text-sm font-bold tabular-nums text-amber-700">{card.pending}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Pending</div>
                    </div>
                    <div className="rounded-md bg-red-50/60 border border-red-100 py-1.5">
                      <div className="text-sm font-bold tabular-nums text-red-700">{card.failed}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Failed</div>
                    </div>
                  </div>

                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden flex">
                    <div className={c.bar} style={{ width: `${processedPct}%` }} />
                    <div className="bg-amber-400" style={{ width: `${pendingPct}%` }} />
                  </div>

                  {showLatest && (
                    <div className="rounded-md border bg-slate-50/60 p-3">
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
                    <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs"
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
        <Card className="shadow-sm border-amber-200 bg-amber-50/30 lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-amber-800 text-base">
              <AlertTriangle className="h-4 w-4" /> Needs Attention
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
                      <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50 text-[10px] shrink-0 ml-2">{b.status}</Badge>
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
            <div className="flex justify-between"><span className="text-muted-foreground">Unmatched parts</span><span className="font-semibold tabular-nums text-amber-700">12</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Open exceptions</span><span className="font-semibold tabular-nums text-red-700">3</span></div>
          </CardContent>
        </Card>
      </div>
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

  const tierColor: Record<string, { border: string; bar: string; chip: string; signal: string }> = {
    green: { border: "border-green-200", bar: "bg-green-500",  chip: "bg-green-50 text-green-700 border-green-200",  signal: "bg-green-500" },
    amber: { border: "border-amber-200", bar: "bg-amber-500",  chip: "bg-amber-50 text-amber-700 border-amber-200",  signal: "bg-amber-500" },
    slate: { border: "border-slate-200", bar: "bg-slate-400",  chip: "bg-slate-100 text-slate-700 border-slate-200", signal: "bg-slate-400" },
  };

  const aiFilter = [
    { label: "High Confidence", count: 184, pct: 31, color: "bg-green-500", text: "text-green-700", note: "Auto-promoted to Admin queue" },
    { label: "Medium Confidence", count: 312, pct: 53, color: "bg-amber-500", text: "text-amber-700", note: "Held for Scout triage" },
    { label: "Low Confidence", count: 88,  pct: 16, color: "bg-slate-300", text: "text-slate-600", note: "Filtered out of pipeline" },
  ];

  const portalHealth = [
    { name: "Structured",    value: 312, fill: "#16a34a", icon: ShieldCheck },
    { name: "Login Required",value: 246, fill: "#2563eb", icon: Lock },
    { name: "High Noise",    value: 412, fill: "#f59e0b", icon: Radio },
    { name: "Restricted",    value: 56,  fill: "#ef4444", icon: ShieldAlert },
  ];
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
              <Card key={t.tier} className={`shadow-sm border-l-4 ${tc.border}`} style={{ borderLeftColor: t.color === "green" ? "#16a34a" : t.color === "amber" ? "#f59e0b" : "#94a3b8" }}>
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
                      <div className="text-xl font-bold tabular-nums text-slate-600">{t.detected.toLocaleString()}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">Detected</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold tabular-nums text-green-700">{t.relevant.toLocaleString()}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">Relevant</div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-muted-foreground">Signal strength</span>
                      <span className="font-semibold tabular-nums">{conversion}% match</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className={`h-full ${tc.signal}`} style={{ width: `${t.signal}%` }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ===== AI Filtering Summary ===== */}
        <Card className="shadow-sm lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Filter className="h-4 w-4 text-purple-600" /> AI Filtering Summary
                </CardTitle>
                <CardDescription>How AI reduces 11.8K scanned items into 584 actionable opportunities</CardDescription>
              </div>
              <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700 text-[10px]">
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
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full ${f.color}`} style={{ width: `${f.pct}%` }} />
                </div>
              </div>
            ))}
            <div className="pt-2 mt-2 border-t flex items-center gap-3">
              <div className="flex-1 flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Signal vs Noise</div>
                  <div className="h-3 rounded-full bg-slate-100 overflow-hidden flex">
                    <div className="bg-green-500" style={{ width: "31%" }} />
                    <div className="bg-amber-500" style={{ width: "53%" }} />
                    <div className="bg-slate-300" style={{ width: "16%" }} />
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Noise filtered</div>
                <div className="text-lg font-bold tabular-nums text-slate-700">11,216</div>
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
                <Zap className="h-4 w-4 text-amber-500" /> Top Shortlisted Opportunities
              </CardTitle>
              <CardDescription>Highest-ranked bids across all monitored portals, ready for Admin assignment</CardDescription>
            </div>
            <Link href="/monitor"><Button variant="outline" size="sm" className="gap-1.5">View all <ArrowRight className="h-3.5 w-3.5" /></Button></Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-muted-foreground">
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
                    <tr key={b.id} className="border-t hover:bg-slate-50/60">
                      <td className="px-4 py-3">
                        <div className="font-mono text-[11px] text-primary">{b.id}</div>
                        <div className="text-xs font-medium leading-tight line-clamp-1 mt-0.5">{b.title}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{b.portalName}</td>
                      <td className="px-4 py-3"><AIScorePill score={b.aiRelevanceScore} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 w-32">
                          <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div className={`h-full ${matchPct >= 80 ? "bg-green-500" : matchPct >= 50 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${matchPct}%` }} />
                          </div>
                          <span className="text-[11px] font-semibold tabular-nums w-8 text-right">{matchPct}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs">{close.toLocaleDateString()}</div>
                        <div className={`text-[10px] ${days <= 3 ? "text-red-600 font-semibold" : "text-muted-foreground"}`}>in {days} days</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/evaluation/${b.id}`}>
                            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5"><Eye className="h-3 w-3" /> View</Button>
                          </Link>
                          <Button size="sm" className="h-7 text-xs gap-1.5"
                            onClick={() => toast.success(`${b.id} assigned to Admin`, { description: "Neeraj Sharma will be notified." })}>
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
                      <Badge className={`mb-2 ${b.goNoGoRecommendation === "Go" ? "bg-green-600" : b.goNoGoRecommendation === "Review" ? "bg-amber-500" : "bg-red-500"}`}>{b.goNoGoRecommendation}</Badge>
                      <p className="text-xs text-muted-foreground">Risk: <span className="font-medium text-amber-700">{b.riskFlags.length > 0 ? "Medium" : "Low"}</span></p>
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
              <Card key={i} className={`shadow-sm ${c.tone === "warn" ? "border-amber-200 bg-amber-50/30" : c.tone === "good" ? "border-green-200 bg-green-50/30" : ""}`}>
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
