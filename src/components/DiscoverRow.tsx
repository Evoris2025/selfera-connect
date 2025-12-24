import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { FollowButton } from '@/components/interactions';
import { CinematicAvatar } from '@/components/ui/CinematicAvatar';
import { GlassCard } from '@/components/ui/GlassCard';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

// Fallback mock profiles when no real users exist
const mockProfiles: SuggestedProfile[] = [
  { id: 'mock-1', display_name: 'Sarah Chen', handle: 'sarahc', avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop', bio: 'Mental health advocate', isFollowing: false },
  { id: 'mock-2', display_name: 'Mind Matters', handle: 'mindmatters', avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop', bio: 'Daily wellness tips', isFollowing: false },
  { id: 'mock-3', display_name: 'James Wilson', handle: 'jwilson', avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop', bio: 'Sharing my journey', isFollowing: false },
  { id: 'mock-4', display_name: 'Wellness Hub', handle: 'wellnesshub', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop', bio: 'Your daily dose of calm', isFollowing: false },
  { id: 'mock-5', display_name: 'Emma Roberts', handle: 'emmar', avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop', bio: 'Mindfulness coach', isFollowing: false },
];

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
      
      const realProfiles = (profilesData || []).map(p => ({
        ...p,
        isFollowing: followingSet.has(p.id),
      }));
      
      // Use real profiles if available, otherwise show mock profiles
      setProfiles(realProfiles.length > 0 ? realProfiles : mockProfiles);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      // On error, show mock profiles as fallback
      setProfiles(mockProfiles);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async (profileId: string, isCurrentlyFollowing: boolean) => {
    // Handle mock profiles - just toggle UI state
    if (profileId.startsWith('mock-')) {
      setProfiles(prev =>
        prev.map(p => (p.id === profileId ? { ...p, isFollowing: !p.isFollowing } : p))
      );
      return;
    }
    
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
      <div className="py-5 px-5">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
        </div>
        <div className="flex gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex-shrink-0 w-40 h-44 bg-muted/50 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="py-5">
      {/* Section Header */}
      <div className="flex items-center justify-between px-5 mb-4">
        <h3 className="text-base font-semibold text-foreground">Discover People</h3>
        <button
          className="text-sm text-primary font-medium flex items-center gap-0.5 hover:opacity-80 transition-opacity"
          onClick={() => navigate('/directory')}
        >
          See all
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Premium Glass Cards Scroll */}
      <ScrollArea className="w-full">
        <div className="flex gap-3 px-5 pb-3">
          {profiles.map((profile, index) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
            >
              <GlassCard
                variant="card"
                hover
                className="flex-shrink-0 w-40 p-4 flex flex-col items-center text-center"
              >
                {/* Premium Avatar with Gradient Ring */}
                <div 
                  className="mb-3 cursor-pointer"
                  onClick={() => navigate(`/profile/${profile.handle || profile.id}`)}
                >
                  <CinematicAvatar
                    src={profile.avatar_url || ''}
                    alt={profile.display_name || ''}
                    fallback={(profile.display_name || 'U').charAt(0)}
                    size="lg"
                    ring="gradient"
                    interactive
                  />
                </div>

                {/* Name */}
                <p className="text-sm font-semibold text-foreground truncate w-full mb-0.5">
                  {profile.display_name || 'User'}
                </p>
                
                {/* Handle */}
                <p className="text-xs text-muted-foreground truncate w-full mb-3">
                  @{profile.handle || 'user'}
                </p>

                {/* Gradient Follow Button */}
                <FollowButton
                  isFollowing={profile.isFollowing}
                  onToggle={() => handleFollowToggle(profile.id, profile.isFollowing)}
                  size="sm"
                  variant="gradient"
                  className="w-full"
                />
              </GlassCard>
            </motion.div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="opacity-0" />
      </ScrollArea>
    </div>
  );
}
