-- Fix infinite recursion in conversation_participants SELECT policy
-- Use a security definer function to bypass RLS when checking membership

-- First, create a helper function that bypasses RLS
CREATE OR REPLACE FUNCTION public.user_is_conversation_participant(p_conversation_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.conversation_participants 
    WHERE conversation_id = p_conversation_id 
    AND user_id = p_user_id
  );
$$;

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view conversation participants" ON public.conversation_participants;

-- Create a fixed policy that uses the security definer function
CREATE POLICY "Users can view conversation participants" 
ON public.conversation_participants 
FOR SELECT 
USING (
  public.user_is_conversation_participant(conversation_id, auth.uid())
);