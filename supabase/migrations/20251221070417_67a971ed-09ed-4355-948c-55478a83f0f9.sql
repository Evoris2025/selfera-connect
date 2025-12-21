-- Drop existing storage policies if they exist and recreate
DROP POLICY IF EXISTS "Users can upload their own media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own media" ON storage.objects;

-- Add RLS policy for media uploads (only authenticated users can upload to their folder)
CREATE POLICY "Users can upload their own media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'media' AND
  auth.uid() IS NOT NULL AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Add RLS policy for media deletion (only owner can delete)
CREATE POLICY "Users can delete their own media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Add RLS policy for media updates (only owner can update)
CREATE POLICY "Users can update their own media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Fix 2: Remove open notification INSERT policy and replace with trigger-based creation
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

-- Create trigger function for reaction notifications
CREATE OR REPLACE FUNCTION public.create_notification_on_reaction()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id UUID;
BEGIN
  -- Get the post author
  SELECT author_id INTO post_author_id FROM posts WHERE id = NEW.post_id;
  
  -- Don't notify if user is reacting to their own post
  IF NEW.user_id != post_author_id AND post_author_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, actor_id, type, target_type, target_id)
    VALUES (post_author_id, NEW.user_id, 'reaction', 'post', NEW.post_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger function for comment notifications
CREATE OR REPLACE FUNCTION public.create_notification_on_comment()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id UUID;
BEGIN
  -- Get the post author
  SELECT author_id INTO post_author_id FROM posts WHERE id = NEW.post_id;
  
  -- Don't notify if user is commenting on their own post
  IF NEW.user_id != post_author_id AND post_author_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, actor_id, type, target_type, target_id, message)
    VALUES (post_author_id, NEW.user_id, 'comment', 'post', NEW.post_id, LEFT(NEW.body, 100));
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger function for follow notifications
CREATE OR REPLACE FUNCTION public.create_notification_on_follow()
RETURNS TRIGGER AS $$
BEGIN
  -- Don't notify if following yourself (shouldn't happen but be safe)
  IF NEW.follower_id != NEW.following_id THEN
    INSERT INTO notifications (user_id, actor_id, type, target_type, target_id)
    VALUES (NEW.following_id, NEW.follower_id, 'follow', 'user', NEW.follower_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers
DROP TRIGGER IF EXISTS on_reaction_create_notification ON reactions;
CREATE TRIGGER on_reaction_create_notification
  AFTER INSERT ON reactions
  FOR EACH ROW
  EXECUTE FUNCTION public.create_notification_on_reaction();

DROP TRIGGER IF EXISTS on_comment_create_notification ON comments;
CREATE TRIGGER on_comment_create_notification
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION public.create_notification_on_comment();

DROP TRIGGER IF EXISTS on_follow_create_notification ON follows;
CREATE TRIGGER on_follow_create_notification
  AFTER INSERT ON follows
  FOR EACH ROW
  EXECUTE FUNCTION public.create_notification_on_follow();