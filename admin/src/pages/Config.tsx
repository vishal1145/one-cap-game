import { useState } from "react";
import {
  Settings,
  ToggleLeft,
  Globe,
  Zap,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Button } from "@/components/ui/button";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rollout: number;
  regions: string[];
  lastModified: string;
  impact?: { metric: string; change: number };
}

const featureFlags: FeatureFlag[] = [
  {
    id: "1",
    name: "new_share_ui",
    description: "Redesigned share screen with animations",
    enabled: true,
    rollout: 100,
    regions: ["Global"],
    lastModified: "2 days ago",
    impact: { metric: "Share Rate", change: 23 },
  },
  {
    id: "2",
    name: "streak_bonuses",
    description: "Extra rewards for daily play streaks",
    enabled: true,
    rollout: 50,
    regions: ["US", "EU"],
    lastModified: "1 week ago",
    impact: { metric: "DAU", change: 12 },
  },
  {
    id: "3",
    name: "ai_generated_statements",
    description: "AI-powered statement generation",
    enabled: false,
    rollout: 0,
    regions: [],
    lastModified: "3 days ago",
  },
  {
    id: "4",
    name: "premium_themes",
    description: "Custom UI themes for Pro users",
    enabled: true,
    rollout: 100,
    regions: ["Global"],
    lastModified: "2 weeks ago",
    impact: { metric: "Pro Retention", change: 8 },
  },
  {
    id: "5",
    name: "leaderboards_v2",
    description: "New competitive leaderboard system",
    enabled: true,
    rollout: 25,
    regions: ["LATAM"],
    lastModified: "5 days ago",
  },
];

const rollbackHistory = [
  {
    feature: "video_statements",
    date: "Jan 15, 2024",
    reason: "Performance issues on low-end devices",
  },
  {
    feature: "social_login",
    date: "Jan 8, 2024",
    reason: "OAuth provider downtime",
  },
  {
    feature: "live_challenges",
    date: "Dec 28, 2023",
    reason: "Server capacity exceeded",
  },
];

export default function Config() {
  const [flags, setFlags] = useState(featureFlags);

  const toggleFlag = (id: string, name: string) => {
    setFlags(
      flags.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f))
    );
    const flag = flags.find((f) => f.id === id);
    if (flag?.enabled) {
      toast.warning(`Feature "${name}" disabled`);
    } else {
      toast.success(`Feature "${name}" enabled`);
    }
  };

  return (
    <AdminLayout>
      <AdminHeader
        title="Configuration"
        subtitle="Feature flags and system settings"
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">24</p>
                <p className="text-sm text-muted-foreground">Active Flags</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">8</p>
                <p className="text-sm text-muted-foreground">Regional Configs</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">5</p>
                <p className="text-sm text-muted-foreground">In Rollout</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <RotateCcw className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">3</p>
                <p className="text-sm text-muted-foreground">Rollbacks (30d)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Flags */}
        <ChartCard
          title="Feature Flags"
          subtitle="Control feature availability"
          action={
            <Button variant="outline" size="sm">
              <Zap className="w-4 h-4 mr-2" />
              Add Flag
            </Button>
          }
        >
          <div className="space-y-3">
            {flags.map((flag) => (
              <div
                key={flag.id}
                className={cn(
                  "flex items-center justify-between p-4 rounded-lg border transition-colors",
                  flag.enabled
                    ? "bg-muted/30 border-border"
                    : "bg-muted/10 border-transparent"
                )}
              >
                <div className="flex items-center gap-4 flex-1">
                  <Switch
                    checked={flag.enabled}
                    onCheckedChange={() => toggleFlag(flag.id, flag.name)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-sm font-mono font-medium text-primary">
                        {flag.name}
                      </code>
                      {flag.rollout < 100 && flag.enabled && (
                        <span className="px-1.5 py-0.5 rounded text-xs bg-warning/10 text-warning">
                          {flag.rollout}% rollout
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {flag.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 ml-4">
                  {flag.regions.length > 0 && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Globe className="w-4 h-4" />
                      <span>{flag.regions.join(", ")}</span>
                    </div>
                  )}

                  {flag.impact && (
                    <div
                      className={cn(
                        "flex items-center gap-1 text-sm font-medium",
                        flag.impact.change >= 0 ? "text-success" : "text-destructive"
                      )}
                    >
                      {flag.impact.change >= 0 ? "+" : ""}
                      {flag.impact.change}% {flag.impact.metric}
                    </div>
                  )}

                  <Button variant="ghost" size="sm" className="text-destructive">
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Kill Switch */}
          <ChartCard title="Kill Switches" subtitle="Emergency feature disabling">
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    <span className="font-semibold text-foreground">
                      Kill All Sharing
                    </span>
                  </div>
                  <Switch />
                </div>
                <p className="text-sm text-muted-foreground">
                  Immediately disable all viral sharing features
                </p>
              </div>

              <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    <span className="font-semibold text-foreground">
                      Kill Payments
                    </span>
                  </div>
                  <Switch />
                </div>
                <p className="text-sm text-muted-foreground">
                  Disable all payment processing
                </p>
              </div>

              <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    <span className="font-semibold text-foreground">
                      Maintenance Mode
                    </span>
                  </div>
                  <Switch />
                </div>
                <p className="text-sm text-muted-foreground">
                  Show maintenance page to all users
                </p>
              </div>
            </div>
          </ChartCard>

          {/* Rollback History */}
          <ChartCard title="Rollback History" subtitle="Recent emergency rollbacks">
            <div className="space-y-3">
              {rollbackHistory.map((rollback, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
                >
                  <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                    <RotateCcw className="w-4 h-4 text-destructive" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <code className="text-sm font-mono font-medium text-foreground">
                        {rollback.feature}
                      </code>
                      <span className="text-xs text-muted-foreground">
                        {rollback.date}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {rollback.reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      </div>
    </AdminLayout>
  );
}
