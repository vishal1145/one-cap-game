import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { FlaskConical, Plus, Play, Pause, CheckCircle, TrendingUp, TrendingDown, Target } from "lucide-react";
import { useTrialExperiments } from "@/hooks/useTrialExperiments";
import type { Database } from "@/integrations/supabase/types";

type ExperimentStatus = Database["public"]["Enums"]["experiment_status"];

const statusConfig: Record<ExperimentStatus, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground" },
  running: { label: "Running", color: "bg-success/10 text-success" },
  paused: { label: "Paused", color: "bg-warning/10 text-warning" },
  concluded: { label: "Concluded", color: "bg-primary/10 text-primary" },
};

export function TrialExperiments() {
  const { experiments, isLoading, createExperiment, updateStatus } = useTrialExperiments();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newExperiment, setNewExperiment] = useState({
    name: "",
    hypothesis: "",
    variantAValue: "",
    variantBValue: "",
    metric: "conversion_rate",
  });

  const handleCreateExperiment = async () => {
    await createExperiment({
      name: newExperiment.name,
      hypothesis: newExperiment.hypothesis,
      variant_a: { name: "Control", value: newExperiment.variantAValue },
      variant_b: { name: "Variant", value: newExperiment.variantBValue },
      metric: newExperiment.metric,
      status: "draft",
    });
    setIsCreateOpen(false);
    setNewExperiment({ name: "", hypothesis: "", variantAValue: "", variantBValue: "", metric: "conversion_rate" });
  };

  const getWinner = (exp: typeof experiments[0]) => {
    if (exp.participants_a === 0 || exp.participants_b === 0) return null;
    const rateA = (exp.conversions_a / exp.participants_a) * 100;
    const rateB = (exp.conversions_b / exp.participants_b) * 100;
    if (Number(exp.significance) >= 95) {
      return rateB > rateA ? "B" : "A";
    }
    return null;
  };

  const getVariantValue = (variant: unknown): string => {
    if (typeof variant === "object" && variant !== null && "value" in variant) {
      return String((variant as { value: unknown }).value);
    }
    return String(variant);
  };

  const runningExperiments = experiments.filter((e) => e.status === "running").length;
  const concludedExperiments = experiments.filter((e) => e.status === "concluded").length;
  const avgSignificance = experiments.filter((e) => Number(e.significance) > 0).reduce((acc, e) => acc + Number(e.significance), 0) / 
    experiments.filter((e) => Number(e.significance) > 0).length || 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Play className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{runningExperiments}</p>
                <p className="text-sm text-muted-foreground">Running Experiments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <CheckCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{concludedExperiments}</p>
                <p className="text-sm text-muted-foreground">Concluded</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Target className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgSignificance.toFixed(0)}%</p>
                <p className="text-sm text-muted-foreground">Avg. Significance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create New Experiment */}
      <div className="flex justify-end">
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Experiment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Experiment</DialogTitle>
              <DialogDescription>Set up an A/B test for trial optimization</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Experiment Name</Label>
                <Input
                  value={newExperiment.name}
                  onChange={(e) => setNewExperiment({ ...newExperiment, name: e.target.value })}
                  placeholder="e.g., Trial Duration Test"
                />
              </div>
              <div className="space-y-2">
                <Label>Hypothesis</Label>
                <Textarea
                  value={newExperiment.hypothesis}
                  onChange={(e) => setNewExperiment({ ...newExperiment, hypothesis: e.target.value })}
                  placeholder="What do you expect to happen?"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Control (A)</Label>
                  <Input
                    value={newExperiment.variantAValue}
                    onChange={(e) => setNewExperiment({ ...newExperiment, variantAValue: e.target.value })}
                    placeholder="Current behavior"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Variant (B)</Label>
                  <Input
                    value={newExperiment.variantBValue}
                    onChange={(e) => setNewExperiment({ ...newExperiment, variantBValue: e.target.value })}
                    placeholder="New behavior"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Success Metric</Label>
                <Select
                  value={newExperiment.metric}
                  onValueChange={(metric) => setNewExperiment({ ...newExperiment, metric })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conversion_rate">Conversion Rate</SelectItem>
                    <SelectItem value="click_through_rate">Click-through Rate</SelectItem>
                    <SelectItem value="feature_adoption">Feature Adoption</SelectItem>
                    <SelectItem value="time_to_convert">Time to Convert</SelectItem>
                    <SelectItem value="revenue_per_user">Revenue per User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateExperiment} disabled={!newExperiment.name}>Create Experiment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Experiments List */}
      <div className="space-y-4">
        {experiments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <FlaskConical className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No experiments yet</p>
              <p className="text-sm">Create your first A/B test to get started</p>
            </CardContent>
          </Card>
        ) : (
          experiments.map((exp) => {
            const winner = getWinner(exp);
            const rateA = exp.participants_a > 0 ? (exp.conversions_a / exp.participants_a) * 100 : 0;
            const rateB = exp.participants_b > 0 ? (exp.conversions_b / exp.participants_b) * 100 : 0;
            const uplift = rateA > 0 ? ((rateB - rateA) / rateA) * 100 : 0;

            return (
              <Card key={exp.id} className={exp.status === "running" ? "ring-2 ring-success/50" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FlaskConical className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{exp.name}</CardTitle>
                        <CardDescription>{exp.hypothesis || "No hypothesis defined"}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={statusConfig[exp.status].color}>
                        {statusConfig[exp.status].label}
                      </Badge>
                      {exp.status === "draft" && (
                        <Button size="sm" onClick={() => updateStatus(exp.id, "running")}>
                          <Play className="w-4 h-4 mr-1" />
                          Start
                        </Button>
                      )}
                      {exp.status === "running" && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => updateStatus(exp.id, "paused")}>
                            <Pause className="w-4 h-4 mr-1" />
                            Pause
                          </Button>
                          <Button size="sm" onClick={() => updateStatus(exp.id, "concluded")}>
                            Conclude
                          </Button>
                        </>
                      )}
                      {exp.status === "paused" && (
                        <Button size="sm" onClick={() => updateStatus(exp.id, "running")}>
                          <Play className="w-4 h-4 mr-1" />
                          Resume
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {exp.status !== "draft" ? (
                    <>
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Variant A */}
                        <div className={`p-4 rounded-lg border-2 ${winner === "A" ? "border-success bg-success/5" : "border-border"}`}>
                          <div className="flex items-center justify-between mb-3">
                            <Badge variant="outline">Control (A)</Badge>
                            {winner === "A" && <Badge className="bg-success text-success-foreground">Winner</Badge>}
                          </div>
                          <p className="font-medium mb-3">{getVariantValue(exp.variant_a)}</p>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Participants</p>
                              <p className="text-xl font-bold">{exp.participants_a.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">{exp.metric}</p>
                              <p className="text-xl font-bold">{rateA.toFixed(1)}%</p>
                            </div>
                          </div>
                        </div>

                        {/* Variant B */}
                        <div className={`p-4 rounded-lg border-2 ${winner === "B" ? "border-success bg-success/5" : "border-border"}`}>
                          <div className="flex items-center justify-between mb-3">
                            <Badge variant="outline">Variant (B)</Badge>
                            {winner === "B" && <Badge className="bg-success text-success-foreground">Winner</Badge>}
                          </div>
                          <p className="font-medium mb-3">{getVariantValue(exp.variant_b)}</p>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Participants</p>
                              <p className="text-xl font-bold">{exp.participants_b.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">{exp.metric}</p>
                              <div className="flex items-center gap-2">
                                <p className="text-xl font-bold">{rateB.toFixed(1)}%</p>
                                {uplift !== 0 && (
                                  <span className={`text-sm flex items-center ${uplift > 0 ? "text-success" : "text-destructive"}`}>
                                    {uplift > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                    {Math.abs(uplift).toFixed(1)}%
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      {/* Significance */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">Statistical Significance</span>
                          <div className="flex items-center gap-2 w-48">
                            <Progress value={Number(exp.significance)} className="h-2" />
                            <span className={`text-sm font-medium ${Number(exp.significance) >= 95 ? "text-success" : ""}`}>
                              {Number(exp.significance).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        {exp.start_date && (
                          <span className="text-sm text-muted-foreground">
                            Started: {new Date(exp.start_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FlaskConical className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Experiment not started yet</p>
                      <p className="text-sm">Click "Start" to begin collecting data</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
