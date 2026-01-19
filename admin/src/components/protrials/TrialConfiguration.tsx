import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Power, Clock, Users, ArrowDown, Settings2, Save, RefreshCw, Loader2 } from "lucide-react";
import { useTrialConfig } from "@/hooks/useTrialConfig";
import { useState, useEffect } from "react";
import type { Database } from "@/integrations/supabase/types";
import  api  from "@/api/client";
import { useToast } from "@/hooks/use-toast";




type TrialEligibility = Database["public"]["Enums"]["trial_eligibility"];
type DowngradeBehavior = Database["public"]["Enums"]["downgrade_behavior"];



interface LocalConfig {
  pro_trial_enabled: boolean;
  trial_duration_days: number;
  eligibility: TrialEligibility;
  downgrade_behavior: DowngradeBehavior;
  paywall_timing_days: number;
  soft_downgrade_enabled: boolean;
}


interface BackendTrialConfig {
  _id: string;
  pro_trial_enabled: boolean;
  trial_duration_days: number;
  paywall_after_days: number;
  trial_eligibility: TrialEligibility;
  downgrade_behavior: DowngradeBehavior;
}



/* ---------------- HELPERS ---------------- */

const mapApiToLocalConfig = (apiData: BackendTrialConfig): LocalConfig => ({
  pro_trial_enabled: apiData.pro_trial_enabled,
  trial_duration_days: apiData.trial_duration_days,
  eligibility: apiData.trial_eligibility,
  downgrade_behavior: apiData.downgrade_behavior,
  paywall_timing_days: apiData.paywall_after_days ?? 0,
  soft_downgrade_enabled: apiData.downgrade_behavior === "soft_prompt",
});

const mapLocalToApiPayload = (config: LocalConfig) => ({
  pro_trial_enabled: config.pro_trial_enabled,
  trial_duration_days: config.trial_duration_days,
  paywall_after_days: config.paywall_timing_days,
  trial_eligibility: config.eligibility,
  downgrade_behavior: config.soft_downgrade_enabled
    ? "soft_prompt"
    : config.downgrade_behavior,
});




