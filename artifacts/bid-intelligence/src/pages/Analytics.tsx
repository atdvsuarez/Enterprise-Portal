import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { TrendingUp, Users, Award, BarChart3, Package } from "lucide-react";
import { cn } from "@/lib/utils";

type PeriodKey = "7d" | "30d" | "90d" | "365d";

const BIDS_PER_YEAR = 2500;

const PERIODS: { key: PeriodKey; label: string; days: number; buckets: number; bucketLabel: string; totalBids: number }[] = [
  { key: "7d", label: "1 Week", days: 7, buckets: 7, bucketLabel: "day", totalBids: Math.round((BIDS_PER_YEAR * 7) / 365) },
  { key: "30d", label: "1 Month", days: 30, buckets: 10, bucketLabel: "3-day", totalBids: Math.round((BIDS_PER_YEAR * 30) / 365) },
  { key: "90d", label: "90 Days", days: 90, buckets: 12, bucketLabel: "week", totalBids: Math.round((BIDS_PER_YEAR * 90) / 365) },
  { key: "365d", label: "365 Days", days: 365, buckets: 12, bucketLabel: "month", totalBids: BIDS_PER_YEAR },
];

const PARTS = [
  { id: "CUM-5286-01", name: "ISX15 Turbocharger" },
  { id: "CUM-3417-02", name: "QSB Fuel Injector" },
  { id: "CUM-7821-04", name: "Brake Pad Assembly" },
  { id: "CUM-9043-11", name: "HVAC Compressor" },
  { id: "CUM-2156-07", name: "Hydraulic Pump" },
  { id: "CUM-6190-03", name: "Air Filter Element" },
  { id: "CUM-4422-09", name: "EGR Cooler Kit" },
  { id: "CUM-8865-05", name: "Alternator 28V" },
];

const CUSTOMERS = [
  "Jefferson County",
  "DART",
  "MBTA",
  "WMATA",
  "LA Metro",
  "King County Metro",
  "City of Sacramento",
  "OCTA",
  "SORTA",
  "TriMet",
];

const ITEM_TYPES = [
  { code: "IND-Parts", label: "Industrial Parts", color: "#DA291C", weight: 0.38 },
  { code: "DX-Parts", label: "Distribution Parts", color: "#2A2A2A", weight: 0.27 },
  { code: "DRC-ENG", label: "ReCon Engines", color: "#1f7a4a", weight: 0.21 },
  { code: "Others-Prod", label: "Other Products", color: "#8E9AAB", weight: 0.14 },
];

const TIERS = [
  { name: "Platinum", color: "#1A1A1A" },
  { name: "Gold", color: "#D4A017" },
  { name: "Silver", color: "#8E9AAB" },
  { name: "Bronze", color: "#A66A3F" },
];

const RED = "#DA291C";
const ACCENT_COLORS = ["#DA291C", "#2A2A2A", "#D4A017", "#1f7a4a", "#55A1D3"];

/* Deterministic seeded RNG so charts are stable across renders */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function bucketLabels(p: (typeof PERIODS)[number]): string[] {
  if (p.key === "7d") {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days;
  }
  if (p.key === "30d") {
    return Array.from({ length: 10 }, (_, i) => `D${i * 3 + 1}`);
  }
  if (p.key === "90d") {
    return Array.from({ length: 12 }, (_, i) => `W${i + 1}`);
  }
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months;
}

/* Distribute a target total across N items using a deterministic weighted RNG */
function distribute(total: number, keys: string[], period: PeriodKey, seedSalt: string): number[] {
  const weights = keys.map((k) => {
    const rng = mulberry32(hashString(k + period + seedSalt));
    return 0.5 + rng(); // 0.5–1.5 weight
  });
  const wsum = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map((w) => (w / wsum) * total);
  const rounded = raw.map((r) => Math.round(r));
  // Adjust to hit total exactly
  let diff = total - rounded.reduce((a, b) => a + b, 0);
  let i = 0;
  while (diff !== 0) {
    rounded[i % rounded.length] += diff > 0 ? 1 : -1;
    diff += diff > 0 ? -1 : 1;
    i++;
  }
  return rounded;
}

/* ---------- Aggregations (deterministic per period, anchored at 2,500 bids/year) ---------- */

