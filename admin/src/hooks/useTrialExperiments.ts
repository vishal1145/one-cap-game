import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type Experiment = Database["public"]["Tables"]["trial_experiments"]["Row"];
type ExperimentInsert = Database["public"]["Tables"]["trial_experiments"]["Insert"];
type ExperimentStatus = Database["public"]["Enums"]["experiment_status"];

export function useTrialExperiments() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchExperiments = async () => {
    try {
      const { data, error } = await supabase
        .from("trial_experiments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setExperiments(data || []);
    } catch (error) {
      console.error("Error fetching experiments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createExperiment = async (data: Omit<ExperimentInsert, "id" | "created_at" | "updated_at">) => {
    try {
      const { error } = await supabase
        .from("trial_experiments")
        .insert(data);

      if (error) throw error;

      await fetchExperiments();
      toast({
        title: "Experiment created",
        description: "Your new experiment is ready to launch.",
      });
    } catch (error) {
      console.error("Error creating experiment:", error);
      toast({
        title: "Error creating experiment",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateStatus = async (id: string, status: ExperimentStatus) => {
    try {
      const updates: Partial<Experiment> = { status };
      
      if (status === "running") {
        updates.start_date = new Date().toISOString();
      } else if (status === "concluded") {
        updates.end_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from("trial_experiments")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      await fetchExperiments();
      toast({
        title: `Experiment ${status}`,
        description: `The experiment has been ${status === "running" ? "started" : status}.`,
      });
    } catch (error) {
      console.error("Error updating experiment:", error);
      toast({
        title: "Error updating experiment",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchExperiments();
  }, []);

  return { experiments, isLoading, createExperiment, updateStatus, refetch: fetchExperiments };
}
