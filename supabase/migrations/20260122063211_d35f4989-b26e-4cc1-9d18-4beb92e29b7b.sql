-- Phase 5: Communities & MyERA Hub

-- Add role column to community_memberships if not exists (community_memberships table already has 'role' column)
-- Update the role to use proper enum

-- Create pathway status enum
DO $$ BEGIN
  CREATE TYPE pathway_status AS ENUM ('available', 'in_progress', 'completed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create support link status enum
DO $$ BEGIN
  CREATE TYPE support_link_status AS ENUM ('pending', 'active', 'inactive', 'ended');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create user_pathways table for tracking user progression
CREATE TABLE IF NOT EXISTS public.user_pathways (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pathway_type TEXT NOT NULL, -- 'creator', 'professional', 'organization', 'support_seeker'
  status pathway_status NOT NULL DEFAULT 'available',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, pathway_type)
);

-- Create user_support_links table for practitioner/org connections
CREATE TABLE IF NOT EXISTS public.user_support_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- the user receiving support
  provider_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- the practitioner/org
  provider_role TEXT NOT NULL, -- 'counsellor', 'psychologist', 'social_worker', 'therapist', etc.
  organization_name TEXT,
  status support_link_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create community_posts junction table for posts associated with communities (if not exists)
-- The table exists but let's ensure it has proper structure

-- Add post_community_id column to posts for direct community association
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES public.communities(id) ON DELETE SET NULL;

-- Enable RLS on new tables
ALTER TABLE public.user_pathways ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_support_links ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_pathways
CREATE POLICY "Users can view their own pathways"
ON public.user_pathways FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pathways"
ON public.user_pathways FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pathways"
ON public.user_pathways FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pathways"
ON public.user_pathways FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for user_support_links
CREATE POLICY "Users can view their own support links"
ON public.user_support_links FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = provider_user_id);

CREATE POLICY "Providers can create support links"
ON public.user_support_links FOR INSERT
WITH CHECK (auth.uid() = provider_user_id);

CREATE POLICY "Users or providers can update support links"
ON public.user_support_links FOR UPDATE
USING (auth.uid() = user_id OR auth.uid() = provider_user_id);

CREATE POLICY "Users can end their support links"
ON public.user_support_links FOR DELETE
USING (auth.uid() = user_id);

-- Add RLS policy for posts with community_id to be viewable
CREATE POLICY "Community posts are viewable by members"
ON public.posts FOR SELECT
USING (
  community_id IS NOT NULL AND 
  moderation_status = 'published' AND
  EXISTS (
    SELECT 1 FROM community_memberships cm 
    WHERE cm.community_id = posts.community_id 
    AND cm.user_id = auth.uid()
  )
);

-- Update updated_at triggers
CREATE TRIGGER update_user_pathways_updated_at
BEFORE UPDATE ON public.user_pathways
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_support_links_updated_at
BEFORE UPDATE ON public.user_support_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_posts_community_id ON public.posts(community_id);
CREATE INDEX IF NOT EXISTS idx_user_pathways_user_id ON public.user_pathways(user_id);
CREATE INDEX IF NOT EXISTS idx_user_support_links_user_id ON public.user_support_links(user_id);
CREATE INDEX IF NOT EXISTS idx_user_support_links_provider_id ON public.user_support_links(provider_user_id);