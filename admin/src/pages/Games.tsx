import { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Play,
  Pause,
  Eye,
  Edit,
  Copy,
  Trash2,
  Globe,
  Star,
} from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Game {
  id: string;
  name: string;
  category: string;
  challenges: number;
  status: "draft" | "live" | "featured" | "paused";
  plays: number;
  completionRate: number;
  replayRate: number;
  region: string;
  version: number;
  lastUpdated: string;
}

const games: Game[] = [
  {
    id: "1",
    name: "Celebrity Secrets Vol. 1",
    category: "Entertainment",
    challenges: 5,
    status: "featured",
    plays: 145230,
    completionRate: 78,
    replayRate: 23,
    region: "Global",
    version: 3,
    lastUpdated: "2 days ago",
  },
  {
    id: "2",
    name: "Sports Legends Quiz",
    category: "Sports",
    challenges: 5,
    status: "live",
    plays: 98120,
    completionRate: 82,
    replayRate: 18,
    region: "US, EU",
    version: 2,
    lastUpdated: "1 week ago",
  },
  {
    id: "3",
    name: "History Mysteries",
    category: "Education",
    challenges: 5,
    status: "live",
    plays: 67890,
    completionRate: 71,
    replayRate: 15,
    region: "Global",
    version: 1,
    lastUpdated: "2 weeks ago",
  },
  {
    id: "4",
    name: "Tech Giants Exposed",
    category: "Technology",
    challenges: 5,
    status: "draft",
    plays: 0,
    completionRate: 0,
    replayRate: 0,
    region: "—",
    version: 1,
    lastUpdated: "3 days ago",
  },
  {
    id: "5",
    name: "Music Trivia Remix",
    category: "Entertainment",
    challenges: 5,
    status: "paused",
    plays: 45670,
    completionRate: 76,
    replayRate: 12,
    region: "LATAM",
    version: 2,
    lastUpdated: "1 month ago",
  },
];

const statusConfig = {
  draft: { label: "Draft", color: "text-muted-foreground", bg: "bg-muted" },
  live: { label: "Live", color: "text-success", bg: "bg-success/10" },
  featured: { label: "Featured", color: "text-warning", bg: "bg-warning/10" },
  paused: { label: "Paused", color: "text-destructive", bg: "bg-destructive/10" },
};

export default function Games() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <AdminLayout>
      <AdminHeader
        title="Games & Challenges"
        subtitle="Build and manage game content"
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground">Total Games</p>
            <p className="text-2xl font-bold text-foreground mt-1">156</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground">Live Games</p>
            <p className="text-2xl font-bold text-success mt-1">124</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground">Featured</p>
            <p className="text-2xl font-bold text-warning mt-1">8</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground">Avg Completion</p>
            <p className="text-2xl font-bold text-primary mt-1">74%</p>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search games..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" onClick={() => toast("Filter options opened")}>
              <Filter className="w-4 h-4" />
            </Button>
          </div>
          <Button onClick={() => toast.success("Game builder opened")}>
            <Plus className="w-4 h-4 mr-2" />
            Create Game
          </Button>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map((game) => (
            <div
              key={game.id}
              className="bg-card rounded-xl border border-border p-5 hover:border-primary/50 transition-all duration-300 group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground truncate">
                      {game.name}
                    </h3>
                    {game.status === "featured" && (
                      <Star className="w-4 h-4 text-warning fill-warning shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{game.category}</span>
                    <span>•</span>
                    <span>{game.challenges} challenges</span>
                  </div>
                </div>
                <span
                  className={cn(
                    "px-2 py-1 rounded text-xs font-medium shrink-0",
                    statusConfig[game.status].bg,
                    statusConfig[game.status].color
                  )}
                >
                  {statusConfig[game.status].label}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-2 rounded-lg bg-muted/50">
                  <p className="text-lg font-bold text-foreground">
                    {game.plays > 0 ? `${(game.plays / 1000).toFixed(1)}K` : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">Plays</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-muted/50">
                  <p className="text-lg font-bold text-foreground">
                    {game.completionRate > 0 ? `${game.completionRate}%` : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">Complete</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-muted/50">
                  <p className="text-lg font-bold text-foreground">
                    {game.replayRate > 0 ? `${game.replayRate}%` : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">Replay</p>
                </div>
              </div>

              {/* Meta */}
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" />
                  <span>{game.region}</span>
                </div>
                <span>v{game.version}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-border">
                <Button variant="ghost" size="sm" className="flex-1" onClick={() => toast(`Preview: ${game.name}`)}>
                  <Eye className="w-4 h-4 mr-1" />
                  Preview
                </Button>
                <Button variant="ghost" size="sm" className="flex-1" onClick={() => toast(`Editing: ${game.name}`)}>
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={() => toast("More options")}>
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
