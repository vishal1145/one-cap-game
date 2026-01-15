import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type UserTrial = Database["public"]["Tables"]["user_trials"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export interface UserTrialWithProfile extends UserTrial {
  profile?: Profile | null;
}

export function useUserTrials() {
  const [trials, setTrials] = useState<UserTrialWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTrials = async () => {
    try {
      const { data, error } = await supabase
        .from("user_trials")
        .select("*")
        .order("started_at", { ascending: false });

      if (error) throw error;
      setTrials(data || []);
    } catch (error) {
      console.error("Error fetching user trials:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const extendTrial = async (id: string, days: number) => {
    try {
      const trial = trials.find((t) => t.id === id);
      if (!trial) return;

      const newExpiry = new Date(new Date(trial.expires_at).getTime() + days * 86400000);
      
      const { error } = await supabase
        .from("user_trials")
        .update({ 
          expires_at: newExpiry.toISOString(), 
          status: "active" 
        })
        .eq("id", id);

      if (error) throw error;

      await fetchTrials();
      toast({
        title: "Trial extended",
        description: `Extended trial by ${days} days.`,
      });
    } catch (error) {
      console.error("Error extending trial:", error);
      toast({
        title: "Error extending trial",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const convertToPro = async (id: string) => {
    try {
      const { error } = await supabase
        .from("user_trials")
        .update({ 
          status: "converted", 
          converted_at: new Date().toISOString() 
        })
        .eq("id", id);

      if (error) throw error;

      await fetchTrials();
      toast({
        title: "User converted",
        description: "User has been upgraded to Pro.",
      });
    } catch (error) {
      console.error("Error converting user:", error);
      toast({
        title: "Error converting user",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const revokeTrial = async (id: string) => {
    try {
      const { error } = await supabase
        .from("user_trials")
        .update({ status: "revoked" })
        .eq("id", id);

      if (error) throw error;

      await fetchTrials();
      toast({
        title: "Trial revoked",
        description: "User trial has been revoked.",
      });
    } catch (error) {
      console.error("Error revoking trial:", error);
      toast({
        title: "Error revoking trial",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchTrials();
  }, []);

  return { trials, isLoading, extendTrial, convertToPro, revokeTrial, refetch: fetchTrials };
}