export function TrialConfiguration() {
  const { isLoading, isSaving, saveConfig } = useTrialConfig();
  const { toast } = useToast();
  const [serverConfig, setServerConfig] =   useState<BackendTrialConfig | null>(null);
  const [config, setConfig] = useState<LocalConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localConfig, setLocalConfig] = useState<LocalConfig>({
    pro_trial_enabled: true,
    trial_duration_days: 3,
    eligibility: "new_users",
    downgrade_behavior: "automatic",
    paywall_timing_days: 0,
    soft_downgrade_enabled: true,
  });
  const [saving, setSaving] = useState(false);

  

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const res = await api.get("/admin/trial-config");

        // Backend returns array → take latest
        const latestConfig = res.data?.[0];

        if (!latestConfig) {
          throw new Error("No trial config found");
        }

        setServerConfig(latestConfig);
        setLocalConfig(mapApiToLocalConfig(latestConfig));
      } catch (err: any) {
        setError("Failed to load trial configuration");
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);


    /* -------- SAVE CONFIG -------- */

  const handleSave = async () => {
      if (!serverConfig || !localConfig) return;
  
      try {
        setSaving(true);
  
        await api.put(
          `/admin/trial-config/${serverConfig._id}`,
          mapLocalToApiPayload(localConfig)
        );
  
        // Sync reset state
        setServerConfig({
          ...serverConfig,
          ...mapLocalToApiPayload(localConfig),
        });

        // Show success toast
        toast({
          title: "Configuration Saved",
          description: "Pro trial configuration has been updated successfully.",
          variant: "default",
        });
      } catch (err) {
        setError("Failed to save configuration");
        
        // Show error toast
        toast({
          title: "Save Failed",
          description: "Failed to save trial configuration. Please try again.",
          variant: "destructive",
        });
      } finally {
        setSaving(false);
      }
    };

  



  const eligibilityOptions = [
    { value: "new_users" as const, label: "New Users Only", description: "Users who have never had a trial" },
    { value: "returning_users" as const, label: "Returning Users", description: "Users who previously had a trial" },
    { value: "campaign_based" as const, label: "Campaign-Based", description: "Users from specific marketing campaigns" },
    { value: "all_users" as const, label: "All Users", description: "Any user can access trial" },
  ];

  const downgradeOptions = [
    { value: "automatic" as const, label: "Automatic", description: "Instant downgrade after trial expires" },
    { value: "soft_prompt" as const, label: "Soft Prompt", description: "Show upgrade prompt, allow limited access" },
    { value: "hard_block" as const, label: "Hard Block", description: "Block access until upgrade or dismiss" },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-48" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Global Toggle */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Power className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Pro Trial Status</CardTitle>
                <CardDescription>Enable or disable Pro trials globally</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={localConfig.pro_trial_enabled ? "default" : "secondary"} className="px-3 py-1">
                {localConfig.pro_trial_enabled ? "Active" : "Disabled"}
              </Badge>
              <Switch
                checked={localConfig.pro_trial_enabled}
                onCheckedChange={(pro_trial_enabled) => setLocalConfig({ ...localConfig, pro_trial_enabled })}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Trial Duration */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Clock className="w-5 h-5 text-accent" />
              </div>
              <div>
                <CardTitle className="text-lg">Trial Duration</CardTitle>
                <CardDescription>Set the default trial length</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Input
                type="number"
                min={1}
                max={30}
                value={localConfig.trial_duration_days}
                onChange={(e) => setLocalConfig({ ...localConfig, trial_duration_days: parseInt(e.target.value) || 3 })}
                className="w-24 text-center text-lg font-semibold"
              />
              <span className="text-muted-foreground">days</span>
            </div>
            <div className="flex gap-2">
              {[3, 5, 7, 14].map((days) => (
                <Button
                  key={days}
                  variant={localConfig.trial_duration_days === days ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLocalConfig({ ...localConfig, trial_duration_days: days })}
                >
                  {days}d
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Paywall Timing */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Settings2 className="w-5 h-5 text-warning" />
              </div>
              <div>
                <CardTitle className="text-lg">Paywall Timing</CardTitle>
                <CardDescription>When to show upgrade prompts</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground">Show paywall after</span>
              <Input
                type="number"
                min={0}
                max={localConfig.trial_duration_days}
                value={localConfig.paywall_timing_days}
                onChange={(e) => setLocalConfig({ ...localConfig, paywall_timing_days: parseInt(e.target.value) || 0 })}
                className="w-20 text-center"
              />
              <span className="text-muted-foreground">days</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Set to 0 for immediate paywall display
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Eligibility */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <Users className="w-5 h-5 text-success" />
            </div>
            <div>
              <CardTitle className="text-lg">Trial Eligibility</CardTitle>
              <CardDescription>Define who can access the Pro trial</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {eligibilityOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setLocalConfig({ ...localConfig, eligibility: option.value })}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  localConfig.eligibility === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <p className="font-medium">{option.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Downgrade Behavior */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <ArrowDown className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-lg">Downgrade Behavior</CardTitle>
              <CardDescription>What happens when the trial expires</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            {downgradeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setLocalConfig({ ...localConfig, downgrade_behavior: option.value })}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  localConfig.downgrade_behavior === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <p className="font-medium">{option.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
              </button>
            ))}
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Soft Downgrade Experience</Label>
              <p className="text-xs text-muted-foreground">
                Show friendly prompts instead of hard blocks
              </p>
            </div>
            <Switch
              checked={localConfig.soft_downgrade_enabled}
              onCheckedChange={(soft_downgrade_enabled) => setLocalConfig({ ...localConfig, soft_downgrade_enabled })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={() => {
            if (config) {
              setLocalConfig({
                pro_trial_enabled: config.pro_trial_enabled,
                trial_duration_days: config.trial_duration_days,
                eligibility: config.eligibility,
                downgrade_behavior: config.downgrade_behavior,
                paywall_timing_days: config.paywall_timing_days || 0,
                soft_downgrade_enabled: config.soft_downgrade_enabled,
              });
            }
          }}
        >
          <RefreshCw className="w-4 h-4" />
          Reset
        </Button>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? "Saving..." : "Save Configuration"}
        </Button>
      </div>
    </div>
  );
}
