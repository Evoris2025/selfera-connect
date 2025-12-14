import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SuggestedProfile {
  id: string;
  display_name: string | null;
  handle: string | null;
  avatar_url: string | null;
  bio: string | null;
  isFollowing: boolean;
}

export function DiscoverRow() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<SuggestedProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchProfiles();
  }, [user]);

  const fetchProfiles = async () => {
    try {
      // Fetch profiles (excluding current user)
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, handle, avatar_url, bio')
        .neq('id', user?.id || '')
        .limit(10);

      if (profilesError) throw profilesError;

      // Fetch current user's follows
      let followingSet = new Set<string>();
      if (user) {
        const { data: followsData, error: followsError } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id)
          .eq('status', 'approved');

        if (!followsError && followsData) {
          followingSet = new Set(followsData.map(f => f.following_id));
        }
      }

      setFollowingIds(followingSet);
      setProfiles(
        (profilesData || []).map(p => ({
          ...p,
          isFollowing: followingSet.has(p.id),
        }))
      );
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async (profileId: string, isCurrentlyFollowing: boolean) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to follow users.',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (isCurrentlyFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', profileId);

        if (error) throw error;

        setFollowingIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(profileId);
          return newSet;
        });
        setProfiles(prev =>
          prev.map(p => (p.id === profileId ? { ...p, isFollowing: false } : p))
        );
        toast({ title: 'Unfollowed successfully' });
      } else {
        // Follow
        const { error } = await supabase.from('follows').insert({
          follower_id: user.id,
          following_id: profileId,
          status: 'approved',
        });

        if (error) throw error;

        setFollowingIds(prev => new Set(prev).add(profileId));
        setProfiles(prev =>
          prev.map(p => (p.id === profileId ? { ...p, isFollowing: true } : p))
        );
        toast({ title: 'Following!' });
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast({
        title: 'Error',
        description: 'Failed to update follow status.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="py-4">
        <div className="flex items-center justify-between px-4 mb-3">
          <div className="h-4 w-28 bg-muted rounded animate-pulse" />
        </div>
        <div className="flex gap-3 px-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex-shrink-0 w-36 h-32 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (profiles.length === 0) {
    return null;
  }

  return (
    <div className="py-4">
      <div className="flex items-center justify-between px-4 mb-3">
        <h3 className="text-sm font-semibold text-foreground">Discover People</h3>
        <button
          className="text-xs text-primary flex items-center gap-0.5"
          onClick={() => navigate('/directory')}
        >
          See all
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>

      <ScrollArea className="w-full">
        <div className="flex gap-3 px-4 pb-2">
          {profiles.map(profile => (
            <div
              key={profile.id}
              className="flex-shrink-0 w-36 bg-card border border-border rounded-xl p-3 flex flex-col items-center text-center"
            >
              <Avatar
                className="h-14 w-14 mb-2 cursor-pointer"
                onClick={() => navigate(`/profile/${profile.handle || profile.id}`)}
              >
                <AvatarImage src={profile.avatar_url || ''} alt={profile.display_name || ''} />
                <AvatarFallback className="bg-secondary text-secondary-foreground text-lg">
                  {(profile.display_name || 'U').charAt(0)}
                </AvatarFallback>
              </Avatar>

              <p className="text-sm font-medium text-foreground truncate w-full">
                {profile.display_name || 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate w-full mb-2">
                @{profile.handle || 'user'}
              </p>

              <Button
                variant={profile.isFollowing ? 'outline' : 'default'}
                size="sm"
                className="w-full h-7 text-xs"
                onClick={() => handleFollowToggle(profile.id, profile.isFollowing)}
              >
                {profile.isFollowing ? 'Following' : 'Follow'}
              </Button>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
