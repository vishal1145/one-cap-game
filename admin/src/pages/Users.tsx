import { useState, useEffect, useCallback } from "react";
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
  Loader2,
  CheckCircle2,
  X,
  Clock,
  Eye,
  Ban,
} from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import api from "@/api/client";

interface BackendUser {
  _id: string;
  username?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  auth_provider: "phone" | "google" | "apple";
  role: "user" | "admin";
  status: "active" | "banned" | "shadow_banned";
  chains?: Array<{ _id: string; title?: string }>;
  challenges?: Array<{ _id: string }>;
  reports?: number;
  subscription?: string;
  last_login_at?: string;
  createdAt: string;
  updatedAt: string;
}

interface UsersResponse {
  success: boolean;
  users: BackendUser[];
  stats: {
    total: number;
    active: number;
    banned: number;
    shadow_banned: number;
  };
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message: string;
}

const statusConfig = {
  active: { label: "Active", color: "text-success", bg: "bg-success/10", icon: CheckCircle2 },
  banned: { label: "Banned", color: "text-destructive", bg: "bg-destructive/10", icon: X },
  shadow_banned: { label: "Shadow_banned", color: "text-warning", bg: "bg-warning/10", icon: Clock },
};

const getInitials = (username?: string, email?: string) => {
  if (username) {
    return username.substring(0, 2).toUpperCase();
  }
  if (email) {
    return email.substring(0, 2).toUpperCase();
  }
  return "??";
};

