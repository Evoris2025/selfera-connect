-- Add emotional tone enum type
CREATE TYPE emotional_tone AS ENUM ('support', 'steady', 'inspiration', 'progress');

-- Add tone column to posts table for emotional context filtering
ALTER TABLE public.posts
ADD COLUMN tone emotional_tone DEFAULT 'steady';

-- Add index for tone filtering
CREATE INDEX idx_posts_tone ON public.posts(tone);