export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_activity_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trial_analytics: {
        Row: {
          avg_conversion_time_hours: number | null
          created_at: string
          date: string
          drop_off_points: Json | null
          feature_usage: Json | null
          id: string
          revenue_from_trials: number | null
          trial_conversions: number
          trial_expirations: number
          trial_starts: number
        }
        Insert: {
          avg_conversion_time_hours?: number | null
          created_at?: string
          date?: string
          drop_off_points?: Json | null
          feature_usage?: Json | null
          id?: string
          revenue_from_trials?: number | null
          trial_conversions?: number
          trial_expirations?: number
          trial_starts?: number
        }
        Update: {
          avg_conversion_time_hours?: number | null
          created_at?: string
          date?: string
          drop_off_points?: Json | null
          feature_usage?: Json | null
          id?: string
          revenue_from_trials?: number | null
          trial_conversions?: number
          trial_expirations?: number
          trial_starts?: number
        }
        Relationships: []
      }
      trial_audit_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          performed_by: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          performed_by?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          performed_by?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      trial_config: {
        Row: {
          created_at: string
          downgrade_behavior: Database["public"]["Enums"]["downgrade_behavior"]
          eligibility: Database["public"]["Enums"]["trial_eligibility"]
          enabled: boolean
          id: string
          paywall_timing_days: number | null
          soft_downgrade_enabled: boolean
          trial_duration_days: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          downgrade_behavior?: Database["public"]["Enums"]["downgrade_behavior"]
          eligibility?: Database["public"]["Enums"]["trial_eligibility"]
          enabled?: boolean
          id?: string
          paywall_timing_days?: number | null
          soft_downgrade_enabled?: boolean
          trial_duration_days?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          downgrade_behavior?: Database["public"]["Enums"]["downgrade_behavior"]
          eligibility?: Database["public"]["Enums"]["trial_eligibility"]
          enabled?: boolean
          id?: string
          paywall_timing_days?: number | null
          soft_downgrade_enabled?: boolean
          trial_duration_days?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      trial_experiments: {
        Row: {
          conversions_a: number
          conversions_b: number
          created_at: string
          created_by: string | null
          end_date: string | null
          hypothesis: string | null
          id: string
          metric: string
          name: string
          participants_a: number
          participants_b: number
          significance: number | null
          start_date: string | null
          status: Database["public"]["Enums"]["experiment_status"]
          updated_at: string
          variant_a: Json
          variant_b: Json
        }
        Insert: {
          conversions_a?: number
          conversions_b?: number
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          hypothesis?: string | null
          id?: string
          metric?: string
          name: string
          participants_a?: number
          participants_b?: number
          significance?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["experiment_status"]
          updated_at?: string
          variant_a?: Json
          variant_b?: Json
        }
        Update: {
          conversions_a?: number
          conversions_b?: number
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          hypothesis?: string | null
          id?: string
          metric?: string
          name?: string
          participants_a?: number
          participants_b?: number
          significance?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["experiment_status"]
          updated_at?: string
          variant_a?: Json
          variant_b?: Json
        }
        Relationships: []
      }
      trial_messages: {
        Row: {
          body: string
          created_at: string
          cta_text: string | null
          id: string
          is_active: boolean
          message_type: Database["public"]["Enums"]["trial_message_type"]
          region: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          body: string
          created_at?: string
          cta_text?: string | null
          id?: string
          is_active?: boolean
          message_type: Database["public"]["Enums"]["trial_message_type"]
          region?: string
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          cta_text?: string | null
          id?: string
          is_active?: boolean
          message_type?: Database["public"]["Enums"]["trial_message_type"]
          region?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_trials: {
        Row: {
          campaign_id: string | null
          converted_at: string | null
          created_at: string
          experiment_id: string | null
          expires_at: string
          features_used: Json | null
          id: string
          started_at: string
          status: Database["public"]["Enums"]["trial_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          campaign_id?: string | null
          converted_at?: string | null
          created_at?: string
          experiment_id?: string | null
          expires_at: string
          features_used?: Json | null
          id?: string
          started_at?: string
          status?: Database["public"]["Enums"]["trial_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          campaign_id?: string | null
          converted_at?: string | null
          created_at?: string
          experiment_id?: string | null
          expires_at?: string
          features_used?: Json | null
          id?: string
          started_at?: string
          status?: Database["public"]["Enums"]["trial_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "content_admin"
        | "growth_admin"
        | "monetization_admin"
        | "moderator"
        | "readonly_executive"
      downgrade_behavior: "automatic" | "soft_prompt" | "hard_block"
      experiment_status: "draft" | "running" | "paused" | "concluded"
      trial_eligibility:
        | "new_users"
        | "returning_users"
        | "campaign_based"
        | "all_users"
      trial_message_type:
        | "onboarding"
        | "day_2_reminder"
        | "day_3_warning"
        | "downgrade_confirmation"
        | "conversion_success"
      trial_status: "active" | "converted" | "expired" | "revoked"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "super_admin",
        "content_admin",
        "growth_admin",
        "monetization_admin",
        "moderator",
        "readonly_executive",
      ],
      downgrade_behavior: ["automatic", "soft_prompt", "hard_block"],
      experiment_status: ["draft", "running", "paused", "concluded"],
      trial_eligibility: [
        "new_users",
        "returning_users",
        "campaign_based",
        "all_users",
      ],
      trial_message_type: [
        "onboarding",
        "day_2_reminder",
        "day_3_warning",
        "downgrade_confirmation",
        "conversion_success",
      ],
      trial_status: ["active", "converted", "expired", "revoked"],
    },
  },
} as const
