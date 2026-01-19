import { useState, useEffect, useCallback } from "react";
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
  Loader2,
  X,
} from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Button } from "@/components/ui/button";
import { ChartCard } from "@/components/dashboard/ChartCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useToast } from "@/hooks/use-toast";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import api from "@/api/client";

interface BackendReport {
  _id: {
    target_type: "user" | "chain" | "challenge";
    target_id: string;
  };
  report_count: number;
  reasons: string[];
  last_reported_at: string;
  statuses: string[];
  group_status: "pending" | "reviewed" | "actioned";
  target: {
    _id: string;
    username?: string;
    email?: string;
    avatar_url?: string;
    status?: string;
    reported_count?: number;
    is_reported?: boolean;
    title?: string;
    visibility?: string;
    starter?: {
      _id: string;
      username: string;
      email: string;
      avatar_url: string;
    };
    starter_id?: string;
    creator?: {
      _id: string;
      username: string;
      email: string;
      avatar_url: string;
    };
    creator_id?: string;
    chain_id?: string;
  };
}

interface ReportsResponse {
  success: boolean;
  reports: BackendReport[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message: string;
}

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

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
  challenge: FileText,
  user: Users,
  chain: MessageSquare,
};

const getSeverity = (reportCount: number): "low" | "medium" | "high" => {
  if (reportCount >= 10) return "high";
  if (reportCount >= 5) return "medium";
  return "low";
};

const getTargetDisplay = (report: BackendReport): string => {
  const { target_type } = report._id;
  const { target } = report;
  
  if (target_type === "user") {
    return `User: @${target.username || target.email || "Unknown"}`;
  } else if (target_type === "chain") {
    return `Chain: ${target.title || "Untitled"}`;
  } else if (target_type === "challenge") {
    return `Challenge: ${target?.creator?.username || "Unknown"}`;
  }
  return "Unknown";
};

interface IndividualReport {
  _id: string;
  target_type: "user" | "chain" | "challenge";
  target_id: string;
  status: "pending" | "reviewed" | "actioned";
}

