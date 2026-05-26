import { mockAnalyticsData } from "@/data/mock";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const chartColors = ["#2563eb", "#16a34a", "#f59e0b", "#a855f7", "#ef4444"];

function ChartCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription className="mt-0.5 text-xs">{description}</CardDescription>
          </div>
          <Badge variant="outline" className="text-[10px] shrink-0">Last 30 days</Badge>
        </div>
      </CardHeader>
      <CardContent className="h-[260px]">{children}</CardContent>
    </Card>
  );
}

export default function Analytics() {
  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">Pipeline health, AI signal quality, and submission outcomes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Bid Volume by Source Type" description="How bids entered the pipeline this period">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockAnalyticsData.sourceType}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill={chartColors[0]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Portal Opportunity Trends" description="Weekly opportunity counts across all portals">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockAnalyticsData.trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke={chartColors[1]} strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="AI Recommendation Distribution" description="Go / Review / No-Go split">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={mockAnalyticsData.recommendation} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={50} paddingAngle={2}>
                {mockAnalyticsData.recommendation.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Qualification Funnel" description="Identify → Qualify → Draft → Submit → Won">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockAnalyticsData.funnel} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
              <Tooltip />
              <Bar dataKey="value" fill={chartColors[3]} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Matched vs Unmatched Parts Trend" description="Catalog coverage strength over time">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockAnalyticsData.matchedParts}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="matched" stroke="#16a34a" strokeWidth={2} />
              <Line type="monotone" dataKey="unmatched" stroke="#f59e0b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Submission Outcomes" description="Closed-loop result tracking">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockAnalyticsData.outcomes}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {mockAnalyticsData.outcomes.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
