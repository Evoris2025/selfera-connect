-- Create notification preferences table
CREATE TABLE public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reactions_enabled BOOLEAN NOT NULL DEFAULT true,
  replies_enabled BOOLEAN NOT NULL DEFAULT true,
  follows_enabled BOOLEAN NOT NULL DEFAULT true,
  comments_enabled BOOLEAN NOT NULL DEFAULT true,
  mentions_enabled BOOLEAN NOT NULL DEFAULT true,
  interactions_enabled BOOLEAN NOT NULL DEFAULT true,
  push_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own preferences"
  ON public.notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own preferences"
  ON public.notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON public.notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Create post views table for tracking views on posts/images/videos
CREATE TABLE public.post_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  view_duration_seconds INTEGER DEFAULT 0,
  UNIQUE(post_id, viewer_id, viewed_at)
);

-- Enable RLS
ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;

-- RLS policies for post_views
CREATE POLICY "Post views are viewable by post owner"
  ON public.post_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM posts p 
      WHERE p.id = post_views.post_id 
      AND p.author_id = auth.uid()
    ) OR viewer_id = auth.uid()
  );

CREATE POLICY "Users can record their views"
  ON public.post_views FOR INSERT
  WITH CHECK (auth.uid() = viewer_id);

-- Create index for faster queries
CREATE INDEX idx_post_views_post_id ON public.post_views(post_id);
CREATE INDEX idx_post_views_viewer_id ON public.post_views(viewer_id);
CREATE INDEX idx_post_views_viewed_at ON public.post_views(viewed_at);
CREATE INDEX idx_notification_preferences_user_id ON public.notification_preferences(user_id);

-- Trigger for updated_at
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();