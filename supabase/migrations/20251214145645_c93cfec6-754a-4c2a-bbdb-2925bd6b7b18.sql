-- Create communities table
CREATE TABLE public.communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  handle TEXT UNIQUE NOT NULL,
  description TEXT,
  avatar_url TEXT,
  cover_url TEXT,
  member_count INTEGER DEFAULT 0,
  follower_count INTEGER DEFAULT 0,
  is_private BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create community memberships table (user is a member of community)
CREATE TABLE public.community_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- 'admin', 'moderator', 'member'
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, community_id)
);

-- Create community follows table (user follows a community without being a member)
CREATE TABLE public.community_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, community_id)
);

-- Create community posts table (posts shared to communities)
CREATE TABLE public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(post_id, community_id)
);

-- Enable RLS
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- Communities policies
CREATE POLICY "Communities are viewable by everyone" ON public.communities
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create communities" ON public.communities
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Community creators can update their communities" ON public.communities
  FOR UPDATE USING (auth.uid() = created_by);

-- Community memberships policies
CREATE POLICY "Memberships are viewable by everyone" ON public.community_memberships
  FOR SELECT USING (true);

CREATE POLICY "Users can join communities" ON public.community_memberships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave communities" ON public.community_memberships
  FOR DELETE USING (auth.uid() = user_id);

-- Community follows policies
CREATE POLICY "Community follows are viewable by everyone" ON public.community_follows
  FOR SELECT USING (true);

CREATE POLICY "Users can follow communities" ON public.community_follows
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow communities" ON public.community_follows
  FOR DELETE USING (auth.uid() = user_id);

-- Community posts policies
CREATE POLICY "Community posts are viewable by everyone" ON public.community_posts
  FOR SELECT USING (true);

CREATE POLICY "Users can share posts to communities" ON public.community_posts
  FOR INSERT WITH CHECK (auth.uid() = shared_by);

CREATE POLICY "Users can remove their shared posts" ON public.community_posts
  FOR DELETE USING (auth.uid() = shared_by);

-- Add indexes for performance
CREATE INDEX idx_community_memberships_user ON public.community_memberships(user_id);
CREATE INDEX idx_community_memberships_community ON public.community_memberships(community_id);
CREATE INDEX idx_community_follows_user ON public.community_follows(user_id);
CREATE INDEX idx_community_follows_community ON public.community_follows(community_id);
CREATE INDEX idx_community_posts_community ON public.community_posts(community_id);
CREATE INDEX idx_community_posts_post ON public.community_posts(post_id);

-- Add trigger for updated_at on communities
CREATE TRIGGER update_communities_updated_at
  BEFORE UPDATE ON public.communities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();