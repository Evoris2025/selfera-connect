-- Drafts table for auto-save functionality
CREATE TABLE public.drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('expression', 'video', 'image', 'post')),
  draft_data JSONB NOT NULL DEFAULT '{}',
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Polls table
CREATE TABLE public.polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  options JSONB NOT NULL DEFAULT '[]',
  duration_hours INTEGER DEFAULT 24,
  ends_at TIMESTAMP WITH TIME ZONE,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Poll votes
CREATE TABLE public.poll_votes (
  poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  option_index INTEGER NOT NULL,
  voted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (poll_id, user_id)
);

-- Scheduled posts
CREATE TABLE public.scheduled_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_data JSONB NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'failed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Video chapters
CREATE TABLE public.video_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  timestamp_seconds INTEGER NOT NULL,
  title TEXT NOT NULL
);

-- Video cards (mid-roll links)
CREATE TABLE public.video_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  timestamp_seconds INTEGER NOT NULL,
  card_type TEXT NOT NULL CHECK (card_type IN ('video', 'channel', 'link', 'poll')),
  card_data JSONB NOT NULL DEFAULT '{}'
);

-- User tags in media
CREATE TABLE public.media_user_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  tagged_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  position_x FLOAT,
  position_y FLOAT,
  media_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Expression interactive responses (poll, question, quiz answers)
CREATE TABLE public.expression_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expression_id UUID REFERENCES public.expressions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sticker_type TEXT NOT NULL CHECK (sticker_type IN ('poll', 'question', 'quiz', 'countdown', 'slider')),
  response_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Playlists table (for video organization)
CREATE TABLE public.playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'unlisted', 'private')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Playlist items
CREATE TABLE public.playlist_items (
  playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (playlist_id, post_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_user_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expression_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for drafts
CREATE POLICY "Users can view their own drafts" ON public.drafts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own drafts" ON public.drafts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own drafts" ON public.drafts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own drafts" ON public.drafts FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for polls
CREATE POLICY "Anyone can view polls" ON public.polls FOR SELECT USING (true);
CREATE POLICY "Post authors can create polls" ON public.polls FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM posts WHERE id = post_id AND author_id = auth.uid())
);

-- RLS Policies for poll_votes
CREATE POLICY "Users can view all votes" ON public.poll_votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can vote" ON public.poll_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can change their vote" ON public.poll_votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can remove their vote" ON public.poll_votes FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for scheduled_posts
CREATE POLICY "Users can view their scheduled posts" ON public.scheduled_posts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create scheduled posts" ON public.scheduled_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their scheduled posts" ON public.scheduled_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their scheduled posts" ON public.scheduled_posts FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for video_chapters
CREATE POLICY "Anyone can view video chapters" ON public.video_chapters FOR SELECT USING (true);
CREATE POLICY "Video authors can manage chapters" ON public.video_chapters FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM posts WHERE id = post_id AND author_id = auth.uid())
);
CREATE POLICY "Video authors can update chapters" ON public.video_chapters FOR UPDATE USING (
  EXISTS (SELECT 1 FROM posts WHERE id = post_id AND author_id = auth.uid())
);
CREATE POLICY "Video authors can delete chapters" ON public.video_chapters FOR DELETE USING (
  EXISTS (SELECT 1 FROM posts WHERE id = post_id AND author_id = auth.uid())
);

-- RLS Policies for video_cards
CREATE POLICY "Anyone can view video cards" ON public.video_cards FOR SELECT USING (true);
CREATE POLICY "Video authors can manage cards" ON public.video_cards FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM posts WHERE id = post_id AND author_id = auth.uid())
);
CREATE POLICY "Video authors can update cards" ON public.video_cards FOR UPDATE USING (
  EXISTS (SELECT 1 FROM posts WHERE id = post_id AND author_id = auth.uid())
);
CREATE POLICY "Video authors can delete cards" ON public.video_cards FOR DELETE USING (
  EXISTS (SELECT 1 FROM posts WHERE id = post_id AND author_id = auth.uid())
);

-- RLS Policies for media_user_tags
CREATE POLICY "Anyone can view media tags" ON public.media_user_tags FOR SELECT USING (true);
CREATE POLICY "Post authors can add tags" ON public.media_user_tags FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM posts WHERE id = post_id AND author_id = auth.uid())
);
CREATE POLICY "Post authors can remove tags" ON public.media_user_tags FOR DELETE USING (
  EXISTS (SELECT 1 FROM posts WHERE id = post_id AND author_id = auth.uid())
);

-- RLS Policies for expression_responses
CREATE POLICY "Expression owners can view responses" ON public.expression_responses FOR SELECT USING (
  EXISTS (SELECT 1 FROM expressions WHERE id = expression_id AND user_id = auth.uid())
  OR auth.uid() = user_id
);
CREATE POLICY "Authenticated users can respond" ON public.expression_responses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their responses" ON public.expression_responses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their responses" ON public.expression_responses FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for playlists
CREATE POLICY "Public playlists are viewable by anyone" ON public.playlists FOR SELECT USING (visibility = 'public' OR auth.uid() = user_id);
CREATE POLICY "Users can create playlists" ON public.playlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their playlists" ON public.playlists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their playlists" ON public.playlists FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for playlist_items
CREATE POLICY "Playlist items are viewable if playlist is viewable" ON public.playlist_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM playlists WHERE id = playlist_id AND (visibility = 'public' OR user_id = auth.uid()))
);
CREATE POLICY "Playlist owners can add items" ON public.playlist_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM playlists WHERE id = playlist_id AND user_id = auth.uid())
);
CREATE POLICY "Playlist owners can remove items" ON public.playlist_items FOR DELETE USING (
  EXISTS (SELECT 1 FROM playlists WHERE id = playlist_id AND user_id = auth.uid())
);

-- Trigger for updating drafts updated_at
CREATE TRIGGER update_drafts_updated_at
BEFORE UPDATE ON public.drafts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_drafts_user_id ON public.drafts(user_id);
CREATE INDEX idx_drafts_content_type ON public.drafts(content_type);
CREATE INDEX idx_polls_post_id ON public.polls(post_id);
CREATE INDEX idx_poll_votes_poll_id ON public.poll_votes(poll_id);
CREATE INDEX idx_scheduled_posts_user_id ON public.scheduled_posts(user_id);
CREATE INDEX idx_scheduled_posts_scheduled_for ON public.scheduled_posts(scheduled_for);
CREATE INDEX idx_video_chapters_post_id ON public.video_chapters(post_id);
CREATE INDEX idx_video_cards_post_id ON public.video_cards(post_id);
CREATE INDEX idx_media_user_tags_post_id ON public.media_user_tags(post_id);
CREATE INDEX idx_expression_responses_expression_id ON public.expression_responses(expression_id);
CREATE INDEX idx_playlists_user_id ON public.playlists(user_id);
CREATE INDEX idx_playlist_items_playlist_id ON public.playlist_items(playlist_id);