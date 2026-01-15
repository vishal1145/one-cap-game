import { useState } from "react";
import {
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Crown,
  Zap,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: "active" | "churning" | "inactive";
  tier: "free" | "pro";
  gamesPlayed: number;
  chainsStarted: number;
  totalShares: number;
  ltv: number;
  joinedAt: string;
  segment: string[];
}

const users: User[] = [
  {
    id: "1",
    name: "Sarah Chen",
    email: "sarah.chen@email.com",
    avatar: "SC",
    status: "active",
    tier: "pro",
    gamesPlayed: 847,
    chainsStarted: 156,
    totalShares: 2341,
    ltv: 89.99,
    joinedAt: "2023-08-15",
    segment: ["Power User", "Viral Spreader"],
  },
  {
    id: "2",
    name: "Marcus Johnson",
    email: "marcus.j@email.com",
    avatar: "MJ",
    status: "active",
    tier: "pro",
    gamesPlayed: 623,
    chainsStarted: 89,
    totalShares: 1567,
    ltv: 149.99,
    joinedAt: "2023-09-02",
    segment: ["High LTV", "Power User"],
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    email: "emily.r@email.com",
    avatar: "ER",
    status: "churning",
    tier: "pro",
    gamesPlayed: 234,
    chainsStarted: 12,
    totalShares: 345,
    ltv: 29.99,
    joinedAt: "2023-11-20",
    segment: ["At-Risk"],
  },
  {
    id: "4",
    name: "James Wilson",
    email: "j.wilson@email.com",
    avatar: "JW",
    status: "active",
    tier: "free",
    gamesPlayed: 156,
    chainsStarted: 45,
    totalShares: 678,
    ltv: 0,
    joinedAt: "2024-01-05",
    segment: ["Viral Spreader"],
  },
  {
    id: "5",
    name: "Aisha Patel",
    email: "aisha.p@email.com",
    avatar: "AP",
    status: "inactive",
    tier: "free",
    gamesPlayed: 23,
    chainsStarted: 2,
    totalShares: 15,
    ltv: 0,
    joinedAt: "2024-01-10",
    segment: [],
  },
];

const statusConfig = {
  active: { label: "Active", color: "text-success", bg: "bg-success/10" },
  churning: { label: "At Risk", color: "text-warning", bg: "bg-warning/10" },
  inactive: { label: "Inactive", color: "text-muted-foreground", bg: "bg-muted" },
};

const segmentConfig: Record<string, { icon: typeof Crown; color: string }> = {
  "Power User": { icon: Zap, color: "text-primary" },
  "Viral Spreader": { icon: TrendingUp, color: "text-accent" },
  "High LTV": { icon: Crown, color: "text-warning" },
  "At-Risk": { icon: AlertTriangle, color: "text-destructive" },
};

export default function Users() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <AdminLayout>
      <AdminHeader
        title="User Management"
        subtitle="Manage users and segments"
      />

      <div className="p-6 space-y-6">
        {/* Segment Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-4 hover:border-primary/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">12,450</p>
                <p className="text-sm text-muted-foreground">Power Users</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 hover:border-accent/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">8,230</p>
                <p className="text-sm text-muted-foreground">Viral Spreaders</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 hover:border-warning/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Crown className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">3,890</p>
                <p className="text-sm text-muted-foreground">High LTV</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 hover:border-destructive/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">1,245</p>
                <p className="text-sm text-muted-foreground">At-Risk Churn</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline">
              Bulk Actions
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr className="bg-muted/30">
                  <th>User</th>
                  <th>Status</th>
                  <th>Tier</th>
                  <th>Games</th>
                  <th>Chains</th>
                  <th>Shares</th>
                  <th>LTV</th>
                  <th>Segments</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="group">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                          {user.avatar}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {user.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={cn(
                          "inline-flex px-2 py-1 rounded text-xs font-medium",
                          statusConfig[user.status].bg,
                          statusConfig[user.status].color
                        )}
                      >
                        {statusConfig[user.status].label}
                      </span>
                    </td>
                    <td>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium uppercase",
                          user.tier === "pro"
                            ? "bg-warning/10 text-warning"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {user.tier === "pro" && <Crown className="w-3 h-3" />}
                        {user.tier}
                      </span>
                    </td>
                    <td className="font-medium">
                      {user.gamesPlayed.toLocaleString()}
                    </td>
                    <td className="font-medium">{user.chainsStarted}</td>
                    <td className="font-medium">
                      {user.totalShares.toLocaleString()}
                    </td>
                    <td className="font-medium">
                      {user.ltv > 0 ? `$${user.ltv.toFixed(2)}` : "—"}
                    </td>
                    <td>
                      <div className="flex items-center gap-1 flex-wrap">
                        {user.segment.length > 0 ? (
                          user.segment.slice(0, 2).map((seg) => {
                            const config = segmentConfig[seg];
                            if (!config) return null;
                            const Icon = config.icon;
                            return (
                              <div
                                key={seg}
                                className={cn(
                                  "flex items-center gap-1 px-1.5 py-0.5 rounded text-xs",
                                  config.color
                                )}
                                title={seg}
                              >
                                <Icon className="w-3 h-3" />
                              </div>
                            );
                          })
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
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
