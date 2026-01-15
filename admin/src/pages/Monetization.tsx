import { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Gift,
  Settings,
  Globe,
  Percent,
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
} from "recharts";

const revenueData = [
  { date: "Mon", revenue: 18500, subscriptions: 145 },
  { date: "Tue", revenue: 21200, subscriptions: 167 },
  { date: "Wed", revenue: 19800, subscriptions: 156 },
  { date: "Thu", revenue: 24500, subscriptions: 198 },
  { date: "Fri", revenue: 22100, subscriptions: 178 },
  { date: "Sat", revenue: 28900, subscriptions: 234 },
  { date: "Sun", revenue: 24800, subscriptions: 201 },
];

const pricingTiers = [
  { region: "US", monthly: 9.99, yearly: 79.99, trial: 7, currency: "USD" },
  { region: "EU", monthly: 8.99, yearly: 69.99, trial: 7, currency: "EUR" },
  { region: "LATAM", monthly: 4.99, yearly: 39.99, trial: 14, currency: "USD" },
  { region: "APAC", monthly: 6.99, yearly: 54.99, trial: 7, currency: "USD" },
];

const nudges = [
  { name: "After 3-win streak", trigger: "streak_3", uplift: 23, active: true },
  { name: "After viral share", trigger: "share_viral", uplift: 45, active: true },
  { name: "High accuracy game", trigger: "accuracy_90", uplift: 18, active: true },
  { name: "Daily login reward", trigger: "daily_login", uplift: -5, active: false },
];

const iapProducts = [
  { name: "Statement Pack: Celebrity", price: 2.99, sales: 4521, revenue: 13518 },
  { name: "Statement Pack: Sports", price: 2.99, sales: 3890, revenue: 11631 },
  { name: "Game Pack: Premium 5", price: 4.99, sales: 2340, revenue: 11677 },
  { name: "Limited: Holiday Bundle", price: 9.99, sales: 1245, revenue: 12438 },
];

export default function Monetization() {
  return (
    <AdminLayout>
      <AdminHeader
        title="Monetization"
        subtitle="Revenue and subscription controls"
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">$159.8K</p>
                <p className="text-sm text-muted-foreground">MRR</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">18,450</p>
                <p className="text-sm text-muted-foreground">Active Subs</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Percent className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">4.2%</p>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">$8.65</p>
                <p className="text-sm text-muted-foreground">ARPU</p>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <ChartCard title="Revenue Overview" subtitle="Last 7 days">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--success))"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--success))"
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
                  tickFormatter={(v) => `$${v / 1000}K`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--success))"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pricing by Region */}
          <ChartCard
            title="Regional Pricing"
            subtitle="Subscription prices by region"
            action={
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Edit Prices
              </Button>
            }
          >
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Region</th>
                    <th>Monthly</th>
                    <th>Yearly</th>
                    <th>Trial</th>
                  </tr>
                </thead>
                <tbody>
                  {pricingTiers.map((tier) => (
                    <tr key={tier.region}>
                      <td>
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{tier.region}</span>
                        </div>
                      </td>
                      <td className="font-medium">
                        {tier.currency} {tier.monthly}
                      </td>
                      <td className="font-medium">
                        {tier.currency} {tier.yearly}
                      </td>
                      <td className="text-muted-foreground">{tier.trial} days</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>

          {/* Subtle Nudges */}
          <ChartCard
            title="Conversion Nudges"
            subtitle="Smart prompts and their impact"
          >
            <div className="space-y-3">
              {nudges.map((nudge) => (
                <div
                  key={nudge.trigger}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border transition-colors",
                    nudge.active
                      ? "bg-muted/30 border-border"
                      : "bg-muted/10 border-transparent opacity-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        nudge.active ? "bg-success" : "bg-muted-foreground"
                      )}
                    />
                    <div>
                      <p className="font-medium text-foreground">{nudge.name}</p>
                      <code className="text-xs text-muted-foreground">
                        {nudge.trigger}
                      </code>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "flex items-center gap-1 font-semibold",
                      nudge.uplift >= 0 ? "text-success" : "text-destructive"
                    )}
                  >
                    {nudge.uplift >= 0 ? "+" : ""}
                    {nudge.uplift}%
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* IAP Products */}
        <ChartCard
          title="In-App Purchases"
          subtitle="Statement packs and special offers"
          action={
            <Button variant="outline" size="sm">
              <Gift className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          }
        >
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Sales</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {iapProducts.map((product) => (
                  <tr key={product.name}>
                    <td className="font-medium text-foreground">{product.name}</td>
                    <td>${product.price}</td>
                    <td>{product.sales.toLocaleString()}</td>
                    <td className="font-semibold text-success">
                      ${product.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>
    </AdminLayout>
  );
}
