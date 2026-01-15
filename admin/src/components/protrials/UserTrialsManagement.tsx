import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, Clock, Crown, XCircle, Eye, Calendar, ArrowUpRight } from "lucide-react";
import { useUserTrials } from "@/hooks/useUserTrials";
import type { Database } from "@/integrations/supabase/types";

type TrialStatus = Database["public"]["Enums"]["trial_status"];

const statusConfig: Record<TrialStatus, { label: string; color: string; icon: typeof Clock }> = {
  active: { label: "Active", color: "bg-success/10 text-success", icon: Clock },
  converted: { label: "Converted", color: "bg-primary/10 text-primary", icon: Crown },
  expired: { label: "Expired", color: "bg-muted text-muted-foreground", icon: XCircle },
  revoked: { label: "Revoked", color: "bg-destructive/10 text-destructive", icon: XCircle },
};

export function UserTrialsManagement() {
  const { trials, isLoading, extendTrial, convertToPro, revokeTrial } = useUserTrials();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredTrials = trials.filter((trial) => {
    const matchesSearch = trial.user_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || trial.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeTrials = trials.filter((t) => t.status === "active").length;
  const convertedUsers = trials.filter((t) => t.status === "converted").length;
  const expiredTrials = trials.filter((t) => t.status === "expired").length;
  const conversionRate = (convertedUsers + expiredTrials) > 0 
    ? ((convertedUsers / (convertedUsers + expiredTrials)) * 100) 
    : 0;

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    if (diff <= 0) return null;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return days > 0 ? `${days}d ${hours}h` : `${hours}h`;
  };

  const getFeaturesUsed = (features: unknown): string[] => {
    if (Array.isArray(features)) return features as string[];
    return [];
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Clock className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeTrials}</p>
                <p className="text-sm text-muted-foreground">Active Trials</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Crown className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{convertedUsers}</p>
                <p className="text-sm text-muted-foreground">Converted</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <XCircle className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{expiredTrials}</p>
                <p className="text-sm text-muted-foreground">Expired</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <ArrowUpRight className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{conversionRate.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div>
              <CardTitle>User Trials</CardTitle>
              <CardDescription>Manage individual user trial status</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by user ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="revoked">Revoked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTrials.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No trials found matching your criteria.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time Remaining</TableHead>
                  <TableHead>Features Used</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrials.map((trial) => {
                  const StatusIcon = statusConfig[trial.status].icon;
                  const timeRemaining = getTimeRemaining(trial.expires_at);
                  const features = getFeaturesUsed(trial.features_used);

                  return (
                    <TableRow key={trial.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {trial.user_id.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-xs font-mono">{trial.user_id.substring(0, 8)}...</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig[trial.status].color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig[trial.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {trial.status === "active" && timeRemaining ? (
                          <span className="font-medium">{timeRemaining}</span>
                        ) : trial.status === "converted" ? (
                          <span className="text-muted-foreground">Converted</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {features.slice(0, 2).map((feature) => (
                            <Badge key={feature} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                          {features.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{features.length - 2}
                            </Badge>
                          )}
                          {features.length === 0 && (
                            <span className="text-muted-foreground text-xs">None</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(trial.started_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg">
                            <DialogHeader>
                              <DialogTitle>User Trial Details</DialogTitle>
                              <DialogDescription>
                                Manage trial status for user {trial.user_id.substring(0, 8)}...
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12">
                                  <AvatarFallback>
                                    {trial.user_id.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium font-mono text-sm">{trial.user_id}</p>
                                </div>
                                <Badge className={`ml-auto ${statusConfig[trial.status].color}`}>
                                  {statusConfig[trial.status].label}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Trial Started</p>
                                  <p className="font-medium">{new Date(trial.started_at).toLocaleDateString()}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">
                                    {trial.status === "converted" ? "Converted On" : "Expires On"}
                                  </p>
                                  <p className="font-medium">
                                    {new Date(trial.converted_at || trial.expires_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              
                              <div>
                                <p className="text-sm text-muted-foreground mb-2">Features Used</p>
                                <div className="flex flex-wrap gap-2">
                                  {features.length > 0 ? (
                                    features.map((feature) => (
                                      <Badge key={feature} variant="secondary">
                                        {feature}
                                      </Badge>
                                    ))
                                  ) : (
                                    <span className="text-muted-foreground text-sm">No features used yet</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <DialogFooter className="flex-col sm:flex-row gap-2">
                              {trial.status === "active" && (
                                <>
                                  <Button
                                    variant="outline"
                                    onClick={() => extendTrial(trial.id, 3)}
                                  >
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Extend 3 Days
                                  </Button>
                                  <Button onClick={() => convertToPro(trial.id)}>
                                    <Crown className="w-4 h-4 mr-2" />
                                    Convert to Pro
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => revokeTrial(trial.id)}
                                  >
                                    Revoke Trial
                                  </Button>
                                </>
                              )}
                              {trial.status === "expired" && (
                                <>
                                  <Button
                                    variant="outline"
                                    onClick={() => extendTrial(trial.id, 3)}
                                  >
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Reactivate Trial
                                  </Button>
                                  <Button onClick={() => convertToPro(trial.id)}>
                                    <Crown className="w-4 h-4 mr-2" />
                                    Convert to Pro
                                  </Button>
                                </>
                              )}
                              {trial.status === "converted" && (
                                <Button variant="destructive" onClick={() => revokeTrial(trial.id)}>
                                  Downgrade User
                                </Button>
                              )}
                              {trial.status === "revoked" && (
                                <Button
                                  variant="outline"
                                  onClick={() => extendTrial(trial.id, 3)}
                                >
                                  <Calendar className="w-4 h-4 mr-2" />
                                  Reactivate Trial
                                </Button>
                              )}
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
