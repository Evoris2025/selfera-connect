-- Add RLS policies for admin topic tag management
CREATE POLICY "Admins can view all topic tags"
ON public.topic_tags
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update topic tags"
ON public.topic_tags
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete topic tags"
ON public.topic_tags
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));