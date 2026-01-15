import { TrendingUp, TrendingDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Game {
  id: string;
  name: string;
  category: string;
  plays: number;
  completionRate: number;
  shares: number;
  trend: number;
}

const games: Game[] = [
  {
    id: "1",
    name: "Celebrity Secrets",
    category: "Entertainment",
    plays: 45230,
    completionRate: 78,
    shares: 12450,
    trend: 15,
  },
  {
    id: "2",
    name: "Sports Legends",
    category: "Sports",
    plays: 38120,
    completionRate: 82,
    shares: 9870,
    trend: 8,
  },
  {
    id: "3",
    name: "History Facts",
    category: "Education",
    plays: 32890,
    completionRate: 71,
    shares: 8240,
    trend: -3,
  },
  {
    id: "4",
    name: "Tech Giants",
    category: "Technology",
    plays: 28450,
    completionRate: 85,
    shares: 7120,
    trend: 22,
  },
  {
    id: "5",
    name: "Music Trivia",
    category: "Entertainment",
    plays: 25670,
    completionRate: 76,
    shares: 6890,
    trend: 5,
  },
];

export function TopGamesTable() {
  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr className="border-b border-border">
            <th>Game</th>
            <th>Plays</th>
            <th>Completion</th>
            <th>Shares</th>
            <th>Trend</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {games.map((game) => (
            <tr key={game.id}>
              <td>
                <div>
                  <p className="font-medium text-foreground">{game.name}</p>
                  <p className="text-xs text-muted-foreground">{game.category}</p>
                </div>
              </td>
              <td className="font-medium">{game.plays.toLocaleString()}</td>
              <td>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${game.completionRate}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {game.completionRate}%
                  </span>
                </div>
              </td>
              <td className="font-medium">{game.shares.toLocaleString()}</td>
              <td>
                <div
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium",
                    game.trend >= 0
                      ? "bg-success/10 text-success"
                      : "bg-destructive/10 text-destructive"
                  )}
                >
                  {game.trend >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {Math.abs(game.trend)}%
                </div>
              </td>
              <td>
                <Button variant="ghost" size="icon-sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
