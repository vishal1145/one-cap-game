import { useState, useEffect, useCallback } from "react";
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
  Loader2,
  Users,
  Trophy,
  X,
  CheckCircle,
  XCircle,
  ListOrdered,
  Check,
  ChevronsUpDown,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import api from "@/api/client";

interface BackendGame {
  _id: string;
  title: string;
  created_by: {
    _id: string;
    username?: string;
    email?: string;
  };
  join_code: string;
  max_players: number;
  status: "draft" | "live" | "ended";
  started_at: string | null;
  ended_at: string | null;
  current_challenge_index: number;
  is_challenge_active: boolean;
  player_count: number;
  challenge_count: number;
  createdAt: string;
  updatedAt: string;
}

interface GamesResponse {
  success: boolean;
  games: BackendGame[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface GameResponse {
  success: boolean;
  game: BackendGame;
  message?: string;
}

interface BackendChallenge {
  _id: string;
  prompt?: string;
  theme?: string;
  statements: Array<{
    text: string;
    is_cap: boolean;
  }>;
  status: string;
  visibility: string;
  creator_id?: {
    _id: string;
    username?: string;
  };
  createdAt: string;
}

interface ChallengesResponse {
  success: boolean;
  challenges: BackendChallenge[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface GameChallenge {
  _id: string;
  game_id: string;
  challenge_id: BackendChallenge;
  order: number;
  started_at: string | null;
  ended_at: string | null;
  createdAt: string;
}

interface GameChallengesResponse {
  success: boolean;
  challenges: GameChallenge[];
}

interface GamePlayer {
  _id: string;
  user_id: {
    _id: string;
    username?: string;
    email?: string;
    avatar?: string;
  };
  score: number;
  joined_at: string;
}

interface GamePlayersResponse {
  success: boolean;
  players: GamePlayer[];
}

interface LeaderboardResponse {
  success: boolean;
  leaderboard: GamePlayer[];
}

const statusConfig = {
  draft: { label: "Draft", color: "text-muted-foreground", bg: "bg-muted" },
  live: { label: "Live", color: "text-success", bg: "bg-success/10" },
  ended: { label: "Ended", color: "text-destructive", bg: "bg-destructive/10" },
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

export default function Games() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [games, setGames] = useState<BackendGame[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create Game Modal
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    title: "",
    max_players: 20,
  });

  // Add Challenge Modal
  const [isAddChallengeDialogOpen, setIsAddChallengeDialogOpen] = useState(false);
  const [selectedGameForChallenge, setSelectedGameForChallenge] = useState<BackendGame | null>(null);
  const [availableChallenges, setAvailableChallenges] = useState<BackendChallenge[]>([]);
  const [selectedChallengeIds, setSelectedChallengeIds] = useState<string[]>([]);
  const [challengeSearchQuery, setChallengeSearchQuery] = useState("");
  const [isLoadingChallenges, setIsLoadingChallenges] = useState(false);
  const [isAddingChallenge, setIsAddingChallenge] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // View Details Modal
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<BackendGame | null>(null);
  const [gameChallenges, setGameChallenges] = useState<GameChallenge[]>([]);
  const [gamePlayers, setGamePlayers] = useState<GamePlayer[]>([]);
  const [gameLeaderboard, setGameLeaderboard] = useState<GamePlayer[]>([]);
  const [detailsTab, setDetailsTab] = useState<"challenges" | "players" | "leaderboard">("challenges");
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Start/End Game Confirmation
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: "start" | "end" | null;
    game: BackendGame | null;
  }>({
    open: false,
    type: null,
    game: null,
  });

  // Create Challenge Modal
  const [isCreateChallengeDialogOpen, setIsCreateChallengeDialogOpen] = useState(false);
  const [isCreatingChallenge, setIsCreatingChallenge] = useState(false);
  const [challengeFormData, setChallengeFormData] = useState({
    theme: "",
    prompt: "",
    statements: [
      { text: "", is_cap: false },
      { text: "", is_cap: false },
      { text: "", is_cap: true },
    ],
    visibility: "direct",
    status: "active",
  });

  const { toast } = useToast();

  // Fetch Games
  const fetchGames = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(statusFilter && statusFilter !== "all" && { status: statusFilter }),
        ...(debouncedSearchQuery && { search: debouncedSearchQuery }),
      });

