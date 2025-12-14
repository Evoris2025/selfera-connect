-- Create storage bucket for media uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for media bucket
CREATE POLICY "Users can upload their own media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own media"
ON storage.objects FOR DELETE
USING (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Media is publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

-- Create expressions table for ephemeral content (Stories)
CREATE TABLE public.expressions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image',
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours'),
  view_count INTEGER DEFAULT 0
);

-- Enable RLS on expressions
ALTER TABLE public.expressions ENABLE ROW LEVEL SECURITY;

-- RLS policies for expressions
CREATE POLICY "Expressions are viewable by everyone"
ON public.expressions FOR SELECT
USING (expires_at > now());

CREATE POLICY "Users can create their own expressions"
ON public.expressions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expressions"
ON public.expressions FOR DELETE
USING (auth.uid() = user_id);

-- Create index for efficient querying
CREATE INDEX idx_expressions_user_id ON public.expressions(user_id);
CREATE INDEX idx_expressions_expires_at ON public.expressions(expires_at);