-- Create table for personal community members (people I value)
CREATE TABLE public.user_community_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  member_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, member_user_id)
);

-- Enable RLS
ALTER TABLE public.user_community_members ENABLE ROW LEVEL SECURITY;

-- Users can view their own community list
CREATE POLICY "Users can view their community members"
ON public.user_community_members
FOR SELECT
USING (auth.uid() = user_id);

-- Users can add people to their community
CREATE POLICY "Users can add to their community"
ON public.user_community_members
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can remove people from their community
CREATE POLICY "Users can remove from their community"
ON public.user_community_members
FOR DELETE
USING (auth.uid() = user_id);

-- Add index for faster lookups
CREATE INDEX idx_user_community_members_user_id ON public.user_community_members(user_id);
CREATE INDEX idx_user_community_members_member_id ON public.user_community_members(member_user_id);