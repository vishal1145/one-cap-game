import { useState } from "react";
import {
  Search,
  Filter,
  TrendingUp,
  Users,
  Zap,
  Clock,
  MoreHorizontal,
  Play,
  Pause,
  XCircle,
  ExternalLink,
  GitBranch,
} from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { ChainTreeVisualization } from "@/components/dashboard/ChainTreeVisualization";
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

interface Chain {
  id: string;
  starterName: string;
  starterAvatar: string;
  participants: number;
  depth: number;
  shareSource: "whatsapp" | "instagram" | "tiktok" | "sms";
  velocity: number;
  proConversions: number;
  status: "active" | "viral" | "throttled" | "killed";
  startedAt: string;
}

const chains: Chain[] = [
  {
    id: "4821",
    starterName: "Sarah Chen",
    starterAvatar: "SC",
    participants: 523,
    depth: 8,
    shareSource: "whatsapp",
    velocity: 45,
    proConversions: 23,
    status: "viral",
    startedAt: "2 hours ago",
  },
  {
    id: "4820",
    starterName: "Marcus Johnson",
    starterAvatar: "MJ",
    participants: 234,
    depth: 6,
    shareSource: "instagram",
    velocity: 28,
    proConversions: 12,
    status: "active",
    startedAt: "4 hours ago",
  },
  {
    id: "4819",
    starterName: "Emily Rodriguez",
    starterAvatar: "ER",
    participants: 156,
    depth: 5,
    shareSource: "tiktok",
    velocity: 15,
    proConversions: 8,
    status: "active",
    startedAt: "6 hours ago",
  },
  {
    id: "4818",
    starterName: "James Wilson",
    starterAvatar: "JW",
    participants: 89,
    depth: 4,
    shareSource: "sms",
    velocity: 8,
    proConversions: 3,
    status: "throttled",
    startedAt: "8 hours ago",
  },
  {
    id: "4817",
    starterName: "Aisha Patel",
    starterAvatar: "AP",
    participants: 45,
    depth: 3,
    shareSource: "whatsapp",
    velocity: 2,
    proConversions: 1,
    status: "killed",
    startedAt: "12 hours ago",
  },
];

const chainGrowthData = [
  { time: "12am", chains: 45 },
  { time: "4am", chains: 38 },
  { time: "8am", chains: 78 },
  { time: "12pm", chains: 156 },
  { time: "4pm", chains: 234 },
  { time: "8pm", chains: 312 },
  { time: "Now", chains: 287 },
];

const statusConfig = {
  active: { label: "Active", color: "text-success", bg: "bg-success/10" },
  viral: { label: "Viral 🔥", color: "text-accent", bg: "bg-accent/10" },
  throttled: { label: "Throttled", color: "text-warning", bg: "bg-warning/10" },
  killed: { label: "Killed", color: "text-muted-foreground", bg: "bg-muted" },
};

const sourceIcons = {
  whatsapp: "📱",
  instagram: "📸",
  tiktok: "🎵",
  sms: "💬",
};

export default function ViralChains() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <AdminLayout>
      <AdminHeader
        title="Viral Chains"
        subtitle="Track and manage viral growth"
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">1,247</p>
                <p className="text-sm text-muted-foreground">Active Chains</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">45.2K</p>
                <p className="text-sm text-muted-foreground">Total Participants</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">12.6</p>
                <p className="text-sm text-muted-foreground">Avg Chain Depth</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">2.4hrs</p>
                <p className="text-sm text-muted-foreground">Avg Time to Viral</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chain Growth Chart */}
        <ChartCard title="Chain Activity" subtitle="Chains started today">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chainGrowthData}>
                <defs>
                  <linearGradient id="chainGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--accent))"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--accent))"
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
                  dataKey="time"
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
                <Area
                  type="monotone"
                  dataKey="chains"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                  fill="url(#chainGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Chain Tree Visualization */}
        <ChartCard
          title="Chain Spread Visualization"
          subtitle="Interactive viral network graph"
          action={
            <Button variant="outline" size="sm">
              <GitBranch className="w-4 h-4 mr-2" />
              Full View
            </Button>
          }
        >
          <ChainTreeVisualization chainId="4821" />
        </ChartCard>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search chains..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Chains Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr className="bg-muted/30">
                  <th>Chain ID</th>
                  <th>Starter</th>
                  <th>Participants</th>
                  <th>Depth</th>
                  <th>Source</th>
                  <th>Velocity</th>
                  <th>Pro Conv.</th>
                  <th>Status</th>
                  <th>Started</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {chains.map((chain) => (
                  <tr key={chain.id} className="group">
                    <td>
                      <span className="font-mono font-medium text-primary">
                        #{chain.id}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-xs">
                          {chain.starterAvatar}
                        </div>
                        <span className="font-medium text-foreground">
                          {chain.starterName}
                        </span>
                      </div>
                    </td>
                    <td className="font-bold text-foreground">
                      {chain.participants.toLocaleString()}
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(chain.depth, 8) }).map(
                          (_, i) => (
                            <div
                              key={i}
                              className="w-2 h-2 rounded-full bg-primary"
                              style={{ opacity: 1 - i * 0.1 }}
                            />
                          )
                        )}
                        <span className="text-xs text-muted-foreground ml-1">
                          {chain.depth}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="text-lg">{sourceIcons[chain.shareSource]}</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <TrendingUp
                          className={cn(
                            "w-4 h-4",
                            chain.velocity > 30
                              ? "text-accent"
                              : chain.velocity > 15
                              ? "text-success"
                              : "text-muted-foreground"
                          )}
                        />
                        <span className="font-medium">{chain.velocity}/hr</span>
                      </div>
                    </td>
                    <td className="font-medium">{chain.proConversions}</td>
                    <td>
                      <span
                        className={cn(
                          "inline-flex px-2 py-1 rounded text-xs font-medium",
                          statusConfig[chain.status].bg,
                          statusConfig[chain.status].color
                        )}
                      >
                        {statusConfig[chain.status].label}
                      </span>
                    </td>
                    <td className="text-muted-foreground text-sm">
                      {chain.startedAt}
                    </td>
                    <td>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon-sm" title="View Chain">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        {chain.status === "active" || chain.status === "viral" ? (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-warning"
                            title="Throttle"
                          >
                            <Pause className="w-4 h-4" />
                          </Button>
                        ) : chain.status === "throttled" ? (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-success"
                            title="Resume"
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        ) : null}
                        {chain.status !== "killed" && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive"
                            title="Kill Chain"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