export default function Users() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [roleFilter, setRoleFilter] = useState<string>("user");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [stats, setStats] = useState<UsersResponse["stats"]>({
    total: 0,
    active: 0,
    banned: 0,
    shadow_banned: 0,
  });
  const [pagination, setPagination] = useState<UsersResponse["pagination"]>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    userId: string;
    action: "ban" | "shadow" | "unban" | null;
    userName: string;
  }>({
    open: false,
    userId: "",
    action: null,
    userName: "",
  });

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        role: roleFilter,
        ...(statusFilter && { status: statusFilter }),
        ...(debouncedSearchQuery && { search: debouncedSearchQuery }),
      });

      const response = await api.get(`/admin/users?${params.toString()}`);
      const data: UsersResponse = response.data;

      if (data.success) {
        setUsers(data.users);
        setStats(data.stats);
        setPagination(data.pagination);
        // toast({
        //   title: "Users loaded",
        //   description: data.message || "Users fetched successfully",
        // });
      } else {
        const errorMsg = data.message || "Failed to fetch users";
        setError(errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        });
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to fetch users";
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      console.error("Error fetching users:", err);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, roleFilter, statusFilter, debouncedSearchQuery, toast]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      // Reset to page 1 when search changes
      if (page !== 1) {
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleStatusChange = async (userId: string, newStatus: "active" | "banned" | "shadow_banned") => {
    try {
      const response = await api.put(`/admin/users/${userId}/status`, {
        status: newStatus,
      });
      
      if (response.data.success) {
        toast({
          title: "Status updated",
          description: response.data.message || "User status updated successfully",
        });
        // Refresh users list
        fetchUsers();
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Failed to update user status",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to update user status";
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      console.error("Error updating user status:", err);
    }
    setConfirmDialog({ open: false, userId: "", action: null, userName: "" });
  };

  const openConfirmDialog = (userId: string, action: "ban" | "shadow" | "unban", userName: string) => {
    setConfirmDialog({ open: true, userId, action, userName });
  };

  return (
    <AdminLayout>
      <AdminHeader
        title="User Management"
        subtitle="Manage users and segments"
      />

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-4 hover:border-primary/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.total.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 hover:border-success/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.active.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 hover:border-destructive/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.banned.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Banned</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 hover:border-warning/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.shadow_banned.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Shadow Banned</p>
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

          </div>
          <div className="flex items-center gap-2">
            <Select
              value={statusFilter || "all"}
              onValueChange={(value) => setStatusFilter(value === "all" ? "" : value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
                <SelectItem value="shadow_banned">Shadow Banned</SelectItem>
              </SelectContent>
            </Select>
            {/* <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline">
              Bulk Actions
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button> */}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {users.length === 0 && !isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              No users found
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr className="bg-muted/30">
                      <th>User</th>
                      <th>Status</th>
                      <th>Challenges</th>
                      <th>Reports</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id} className="group">
                        <td>
                          <div className="flex items-center gap-3">
                            {user.avatar_url ? (
                              <img
                                src={user.avatar_url}
                                alt={user.username || user.email || "User"}
                                className="w-9 h-9 rounded-full object-cover shrink-0"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                                {getInitials(user.username, user.email)}
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-foreground">
                                {user.username || user.email || user.phone || "N/A"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {user.email || user.phone || "—"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          {(() => {
                            const config = statusConfig[user.status];
                            const Icon = config?.icon;
                            return (
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium",
                                  config?.bg || "bg-muted",
                                  config?.color || "text-muted-foreground"
                                )}
                              >
                                {Icon && <Icon className="w-3 h-3" />}
                                {config?.label || user.status}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="font-medium">
                          {user.challenges?.length || 0}
                        </td>
                        <td className="font-medium">
                          {user.reports || 0}
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            {user.status === "active" ? (
                              <>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => openConfirmDialog(user._id, "ban", user.username || user.email || "User")}
                                  className="h-7 text-xs"
                                >
                                  <Ban className="w-3 h-3" />
                                  Ban
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openConfirmDialog(user._id, "shadow", user.username || user.email || "User")}
                                  className="h-7 text-xs border-warning text-warning hover:bg-warning/10"
                                >
                                  <Clock className="w-3 h-3" />
                                  Shadow
                                </Button>
                                {/* <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs"
                                >
                                  <Eye className="w-3 h-3" />
                                  View
                                </Button> */}
                              </>
                            ) : (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openConfirmDialog(user._id, "unban", user.username || user.email || "User")}
                                  className="h-7 text-xs border-success text-success hover:bg-success/10"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  Unban
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs"
                                >
                                  <Eye className="w-3 h-3" />
                                  View
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="border-t border-border p-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                      {pagination.total} users
                    </div>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (pagination.page > 1) {
                                handlePageChange(pagination.page - 1);
                              }
                            }}
                            className={cn(
                              pagination.page === 1 && "pointer-events-none opacity-50"
                            )}
                          />
                        </PaginationItem>

                        {(() => {
                          const pages: (number | "ellipsis")[] = [];
                          const maxVisible = 7;
                          const { page, totalPages } = pagination;

                          if (totalPages <= maxVisible) {
                            for (let i = 1; i <= totalPages; i++) {
                              pages.push(i);
                            }
                          } else {
                            pages.push(1);

                            if (page > 3) {
                              pages.push("ellipsis");
                            }

                            const start = Math.max(2, page - 1);
                            const end = Math.min(totalPages - 1, page + 1);

                            for (let i = start; i <= end; i++) {
                              pages.push(i);
                            }

                            if (page < totalPages - 2) {
                              pages.push("ellipsis");
                            }

                            pages.push(totalPages);
                          }

                          return pages.map((p, index) => {
                            if (p === "ellipsis") {
                              return (
                                <PaginationItem key={`ellipsis-${index}`}>
                                  <PaginationEllipsis />
                                </PaginationItem>
                              );
                            }

                            return (
                              <PaginationItem key={p}>
                                <PaginationLink
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handlePageChange(p);
                                  }}
                                  isActive={page === p}
                                >
                                  {p}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          });
                        })()}

                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (pagination.page < pagination.totalPages) {
                                handlePageChange(pagination.page + 1);
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
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.action === "ban" && "Ban User"}
              {confirmDialog.action === "shadow" && "Shadow Ban User"}
              {confirmDialog.action === "unban" && "Unban User"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.action === "ban" && (
                <>Are you sure you want to ban <strong>{confirmDialog.userName}</strong>? This action will restrict their access to the platform.</>
              )}
              {confirmDialog.action === "shadow" && (
                <>Are you sure you want to shadow ban <strong>{confirmDialog.userName}</strong>? This will limit their visibility without their knowledge.</>
              )}
              {confirmDialog.action === "unban" && (
                <>Are you sure you want to unban <strong>{confirmDialog.userName}</strong>? This will restore their access to the platform.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDialog.action === "ban") {
                  handleStatusChange(confirmDialog.userId, "banned");
                } else if (confirmDialog.action === "shadow") {
                  handleStatusChange(confirmDialog.userId, "shadow_banned");
                } else if (confirmDialog.action === "unban") {
                  handleStatusChange(confirmDialog.userId, "active");
                }
              }}
              className={cn(
                confirmDialog.action === "ban" && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                confirmDialog.action === "shadow" && "bg-warning text-warning-foreground hover:bg-warning/90",
                confirmDialog.action === "unban" && "bg-success text-success-foreground hover:bg-success/90"
              )}
            >
              {confirmDialog.action === "ban" && "Ban User"}
              {confirmDialog.action === "shadow" && "Shadow Ban"}
              {confirmDialog.action === "unban" && "Unban User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
