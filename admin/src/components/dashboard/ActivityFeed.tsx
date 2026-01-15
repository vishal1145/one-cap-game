import { AlertTriangle, CheckCircle, TrendingUp, Users, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  type: "alert" | "success" | "info" | "viral";
  title: string;
  description: string;
  time: string;
}

const activities: Activity[] = [
  {
    id: "1",
    type: "viral",
    title: "Viral Chain Detected",
    description: "Chain #4821 reached 500+ participants in 2 hours",
    time: "2 min ago",
  },
  {
    id: "2",
    type: "alert",
    title: "Content Flagged",
    description: "Statement #892 received 10+ reports",
    time: "15 min ago",
  },
  {
    id: "3",
    type: "success",
    title: "A/B Test Complete",
    description: "Paywall variant B shows +23% conversion",
    time: "1 hour ago",
  },
  {
    id: "4",
    type: "info",
    title: "New Region Peak",
    description: "Brazil DAU up 45% this week",
    time: "2 hours ago",
  },
  {
    id: "5",
    type: "alert",
    title: "Churn Risk Alert",
    description: "12 power users showing declining activity",
    time: "3 hours ago",
  },
];

const typeConfig = {
  alert: {
    icon: AlertTriangle,
    bg: "bg-destructive/10",
    iconColor: "text-destructive",
  },
  success: {
    icon: CheckCircle,
    bg: "bg-success/10",
    iconColor: "text-success",
  },
  info: {
    icon: Users,
    bg: "bg-primary/10",
    iconColor: "text-primary",
  },
  viral: {
    icon: Zap,
    bg: "bg-accent/10",
    iconColor: "text-accent",
  },
};

export function ActivityFeed() {
  return (
    <div className="space-y-3">
      {activities.map((activity, index) => {
        const config = typeConfig[activity.type];
        const Icon = config.icon;

        return (
          <div
            key={activity.id}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer animate-slide-up opacity-0",
              `stagger-${index + 1}`
            )}
            style={{ animationFillMode: "forwards" }}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                config.bg
              )}
            >
              <Icon className={cn("w-4 h-4", config.iconColor)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {activity.title}
              </p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {activity.description}
              </p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {activity.time}
            </span>
          </div>
        );
      })}
    </div>
  );
}
