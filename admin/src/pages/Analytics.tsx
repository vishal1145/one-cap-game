import { useState } from "react";
import {
  Calendar,
  Download,
  TrendingUp,
  TrendingDown,
  Filter,
} from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Button } from "@/components/ui/button";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { cn } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
} from "recharts";

const retentionData = [
  { day: "D1", rate: 45 },
  { day: "D3", rate: 32 },
  { day: "D7", rate: 24 },
  { day: "D14", rate: 18 },
  { day: "D30", rate: 12 },
  { day: "D60", rate: 8 },
  { day: "D90", rate: 6 },
];

const eventData = [
  { name: "app_open", count: 1245000, change: 12 },
  { name: "challenge_started", count: 890000, change: 18 },
  { name: "challenge_completed", count: 678000, change: 15 },
  { name: "game_completed", count: 234000, change: 22 },
  { name: "share_completed", count: 156000, change: 34 },
  { name: "pro_paywall_viewed", count: 89000, change: -5 },
  { name: "subscription_started", count: 12400, change: 8 },
];

const cohortData = [
  { week: "Week 1", users: 10000, retained: 4500 },
  { week: "Week 2", users: 12000, retained: 5200 },
  { week: "Week 3", users: 11500, retained: 4800 },
  { week: "Week 4", users: 14000, retained: 6300 },
  { week: "Week 5", users: 13200, retained: 5900 },
  { week: "Week 6", users: 15800, retained: 7100 },
];

const funnelSteps = [
  { name: "Install", value: 100, count: 156000 },
  { name: "Onboarding Complete", value: 78, count: 121680 },
  { name: "First Challenge", value: 65, count: 101400 },
  { name: "First Share", value: 42, count: 65520 },
  { name: "Second Session", value: 38, count: 59280 },
  { name: "Pro Paywall View", value: 25, count: 39000 },
  { name: "Pro Conversion", value: 8, count: 12480 },
];

export default function Analytics() {
  const [dateRange, setDateRange] = useState("7d");

  return (
    <AdminLayout>
      <AdminHeader
        title="Analytics"
        subtitle="Event tracking and cohort analysis"
      />

      <div className="p-6 space-y-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {["24h", "7d", "30d", "90d"].map((range) => (
              <Button
                key={range}
                variant={dateRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setDateRange(range)}
              >
                {range}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Custom Range
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Retention Curve */}
        <ChartCard
          title="Retention Curve"
          subtitle="User retention over time"
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={retentionData}>
                <defs>
                  <linearGradient id="retentionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`${value}%`, "Retention"]}
                />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#retentionGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Event Tracking */}
          <ChartCard title="Event Tracking" subtitle="Key events last 7 days">
            <div className="space-y-3">
              {eventData.map((event) => (
                <div
                  key={event.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <code className="text-sm font-mono text-primary bg-primary/10 px-2 py-1 rounded">
                      {event.name}
                    </code>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-foreground">
                      {(event.count / 1000).toFixed(0)}K
                    </span>
                    <div
                      className={cn(
                        "flex items-center gap-1 text-sm font-medium",
                        event.change >= 0 ? "text-success" : "text-destructive"
                      )}
                    >
                      {event.change >= 0 ? (
                        <TrendingUp className="w-3.5 h-3.5" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5" />
                      )}
                      {Math.abs(event.change)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>

          {/* Cohort Analysis */}
          <ChartCard title="Cohort Analysis" subtitle="Weekly cohort retention">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cohortData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="week"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    tickFormatter={(v) => `${v / 1000}K`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    dataKey="users"
                    fill="hsl(var(--muted))"
                    radius={[4, 4, 0, 0]}
                    name="New Users"
                  />
                  <Bar
                    dataKey="retained"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                    name="Retained"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Conversion Funnel */}
        <ChartCard
          title="Conversion Funnel"
          subtitle="User journey from install to conversion"
        >
          <div className="space-y-4">
            {funnelSteps.map((step, index) => (
              <div key={step.name} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-semibold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="font-medium text-foreground">{step.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {step.count.toLocaleString()} users
                    </span>
                    <span className="font-semibold text-foreground w-12 text-right">
                      {step.value}%
                    </span>
                  </div>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-700"
                    style={{ width: `${step.value}%` }}
                  />
                </div>
                {index < funnelSteps.length - 1 && (
                  <div className="absolute left-3 top-full h-4 w-px bg-border" />
                )}
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </AdminLayout>
  );
}
