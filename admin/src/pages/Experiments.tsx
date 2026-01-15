import { useState } from "react";
import {
  FlaskConical,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  XCircle,
  TrendingUp,
  Users,
  Percent,
} from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Button } from "@/components/ui/button";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { cn } from "@/lib/utils";

interface Experiment {
  id: string;
  name: string;
  hypothesis: string;
  status: "running" | "concluded" | "paused" | "draft";
  variants: { name: string; traffic: number; metric: number }[];
  metric: string;
  participants: number;
  significance: number;
  startDate: string;
  winner?: string;
}

const experiments: Experiment[] = [
  {
    id: "1",
    name: "Paywall Copy Test",
    hypothesis: "Urgency-focused copy increases conversion",
    status: "running",
    variants: [
      { name: "Control", traffic: 50, metric: 3.8 },
      { name: "Urgency Copy", traffic: 50, metric: 4.6 },
    ],
    metric: "Pro Conversion %",
    participants: 45200,
    significance: 92,
    startDate: "Jan 15, 2024",
  },
  {
    id: "2",
    name: "Game Length Optimization",
    hypothesis: "Shorter games (3 challenges) increase completion",
    status: "concluded",
    variants: [
      { name: "5 Challenges", traffic: 50, metric: 74 },
      { name: "3 Challenges", traffic: 50, metric: 89 },
    ],
    metric: "Completion Rate %",
    participants: 78500,
    significance: 99,
    startDate: "Jan 8, 2024",
    winner: "3 Challenges",
  },
  {
    id: "3",
    name: "Share Prompt Timing",
    hypothesis: "Prompt after high-accuracy game increases shares",
    status: "running",
    variants: [
      { name: "After Every Game", traffic: 33, metric: 12 },
      { name: "After Win Only", traffic: 33, metric: 18 },
      { name: "After 80%+ Accuracy", traffic: 34, metric: 24 },
    ],
    metric: "Share Rate %",
    participants: 34100,
    significance: 87,
    startDate: "Jan 18, 2024",
  },
  {
    id: "4",
    name: "Trial Length Test",
    hypothesis: "14-day trial increases eventual conversion",
    status: "paused",
    variants: [
      { name: "7 Days", traffic: 50, metric: 8.2 },
      { name: "14 Days", traffic: 50, metric: 7.8 },
    ],
    metric: "Conversion %",
    participants: 12400,
    significance: 45,
    startDate: "Jan 5, 2024",
  },
];

const statusConfig = {
  running: { label: "Running", color: "text-success", bg: "bg-success/10", icon: Play },
  concluded: { label: "Concluded", color: "text-primary", bg: "bg-primary/10", icon: CheckCircle },
  paused: { label: "Paused", color: "text-warning", bg: "bg-warning/10", icon: Pause },
  draft: { label: "Draft", color: "text-muted-foreground", bg: "bg-muted", icon: FlaskConical },
};

export default function Experiments() {
  return (
    <AdminLayout>
      <AdminHeader
        title="Experiments"
        subtitle="A/B testing and optimization"
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Play className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">8</p>
                <p className="text-sm text-muted-foreground">Running</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">23</p>
                <p className="text-sm text-muted-foreground">Concluded</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">+18%</p>
                <p className="text-sm text-muted-foreground">Avg Uplift</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">156K</p>
                <p className="text-sm text-muted-foreground">In Tests</p>
              </div>
            </div>
          </div>
        </div>

        {/* Experiments List */}
        <div className="space-y-4">
          {experiments.map((exp) => {
            const StatusIcon = statusConfig[exp.status].icon;
            const bestVariant = [...exp.variants].sort((a, b) => b.metric - a.metric)[0];

            return (
              <div
                key={exp.id}
                className="bg-card rounded-xl border border-border p-5 hover:border-primary/50 transition-colors"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-foreground text-lg">
                        {exp.name}
                      </h3>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium",
                          statusConfig[exp.status].bg,
                          statusConfig[exp.status].color
                        )}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig[exp.status].label}
                      </span>
                      {exp.winner && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-success/10 text-success">
                          <CheckCircle className="w-3 h-3" />
                          Winner: {exp.winner}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{exp.hypothesis}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {exp.status === "running" && (
                      <Button variant="outline" size="sm">
                        <Pause className="w-4 h-4 mr-1" />
                        Pause
                      </Button>
                    )}
                    {exp.status === "paused" && (
                      <Button variant="outline" size="sm">
                        <Play className="w-4 h-4 mr-1" />
                        Resume
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Rollback
                    </Button>
                  </div>
                </div>

                {/* Variants */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {exp.variants.map((variant) => (
                    <div
                      key={variant.name}
                      className={cn(
                        "p-4 rounded-lg border",
                        variant.name === bestVariant.name && exp.status !== "draft"
                          ? "border-success bg-success/5"
                          : "border-border bg-muted/30"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-foreground">
                          {variant.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {variant.traffic}% traffic
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-foreground">
                        {variant.metric}
                        {exp.metric.includes("%") && "%"}
                      </p>
                      <p className="text-xs text-muted-foreground">{exp.metric}</p>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-border text-sm">
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {exp.participants.toLocaleString()} participants
                    </span>
                    <span>Started {exp.startDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Significance:</span>
                    <div
                      className={cn(
                        "flex items-center gap-1 font-semibold",
                        exp.significance >= 95
                          ? "text-success"
                          : exp.significance >= 80
                          ? "text-warning"
                          : "text-muted-foreground"
                      )}
                    >
                      <Percent className="w-4 h-4" />
                      {exp.significance}%
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Create New */}
        <div className="flex justify-center">
          <Button size="lg">
            <FlaskConical className="w-5 h-5 mr-2" />
            Create New Experiment
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
