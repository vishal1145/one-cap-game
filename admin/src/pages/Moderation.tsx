import { useState } from "react";
import {
  Shield,
  AlertTriangle,
  Ban,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Flag,
  MessageSquare,
  Users,
  FileText,
} from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Button } from "@/components/ui/button";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Report {
  id: string;
  type: "statement" | "user" | "chain";
  target: string;
  reason: string;
  reportedBy: number;
  status: "pending" | "reviewed" | "actioned";
  severity: "low" | "medium" | "high";
  createdAt: string;
}

const reports: Report[] = [
  {
    id: "1",
    type: "statement",
    target: "Statement #892: 'Politicians never lie'",
    reason: "Misinformation",
    reportedBy: 23,
    status: "pending",
    severity: "high",
    createdAt: "15 min ago",
  },
  {
    id: "2",
    type: "user",
    target: "User: @toxicgamer99",
    reason: "Harassment in chains",
    reportedBy: 8,
    status: "pending",
    severity: "high",
    createdAt: "1 hour ago",
  },
  {
    id: "3",
    type: "statement",
    target: "Statement #1045: Cultural joke",
    reason: "Cultural insensitivity",
    reportedBy: 5,
    status: "reviewed",
    severity: "medium",
    createdAt: "2 hours ago",
  },
  {
    id: "4",
    type: "chain",
    target: "Chain #3892",
    reason: "Spam abuse",
    reportedBy: 12,
    status: "actioned",
    severity: "medium",
    createdAt: "4 hours ago",
  },
  {
    id: "5",
    type: "statement",
    target: "Statement #567",
    reason: "Inappropriate content",
    reportedBy: 3,
    status: "pending",
    severity: "low",
    createdAt: "6 hours ago",
  },
];

const aiFilters = [
  { name: "Hate Speech", blocked: 1245, accuracy: 98.5, active: true },
  { name: "Sexual Content", blocked: 856, accuracy: 97.2, active: true },
  { name: "Violence", blocked: 432, accuracy: 96.8, active: true },
  { name: "Cultural Sensitivity", blocked: 234, accuracy: 89.4, active: true },
  { name: "Spam Detection", blocked: 3421, accuracy: 94.1, active: true },
];

const statusConfig = {
  pending: { label: "Pending", color: "text-warning", bg: "bg-warning/10" },
  reviewed: { label: "Reviewed", color: "text-primary", bg: "bg-primary/10" },
  actioned: { label: "Actioned", color: "text-success", bg: "bg-success/10" },
};

const severityConfig = {
  low: { color: "text-muted-foreground", bg: "bg-muted" },
  medium: { color: "text-warning", bg: "bg-warning/10" },
  high: { color: "text-destructive", bg: "bg-destructive/10" },
};

const typeIcons = {
  statement: FileText,
  user: Users,
  chain: MessageSquare,
};

export default function Moderation() {
  const [filter, setFilter] = useState<"all" | "pending" | "reviewed" | "actioned">("all");

  const filteredReports = reports.filter(
    (r) => filter === "all" || r.status === filter
  );

  return (
    <AdminLayout>
      <AdminHeader
        title="Moderation"
        subtitle="Content safety and trust management"
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Flag className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">47</p>
                <p className="text-sm text-muted-foreground">Pending Reports</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <Ban className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">234</p>
                <p className="text-sm text-muted-foreground">Bans This Month</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">6.2K</p>
                <p className="text-sm text-muted-foreground">AI Blocked</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">96.2%</p>
                <p className="text-sm text-muted-foreground">AI Accuracy</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reports Queue */}
          <div className="lg:col-span-2">
            <ChartCard
              title="Reports Queue"
              subtitle="User-submitted reports"
              action={
                <div className="flex items-center gap-1">
                  {(["all", "pending", "reviewed", "actioned"] as const).map((f) => (
                    <Button
                      key={f}
                      variant={filter === f ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setFilter(f)}
                      className="capitalize text-xs"
                    >
                      {f}
                    </Button>
                  ))}
                </div>
              }
            >
              <div className="space-y-3">
                {filteredReports.map((report) => {
                  const TypeIcon = typeIcons[report.type];
                  return (
                    <div
                      key={report.id}
                      className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                          severityConfig[report.severity].bg
                        )}
                      >
                        <TypeIcon
                          className={cn("w-5 h-5", severityConfig[report.severity].color)}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="font-medium text-foreground truncate">
                            {report.target}
                          </p>
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded text-xs font-medium shrink-0",
                              statusConfig[report.status].bg,
                              statusConfig[report.status].color
                            )}
                          >
                            {statusConfig[report.status].label}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {report.reason} • {report.reportedBy} reports
                        </p>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => toast(`Reviewing: ${report.target}`)}>
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            Review
                          </Button>
                          {report.status === "pending" && (
                            <>
                              <Button variant="ghost" size="sm" className="text-success" onClick={() => toast.success(`Report dismissed`)}>
                                <CheckCircle className="w-3.5 h-3.5 mr-1" />
                                Dismiss
                              </Button>
                              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => toast.error(`Action taken on report`)}>
                                <Ban className="w-3.5 h-3.5 mr-1" />
                                Action
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {report.createdAt}
                      </span>
                    </div>
                  );
                })}
              </div>
            </ChartCard>
          </div>

          {/* AI Safety Filters */}
          <ChartCard title="AI Safety Filters" subtitle="Automated content moderation">
            <div className="space-y-3">
              {aiFilters.map((filter) => (
                <div
                  key={filter.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        filter.active ? "bg-success" : "bg-muted-foreground"
                      )}
                    />
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {filter.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {filter.blocked.toLocaleString()} blocked
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-success text-sm">
                      {filter.accuracy}%
                    </p>
                    <p className="text-xs text-muted-foreground">accuracy</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              <Shield className="w-4 h-4 mr-2" />
              Configure Filters
            </Button>
          </ChartCard>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <Ban className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Quick Ban</h3>
                <p className="text-sm text-muted-foreground">Ban a user by ID</p>
              </div>
            </div>
            <Button variant="destructive" className="w-full" onClick={() => toast.error("User banned successfully")}>
              Ban User
            </Button>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <EyeOff className="w-5 h-5 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Shadow Ban</h3>
                <p className="text-sm text-muted-foreground">Limit visibility silently</p>
              </div>
            </div>
            <Button variant="warning" className="w-full" onClick={() => toast.warning("User shadow banned")}>
              Shadow Ban
            </Button>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Remove Content</h3>
                <p className="text-sm text-muted-foreground">Delete statement or game</p>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={() => toast("Content removal dialog opened")}>
              Remove Content
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