      const response = await api.get(`/admin/games?${params.toString()}`);
      const data: GamesResponse = response.data;

      if (data.success) {
        setGames(data.games);
        setPagination(data.pagination);
      } else {
        const errorMsg = "Failed to fetch games";
        setError(errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        });
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to fetch games";
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      console.error("Error fetching games:", err);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, statusFilter, debouncedSearchQuery, toast]);

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
    fetchGames();
  }, [fetchGames]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
  }, [statusFilter]);

  // Create Game
  const handleCreateGame = async () => {
    if (!createFormData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a game title",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post("/admin/games", createFormData);
      const data: GameResponse = response.data;

      if (data.success) {
        toast({
          title: "Success",
          description: data.message || "Game created successfully",
        });
        setIsCreateDialogOpen(false);
        setCreateFormData({ title: "", max_players: 20 });
        fetchGames();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to create game",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "An unexpected error occurred";
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      console.error("Error creating game:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch Available Challenges
  const fetchAvailableChallenges = async () => {
    setIsLoadingChallenges(true);
    try {
      const response = await api.get("/challenges/my?page=1&limit=100&status=active");
      const data: ChallengesResponse = response.data;

      if (data.success) {
        setAvailableChallenges(data.challenges);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch challenges",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to fetch challenges";
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      console.error("Error fetching challenges:", err);
    } finally {
      setIsLoadingChallenges(false);
    }
  };

  // Add Challenges to Game (Multiple)
  const handleAddChallenges = async () => {
    if (selectedChallengeIds.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one challenge",
        variant: "destructive",
      });
      return;
    }

    setIsAddingChallenge(true);
    try {
      const response = await api.post(
        `/admin/games/${selectedGameForChallenge?._id}/challenges/bulk`,
        { challenge_ids: selectedChallengeIds }
      );
      const data = response.data;

      if (data.success) {
        toast({
          title: "Success",
          description: data.message || `${selectedChallengeIds.length} challenge(s) added successfully`,
        });
        setIsAddChallengeDialogOpen(false);
        setSelectedChallengeIds([]);
        setChallengeSearchQuery("");
        fetchGames();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to add challenges",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "An unexpected error occurred";
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      console.error("Error adding challenges:", err);
    } finally {
      setIsAddingChallenge(false);
    }
  };

  // Toggle challenge selection
  const toggleChallengeSelection = (challengeId: string) => {
    setSelectedChallengeIds((prev) =>
      prev.includes(challengeId)
        ? prev.filter((id) => id !== challengeId)
        : [...prev, challengeId]
    );
  };

  // Remove selected challenge
  const removeSelectedChallenge = (challengeId: string) => {
    setSelectedChallengeIds((prev) => prev.filter((id) => id !== challengeId));
  };

  // Filter challenges by search
  const filteredChallenges = availableChallenges.filter((challenge) => {
    const searchLower = challengeSearchQuery.toLowerCase();
    return (
      challenge.theme?.toLowerCase().includes(searchLower) ||
      challenge.prompt?.toLowerCase().includes(searchLower)
    );
  });

  // Start Game
  const handleStartGame = async (game: BackendGame) => {
    try {
      const response = await api.post(`/admin/games/${game._id}/start`);
      const data: GameResponse = response.data;

      if (data.success) {
        toast({
          title: "Success",
          description: data.message || "Game started successfully",
        });
        setActionDialog({ open: false, type: null, game: null });
        fetchGames();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to start game",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to start game";
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      console.error("Error starting game:", err);
    }
  };

  // End Game
  const handleEndGame = async (game: BackendGame) => {
    try {
      const response = await api.post(`/admin/games/${game._id}/end`);
      const data: GameResponse = response.data;

      if (data.success) {
        toast({
          title: "Success",
          description: data.message || "Game ended successfully",
        });
        setActionDialog({ open: false, type: null, game: null });
        fetchGames();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to end game",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to end game";
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      console.error("Error ending game:", err);
    }
  };

  // Create Challenge
  const handleCreateChallenge = async () => {
    // Validation
    if (!challengeFormData.theme) {
      toast({
        title: "Validation Error",
        description: "Please select a challenge theme",
        variant: "destructive",
      });
      return;
    }

    const validStatements = challengeFormData.statements.filter((s) => s.text.trim());
    if (validStatements.length < 3 || validStatements.length > 10) {
      toast({
        title: "Validation Error",
        description: "Challenge must have between 3 and 10 statements",
        variant: "destructive",
      });
      return;
    }

    const capCount = validStatements.filter((s) => s.is_cap).length;
    if (capCount !== 1) {
      toast({
        title: "Validation Error",
        description: "Challenge must have exactly 1 Cap statement",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingChallenge(true);
    try {
      const payload: any = {
        theme: challengeFormData.theme,
        statements: validStatements,
        status: "active",
      };

      // Add prompt if provided
      if (challengeFormData.prompt.trim()) {
        payload.prompt = challengeFormData.prompt;
      }

      const response = await api.post("/challenges", payload);
      const data = response.data;

      if (data.success) {
        toast({
          title: "Success",
          description: "Challenge created successfully",
        });
        setIsCreateChallengeDialogOpen(false);
        // Reset form
        setChallengeFormData({
          theme: "",
          prompt: "",
          statements: [
            { text: "", is_cap: false },
            { text: "", is_cap: false },
            { text: "", is_cap: true },
          ],
          visibility: "direct",
          status: "active",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to create challenge",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "An unexpected error occurred";
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      console.error("Error creating challenge:", err);
    } finally {
      setIsCreatingChallenge(false);
    }
  };

  const addStatement = () => {
    if (challengeFormData.statements.length < 10) {
      setChallengeFormData({
        ...challengeFormData,
        statements: [...challengeFormData.statements, { text: "", is_cap: false }],
      });
    }
  };

  const removeStatement = (index: number) => {
    if (challengeFormData.statements.length > 3) {
      const newStatements = challengeFormData.statements.filter((_, i) => i !== index);
      setChallengeFormData({
        ...challengeFormData,
        statements: newStatements,
      });
    }
  };

  const updateStatement = (index: number, field: "text" | "is_cap", value: string | boolean) => {
    const newStatements = [...challengeFormData.statements];
    if (field === "is_cap" && value === true) {
      // Ensure only one cap
      newStatements.forEach((s, i) => {
        s.is_cap = i === index;
      });
    } else {
      newStatements[index] = { ...newStatements[index], [field]: value };
    }
    setChallengeFormData({
      ...challengeFormData,
      statements: newStatements,
    });
  };

  // View Game Details
  const handleViewDetails = async (game: BackendGame) => {
    setSelectedGame(game);
    setIsDetailsDialogOpen(true);
    setDetailsTab("challenges");
    setIsLoadingDetails(true);

    try {
      // Fetch challenges
      const challengesResponse = await api.get(`/admin/games/${game._id}/challenges`);
      const challengesData: GameChallengesResponse = challengesResponse.data;
      if (challengesData.success) {
        setGameChallenges(challengesData.challenges);
      }

      // Fetch players
      const playersResponse = await api.get(`/admin/games/${game._id}/players`);
      const playersData: GamePlayersResponse = playersResponse.data;
      if (playersData.success) {
        setGamePlayers(playersData.players);
      }

      // Fetch leaderboard
      const leaderboardResponse = await api.get(`/admin/games/${game._id}/leaderboard`);
      const leaderboardData: LeaderboardResponse = leaderboardResponse.data;
      if (leaderboardData.success) {
        setGameLeaderboard(leaderboardData.leaderboard);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to fetch game details";
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      console.error("Error fetching game details:", err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const stats = {
    total: pagination.total,
    live: games.filter((g) => g.status === "live").length,
    draft: games.filter((g) => g.status === "draft").length,
    ended: games.filter((g) => g.status === "ended").length,
  };

  return (
    <AdminLayout>
      <AdminHeader title="Games" subtitle="Manage live game sessions" />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground">Total Games</p>
            <p className="text-2xl font-bold text-foreground mt-1">{stats.total}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground">Live Games</p>
            <p className="text-2xl font-bold text-success mt-1">{stats.live}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground">Draft Games</p>
            <p className="text-2xl font-bold text-warning mt-1">{stats.draft}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground">Ended Games</p>
            <p className="text-2xl font-bold text-muted-foreground mt-1">{stats.ended}</p>
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="ended">Ended</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsCreateChallengeDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Challenge
            </Button>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Game
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={fetchGames}>
              Try Again
            </Button>
          </div>
        )}

        {/* Games Grid */}
        {!isLoading && !error && games.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No games found</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => setIsCreateDialogOpen(true)}>
              Create Your First Game
            </Button>
          </div>
        )}

        {!isLoading && !error && games.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {games.map((game) => (
                <div
                  key={game._id}
                  className="bg-card rounded-xl border border-border p-5 hover:border-primary/50 transition-all duration-300 group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate mb-1">{game.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{game.challenge_count} challenges</span>
                        <span>•</span>
                        <span>{game.player_count} players</span>
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

                  {/* Join Code */}
                  <div className="bg-muted/50 rounded-lg p-3 mb-4">
                    <p className="text-xs text-muted-foreground mb-1">Join Code</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-bold font-mono text-foreground">{game.join_code}</p>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => {
                          navigator.clipboard.writeText(game.join_code);
                          toast({
                            title: "Copied!",
                            description: "Join code copied to clipboard",
                          });
                        }}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-2 rounded-lg bg-muted/50">
                      <p className="text-lg font-bold text-foreground">{game.max_players}</p>
                      <p className="text-xs text-muted-foreground">Max</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/50">
                      <p className="text-lg font-bold text-foreground">{game.player_count}</p>
                      <p className="text-xs text-muted-foreground">Players</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/50">
                      <p className="text-lg font-bold text-foreground">{game.challenge_count}</p>
                      <p className="text-xs text-muted-foreground">Rounds</p>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <span>{formatTimeAgo(game.createdAt)}</span>
                    <span>by {game.created_by.username || "Admin"}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-border">
                    {game.status === "draft" && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setSelectedGameForChallenge(game);
                            setIsAddChallengeDialogOpen(true);
                            fetchAvailableChallenges();
                          }}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Challenge
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1"
                          onClick={() => setActionDialog({ open: true, type: "start", game })}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Start
                        </Button>
                      </>
                    )}
                    {game.status === "live" && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleViewDetails(game)}
                        >
                          <Users className="w-4 h-4 mr-1" />
                          Players
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1"
                          onClick={() => setActionDialog({ open: true, type: "end", game })}
                        >
                          <Pause className="w-4 h-4 mr-1" />
                          End
                        </Button>
                      </>
                    )}
                    {game.status === "ended" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleViewDetails(game)}
                      >
                        <Trophy className="w-4 h-4 mr-1" />
                        Results
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleViewDetails(game)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>

                  {[...Array(pagination.totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    if (
                      pageNum === 1 ||
                      pageNum === pagination.totalPages ||
                      (pageNum >= page - 1 && pageNum <= page + 1)
                    ) {
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() => setPage(pageNum)}
                            isActive={page === pageNum}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    } else if (pageNum === page - 2 || pageNum === page + 2) {
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                      className={
                        page === pagination.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </div>

      {/* Create Game Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Game</DialogTitle>
            <DialogDescription>Set up a new live game session</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Game Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g., Friday Night Game"
                value={createFormData.title}
                onChange={(e) => setCreateFormData({ ...createFormData, title: e.target.value })}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_players">Max Players</Label>
              <Input
                id="max_players"
                type="number"
                min="2"
                max="100"
                value={createFormData.max_players}
                onChange={(e) =>
                  setCreateFormData({ ...createFormData, max_players: parseInt(e.target.value) || 20 })
                }
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">Maximum number of players (2-100)</p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateGame} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Game
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Challenge Dialog */}
      <Dialog open={isAddChallengeDialogOpen} onOpenChange={setIsAddChallengeDialogOpen}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Add Challenges to Game</DialogTitle>
            <DialogDescription>
              Game: {selectedGameForChallenge?.title} • Select multiple challenges
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {isLoadingChallenges ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : availableChallenges.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No challenges available</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => {
                    setIsAddChallengeDialogOpen(false);
                    setIsCreateChallengeDialogOpen(true);
                  }}
                >
                  Create Challenge
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Label>Select Challenges</Label>
                
                {/* Multi-select Popover */}
                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={isPopoverOpen}
                      className="w-full justify-between"
                    >
                      <span className="truncate">
                        {selectedChallengeIds.length === 0
                          ? "Select challenges..."
                          : `${selectedChallengeIds.length} challenge(s) selected`}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[580px] p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Search challenges..."
                        value={challengeSearchQuery}
                        onValueChange={setChallengeSearchQuery}
                      />
                      <CommandList>
                        <CommandEmpty>No challenges found.</CommandEmpty>
                        <CommandGroup>
                          {filteredChallenges.map((challenge) => (
                            <CommandItem
                              key={challenge._id}
                              value={challenge._id}
                              onSelect={() => toggleChallengeSelection(challenge._id)}
                              className="cursor-pointer"
                            >
                              <div className="flex items-center gap-2 w-full">
                                <div
                                  className={cn(
                                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                    selectedChallengeIds.includes(challenge._id)
                                      ? "bg-primary text-primary-foreground"
                                      : "opacity-50 [&_svg]:invisible"
                                  )}
                                >
                                  <Check className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">
                                    {challenge.prompt || challenge.theme || "Untitled Challenge"}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {challenge.theme && challenge.prompt && `${challenge.theme} • `}
                                    {challenge.statements.length} statements
                                  </p>
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {/* Selected Challenges */}
                {selectedChallengeIds.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">
                      Selected ({selectedChallengeIds.length})
                    </Label>
                    <div className="flex flex-wrap gap-2 p-3 border border-border rounded-lg bg-muted/30 max-h-[200px] overflow-y-auto">
                      {selectedChallengeIds.map((id) => {
                        const challenge = availableChallenges.find((c) => c._id === id);
                        if (!challenge) return null;
                        return (
                          <Badge
                            key={id}
                            variant="secondary"
                            className="pl-3 pr-1 py-1 gap-1"
                          >
                            <span className="max-w-[200px] truncate">
                              {challenge.prompt || challenge.theme || "Untitled"}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeSelectedChallenge(id)}
                              className="ml-1 rounded-full hover:bg-background/50 p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddChallengeDialogOpen(false);
                setSelectedChallengeIds([]);
                setChallengeSearchQuery("");
              }}
              disabled={isAddingChallenge}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddChallenges}
              disabled={isAddingChallenge || selectedChallengeIds.length === 0}
            >
              {isAddingChallenge && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add {selectedChallengeIds.length > 0 && `(${selectedChallengeIds.length})`} Challenge
              {selectedChallengeIds.length !== 1 && "s"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{selectedGame?.title}</DialogTitle>
            <DialogDescription>
              Status: {selectedGame?.status} • Join Code: {selectedGame?.join_code}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Tabs */}
            <div className="flex gap-2 border-b border-border">
              <Button
                variant={detailsTab === "challenges" ? "default" : "ghost"}
                size="sm"
                onClick={() => setDetailsTab("challenges")}
              >
                <ListOrdered className="w-4 h-4 mr-2" />
                Challenges ({gameChallenges.length})
              </Button>
              <Button
                variant={detailsTab === "players" ? "default" : "ghost"}
                size="sm"
                onClick={() => setDetailsTab("players")}
              >
                <Users className="w-4 h-4 mr-2" />
                Players ({gamePlayers.length})
              </Button>
              <Button
                variant={detailsTab === "leaderboard" ? "default" : "ghost"}
                size="sm"
                onClick={() => setDetailsTab("leaderboard")}
              >
                <Trophy className="w-4 h-4 mr-2" />
                Leaderboard
              </Button>
            </div>

            {/* Content */}
            <div className="max-h-[400px] overflow-y-auto">
              {isLoadingDetails ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {detailsTab === "challenges" && (
                    <div className="space-y-2">
                      {gameChallenges.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No challenges added yet</p>
                      ) : (
                        gameChallenges.map((gc, index) => (
                          <div
                            key={gc._id}
                            className="bg-muted/50 rounded-lg p-3 flex items-start gap-3"
                          >
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground">
                                {gc.challenge_id.theme || gc.challenge_id.prompt || "Untitled"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {gc.challenge_id.statements.length} statements
                              </p>
                            </div>
                            {gc.started_at && (
                              <CheckCircle className="w-5 h-5 text-success shrink-0" />
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {detailsTab === "players" && (
                    <div className="space-y-2">
                      {gamePlayers.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No players yet</p>
                      ) : (
                        gamePlayers.map((player) => (
                          <div
                            key={player._id}
                            className="bg-muted/50 rounded-lg p-3 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Users className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground">
                                  {player.user_id.username || player.user_id.email || "User"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Joined {formatTimeAgo(player.joined_at)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-foreground">{player.score}</p>
                              <p className="text-xs text-muted-foreground">points</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {detailsTab === "leaderboard" && (
                    <div className="space-y-2">
                      {gameLeaderboard.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No scores yet</p>
                      ) : (
                        gameLeaderboard.map((player, index) => (
                          <div
                            key={player._id}
                            className="bg-muted/50 rounded-lg p-3 flex items-center gap-3"
                          >
                            <div
                              className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center font-bold",
                                index === 0 && "bg-warning text-warning-foreground",
                                index === 1 && "bg-muted-foreground/20 text-foreground",
                                index === 2 && "bg-orange-500/20 text-orange-500",
                                index > 2 && "bg-muted text-muted-foreground"
                              )}
                            >
                              {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-foreground">
                                {player.user_id.username || player.user_id.email || "User"}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-foreground">{player.score}</p>
                              <p className="text-xs text-muted-foreground">points</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Challenge Dialog */}
      <Dialog open={isCreateChallengeDialogOpen} onOpenChange={setIsCreateChallengeDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Challenge</DialogTitle>
            <DialogDescription>
              Create a challenge with 3-10 statements and exactly 1 Cap
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Theme */}
            <div className="space-y-2">
              <Label htmlFor="theme">
                Challenge Theme <span className="text-destructive">*</span>
              </Label>
              <Select
                value={challengeFormData.theme}
                onValueChange={(value) => setChallengeFormData({ ...challengeFormData, theme: value })}
                disabled={isCreatingChallenge}
              >
                <SelectTrigger id="theme">
                  <SelectValue placeholder="Select a theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="History">History</SelectItem>
                  <SelectItem value="Entertainment">Entertainment</SelectItem>
                  <SelectItem value="Relationship">Relationship</SelectItem>
                  <SelectItem value="Science">Science</SelectItem>
                  <SelectItem value="Sports">Sports</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Prompt */}
            <div className="space-y-2">
              <Label htmlFor="prompt">
                Challenge Prompt <span className="text-muted-foreground text-xs">(Optional)</span>
              </Label>
              <Input
                id="prompt"
                placeholder="e.g., Guess the false fact about celebrities"
                value={challengeFormData.prompt}
                onChange={(e) => setChallengeFormData({ ...challengeFormData, prompt: e.target.value })}
                disabled={isCreatingChallenge}
              />
              <p className="text-xs text-muted-foreground">
                A descriptive prompt or question for the challenge
              </p>
            </div>

            {/* Statements */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>
                  Statements <span className="text-destructive">*</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    ({challengeFormData.statements.length}/10)
                  </span>
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addStatement}
                  disabled={challengeFormData.statements.length >= 10 || isCreatingChallenge}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Statement
                </Button>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {challengeFormData.statements.map((statement, index) => (
                  <div
                    key={index}
                    className={cn(
                      "border rounded-lg p-3",
                      statement.is_cap ? "border-destructive bg-destructive/5" : "border-border"
                    )}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                        <Input
                          placeholder="Enter statement text"
                          value={statement.text}
                          onChange={(e) => updateStatement(index, "text", e.target.value)}
                          disabled={isCreatingChallenge}
                          className="flex-1"
                        />
                      </div>
                      {challengeFormData.statements.length > 3 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => removeStatement(index)}
                          disabled={isCreatingChallenge}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id={`cap-${index}`}
                        name="cap-statement"
                        checked={statement.is_cap}
                        onChange={() => updateStatement(index, "is_cap", true)}
                        disabled={isCreatingChallenge}
                        className="w-4 h-4 text-destructive"
                      />
                      <Label
                        htmlFor={`cap-${index}`}
                        className={cn(
                          "text-sm cursor-pointer",
                          statement.is_cap ? "text-destructive font-medium" : "text-muted-foreground"
                        )}
                      >
                        {statement.is_cap ? "This is the Cap (False statement)" : "Mark as Cap"}
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visibility & Status */}
            {/*<div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="visibility">Visibility</Label>
                <Select
                  value={challengeFormData.visibility}
                  onValueChange={(value) =>
                    setChallengeFormData({ ...challengeFormData, visibility: value })
                  }
                  disabled={isCreatingChallenge}
                >
                  <SelectTrigger id="visibility">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="direct">Direct</SelectItem>
                    <SelectItem value="story">Story</SelectItem>
                  </SelectContent>
                </Select>
              </div> 

               <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={challengeFormData.status}
                  onValueChange={(value) => setChallengeFormData({ ...challengeFormData, status: value })}
                  disabled={isCreatingChallenge}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>*/}

            {/* Info Box */}
            <div className="bg-muted/50 rounded-lg p-3 text-sm">
              <p className="text-muted-foreground">
                <strong>Tips:</strong> Create a challenge with statements where only one is false (the Cap).
                Players will try to identify which statement is the Cap.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateChallengeDialogOpen(false)}
              disabled={isCreatingChallenge}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateChallenge} disabled={isCreatingChallenge}>
              {isCreatingChallenge && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Challenge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Start/End Game Confirmation */}
      <AlertDialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionDialog.type === "start" ? "Start Game?" : "End Game?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionDialog.type === "start"
                ? `Are you sure you want to start "${actionDialog.game?.title}"? Players will be able to join using the join code.`
                : `Are you sure you want to end "${actionDialog.game?.title}"? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (actionDialog.type === "start" && actionDialog.game) {
                  handleStartGame(actionDialog.game);
                } else if (actionDialog.type === "end" && actionDialog.game) {
                  handleEndGame(actionDialog.game);
                }
              }}
            >
              {actionDialog.type === "start" ? "Start Game" : "End Game"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
