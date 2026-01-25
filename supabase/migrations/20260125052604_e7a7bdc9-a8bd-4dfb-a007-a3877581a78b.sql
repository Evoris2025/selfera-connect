-- Phase D: Subscriptions, Billing Status & ERA Charging Rules

-- 1. Create ERA tier colour enum
CREATE TYPE public.era_tier AS ENUM ('pink', 'green', 'blue', 'purple', 'orange');

-- 2. Create plan type enum (client vs provider)
CREATE TYPE public.plan_type AS ENUM ('free', 'client', 'provider');

-- 3. Add new columns to user_subscriptions
ALTER TABLE public.user_subscriptions
ADD COLUMN IF NOT EXISTS plan_type public.plan_type DEFAULT 'free',
ADD COLUMN IF NOT EXISTS tier_colour public.era_tier DEFAULT NULL,
ADD COLUMN IF NOT EXISTS amount_due numeric(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS subscriber_count integer DEFAULT 0;

-- 4. Create interaction status enum
CREATE TYPE public.interaction_status AS ENUM ('draft', 'requested', 'confirmed', 'completed', 'cancelled');

-- 5. Create interactions table
CREATE TABLE public.interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_tier_price numeric(10,2) NOT NULL DEFAULT 24.99,
  client_base_price numeric(10,2) NOT NULL DEFAULT 24.99,
  amount_due numeric(10,2) NOT NULL DEFAULT 0,
  status public.interaction_status NOT NULL DEFAULT 'draft',
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT different_users CHECK (client_user_id != provider_user_id)
);

-- 6. Enable RLS on interactions
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;

-- 7. RLS policies for interactions
-- Clients can view their own interactions
CREATE POLICY "Clients can view their interactions"
ON public.interactions FOR SELECT
USING (auth.uid() = client_user_id);

-- Providers can view interactions where they are the provider
CREATE POLICY "Providers can view their interactions"
ON public.interactions FOR SELECT
USING (auth.uid() = provider_user_id);

-- Clients can create interaction requests
CREATE POLICY "Clients can create interaction requests"
ON public.interactions FOR INSERT
WITH CHECK (auth.uid() = client_user_id);

-- Clients can update their draft interactions
CREATE POLICY "Clients can update draft interactions"
ON public.interactions FOR UPDATE
USING (auth.uid() = client_user_id AND status = 'draft');

-- Providers can update interaction status (accept/decline)
CREATE POLICY "Providers can update interaction status"
ON public.interactions FOR UPDATE
USING (auth.uid() = provider_user_id AND status IN ('requested', 'confirmed'));

-- Clients can cancel their own interactions
CREATE POLICY "Clients can cancel interactions"
ON public.interactions FOR DELETE
USING (auth.uid() = client_user_id AND status IN ('draft', 'requested'));

-- 8. Add trigger for updated_at
CREATE TRIGGER update_interactions_updated_at
  BEFORE UPDATE ON public.interactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 9. Add index for efficient lookups
CREATE INDEX idx_interactions_client ON public.interactions(client_user_id);
CREATE INDEX idx_interactions_provider ON public.interactions(provider_user_id);
CREATE INDEX idx_interactions_status ON public.interactions(status);