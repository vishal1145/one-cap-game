import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Users, Crown, Clock, DollarSign, Target, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useTrialAnalytics } from "@/hooks/useTrialAnalytics";

const funnelData = [
  { name: "Trial Started", value: 1000, fill: "hsl(var(--primary))" },
  { name: "Day 1 Active", value: 850, fill: "hsl(var(--chart-2))" },
  { name: "Day 2 Active", value: 620, fill: "hsl(var(--chart-3))" },
  { name: "Day 3 Active", value: 450, fill: "hsl(var(--chart-4))" },
  { name: "Converted", value: 280, fill: "hsl(var(--success))" },
];

const featureUsageData = [
  { feature: "Advanced Analytics", usage: 78 },
  { feature: "Team Collaboration", usage: 65 },
  { feature: "Priority Support", usage: 52 },
  { feature: "API Access", usage: 41 },
  { feature: "Custom Reports", usage: 38 },
];

const dropOffData = [
  { point: "Initial Setup", dropOff: 15 },
  { point: "First Feature Use", dropOff: 12 },
  { point: "Day 2 Return", dropOff: 23 },
  { point: "Upgrade Prompt", dropOff: 18 },
  { point: "Checkout", dropOff: 8 },
];

export function TrialAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("30d");
  const { analytics, stats, isLoading } = useTrialAnalytics(timeRange);

  const chartData = analytics.map((a) => ({
    date: new Date(a.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    starts: a.trial_starts,
    conversions: a.trial_conversions,
    revenue: Number(a.revenue_from_trials) || 0,
  }));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-end">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Trial Starts</p>
                <p className="text-3xl font-bold">{stats.totalStarts.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1 text-success text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>Active</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-3xl font-bold">{stats.conversionRate.toFixed(1)}%</p>
                <div className="flex items-center gap-1 mt-1 text-success text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>{stats.totalConversions} converted</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-success/10">
                <Crown className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Time to Convert</p>
                <p className="text-3xl font-bold">{(stats.avgConversionTime / 24).toFixed(1)}d</p>
                <div className="flex items-center gap-1 mt-1 text-muted-foreground text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{stats.avgConversionTime.toFixed(0)}h avg</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-accent/10">
                <Clock className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Trial Revenue</p>
                <p className="text-3xl font-bold">${(stats.totalRevenue / 1000).toFixed(1)}K</p>
                <div className="flex items-center gap-1 mt-1 text-success text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>From trials</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-warning/10">
                <DollarSign className="w-6 h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Trial Conversion Funnel
          </CardTitle>
          <CardDescription>User journey from trial start to conversion</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-5 gap-4">
            {funnelData.map((step, index) => (
              <div key={step.name} className="relative">
                <div 
                  className="rounded-lg p-4 text-center"
                  style={{ backgroundColor: `${step.fill}20` }}
                >
                  <p className="text-2xl font-bold" style={{ color: step.fill }}>
                    {step.value.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{step.name}</p>
                  {index > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {((step.value / funnelData[0].value) * 100).toFixed(1)}% of total
                    </p>
                  )}
                </div>
                {index < funnelData.length - 1 && (
                  <ArrowRight className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-muted-foreground/30" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Conversion Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Trial Starts vs Conversions</CardTitle>
            <CardDescription>Daily comparison over time</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorStarts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorConversions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="starts" 
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#colorStarts)" 
                    name="Trial Starts"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="conversions" 
                    stroke="hsl(var(--success))" 
                    fillOpacity={1} 
                    fill="url(#colorConversions)" 
                    name="Conversions"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                No analytics data available for this period
              </div>
            )}
          </CardContent>
        </Card>

        {/* Feature Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Feature Usage During Trial</CardTitle>
            <CardDescription>Which Pro features are most explored</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {featureUsageData.map((feature) => (
                <div key={feature.feature} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{feature.feature}</span>
                    <span className="font-medium">{feature.usage}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${feature.usage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Drop-off Points */}
        <Card>
          <CardHeader>
            <CardTitle>Drop-off Points</CardTitle>
            <CardDescription>Where users leave before conversion</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dropOffData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="point" type="category" width={120} className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => [`${value}%`, "Drop-off"]}
                />
                <Bar dataKey="dropOff" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* A/B Test Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Trial Duration A/B Comparison</CardTitle>
            <CardDescription>Performance by trial length</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { duration: "3 Days", conversionRate: 24.5, avgTime: 2.1, revenue: 8420 },
                { duration: "5 Days", conversionRate: 28.2, avgTime: 3.4, revenue: 9650 },
                { duration: "7 Days", conversionRate: 26.8, avgTime: 4.2, revenue: 9120 },
              ].map((test, index) => (
                <div 
                  key={test.duration}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    index === 1 ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{test.duration} Trial</span>
                    {index === 1 && (
                      <Badge className="bg-success text-success-foreground">Best Performer</Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Conversion</p>
                      <p className="font-bold text-lg">{test.conversionRate}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Avg. Time</p>
                      <p className="font-bold text-lg">{test.avgTime}d</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Revenue</p>
                      <p className="font-bold text-lg">${(test.revenue / 1000).toFixed(1)}K</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
