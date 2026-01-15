import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type TrialAnalytics = Database["public"]["Tables"]["trial_analytics"]["Row"];

export function useTrialAnalytics(timeRange: string = "30d") {
  const [analytics, setAnalytics] = useState<TrialAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const daysAgo = timeRange === "7d" ? 7 : timeRange === "90d" ? 90 : 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const { data, error } = await supabase
        .from("trial_analytics")
        .select("*")
        .gte("date", startDate.toISOString().split("T")[0])
        .order("date", { ascending: true });

      if (error) throw error;
      setAnalytics(data || []);
    } catch (error) {
      console.error("Error fetching trial analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  // Compute aggregated stats
  const stats = {
    totalStarts: analytics.reduce((sum, a) => sum + a.trial_starts, 0),
    totalConversions: analytics.reduce((sum, a) => sum + a.trial_conversions, 0),
    totalRevenue: analytics.reduce((sum, a) => sum + (Number(a.revenue_from_trials) || 0), 0),
    avgConversionTime: analytics.length > 0 
      ? analytics.reduce((sum, a) => sum + (Number(a.avg_conversion_time_hours) || 0), 0) / analytics.length 
      : 0,
    conversionRate: analytics.reduce((sum, a) => sum + a.trial_starts, 0) > 0
      ? (analytics.reduce((sum, a) => sum + a.trial_conversions, 0) / 
         analytics.reduce((sum, a) => sum + a.trial_starts, 0)) * 100
      : 0,
  };

  return { analytics, stats, isLoading, refetch: fetchAnalytics };
}
