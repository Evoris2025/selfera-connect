-- Create enums for user types, content moderation, and reactions
CREATE TYPE public.user_type AS ENUM ('individual', 'organization', 'professional');
CREATE TYPE public.verification_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.moderation_status AS ENUM ('published', 'limited', 'removed');
CREATE TYPE public.reaction_type AS ENUM ('support', 'informative', 'relatable');
CREATE TYPE public.report_status AS ENUM ('new', 'reviewing', 'actioned', 'dismissed');
CREATE TYPE public.follow_status AS ENUM ('requested', 'approved');
CREATE TYPE public.content_warning_type AS ENUM ('sensitive', 'triggering', 'graphic', 'other');
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  handle TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  country TEXT,
  language_pref TEXT DEFAULT 'en',
  is_private BOOLEAN DEFAULT false,
  user_type user_type DEFAULT 'individual',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create verification requests table
CREATE TABLE public.verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status verification_status DEFAULT 'pending',
  submitted_fields JSONB,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create topic tags table
CREATE TABLE public.topic_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create posts table
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT,
  media_url TEXT,
  media_type TEXT,
  media_meta JSONB,
  thumbnail_url TEXT,
  language_code TEXT DEFAULT 'en',
  visibility TEXT DEFAULT 'public',
  content_warning_enabled BOOLEAN DEFAULT false,
  content_warning_type content_warning_type,
  moderation_status moderation_status DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create post tag mapping table
CREATE TABLE public.post_tag_map (
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES public.topic_tags(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (post_id, tag_id)
);

-- Create reactions table
CREATE TABLE public.reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type reaction_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (post_id, user_id, type)
);

-- Create comments table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  body TEXT NOT NULL,
  is_removed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create follows table
CREATE TABLE public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status follow_status DEFAULT 'approved',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (follower_id, following_id)
);

-- Create saves table
CREATE TABLE public.saves (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);

-- Create reports table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status report_status DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create blocks table
CREATE TABLE public.blocks (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  target_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, target_user_id)
);

-- Create mutes table
CREATE TABLE public.mutes (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  target_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, target_user_id)
);

-- Create service directory entries table
CREATE TABLE public.service_directory_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  regions_served TEXT[],
  delivery_type TEXT,
  price_range TEXT,
  languages_supported TEXT[],
  tags TEXT[],
  links JSONB,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_tag_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_directory_entries ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, handle)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data ->> 'handle', LOWER(REPLACE(split_part(NEW.email, '@', 1), '.', '_')) || '_' || SUBSTR(NEW.id::TEXT, 1, 4))
  );
  
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_directory_updated_at BEFORE UPDATE ON public.service_directory_entries
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for user_roles (read-only for users)
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for verification_requests
CREATE POLICY "Users can view their own verification requests" ON public.verification_requests
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own verification requests" ON public.verification_requests
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for topic_tags (public read)
CREATE POLICY "Topic tags are viewable by everyone" ON public.topic_tags
FOR SELECT USING (active = true);

-- RLS Policies for posts
CREATE POLICY "Published posts are viewable by everyone" ON public.posts
FOR SELECT USING (
  moderation_status = 'published' 
  AND visibility = 'public'
);

CREATE POLICY "Users can view their own posts" ON public.posts
FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Users can create posts" ON public.posts
FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own posts" ON public.posts
FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own posts" ON public.posts
FOR DELETE USING (auth.uid() = author_id);

-- RLS Policies for post_tag_map
CREATE POLICY "Post tags are viewable by everyone" ON public.post_tag_map
FOR SELECT USING (true);

CREATE POLICY "Users can add tags to their posts" ON public.post_tag_map
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.posts WHERE id = post_id AND author_id = auth.uid())
);

-- RLS Policies for reactions
CREATE POLICY "Reactions are viewable by everyone" ON public.reactions
FOR SELECT USING (true);

CREATE POLICY "Users can add reactions" ON public.reactions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own reactions" ON public.reactions
FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for comments
CREATE POLICY "Comments are viewable by everyone" ON public.comments
FOR SELECT USING (is_removed = false);

CREATE POLICY "Users can add comments" ON public.comments
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON public.comments
FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for follows
CREATE POLICY "Follows are viewable by everyone" ON public.follows
FOR SELECT USING (true);

CREATE POLICY "Users can follow others" ON public.follows
FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow" ON public.follows
FOR DELETE USING (auth.uid() = follower_id);

-- RLS Policies for saves
CREATE POLICY "Users can view their own saves" ON public.saves
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can save posts" ON public.saves
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave posts" ON public.saves
FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for reports
CREATE POLICY "Users can create reports" ON public.reports
FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports" ON public.reports
FOR SELECT USING (auth.uid() = reporter_id);

-- RLS Policies for blocks
CREATE POLICY "Users can view their blocks" ON public.blocks
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can block others" ON public.blocks
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unblock" ON public.blocks
FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for mutes
CREATE POLICY "Users can view their mutes" ON public.mutes
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can mute others" ON public.mutes
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unmute" ON public.mutes
FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for service directory
CREATE POLICY "Directory entries are viewable by everyone" ON public.service_directory_entries
FOR SELECT USING (true);

CREATE POLICY "Users can create their own directory entry" ON public.service_directory_entries
FOR INSERT WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Users can update their own directory entry" ON public.service_directory_entries
FOR UPDATE USING (auth.uid() = owner_user_id);

-- Insert default topic tags
INSERT INTO public.topic_tags (name, category) VALUES
  ('Self-care', 'wellness'),
  ('Anxiety', 'mental-health'),
  ('Depression', 'mental-health'),
  ('Mindfulness', 'wellness'),
  ('Recovery', 'journey'),
  ('Support', 'community'),
  ('Awareness', 'education'),
  ('Wellness', 'wellness'),
  ('Therapy', 'professional'),
  ('Stress', 'mental-health'),
  ('Relationships', 'life'),
  ('Work-life', 'life'),
  ('Grief', 'mental-health'),
  ('PTSD', 'mental-health'),
  ('Addiction', 'recovery');
