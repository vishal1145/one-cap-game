import {
  Users,
  TrendingUp,
  Share2,
  DollarSign,
  Activity,
  Gamepad2,
  Zap,
  Crown,
} from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { KPICard } from "@/components/dashboard/KPICard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { TopGamesTable } from "@/components/dashboard/TopGamesTable";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Mock data for charts
const dauData = [
  { date: "Mon", dau: 45000, mau: 280000 },
  { date: "Tue", dau: 52000, mau: 285000 },
  { date: "Wed", dau: 48000, mau: 290000 },
  { date: "Thu", dau: 61000, mau: 295000 },
  { date: "Fri", dau: 55000, mau: 300000 },
  { date: "Sat", dau: 78000, mau: 310000 },
  { date: "Sun", dau: 82000, mau: 320000 },
];

const chainData = [
  { date: "Mon", chains: 120 },
  { date: "Tue", chains: 145 },
  { date: "Wed", chains: 132 },
  { date: "Thu", chains: 178 },
  { date: "Fri", chains: 156 },
  { date: "Sat", chains: 234 },
  { date: "Sun", chains: 256 },
];

const funnelData = [
  { name: "Install", value: 100000, fill: "hsl(var(--chart-1))" },
  { name: "First Guess", value: 78000, fill: "hsl(var(--chart-2))" },
  { name: "First Share", value: 45000, fill: "hsl(var(--chart-3))" },
  { name: "Pro Convert", value: 12000, fill: "hsl(var(--chart-4))" },
];

const shareSourceData = [
  { name: "WhatsApp", value: 45, fill: "hsl(var(--chart-4))" },
  { name: "Instagram", value: 25, fill: "hsl(var(--chart-2))" },
  { name: "TikTok", value: 18, fill: "hsl(var(--chart-3))" },
  { name: "SMS", value: 12, fill: "hsl(var(--chart-1))" },
];

export default function Dashboard() {
  return (
    <AdminLayout>
      <AdminHeader
        title="Executive Dashboard"
        subtitle="Real-time overview of One Cap! performance"
      />

      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Daily Active Users"
            value="82.4K"
            change={18.5}
            icon={Users}
            variant="primary"
          />
          <KPICard
            title="K-Factor"
            value="2.4"
            change={12.3}
            icon={TrendingUp}
            variant="success"
          />
          <KPICard
            title="Avg Shares / User"
            value="3.8"
            change={8.7}
            icon={Share2}
            variant="accent"
          />
          <KPICard
            title="Revenue (Today)"
            value="$24.8K"
            change={-2.4}
            icon={DollarSign}
            variant="warning"
          />
        </div>

        {/* Secondary KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Avg Chain Length"
            value="12.6"
            change={5.2}
            icon={Activity}
          />
          <KPICard
            title="Games Played Today"
            value="156K"
            change={22.1}
            icon={Gamepad2}
          />
          <KPICard
            title="Viral Chains Active"
            value="1,247"
            change={34.8}
            icon={Zap}
          />
          <KPICard
            title="Pro Conversion"
            value="4.2%"
            change={1.8}
            icon={Crown}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Daily Active Users"
            subtitle="7-day trend"
            action={
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-xs">
                  Week
                </Button>
                <Button variant="secondary" size="sm" className="text-xs">
                  Month
                </Button>
              </div>
            }
          >
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dauData}>
                  <defs>
                    <linearGradient id="dauGradient" x1="0" y1="0" x2="0" y2="1">
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
                    dataKey="date"
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
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="dau"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#dauGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Viral Chains" subtitle="New chains started per day">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chainData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    dataKey="chains"
                    fill="hsl(var(--accent))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard title="Conversion Funnel" subtitle="Install to Pro journey">
            <div className="space-y-3 mt-2">
              {funnelData.map((item, index) => {
                const prevValue = index > 0 ? funnelData[index - 1].value : item.value;
                const convRate =
                  index > 0
                    ? Math.round((item.value / prevValue) * 100)
                    : 100;
                return (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="font-medium text-foreground">
                        {(item.value / 1000).toFixed(0)}K
                        {index > 0 && (
                          <span className="text-xs text-muted-foreground ml-2">
                            ({convRate}%)
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${(item.value / funnelData[0].value) * 100}%`,
                          backgroundColor: item.fill,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartCard>

          <ChartCard title="Share Sources" subtitle="Where users share from">
            <div className="h-48 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={shareSourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {shareSourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`${value}%`, "Share"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {shareSourceData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center gap-2 text-sm"
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="font-medium text-foreground ml-auto">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </ChartCard>

          <ChartCard title="Live Activity" subtitle="Real-time alerts & events">
            <ActivityFeed />
          </ChartCard>
        </div>

        {/* Top Games Table */}
        <ChartCard
          title="Top Performing Games"
          subtitle="Games ranked by engagement metrics"
          action={
            <Button variant="outline" size="sm">
              View All
            </Button>
          }
        >
          <TopGamesTable />
        </ChartCard>
      </div>
    </AdminLayout>
  );
}
