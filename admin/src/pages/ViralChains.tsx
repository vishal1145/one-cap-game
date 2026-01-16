import { useState, useEffect, useCallback } from "react";
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
  Loader2,
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { ChainTreeVisualization } from "@/components/dashboard/ChainTreeVisualization";
import { cn } from "@/lib/utils";
import api from "@/api/client";
import { useToast } from "@/hooks/use-toast";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface BackendChain {
  _id: string;
  title: string;
  starter_id: {
    _id: string;
    username?: string;
  };
  visibility: "public" | "friends" | "private";
  status: "active" | "expired" | "muted";
  expires_at: string;
  total_challenges: number;
  total_participants: number;
  growth_velocity: number;
  is_muted: boolean;
  muted_reason?: string;
  muted_by?: string;
  createdAt: string;
  updatedAt: string;
}

interface ChainsResponse {
  success: boolean;
  chains: {
    chains: BackendChain[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  message: string;
}

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
  expired: { label: "Expired", color: "text-muted-foreground", bg: "bg-muted" },
  muted: { label: "Muted", color: "text-warning", bg: "bg-warning/10" },
};

const visibilityConfig = {
  public: { label: "Public", icon: "🌐" },
  friends: { label: "Friends", icon: "👥" },
  private: { label: "Private", icon: "🔒" },
};

const getInitials = (username?: string) => {
  if (username) {
    return username.substring(0, 2).toUpperCase();
  }
  return "??";
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

export default function ViralChains() {
  const [searchQuery, setSearchQuery] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [chains, setChains] = useState<BackendChain[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchChains = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(visibilityFilter && { visibility: visibilityFilter }),
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await api.get(`/admin/chains?${params.toString()}`);
      const data: ChainsResponse = response.data;

      if (data.success) {
        setChains(data.chains.chains);
        setPagination(data.chains.pagination);
        // toast({
        //   title: "Chains loaded",
        //   description: data.message || "Chains fetched successfully",
        // });
      } else {
        const errorMsg = data.message || "Failed to fetch chains";
        setError(errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        });
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to fetch chains";
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      console.error("Error fetching chains:", err);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, visibilityFilter, searchQuery, toast]);

  useEffect(() => {
    fetchChains();
  }, [fetchChains]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        // fetchChains will be called via the main useEffect
      } else {
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, page]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Calculate stats from chains
  const stats = {
    activeChains: chains.filter((c) => c.status === "active").length,
    totalParticipants: chains.reduce((sum, c) => sum + c.total_participants, 0),
    avgDepth: chains.length > 0
      ? Math.round((chains.reduce((sum, c) => sum + c.total_participants, 0) / chains.length) * 10) / 10
      : 0,
    avgVelocity: chains.length > 0
      ? Math.round((chains.reduce((sum, c) => sum + c.growth_velocity, 0) / chains.length) * 10) / 10
      : 0,
  };

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
                <p className="text-2xl font-bold text-foreground">
                  {stats.activeChains.toLocaleString()}
                </p>
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
                <p className="text-2xl font-bold text-foreground">
                  {stats.totalParticipants.toLocaleString()}
                </p>
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
                <p className="text-2xl font-bold text-foreground">{stats.avgDepth}</p>
                <p className="text-sm text-muted-foreground">Avg Participants</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.avgVelocity}/hr</p>
                <p className="text-sm text-muted-foreground">Avg Growth Velocity</p>
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
            <Select
              value={visibilityFilter || "all"}
              onValueChange={(value) => setVisibilityFilter(value === "all" ? "" : value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Visibility</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="friends">Friends</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Chains Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {chains.length === 0 && !isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              No chains found
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr className="bg-muted/30">
                      <th>Chain ID</th>
                      <th>Title</th>
                      <th>Starter</th>
                      <th>Participants</th>
                      <th>Challenges</th>
                      <th>Visibility</th>
                      <th>Velocity</th>
                      <th>Status</th>
                      <th>Started</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {chains.map((chain) => (
                      <tr key={chain._id} className="group">
                        <td>
                          <span className="font-mono font-medium text-primary">
                            #{chain._id.substring(chain._id.length - 6)}
                          </span>
                        </td>
                        <td>
                          <span className="font-medium text-foreground truncate max-w-[200px] block">
                            {chain.title}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-xs">
                              {getInitials(chain.starter_id?.username)}
                            </div>
                            <span className="font-medium text-foreground">
                              {chain.starter_id?.username || "Unknown"}
                            </span>
                          </div>
                        </td>
                        <td className="font-bold text-foreground">
                          {chain.total_participants.toLocaleString()}
                        </td>
                        <td className="font-medium">
                          {chain.total_challenges}
                        </td>
                        <td>
                          <span className="text-sm">
                            {visibilityConfig[chain.visibility]?.icon}{" "}
                            {visibilityConfig[chain.visibility]?.label}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <TrendingUp
                              className={cn(
                                "w-4 h-4",
                                chain.growth_velocity > 30
                                  ? "text-accent"
                                  : chain.growth_velocity > 15
                                  ? "text-success"
                                  : "text-muted-foreground"
                              )}
                            />
                            <span className="font-medium">{chain.growth_velocity}/hr</span>
                          </div>
                        </td>
                        <td>
                          <span
                            className={cn(
                              "inline-flex px-2 py-1 rounded text-xs font-medium",
                              statusConfig[chain.status]?.bg || "bg-muted",
                              statusConfig[chain.status]?.color || "text-muted-foreground"
                            )}
                          >
                            {statusConfig[chain.status]?.label || chain.status}
                          </span>
                        </td>
                        <td className="text-muted-foreground text-sm">
                          {formatTimeAgo(chain.createdAt)}
                        </td>
                        <td>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon-sm" title="View Chain">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                            {chain.status === "active" ? (
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="text-warning"
                                title="Mute"
                              >
                                <Pause className="w-4 h-4" />
                              </Button>
                            ) : chain.status === "muted" ? (
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="text-success"
                                title="Unmute"
                              >
                                <Play className="w-4 h-4" />
                              </Button>
                            ) : null}
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
                      {pagination.total} chains
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
    </AdminLayout>
  );
}
