import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  Upload,
  Loader2,
} from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import api from "@/api/client";

interface BackendStatement {
  _id: string;
  text: string;
  type: "truth" | "cap";
  category: string;
  difficulty: "easy" | "medium" | "hard";
  status: "draft" | "live" | "retired";
  views: number;
  correct_guesses: number;
  wrong_guesses: number;
  created_by?: {
    _id: string;
    username?: string;
    email?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface StatementsResponse {
  success: boolean;
  statements: BackendStatement[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message: string;
}

interface CreateStatementResponse {
  success: boolean;
  statement: BackendStatement;
  message: string;
}

const statusConfig = {
  draft: { icon: Clock, color: "text-warning", bg: "bg-warning/10" },
  live: { icon: CheckCircle, color: "text-success", bg: "bg-success/10" },
  retired: { icon: AlertTriangle, color: "text-muted-foreground", bg: "bg-muted" },
};

const difficultyColors = {
  easy: "bg-success/10 text-success",
  medium: "bg-warning/10 text-warning",
  hard: "bg-destructive/10 text-destructive",
};

export default function Statements() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    category: "all",
    type: "all",
    difficulty: "all",
    status: "all",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingStatementId, setEditingStatementId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statements, setStatements] = useState<BackendStatement[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    text: "",
    type: "cap" as "truth" | "cap",
    category: "",
    difficulty: "easy" as "easy" | "medium" | "hard",
    status: "live" as "draft" | "live" | "retired",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingStatement, setIsLoadingStatement] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statementToDelete, setStatementToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchStatements = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(debouncedSearchQuery && { search: debouncedSearchQuery }),
        ...(filters.category && filters.category !== "all" && { category: filters.category }),
        ...(filters.type && filters.type !== "all" && { type: filters.type }),
        ...(filters.difficulty && filters.difficulty !== "all" && { difficulty: filters.difficulty }),
        ...(filters.status && filters.status !== "all" && { status: filters.status }),
      });

      const response = await api.get(`/admin/statements?${params.toString()}`);
      const data: StatementsResponse = response.data;

      if (data.success) {
        setStatements(data.statements);
        setPagination(data.pagination);
      } else {
        const errorMsg = data.message || "Failed to fetch statements";
        setError(errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        });
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to fetch statements";
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      console.error("Error fetching statements:", err);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearchQuery, filters, toast]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      // Reset to page 1 when search changes
      setPagination((prev) => {
        if (prev.page !== 1) {
          return { ...prev, page: 1 };
        }
        return prev;
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPagination((prev) => {
      if (prev.page !== 1) {
        return { ...prev, page: 1 };
      }
      return prev;
    });
  }, [filters]);

  useEffect(() => {
    fetchStatements();
  }, [fetchStatements]);

  const fetchStatementById = async (statementId: string) => {
    setIsLoadingStatement(true);
    try {
      const response = await api.get(`/admin/statements/${statementId}`);
      const data = response.data;

      if (data.success && data.statement) {
        const statement = data.statement;
        setFormData({
          text: statement.text || "",
          type: statement.type || "cap",
          category: statement.category || "",
          difficulty: statement.difficulty || "easy",
          status: statement.status || "live",
        });
        setIsEditMode(true);
        setEditingStatementId(statementId);
        setIsDialogOpen(true);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch statement",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to fetch statement";
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      console.error("Error fetching statement:", err);
    } finally {
      setIsLoadingStatement(false);
    }
  };

  const handleEditClick = (statementId: string) => {
    fetchStatementById(statementId);
  };

  const handleCreateStatement = async () => {
    if (!formData.text.trim() || !formData.category.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let response;
      if (isEditMode && editingStatementId) {
        // Update existing statement
        response = await api.put(`/admin/statements/${editingStatementId}`, formData);
      } else {
        // Create new statement
        response = await api.post("/admin/statements", formData);
      }

      const data: CreateStatementResponse = response.data;

      if (data.success) {
        toast({
          title: "Success",
          description: data.message || (isEditMode ? "Statement updated successfully" : "Statement created successfully"),
        });
        setIsDialogOpen(false);
        resetForm();
        fetchStatements();
      } else {
        toast({
          title: "Error",
          description: data.message || (isEditMode ? "Failed to update statement" : "Failed to create statement"),
          variant: "destructive",
        });
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || (isEditMode ? "Failed to update statement" : "Failed to create statement");
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      console.error(`Error ${isEditMode ? "updating" : "creating"} statement:`, err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateAccuracy = (correct: number, wrong: number) => {
    const total = correct + wrong;
    if (total === 0) return 0;
    return Math.round((correct / total) * 100);
  };

  const resetForm = () => {
    setFormData({
      text: "",
      type: "cap",
      category: "",
      difficulty: "easy",
      status: "live",
    });
    setIsEditMode(false);
    setEditingStatementId(null);
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const handleDeleteClick = (statementId: string) => {
    setStatementToDelete(statementId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!statementToDelete) return;

    setIsDeleting(true);
    try {
      const response = await api.delete(`/admin/statements/${statementToDelete}`);
      const data = response.data;

      if (data.success) {
        toast({
          title: "Success",
          description: data.message || "Statement deleted successfully",
        });
        setDeleteDialogOpen(false);
        setStatementToDelete(null);
        fetchStatements();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete statement",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to delete statement";
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      console.error("Error deleting statement:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminLayout>
      <AdminHeader
        title="Statements"
        subtitle="Manage truth and cap content"
      />

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground">Total Statements</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {pagination.total.toLocaleString()}
            </p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground">Live</p>
            <p className="text-2xl font-bold text-success mt-1">
              {statements.filter((s) => s.status === "live").length.toLocaleString()}
            </p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground">Draft</p>
            <p className="text-2xl font-bold text-warning mt-1">
              {statements.filter((s) => s.status === "draft").length.toLocaleString()}
            </p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground">Avg Accuracy</p>
            <p className="text-2xl font-bold text-primary mt-1">
              {statements.length > 0
                ? Math.round(
                  statements.reduce(
                    (sum, s) =>
                      sum + calculateAccuracy(s.correct_guesses, s.wrong_guesses),
                    0
                  ) / statements.length
                )
                : 0}
              %
            </p>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search statements..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  {/* <Label htmlFor="filter-category" className="text-sm whitespace-nowrap">
                    Category:
                  </Label> */}
                  <Select
                    value={filters.category || "all"}
                    onValueChange={(value) =>
                      setFilters({ ...filters, category: value })
                    }
                  >
                    <SelectTrigger id="filter-category" className="w-[150px]">
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      <SelectItem value="history">History</SelectItem>
                      <SelectItem value="entertainment">Entertainment</SelectItem>
                      <SelectItem value="relationship">Relationship</SelectItem>
                      <SelectItem value="science">Science</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  {/* <Label htmlFor="filter-type" className="text-sm whitespace-nowrap">
                    Type:
                  </Label> */}
                  <Select
                    value={filters.type || "all"}
                    onValueChange={(value) =>
                      setFilters({ ...filters, type: value })
                    }
                  >
                    <SelectTrigger id="filter-type" className="w-[130px]">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="truth">Truth</SelectItem>
                      <SelectItem value="cap">Cap</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  {/* <Label htmlFor="filter-difficulty" className="text-sm whitespace-nowrap">
                    Difficulty:
                  </Label> */}
                  <Select
                    value={filters.difficulty || "all"}
                    onValueChange={(value) =>
                      setFilters({ ...filters, difficulty: value })
                    }
                  >
                    <SelectTrigger id="filter-difficulty" className="w-[130px]">
                      <SelectValue placeholder="All difficulties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All difficulties</SelectItem>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  {/* <Label htmlFor="filter-status" className="text-sm whitespace-nowrap">
                    Status:
                  </Label> */}
                  <Select
                    value={filters.status || "all"}
                    onValueChange={(value) =>
                      setFilters({ ...filters, status: value })
                    }
                  >
                    <SelectTrigger id="filter-status" className="w-[130px]">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="live">Live</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(filters.category !== "all" || filters.type !== "all" || filters.difficulty !== "all" || filters.status !== "all") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters({ category: "all", type: "all", difficulty: "all", status: "all" })}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
             <div className="flex items-center gap-2">
               <Button onClick={() => {
                 resetForm();
                 setIsDialogOpen(true);
               }}>
                 <Plus className="w-4 h-4 mr-2" />
                 Add Statement
               </Button>
             </div>
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
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : statements.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              No statements found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr className="bg-muted/30">
                    <th className="w-[40%]">Statement</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Difficulty</th>
                    <th>Status</th>
                    <th>Views</th>
                    <th>Accuracy</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {statements.map((statement) => {
                    const StatusIcon = statusConfig[statement.status].icon;
                    const accuracy = calculateAccuracy(
                      statement.correct_guesses,
                      statement.wrong_guesses
                    );
                    return (
                      <tr key={statement._id} className="group">
                        <td>
                          <p className="font-medium text-foreground line-clamp-2">
                            {statement.text}
                          </p>
                        </td>
                        <td>
                          <span
                            className={cn(
                              "inline-flex px-2 py-1 rounded text-xs font-semibold uppercase",
                              statement.type === "truth"
                                ? "bg-success/10 text-success"
                                : "bg-accent/10 text-accent"
                            )}
                          >
                            {statement.type}
                          </span>
                        </td>
                        <td className="text-muted-foreground">
                          {statement.category}
                        </td>
                        <td>
                          <span
                            className={cn(
                              "inline-flex px-2 py-1 rounded text-xs font-medium capitalize",
                              difficultyColors[statement.difficulty]
                            )}
                          >
                            {statement.difficulty}
                          </span>
                        </td>
                        <td>
                          <div
                            className={cn(
                              "inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium capitalize",
                              statusConfig[statement.status].bg,
                              statusConfig[statement.status].color
                            )}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {statement.status}
                          </div>
                        </td>
                        <td className="font-medium">
                          {statement.views.toLocaleString()}
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${accuracy}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {accuracy}%
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {/* <Button variant="ghost" size="icon-sm">
                              <Eye className="w-4 h-4" />
                            </Button> */}
                            <Button 
                              variant="ghost" 
                              size="icon-sm"
                              onClick={() => handleEditClick(statement._id)}
                              disabled={isLoadingStatement}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-destructive"
                              onClick={() => handleDeleteClick(statement._id)}
                              disabled={isDeleting}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Statement Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Statement" : "Create New Statement"}</DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? "Update the statement details below"
                : "Add a new truth or cap statement to the database"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Statement Text */}
            <div className="space-y-2">
              <Label htmlFor="text">
                Statement Text <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="text"
                placeholder="Enter the statement text (max 300 characters)"
                value={formData.text}
                onChange={(e) =>
                  setFormData({ ...formData, text: e.target.value })
                }
                maxLength={300}
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {formData.text.length}/300 characters
              </p>
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label>
                Type <span className="text-destructive">*</span>
              </Label>
              <RadioGroup
                value={formData.type}
                onValueChange={(value: "truth" | "cap") =>
                  setFormData({ ...formData, type: value as "truth" | "cap" })
                }
                className="flex gap-6"
                disabled={isLoadingStatement}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="truth" id="truth" />
                  <Label htmlFor="truth" className="font-normal cursor-pointer">
                    Truth
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cap" id="cap" />
                  <Label htmlFor="cap" className="font-normal cursor-pointer">
                    Cap
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
                disabled={isLoadingStatement}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="history">History</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="relationship">Relationship</SelectItem>
                  <SelectItem value="science">Science</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <Label htmlFor="difficulty">
                Difficulty <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value: "easy" | "medium" | "hard") =>
                  setFormData({ ...formData, difficulty: value })
                }
                disabled={isLoadingStatement}
              >
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "draft" | "live" | "retired") =>
                  setFormData({ ...formData, status: value })
                }
                disabled={isLoadingStatement}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleDialogClose(false)}
              disabled={isSubmitting || isLoadingStatement}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateStatement} disabled={isSubmitting || isLoadingStatement}>
              {isLoadingStatement ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  {isEditMode ? "Update Statement" : "Create Statement"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the statement
              from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
