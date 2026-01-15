import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, Search, Filter, Download, Eye, Clock, User, Settings, Crown, AlertTriangle, CheckCircle, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useTrialAuditLog } from "@/hooks/useTrialAuditLog";

const actionConfig: Record<string, { label: string; icon: typeof Clock; color: string }> = {
  trial_extended: { label: "Trial Extended", icon: Clock, color: "text-primary" },
  trial_started: { label: "Trial Started", icon: CheckCircle, color: "text-success" },
  trial_revoked: { label: "Trial Revoked", icon: AlertTriangle, color: "text-destructive" },
  user_converted: { label: "User Converted", icon: Crown, color: "text-success" },
  config_updated: { label: "Config Updated", icon: Settings, color: "text-warning" },
  message_updated: { label: "Message Updated", icon: FileText, color: "text-accent" },
  experiment_started: { label: "Experiment Started", icon: Shield, color: "text-primary" },
  experiment_concluded: { label: "Experiment Concluded", icon: CheckCircle, color: "text-success" },
};

const categoryFromAction = (action: string): string => {
  if (action.startsWith("trial_")) return "trial";
  if (action.startsWith("config_") || action.startsWith("message_")) return "config";
  if (action.startsWith("user_")) return "user";
  if (action.startsWith("experiment_")) return "experiment";
  return "other";
};

const categoryConfig: Record<string, { label: string; color: string }> = {
  trial: { label: "Trial", color: "bg-primary/10 text-primary" },
  config: { label: "Config", color: "bg-warning/10 text-warning" },
  user: { label: "User", color: "bg-success/10 text-success" },
  experiment: { label: "Experiment", color: "bg-accent/10 text-accent" },
  other: { label: "Other", color: "bg-muted text-muted-foreground" },
};

export function ComplianceLog() {
  const { logs, isLoading } = useTrialAuditLog();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filteredLogs = logs.filter((entry) => {
    const category = categoryFromAction(entry.action);
    const matchesSearch = 
      entry.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.performed_by?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.user_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      JSON.stringify(entry.details).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleExport = () => {
    const data = JSON.stringify(filteredLogs, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trial-audit-log-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Export complete",
      description: "Audit log has been downloaded.",
    });
  };

  const formatTimestamp = (date: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const trialActions = logs.filter((e) => categoryFromAction(e.action) === "trial").length;
  const configChanges = logs.filter((e) => categoryFromAction(e.action) === "config").length;
  const userActions = logs.filter((e) => categoryFromAction(e.action) === "user").length;

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
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{logs.length}</p>
                <p className="text-sm text-muted-foreground">Total Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Clock className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{trialActions}</p>
                <p className="text-sm text-muted-foreground">Trial Actions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Settings className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{configChanges}</p>
                <p className="text-sm text-muted-foreground">Config Changes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <User className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{userActions}</p>
                <p className="text-sm text-muted-foreground">User Actions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Notice */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Compliance & Transparency</h3>
              <p className="text-sm text-muted-foreground">
                All trial-related state changes are logged for compliance and reporting purposes. 
                Trial messaging is visible in-app to ensure transparency with users. 
                Export audit logs for external compliance reviews.
              </p>
            </div>
            <Button variant="outline" onClick={handleExport} className="shrink-0">
              <Download className="w-4 h-4 mr-2" />
              Export Logs
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div>
              <CardTitle>Audit Log</CardTitle>
              <CardDescription>Complete history of trial-related actions</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-36">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="config">Config</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="experiment">Experiment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No audit logs found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Affected User</TableHead>
                  <TableHead>Performed By</TableHead>
                  <TableHead className="text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((entry) => {
                  const config = actionConfig[entry.action] || { label: entry.action, icon: Shield, color: "text-foreground" };
                  const Icon = config.icon;
                  const category = categoryFromAction(entry.action);

                  return (
                    <TableRow key={entry.id}>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatTimestamp(entry.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${config.color}`} />
                          <span className="font-medium">{config.label}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={categoryConfig[category].color}>
                          {categoryConfig[category].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {entry.user_id ? (
                          <span className="text-sm font-mono">{entry.user_id.substring(0, 8)}...</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-mono">{entry.performed_by?.substring(0, 8) || "system"}...</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Action Details</DialogTitle>
                              <DialogDescription>
                                {config.label} - {formatTimestamp(entry.created_at)}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Action</p>
                                  <p className="font-medium">{config.label}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Category</p>
                                  <Badge className={categoryConfig[category].color}>
                                    {categoryConfig[category].label}
                                  </Badge>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Performed By</p>
                                  <p className="font-medium font-mono">{entry.performed_by || "system"}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">IP Address</p>
                                  <p className="font-medium font-mono">{entry.ip_address || "N/A"}</p>
                                </div>
                                {entry.user_id && (
                                  <div className="col-span-2">
                                    <p className="text-muted-foreground">Affected User</p>
                                    <p className="font-medium font-mono">{entry.user_id}</p>
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground mb-2">Details</p>
                                <pre className="bg-muted p-3 rounded-lg text-sm overflow-auto">
                                  {JSON.stringify(entry.details, null, 2)}
                                </pre>
                              </div>
                            </div>
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
