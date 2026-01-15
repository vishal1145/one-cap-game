import { useState } from "react";
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
} from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Statement {
  id: string;
  text: string;
  truthOrCap: "truth" | "cap";
  category: string;
  difficulty: "easy" | "medium" | "hard";
  status: "draft" | "live" | "retired";
  views: number;
  accuracy: number;
  createdAt: string;
}

const statements: Statement[] = [
  {
    id: "1",
    text: "Elon Musk once sold flamethrowers as a side project",
    truthOrCap: "truth",
    category: "Technology",
    difficulty: "medium",
    status: "live",
    views: 45230,
    accuracy: 68,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    text: "The Great Wall of China is visible from space with naked eyes",
    truthOrCap: "cap",
    category: "History",
    difficulty: "easy",
    status: "live",
    views: 38120,
    accuracy: 72,
    createdAt: "2024-01-14",
  },
  {
    id: "3",
    text: "Honey never expires and has been found edible in ancient tombs",
    truthOrCap: "truth",
    category: "Science",
    difficulty: "medium",
    status: "live",
    views: 32890,
    accuracy: 54,
    createdAt: "2024-01-13",
  },
  {
    id: "4",
    text: "Goldfish have a 3-second memory span",
    truthOrCap: "cap",
    category: "Animals",
    difficulty: "easy",
    status: "draft",
    views: 0,
    accuracy: 0,
    createdAt: "2024-01-12",
  },
  {
    id: "5",
    text: "The iPhone was originally designed to be a tablet first",
    truthOrCap: "truth",
    category: "Technology",
    difficulty: "hard",
    status: "live",
    views: 28450,
    accuracy: 41,
    createdAt: "2024-01-11",
  },
  {
    id: "6",
    text: "Bananas are berries but strawberries are not",
    truthOrCap: "truth",
    category: "Science",
    difficulty: "hard",
    status: "retired",
    views: 52100,
    accuracy: 38,
    createdAt: "2024-01-10",
  },
];

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
            <p className="text-2xl font-bold text-foreground mt-1">2,847</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground">Live</p>
            <p className="text-2xl font-bold text-success mt-1">2,134</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground">Pending Review</p>
            <p className="text-2xl font-bold text-warning mt-1">89</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground">Avg Accuracy</p>
            <p className="text-2xl font-bold text-primary mt-1">62%</p>
          </div>
        </div>

        {/* Actions Bar */}
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
            <Button variant="outline" size="icon" onClick={() => toast("Filters opened")}>
              <Filter className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => toast.success("Bulk upload dialog opened")}>
              <Upload className="w-4 h-4 mr-2" />
              Bulk Upload
            </Button>
            <Button onClick={() => toast.success("Create statement dialog opened")}>
              <Plus className="w-4 h-4 mr-2" />
              Add Statement
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
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
                  return (
                    <tr key={statement.id} className="group">
                      <td>
                        <p className="font-medium text-foreground line-clamp-2">
                          {statement.text}
                        </p>
                      </td>
                      <td>
                        <span
                          className={cn(
                            "inline-flex px-2 py-1 rounded text-xs font-semibold uppercase",
                            statement.truthOrCap === "truth"
                              ? "bg-success/10 text-success"
                              : "bg-accent/10 text-accent"
                          )}
                        >
                          {statement.truthOrCap}
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
                              style={{ width: `${statement.accuracy}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {statement.accuracy}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon-sm" onClick={() => toast(`Viewing statement: ${statement.text.slice(0, 30)}...`)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => toast(`Editing statement #${statement.id}`)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive"
                            onClick={() => toast.error(`Statement #${statement.id} deleted`)}
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
        </div>
      </div>
    </AdminLayout>
  );
}
