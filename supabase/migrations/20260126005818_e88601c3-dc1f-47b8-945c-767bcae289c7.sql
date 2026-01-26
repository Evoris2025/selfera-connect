-- Phase H: Creator Contribution Score (CCS) & Earning Readiness

-- Create creator_contribution_scores table for internal scoring
CREATE TABLE public.creator_contribution_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  
  -- Overall CCS score (weighted aggregate)
  ccs_score INTEGER NOT NULL DEFAULT 0,
  
  -- Individual score components (stored for transparency/auditing)
  interactions_completed INTEGER NOT NULL DEFAULT 0,
  interactions_declined INTEGER NOT NULL DEFAULT 0,
  reports_received INTEGER NOT NULL DEFAULT 0,
  reports_against_others INTEGER NOT NULL DEFAULT 0,
  account_age_days INTEGER NOT NULL DEFAULT 0,
  activity_score INTEGER NOT NULL DEFAULT 0,
  community_participation INTEGER NOT NULL DEFAULT 0,
  
  -- Tier multiplier from ERA tier system
  tier_multiplier NUMERIC(3,2) NOT NULL DEFAULT 1.00,
  
  -- Eligibility tracking
  eligible_for_earnings BOOLEAN NOT NULL DEFAULT false,
  eligibility_reason TEXT,
  eligibility_updated_at TIMESTAMP WITH TIME ZONE,
  
  -- Visibility weighting (0.5 to 2.0 multiplier)
  visibility_weight NUMERIC(3,2) NOT NULL DEFAULT 1.00,
  
  -- Profile reach estimates (simulated initially)
  estimated_reach INTEGER NOT NULL DEFAULT 0,
  profile_views_30d INTEGER NOT NULL DEFAULT 0,
  interaction_views_30d INTEGER NOT NULL DEFAULT 0,
  
  -- Completion rate (0-100)
  completion_rate INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.creator_contribution_scores ENABLE ROW LEVEL SECURITY;

-- Users can view their own score (NOT publicly visible)
CREATE POLICY "Users can view their own CCS"
  ON public.creator_contribution_scores
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own score (for activity tracking)
CREATE POLICY "Users can update their own CCS"
  ON public.creator_contribution_scores
  FOR UPDATE
  USING (auth.uid() = user_id);

-- System/user can create their CCS record
CREATE POLICY "Users can create their own CCS"
  ON public.creator_contribution_scores
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all scores for moderation
CREATE POLICY "Admins can view all CCS"
  ON public.creator_contribution_scores
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Create score_change_logs table for audit trail
CREATE TABLE public.creator_score_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  
  -- What changed
  change_type TEXT NOT NULL, -- 'ccs_update', 'eligibility_change', 'visibility_change'
  previous_value JSONB,
  new_value JSONB,
  reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.creator_score_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view score audit logs"
  ON public.creator_score_audit_logs
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- System can insert audit logs (via security definer function)
CREATE POLICY "System can create audit logs"
  ON public.creator_score_audit_logs
  FOR INSERT
  WITH CHECK (true);

-- Create trigger to update updated_at
CREATE TRIGGER update_ccs_updated_at
  BEFORE UPDATE ON public.creator_contribution_scores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_ccs_user_id ON public.creator_contribution_scores(user_id);
CREATE INDEX idx_ccs_visibility_weight ON public.creator_contribution_scores(visibility_weight DESC);
CREATE INDEX idx_ccs_eligible ON public.creator_contribution_scores(eligible_for_earnings) WHERE eligible_for_earnings = true;
CREATE INDEX idx_score_audit_user ON public.creator_score_audit_logs(user_id);