function getCustomerVolume(period: PeriodKey) {
  const meta = PERIODS.find((p) => p.key === period)!;
  const bidsArr = distribute(meta.totalBids, CUSTOMERS, period, "cust");
  return CUSTOMERS.map((c, i) => ({ customer: c, bids: bidsArr[i] }))
    .sort((a, b) => b.bids - a.bids)
    .slice(0, 8);
}

function getPartsSold(period: PeriodKey) {
  const meta = PERIODS.find((p) => p.key === period)!;
  // ~10 line items per bid on average
  const totalUnits = meta.totalBids * 10;
  const unitsArr = distribute(totalUnits, PARTS.map((p) => p.id), period, "part");
  return PARTS.map((p, i) => ({
    part: p.id,
    label: `${p.id} · ${p.name}`,
    units: unitsArr[i],
  })).sort((a, b) => b.units - a.units);
}

function getCustomerTiers(period: PeriodKey) {
  const meta = PERIODS.find((p) => p.key === period)!;
  // Revenue scales with bid volume: ~$3.5K per bid in display units (thousands)
  const totalRevenueK = meta.totalBids * 3.5;
  const weights = [0.42, 0.31, 0.18, 0.09]; // Platinum dominates
  return TIERS.map((t, i) => {
    const rng = mulberry32(hashString(t.name + period));
    const jitter = 0.92 + rng() * 0.16;
    return {
      name: t.name,
      color: t.color,
      revenue: Math.round(totalRevenueK * weights[i] * jitter),
    };
  });
}

function getItemTypeSales(period: PeriodKey) {
  const meta = PERIODS.find((p) => p.key === period)!;
  // Revenue in dollars (units of $K) split by item type, anchored to bid volume
  const totalRevenueK = meta.totalBids * 3.5;
  const totalUnits = meta.totalBids * 10;
  return ITEM_TYPES.map((t) => {
    const rng = mulberry32(hashString(t.code + period));
    const jitter = 0.9 + rng() * 0.2;
    return {
      code: t.code,
      label: t.label,
      color: t.color,
      revenue: Math.round(totalRevenueK * t.weight * jitter * 1000),
      units: Math.round(totalUnits * t.weight * jitter),
    };
  }).sort((a, b) => b.revenue - a.revenue);
}

function getPartTrends(period: PeriodKey) {
  const p = PERIODS.find((x) => x.key === period)!;
  const labels = bucketLabels(p);
  const topParts = getPartsSold(period).slice(0, 5);
  return labels.map((label, idx) => {
    const row: Record<string, number | string> = { bucket: label };
    topParts.forEach((tp) => {
      const rng = mulberry32(hashString(tp.part + period + idx));
      const baseline = tp.units / labels.length;
      const noise = 0.75 + rng() * 0.5; // ±25%
      // gentle upward drift across buckets for visual interest
      const drift = 1 + (idx / labels.length) * 0.25;
      row[tp.part] = Math.max(1, Math.round(baseline * noise * drift));
    });
    return row;
  });
}

/* ---------- Component ---------- */

function ChartCard({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#DA291C]/10 flex items-center justify-center shrink-0">
            <Icon className="h-4.5 w-4.5 text-[#DA291C]" />
          </div>
          <div className="min-w-0">
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription className="mt-0.5 text-xs">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[300px]">{children}</CardContent>
    </Card>
  );
}

