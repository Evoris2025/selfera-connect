-- Create expression_reactions table for tracking reactions on expressions
CREATE TABLE public.expression_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expression_id UUID NOT NULL REFERENCES public.expressions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(expression_id, user_id, emoji)
);

-- Create expression_replies table for tracking replies on expressions
CREATE TABLE public.expression_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expression_id UUID NOT NULL REFERENCES public.expressions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create expression_views table for tracking views
CREATE TABLE public.expression_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expression_id UUID NOT NULL REFERENCES public.expressions(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  watch_duration_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  UNIQUE(expression_id, viewer_id)
);

-- Create push_subscriptions table for storing device tokens
CREATE TABLE public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

-- Enable RLS on all tables
ALTER TABLE public.expression_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expression_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expression_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for expression_reactions
CREATE POLICY "Expression reactions are viewable by everyone"
  ON public.expression_reactions FOR SELECT
  USING (true);

CREATE POLICY "Users can add reactions to expressions"
  ON public.expression_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own reactions"
  ON public.expression_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for expression_replies
CREATE POLICY "Expression replies are viewable by everyone"
  ON public.expression_replies FOR SELECT
  USING (true);

CREATE POLICY "Users can add replies to expressions"
  ON public.expression_replies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own replies"
  ON public.expression_replies FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for expression_views
CREATE POLICY "Expression views are viewable by expression owner"
  ON public.expression_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.expressions e
      WHERE e.id = expression_id AND e.user_id = auth.uid()
    )
    OR viewer_id = auth.uid()
  );

CREATE POLICY "Users can record their views"
  ON public.expression_views FOR INSERT
  WITH CHECK (auth.uid() = viewer_id);

CREATE POLICY "Users can update their own view records"
  ON public.expression_views FOR UPDATE
  USING (auth.uid() = viewer_id);

-- RLS policies for push_subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON public.push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions"
  ON public.push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON public.push_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions"
  ON public.push_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger function to notify on expression reaction
CREATE OR REPLACE FUNCTION public.notify_expression_reaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  expression_owner_id UUID;
BEGIN
  -- Get expression owner
  SELECT user_id INTO expression_owner_id FROM expressions WHERE id = NEW.expression_id;
  
  -- Don't notify if user is reacting to their own expression
  IF NEW.user_id != expression_owner_id AND expression_owner_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, actor_id, type, target_type, target_id, message)
    VALUES (expression_owner_id, NEW.user_id, 'expression_reaction', 'expression', NEW.expression_id::text, NEW.emoji);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger function to notify on expression reply
CREATE OR REPLACE FUNCTION public.notify_expression_reply()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  expression_owner_id UUID;
BEGIN
  -- Get expression owner
  SELECT user_id INTO expression_owner_id FROM expressions WHERE id = NEW.expression_id;
  
  -- Don't notify if user is replying to their own expression
  IF NEW.user_id != expression_owner_id AND expression_owner_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, actor_id, type, target_type, target_id, message)
    VALUES (expression_owner_id, NEW.user_id, 'expression_reply', 'expression', NEW.expression_id::text, LEFT(NEW.content, 100));
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER on_expression_reaction_create
  AFTER INSERT ON public.expression_reactions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_expression_reaction();

CREATE TRIGGER on_expression_reply_create
  AFTER INSERT ON public.expression_replies
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_expression_reply();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.expression_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.expression_replies;
ALTER PUBLICATION supabase_realtime ADD TABLE public.expression_views;