-- Create enum for trial status
CREATE TYPE public.trial_status AS ENUM ('active', 'converted', 'expired', 'revoked');

-- Create enum for trial eligibility
CREATE TYPE public.trial_eligibility AS ENUM ('new_users', 'returning_users', 'campaign_based', 'all_users');

-- Create enum for downgrade behavior
CREATE TYPE public.downgrade_behavior AS ENUM ('automatic', 'soft_prompt', 'hard_block');

-- Create enum for message type
CREATE TYPE public.trial_message_type AS ENUM ('onboarding', 'day_2_reminder', 'day_3_warning', 'downgrade_confirmation', 'conversion_success');

-- Create enum for experiment status
CREATE TYPE public.experiment_status AS ENUM ('draft', 'running', 'paused', 'concluded');

-- Global trial configuration table
CREATE TABLE public.trial_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT true,
  trial_duration_days INTEGER NOT NULL DEFAULT 3,
  eligibility trial_eligibility NOT NULL DEFAULT 'new_users',
  downgrade_behavior downgrade_behavior NOT NULL DEFAULT 'automatic',
  paywall_timing_days INTEGER DEFAULT 0,
  soft_downgrade_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Trial messages table
CREATE TABLE public.trial_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_type trial_message_type NOT NULL,
  region TEXT NOT NULL DEFAULT 'global',
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  cta_text TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(message_type, region)
);

-- User trials table
CREATE TABLE public.user_trials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  status trial_status NOT NULL DEFAULT 'active',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  converted_at TIMESTAMP WITH TIME ZONE,
  features_used JSONB DEFAULT '[]'::jsonb,
  experiment_id UUID,
  campaign_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Trial experiments table
CREATE TABLE public.trial_experiments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  hypothesis TEXT,
  status experiment_status NOT NULL DEFAULT 'draft',
  variant_a JSONB NOT NULL DEFAULT '{}'::jsonb,
  variant_b JSONB NOT NULL DEFAULT '{}'::jsonb,
  metric TEXT NOT NULL DEFAULT 'conversion_rate',
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  participants_a INTEGER NOT NULL DEFAULT 0,
  participants_b INTEGER NOT NULL DEFAULT 0,
  conversions_a INTEGER NOT NULL DEFAULT 0,
  conversions_b INTEGER NOT NULL DEFAULT 0,
  significance DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Trial audit log for compliance
CREATE TABLE public.trial_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  performed_by UUID REFERENCES auth.users(id),
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Trial analytics aggregation table
CREATE TABLE public.trial_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  trial_starts INTEGER NOT NULL DEFAULT 0,
  trial_conversions INTEGER NOT NULL DEFAULT 0,
  trial_expirations INTEGER NOT NULL DEFAULT 0,
  avg_conversion_time_hours DECIMAL(10,2) DEFAULT 0,
  revenue_from_trials DECIMAL(10,2) DEFAULT 0,
  feature_usage JSONB DEFAULT '{}'::jsonb,
  drop_off_points JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(date)
);

-- Enable RLS on all tables
ALTER TABLE public.trial_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trial_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trial_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trial_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trial_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies for trial_config (admin only)
CREATE POLICY "Admins can view trial config"
  ON public.trial_config FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update trial config"
  ON public.trial_config FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert trial config"
  ON public.trial_config FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- RLS policies for trial_messages (admin only)
CREATE POLICY "Admins can view trial messages"
  ON public.trial_messages FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage trial messages"
  ON public.trial_messages FOR ALL
  USING (is_admin(auth.uid()));

-- RLS policies for user_trials (admin only for management)
CREATE POLICY "Admins can view all user trials"
  ON public.user_trials FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage user trials"
  ON public.user_trials FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Users can view own trial"
  ON public.user_trials FOR SELECT
  USING (auth.uid() = user_id);

-- RLS policies for trial_experiments (admin only)
CREATE POLICY "Admins can view experiments"
  ON public.trial_experiments FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage experiments"
  ON public.trial_experiments FOR ALL
  USING (is_admin(auth.uid()));

-- RLS policies for trial_audit_log (admin only)
CREATE POLICY "Admins can view audit log"
  ON public.trial_audit_log FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert audit log"
  ON public.trial_audit_log FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

-- RLS policies for trial_analytics (admin only)
CREATE POLICY "Admins can view analytics"
  ON public.trial_analytics FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage analytics"
  ON public.trial_analytics FOR ALL
  USING (is_admin(auth.uid()));

-- Create triggers for updated_at
CREATE TRIGGER update_trial_config_updated_at
  BEFORE UPDATE ON public.trial_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trial_messages_updated_at
  BEFORE UPDATE ON public.trial_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_trials_updated_at
  BEFORE UPDATE ON public.user_trials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trial_experiments_updated_at
  BEFORE UPDATE ON public.trial_experiments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default trial config
INSERT INTO public.trial_config (enabled, trial_duration_days, eligibility, downgrade_behavior)
VALUES (true, 3, 'new_users', 'automatic');

-- Insert default messages
INSERT INTO public.trial_messages (message_type, region, title, body, cta_text) VALUES
  ('onboarding', 'global', 'Welcome to Pro Trial!', 'Enjoy 3 days of unlimited access to all Pro features. Make the most of it!', 'Explore Pro Features'),
  ('day_2_reminder', 'global', 'Day 2: How''s your trial going?', 'You have 1 day left to explore Pro features. Have you tried everything yet?', 'Continue Exploring'),
  ('day_3_warning', 'global', 'Last day of your trial!', 'Your Pro trial ends today. Upgrade now to keep your access!', 'Upgrade to Pro'),
  ('downgrade_confirmation', 'global', 'Your trial has ended', 'Thanks for trying Pro! You can upgrade anytime to get back your premium features.', 'Upgrade Now'),
  ('conversion_success', 'global', 'Welcome to Pro!', 'You''re now a Pro member. Enjoy unlimited access to all premium features!', 'Get Started');