function formatCompactCurrency(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

export default function Analytics() {
  const [period, setPeriod] = useState<PeriodKey>("30d");
  const periodMeta = PERIODS.find((p) => p.key === period)!;

  const partsSold = useMemo(() => getPartsSold(period), [period]);
  const tiers = useMemo(() => getCustomerTiers(period), [period]);
  const customerVolume = useMemo(() => getCustomerVolume(period), [period]);
  const partTrends = useMemo(() => getPartTrends(period), [period]);
  const itemTypeSales = useMemo(() => getItemTypeSales(period), [period]);
  const topPartIds = useMemo(() => partsSold.slice(0, 5).map((p) => p.part), [partsSold]);

  const totals = useMemo(() => {
    const units = partsSold.reduce((s, p) => s + p.units, 0);
    const revenue = tiers.reduce((s, t) => s + t.revenue, 0) * 1000;
    const bids = periodMeta.totalBids;
    return { units, revenue, bids };
  }, [partsSold, tiers, periodMeta]);

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Daily Bids Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Historical KPIs for the Daily Bids team — parts performance, customer mix, and demand trends.
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border bg-card p-1 shadow-sm">
          {PERIODS.map((p) => (
            <Button
              key={p.key}
              size="sm"
              variant="ghost"
              onClick={() => setPeriod(p.key)}
              className={cn(
                "h-8 px-3 text-xs font-medium transition-colors",
                period === p.key
                  ? "bg-[#DA291C] text-white hover:bg-[#b32016] hover:text-white"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
              Units sold · {periodMeta.label}
            </div>
            <div className="text-2xl font-bold tabular-nums mt-1">{totals.units.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Across {PARTS.length} active SKUs</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
              Revenue · {periodMeta.label}
            </div>
            <div className="text-2xl font-bold tabular-nums mt-1">{formatCompactCurrency(totals.revenue)}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Across all tiers</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
              Bids submitted · {periodMeta.label}
            </div>
            <div className="text-2xl font-bold tabular-nums mt-1">{totals.bids.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-0.5">All customers combined</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Part ID most sold */}
        <ChartCard
          title="Part ID — Most Sold"
          description={`Top SKUs by units sold over the last ${periodMeta.label.toLowerCase()}`}
          icon={BarChart3}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={partsSold} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="part"
                tick={{ fontSize: 11 }}
                width={110}
              />
              <Tooltip
                formatter={(v: number) => [`${v.toLocaleString()} units`, "Sold"]}
                contentStyle={{ fontSize: 12, borderRadius: 6 }}
              />
              <Bar dataKey="units" fill={RED} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Customer Tier with most business */}
        <ChartCard
          title="Customer Tier — Share of Business"
          description={`Revenue split by customer tier · ${periodMeta.label.toLowerCase()}`}
          icon={Award}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={tiers}
                dataKey="revenue"
                nameKey="name"
                cx="40%"
                cy="50%"
                innerRadius={55}
                outerRadius={95}
                paddingAngle={2}
              >
                {tiers.map((t) => (
                  <Cell key={t.name} fill={t.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: number, n) => [formatCompactCurrency(v * 1000), n as string]}
                contentStyle={{ fontSize: 12, borderRadius: 6 }}
              />
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                iconType="circle"
                wrapperStyle={{ fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Customer by Volume */}
        <ChartCard
          title="Customers by Volume"
          description={`Top customers by bid count · ${periodMeta.label.toLowerCase()}`}
          icon={Users}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={customerVolume} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="customer"
                tick={{ fontSize: 11 }}
                width={140}
              />
              <Tooltip
                formatter={(v: number) => [`${v.toLocaleString()} bids`, "Volume"]}
                contentStyle={{ fontSize: 12, borderRadius: 6 }}
              />
              <Bar dataKey="bids" fill="#2A2A2A" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Changes in sales by Part ID */}
        <ChartCard
          title="Sales Trend — Top 5 Parts"
          description={`Unit sales per ${periodMeta.bucketLabel} bucket across the ${periodMeta.label.toLowerCase()}`}
          icon={TrendingUp}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={partTrends} margin={{ left: 4, right: 12, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
              {topPartIds.map((id, i) => (
                <Line
                  key={id}
                  type="monotone"
                  dataKey={id}
                  stroke={ACCENT_COLORS[i % ACCENT_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Sales by Item Type Code */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Sales by Item Type Code"
            description={`Revenue by product family · ${periodMeta.label.toLowerCase()}`}
            icon={Package}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={itemTypeSales} margin={{ left: 8, right: 16, top: 12, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                <XAxis
                  dataKey="code"
                  tick={{ fontSize: 12, fontWeight: 600 }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v: number) => formatCompactCurrency(v)}
                />
                <Tooltip
                  formatter={(v: number, _n, item) => [
                    `${formatCompactCurrency(v)} · ${(item.payload.units as number).toLocaleString()} units`,
                    item.payload.label as string,
                  ]}
                  contentStyle={{ fontSize: 12, borderRadius: 6 }}
                />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]} maxBarSize={120}>
                  {itemTypeSales.map((t) => (
                    <Cell key={t.code} fill={t.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
