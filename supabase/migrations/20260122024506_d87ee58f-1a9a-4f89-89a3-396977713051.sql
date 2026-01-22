-- Add RLS policy to allow users to approve/reject follow requests (update their incoming follows)
CREATE POLICY "Users can update follow requests they receive"
ON public.follows
FOR UPDATE
USING (auth.uid() = following_id)
WITH CHECK (auth.uid() = following_id);