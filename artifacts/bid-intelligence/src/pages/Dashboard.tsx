import { useRole } from "@/lib/role";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight, Activity, Clock, AlertTriangle, FileText, CheckCircle, Database,
  Globe, Inbox, ShieldAlert, ThumbsUp, TrendingUp, Sparkles, Building2, Eye,
} from "lucide-react";
import { Link } from "wouter";
import { mockPortals, mockBids, mockActivityLog } from "@/data/mock";
import { PortalTypeBadge } from "@/components/common/PortalTypeBadge";
import { AIScorePill } from "@/components/common/AIScorePill";
import { ConfidenceMeter } from "@/components/common/ConfidenceMeter";
import { KpiCard } from "@/components/common/KpiCard";
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { toast } from "sonner";

export default function Dashboard() {
  const { role, user } = useRole();
  if (role === "admin") return <AdminDashboard />;
  if (role === "scout") return <ScoutDashboard />;
  return <AEDashboard userName={user.name} />;
}

/* ---------------- ADMIN ---------------- */
function AdminDashboard() {
  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Operational Dashboard</h1>
          <p className="text-muted-foreground mt-1">Daily Bids intake, queue health, and portal resources.</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Intake Patterns</CardTitle>
                  <CardDescription>Process incoming requests via supported channels</CardDescription>
                </div>
                <Link href="/intake">
                  <Button variant="outline" size="sm" className="gap-2">Go to Intake <ArrowRight className="h-4 w-4" /></Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { title: "Email Body", icon: FileText, desc: "Paste raw text from emails for fast AI extraction.", color: "blue" },
                  { title: "Excel Attachment", icon: Database, desc: "Upload customer spreadsheets for bulk mapping.", color: "green" },
                  { title: "External URL", icon: Globe, desc: "Scan public portals to auto-pull RFQ data.", color: "purple" },
                ].map(p => {
                  const Icon = p.icon;
                  return (
                    <Link key={p.title} href="/intake">
                      <div className="p-4 rounded-lg border bg-card hover:border-primary/50 transition-colors cursor-pointer group hover-elevate">
                        <div className={`w-10 h-10 rounded-full bg-${p.color}-100 dark:bg-${p.color}-900/30 flex items-center justify-center mb-3`}>
                          <Icon className={`h-5 w-5 text-${p.color}-600 dark:text-${p.color}-400`} />
                        </div>
                        <h4 className="font-semibold mb-1">{p.title}</h4>
                        <p className="text-xs text-muted-foreground">{p.desc}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Portal Resources */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Portal Resources</CardTitle>
                  <CardDescription>Connection health and per-portal actions</CardDescription>
                </div>
                <Link href="/portals"><Button variant="outline" size="sm" className="gap-2">Manage <ArrowRight className="h-4 w-4" /></Button></Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {mockPortals.map(p => (
                <div key={p.id} className="flex items-center gap-4 px-3 py-3 rounded-md border bg-card hover-elevate">
                  <div className="w-9 h-9 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">{p.name.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{p.name}</p>
                      <PortalTypeBadge type={p.type} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.bidCount} bids · Last sync {p.lastSync}</p>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${p.status === "Healthy" ? "bg-green-500" : p.status === "Degraded" ? "bg-amber-500" : "bg-red-500"}`} />
                  <Button
                    size="sm"
                    variant={p.status === "Blocked" ? "outline" : "default"}
                    className="shrink-0 min-w-[120px]"
                    onClick={() => toast.success(`${p.primaryCta}: ${p.name}`)}
                  >
                    {p.primaryCta}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle>Recent Intake Activity</CardTitle>
              <CardDescription>Live feed of processing logs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockActivityLog.slice(0, 8).map((a, i) => {
                  const colorMap: Record<string, string> = {
                    "Scan URL": "text-blue-600", "Excel Upload": "text-green-600",
                    "Email Extract": "text-amber-600", "Portal Sync": "text-purple-600",
                    "Exception": "text-red-600", "Approval": "text-green-600",
                    "New Upload": "text-blue-600", "System": "text-slate-500",
                  };
                  return (
                    <div key={i} className="flex gap-4 items-start text-sm border-b last:border-0 pb-3 last:pb-0">
                      <div className="w-20 text-muted-foreground shrink-0 tabular-nums text-xs">{a.timestamp}</div>
                      <div className="flex-1">
                        <span className={`font-medium ${colorMap[a.type] || "text-slate-600"}`}>{a.type}</span>
                        <span className="text-foreground/80"> · {a.message}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-sm border-amber-200 bg-amber-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-amber-700 text-base">
                <AlertTriangle className="h-4 w-4" /> Needs Attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {mockBids.filter(b => b.status === "Exception" || b.status === "Needs Review").slice(0, 5).map(b => (
                  <li key={b.id} className="flex justify-between items-center bg-background p-2.5 rounded border">
                    <Link href={`/evaluation/${b.id}`}>
                      <span className="font-mono text-xs font-medium text-primary cursor-pointer hover:underline">{b.id}</span>
                    </Link>
                    <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 text-[10px]">{b.status}</Badge>
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
    </div>
  );
}

/* ---------------- SCOUT ---------------- */
function ScoutDashboard() {
  const signalNoise = [
    { name: "Mon", signal: 18, noise: 142 },
    { name: "Tue", signal: 22, noise: 128 },
    { name: "Wed", signal: 19, noise: 152 },
    { name: "Thu", signal: 27, noise: 118 },
    { name: "Fri", signal: 31, noise: 134 },
    { name: "Sat", signal: 12, noise: 65 },
    { name: "Sun", signal: 8, noise: 48 },
  ];
  const shortlist = mockBids.filter(b => b.aiRelevanceScore >= 75).slice(0, 5);

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Scout Dashboard</h1>
        <p className="text-muted-foreground mt-1">Portal monitoring and high-relevance opportunity triage.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard title="New Opportunities" value={47} icon={Inbox} color="blue" trend="+8 this morning" trendUp />
        <KpiCard title="High-Relevance" value={18} icon={Sparkles} color="green" />
        <KpiCard title="Restricted Portals" value={2} icon={ShieldAlert} color="red" />
        <KpiCard title="Handed Off Today" value={6} icon={ThumbsUp} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Portal Resources</CardTitle>
                  <CardDescription>Refresh or scrape your watched portals</CardDescription>
                </div>
                <Link href="/portals"><Button variant="outline" size="sm">Manage portals</Button></Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {mockPortals.map(p => (
                <div key={p.id} className="flex items-center gap-4 px-3 py-3 rounded-md border bg-card hover-elevate">
                  <div className="w-9 h-9 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">{p.name.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{p.name}</p>
                      <PortalTypeBadge type={p.type} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.bidCount} bids · Synced {p.lastSync}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => toast.success(`Refreshed ${p.name}`)}>Refresh</Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle>AI Signal vs Noise · 7 days</CardTitle>
              <CardDescription>Bids passing relevance filter vs raw scraped volume</CardDescription>
            </CardHeader>
            <CardContent className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={signalNoise}>
                  <defs>
                    <linearGradient id="noise" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#cbd5e1" stopOpacity={0.6} /><stop offset="95%" stopColor="#cbd5e1" stopOpacity={0.1} /></linearGradient>
                    <linearGradient id="signal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#16a34a" stopOpacity={0.7} /><stop offset="95%" stopColor="#16a34a" stopOpacity={0.1} /></linearGradient>
                  </defs>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="noise" stroke="#94a3b8" fill="url(#noise)" />
                  <Area type="monotone" dataKey="signal" stroke="#16a34a" fill="url(#signal)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">High-Relevance Shortlist</CardTitle>
            <CardDescription>Top opportunities ready for handoff</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {shortlist.map(b => (
              <Link key={b.id} href={`/evaluation/${b.id}`}>
                <div className="p-3 rounded border bg-card hover-elevate cursor-pointer">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono text-primary">{b.id}</p>
                      <p className="text-sm font-medium leading-tight line-clamp-2 mt-1">{b.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 truncate">{b.customer}</p>
                    </div>
                    <AIScorePill score={b.aiRelevanceScore} />
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ---------------- AE ---------------- */
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
