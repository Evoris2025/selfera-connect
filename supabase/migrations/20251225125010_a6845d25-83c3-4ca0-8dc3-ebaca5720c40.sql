-- Allow authenticated users to create new topic tags
CREATE POLICY "Authenticated users can create topic tags"
ON public.topic_tags
FOR INSERT
TO authenticated
WITH CHECK (true);