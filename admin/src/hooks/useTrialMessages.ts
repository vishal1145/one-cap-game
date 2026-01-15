import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type TrialMessage = Database["public"]["Tables"]["trial_messages"]["Row"];
type TrialMessageInsert = Database["public"]["Tables"]["trial_messages"]["Insert"];

export function useTrialMessages() {
  const [messages, setMessages] = useState<TrialMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("trial_messages")
        .select("*")
        .order("message_type");

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching trial messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateMessage = async (id: string, updates: Partial<TrialMessage>) => {
    try {
      const { error } = await supabase
        .from("trial_messages")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      await fetchMessages();
      toast({
        title: "Message saved",
        description: "Trial messaging has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating message:", error);
      toast({
        title: "Error saving message",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return { messages, isLoading, updateMessage, refetch: fetchMessages };
}