export default function Moderation() {
  const [reports, setReports] = useState<BackendReport[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "reviewed" | "actioned">("all");
  const [targetTypeFilter, setTargetTypeFilter] = useState<"all" | "user" | "chain" | "challenge">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const { toast: toastHook } = useToast();
  
  // Action dialog state
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<BackendReport | null>(null);
  const [selectedAction, setSelectedAction] = useState<"ignore" | "ban" | "mute" | "delete" | null>(null);
  const [notes, setNotes] = useState("");
  const [isTakingAction, setIsTakingAction] = useState(false);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(targetTypeFilter !== "all" && { target_type: targetTypeFilter }),
      });

      const response = await api.get(`/admin/reports?${params.toString()}`);
      const data: ReportsResponse = response.data;

      if (data.success) {
        setReports(data.reports);
        setPagination(data.pagination);
      } else {
        const errorMsg = data.message || "Failed to fetch reports";
        setError(errorMsg);
        toastHook({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        });
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to fetch reports";
      setError(errorMsg);
      toastHook({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      console.error("Error fetching reports:", err);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, statusFilter, targetTypeFilter, toastHook]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [statusFilter, targetTypeFilter]);

  const getFirstPendingReportId = async (targetType: string, targetId: string): Promise<string | null> => {
    try {
      // Fetch individual reports for this target to get a reportId
      const params = new URLSearchParams({
        target_type: targetType,
        status: "pending",
        limit: "1",
      });
      
      const response = await api.get(`/admin/reports?${params.toString()}`);
      
      return null; // Will need backend support
    } catch (err) {
      console.error("Error fetching report ID:", err);
      return null;
    }
  };

  const handleTakeAction = async (report: BackendReport, action: "ignore" | "ban" | "mute" | "delete") => {
    setSelectedReport(report);
    setSelectedAction(action);
    setNotes("");
    setActionDialogOpen(true);
  };

  const confirmTakeAction = async () => {
    if (!selectedReport || !selectedAction) return;

    setIsTakingAction(true);
    try {
      const targetType = selectedReport._id.target_type;
      const targetId = selectedReport._id.target_id;

      const response = await api.put(`/admin/reports/target/action`, {
        target_type: targetType,
        target_id: targetId,
        action: selectedAction,
        notes: notes || undefined,
      });

      if (response.data.success) {
        toastHook({
          title: "Success",
          description: response.data.message || "Action taken successfully",
        });
        setActionDialogOpen(false);
        setNotes("");
        // Refresh reports
        fetchReports();
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to take action";
      toastHook({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsTakingAction(false);
    }
  };

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
                <p className="text-2xl font-bold text-foreground">
                  {reports.filter((r) => r.group_status === "pending").length}
                </p>
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
                <div className="flex items-center gap-2">
                  <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
                    <SelectTrigger className="w-[120px] h-8 text-xs">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="actioned">Actioned</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={targetTypeFilter} onValueChange={(value) => setTargetTypeFilter(value as typeof targetTypeFilter)}>
                    <SelectTrigger className="w-[120px] h-8 text-xs">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="chain">Chain</SelectItem>
                      <SelectItem value="challenge">Challenge</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              }
            >
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : error ? (
                <div className="text-center py-12 text-destructive">{error}</div>
              ) : reports.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No reports found</div>
              ) : (
                <>
                  <div className="space-y-3">
                    {reports.map((report) => {
                      const TypeIcon = typeIcons[report._id.target_type];
                      const severity = getSeverity(report.report_count);
                      const targetDisplay = getTargetDisplay(report);
                      return (
                        <div
                          key={`${report._id.target_type}-${report._id.target_id}`}
                          className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <div
                            className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                              severityConfig[severity].bg
                            )}
                          >
                            <TypeIcon
                              className={cn("w-5 h-5", severityConfig[severity].color)}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p className="font-medium text-foreground truncate">
                                {targetDisplay}
                              </p>
                              <span
                                className={cn(
                                  "px-2 py-0.5 rounded text-xs font-medium shrink-0",
                                  statusConfig[report.group_status].bg,
                                  statusConfig[report.group_status].color
                                )}
                              >
                                {statusConfig[report.group_status].label}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {report.reasons.join(", ")} • {report.report_count} {report.report_count === 1 ? "report" : "reports"}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              {report.group_status === "pending" && (
                                <>
                                  {report._id.target_type === "user" && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-muted-foreground"
                                        onClick={() => handleTakeAction(report, "ignore")}
                                      >
                                        <X className="w-3.5 h-3.5 mr-1" />
                                        Ignore
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive"
                                        onClick={() => handleTakeAction(report, "ban")}
                                      >
                                        <Ban className="w-3.5 h-3.5 mr-1" />
                                        Ban
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-warning"
                                        onClick={() => handleTakeAction(report, "mute")}
                                      >
                                        <EyeOff className="w-3.5 h-3.5 mr-1" />
                                        Shadow Ban
                                      </Button>
                                    </>
                                  )}
                                  {(report._id.target_type === "chain" || report._id.target_type === "challenge") && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-muted-foreground"
                                        onClick={() => handleTakeAction(report, "ignore")}
                                      >
                                        <X className="w-3.5 h-3.5 mr-1" />
                                        Ignore
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-warning"
                                        onClick={() => handleTakeAction(report, "mute")}
                                      >
                                        <EyeOff className="w-3.5 h-3.5 mr-1" />
                                        Mute
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive"
                                        onClick={() => handleTakeAction(report, "delete")}
                                      >
                                        <XCircle className="w-3.5 h-3.5 mr-1" />
                                        Delete
                                      </Button>
                                    </>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatTimeAgo(report.last_reported_at)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {pagination.totalPages > 1 && (
                    <div className="mt-4">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() => {
                                if (pagination.page > 1) {
                                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
                                }
                              }}
                              className={cn(
                                pagination.page === 1 && "pointer-events-none opacity-50"
                              )}
                            />
                          </PaginationItem>
                          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => setPagination((prev) => ({ ...prev, page }))}
                                isActive={pagination.page === page}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext
                              onClick={() => {
                                if (pagination.page < pagination.totalPages) {
                                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
                                }
                              }}
                              className={cn(
                                pagination.page === pagination.totalPages && "pointer-events-none opacity-50"
                              )}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
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
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        */}
      </div>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedAction === "ignore" && "Ignore Report"}
              {selectedAction === "ban" && "Ban User"}
              {selectedAction === "mute" && selectedReport?._id.target_type === "user" && "Shadow Ban User"}
              {selectedAction === "mute" && selectedReport?._id.target_type !== "user" && "Mute Content"}
              {selectedAction === "delete" && "Delete Content"}
            </DialogTitle>
            <DialogDescription>
              {selectedAction === "ignore" && "This will mark the report as reviewed without taking any action."}
              {selectedAction === "ban" && "This will permanently ban the user from the platform."}
              {selectedAction === "mute" && selectedReport?._id.target_type === "user" && "This will shadow ban the user, limiting their visibility without notification."}
              {selectedAction === "mute" && selectedReport?._id.target_type !== "user" && "This will mute the content, limiting its visibility."}
              {selectedAction === "delete" && "This will permanently delete the content from the platform."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes about this action..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                {notes.length}/500 characters
              </p>
            </div>
            {selectedReport && (
              <div className="text-sm text-muted-foreground">
                <p>Target: {getTargetDisplay(selectedReport)}</p>
                <p>Reports: {selectedReport.report_count}</p>
                <p>Reasons: {selectedReport.reasons.join(", ")}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setActionDialogOpen(false);
                setNotes("");
              }}
              disabled={isTakingAction}
            >
              Cancel
            </Button>
            <Button
              variant={selectedAction === "delete" || selectedAction === "ban" ? "destructive" : "default"}
              onClick={confirmTakeAction}
              disabled={isTakingAction}
            >
              {isTakingAction ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
