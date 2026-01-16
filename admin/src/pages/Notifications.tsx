import { useState, useEffect, useCallback } from "react";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  Filter,
  CheckCheck,
  Trash2,
  Loader2,
} from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import api from "@/api/client";

interface BackendNotification {
  _id: string;
  title: string;
  message: string;
  type: "success" | "warning" | "info" | "error";
  category: "system" | "user" | "moderation" | "analytics";
  read: boolean;
  read_at: string | null;
  recipient_id: string | null;
  related_entity_type: string | null;
  related_entity_id: string | null;
  createdAt: string;
  updatedAt: string;
}

interface NotificationsResponse {
  success: boolean;
  notifications: BackendNotification[];
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

const typeConfig = {
  success: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10", border: "border-success/20" },
  warning: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10", border: "border-warning/20" },
  info: { icon: Info, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
  error: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/20" },
};

const categoryConfig = {
  system: "System",
  user: "User",
  moderation: "Moderation",
  analytics: "Analytics",
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<BackendNotification[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filter !== "all" && filter !== "unread" && { category: filter }),
        ...(filter === "unread" && { read: "false" }),
      });

      const response = await api.get(`/admin/notifications?${params.toString()}`);
      const data: NotificationsResponse = response.data;

      if (data.success) {
        setNotifications(data.notifications);
        setPagination(data.pagination);
      } else {
        const errorMsg = data.message || "Failed to fetch notifications";
        setError(errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        });
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to fetch notifications";
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      console.error("Error fetching notifications:", err);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, filter, toast]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setPagination((prev) => {
      if (prev.page !== 1) {
        return { ...prev, page: 1 };
      }
      return prev;
    });
  }, [filter]);

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.read;
    return notification.category === filter;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await api.put(`/admin/notifications/${id}`, { read: true });
      const data = response.data;

      if (data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, read: true } : n))
        );
        toast({
          title: "Success",
          description: "Notification marked as read",
        });
        fetchNotifications();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to mark notification as read",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to mark notification as read";
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      console.error("Error marking notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsMarkingAllRead(true);
    try {
      const params = new URLSearchParams();
      if (filter !== "all" && filter !== "unread") {
        params.append("category", filter);
      }

      const response = await api.put(`/admin/notifications/mark-all-read?${params.toString()}`);
      const data = response.data;

      if (data.success) {
        toast({
          title: "Success",
          description: data.message || "All notifications marked as read",
        });
        fetchNotifications();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to mark all notifications as read",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to mark all notifications as read";
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      console.error("Error marking all notifications as read:", err);
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await api.delete(`/admin/notifications/${id}`);
      const data = response.data;

      if (data.success) {
        toast({
          title: "Success",
          description: "Notification deleted",
        });
        fetchNotifications();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete notification",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to delete notification";
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      console.error("Error deleting notification:", err);
    }
  };

  const handleDeleteAll = async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== "all" && filter !== "unread") {
        params.append("category", filter);
      }

      const response = await api.delete(`/admin/notifications?${params.toString()}`);
      const data = response.data;

      if (data.success) {
        toast({
          title: "Success",
          description: data.message || "All notifications deleted",
        });
        fetchNotifications();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete all notifications",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to delete all notifications";
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      console.error("Error deleting all notifications:", err);
    }
  };

  return (
    <AdminLayout>
      <AdminHeader
        title="Notifications"
        subtitle="Stay updated with system alerts and activities"
      />

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {pagination.total.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {unreadCount.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Unread</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {notifications.filter((n) => n.read).length.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Read</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {notifications.filter((n) => n.type === "error" || n.type === "warning").length.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Alerts</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter notifications" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Notifications</SelectItem>
                <SelectItem value="unread">Unread Only</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="moderation">Moderation</SelectItem>
                <SelectItem value="analytics">Analytics</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAllRead || unreadCount === 0}
            >
              {isMarkingAllRead ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Marking...
                </>
              ) : (
                <>
                  <CheckCheck className="w-4 h-4 mr-2" />
                  Mark All Read
                </>
              )}
            </Button>
            {notifications.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteAll}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Notifications List */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground mb-2">No notifications</p>
              <p className="text-sm text-muted-foreground">
                {filter === "all"
                  ? "You're all caught up!"
                  : `No ${filter === "unread" ? "unread" : filter} notifications`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredNotifications.map((notification) => {
                const TypeIcon = typeConfig[notification.type].icon;
                return (
                  <div
                    key={notification._id}
                    className={cn(
                      "p-4 hover:bg-muted/30 transition-colors group",
                      !notification.read && "bg-primary/5"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                          typeConfig[notification.type].bg,
                          typeConfig[notification.type].border,
                          "border"
                        )}
                      >
                        <TypeIcon
                          className={cn("w-5 h-5", typeConfig[notification.type].color)}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-foreground">
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <span className="w-2 h-2 bg-primary rounded-full" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>{formatTimeAgo(notification.createdAt)}</span>
                              <span>•</span>
                              <span className="capitalize">
                                {categoryConfig[notification.category]}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleMarkAsRead(notification._id)}
                                className="h-7 w-7"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleDelete(notification._id)}
                              className="h-7 w-7 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
