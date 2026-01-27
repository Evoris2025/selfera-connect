-- Fix infinite recursion in conversation_participants SELECT policy
-- The current policy checks conversation_participants within itself, causing recursion

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view conversation participants" ON public.conversation_participants;

-- Create a fixed policy that avoids recursion by directly checking user_id
CREATE POLICY "Users can view conversation participants" 
ON public.conversation_participants 
FOR SELECT 
USING (
  -- Users can see participants in any conversation they are part of
  conversation_id IN (
    SELECT conversation_id 
    FROM public.conversation_participants 
    WHERE user_id = auth.uid()
  )
);