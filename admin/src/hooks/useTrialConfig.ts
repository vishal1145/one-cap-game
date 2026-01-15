import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type TrialConfig = Database["public"]["Tables"]["trial_config"]["Row"];
type TrialConfigInsert = Database["public"]["Tables"]["trial_config"]["Insert"];

export function useTrialConfig() {
  const [config, setConfig] = useState<TrialConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from("trial_config")
        .select("*")
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      setConfig(data);
    } catch (error) {
      console.error("Error fetching trial config:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = async (updates: Partial<TrialConfigInsert>) => {
    setIsSaving(true);
    try {
      if (config?.id) {
        const { error } = await supabase
          .from("trial_config")
          .update(updates)
          .eq("id", config.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("trial_config")
          .insert(updates as TrialConfigInsert);

        if (error) throw error;
      }

      await fetchConfig();
      toast({
        title: "Configuration saved",
        description: "Trial settings have been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving trial config:", error);
      toast({
        title: "Error saving configuration",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return { config, isLoading, isSaving, saveConfig, refetch: fetchConfig };
}
