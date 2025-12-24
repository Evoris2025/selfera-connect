import { useState, useEffect, useCallback } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { FollowButton } from '@/components/interactions';
import { CinematicAvatar } from '@/components/ui/CinematicAvatar';
import { GlassCard } from '@/components/ui/GlassCard';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const VISIBLE_COUNT = 8;
const FETCH_COUNT = 20;
const HIDDEN_PROFILES_KEY = 'selfera_hidden_discover_profiles';

// Fallback mock profiles when no real users exist
const mockProfiles: SuggestedProfile[] = [
  { id: 'mock-1', display_name: 'Sarah Chen', handle: 'sarahc', avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop', bio: 'Mental health advocate', isFollowing: false },
  { id: 'mock-2', display_name: 'Mind Matters', handle: 'mindmatters', avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop', bio: 'Daily wellness tips', isFollowing: false },
  { id: 'mock-3', display_name: 'James Wilson', handle: 'jwilson', avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop', bio: 'Sharing my journey', isFollowing: false },
  { id: 'mock-4', display_name: 'Wellness Hub', handle: 'wellnesshub', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop', bio: 'Your daily dose of calm', isFollowing: false },
  { id: 'mock-5', display_name: 'Emma Roberts', handle: 'emmar', avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop', bio: 'Mindfulness coach', isFollowing: false },
  { id: 'mock-6', display_name: 'Alex Turner', handle: 'alext', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop', bio: 'Daily reflections', isFollowing: false },
  { id: 'mock-7', display_name: 'Calm Corner', handle: 'calmcorner', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop', bio: 'Peace of mind', isFollowing: false },
  { id: 'mock-8', display_name: 'Mike Chen', handle: 'mikec', avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop', bio: 'Growth mindset', isFollowing: false },
];

interface SuggestedProfile {
  id: string;
  display_name: string | null;
  handle: string | null;
  avatar_url: string | null;
  bio: string | null;
  isFollowing: boolean;
}

// Load hidden profiles from localStorage
const loadHiddenProfiles = (): Set<string> => {
  try {
    const stored = localStorage.getItem(HIDDEN_PROFILES_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
};

// Save hidden profiles to localStorage
const saveHiddenProfiles = (ids: Set<string>) => {
  try {
    localStorage.setItem(HIDDEN_PROFILES_KEY, JSON.stringify([...ids]));
  } catch {
    // Ignore storage errors
  }
};

export function DiscoverRow() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<SuggestedProfile[]>([]);
  const [reserveProfiles, setReserveProfiles] = useState<SuggestedProfile[]>([]);
  const [hiddenProfiles, setHiddenProfiles] = useState<Set<string>>(loadHiddenProfiles);
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    fetchProfiles();
  }, [user]);

  const fetchProfiles = async () => {
    try {
      const hidden = loadHiddenProfiles();
      
      // Fetch more profiles than we display
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, handle, avatar_url, bio')
        .neq('id', user?.id || '')
        .limit(FETCH_COUNT);

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
      
      // Filter out hidden and already-followed profiles
      const availableProfiles = (profilesData || [])
        .filter(p => !hidden.has(p.id) && !followingSet.has(p.id))
        .map(p => ({
          ...p,
          isFollowing: false,
        }));
      
      // Split into visible and reserve
      if (availableProfiles.length > 0) {
        setProfiles(availableProfiles.slice(0, VISIBLE_COUNT));
        setReserveProfiles(availableProfiles.slice(VISIBLE_COUNT));
      } else {
        // Use mock profiles as fallback, also filtered
        const availableMocks = mockProfiles.filter(p => !hidden.has(p.id));
        setProfiles(availableMocks.slice(0, VISIBLE_COUNT));
        setReserveProfiles(availableMocks.slice(VISIBLE_COUNT));
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
      // On error, show mock profiles as fallback
      const hidden = loadHiddenProfiles();
      const availableMocks = mockProfiles.filter(p => !hidden.has(p.id));
      setProfiles(availableMocks.slice(0, VISIBLE_COUNT));
      setReserveProfiles(availableMocks.slice(VISIBLE_COUNT));
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = useCallback(async (profileId: string, isCurrentlyFollowing: boolean) => {
    // Only handle follow action for dismiss behavior (not unfollow)
    if (isCurrentlyFollowing) return;

    // Handle mock profiles
    if (profileId.startsWith('mock-')) {
      // Add to hidden profiles
      const newHidden = new Set(hiddenProfiles).add(profileId);
      setHiddenProfiles(newHidden);
      saveHiddenProfiles(newHidden);
      
      // Remove from visible and add from reserve
      setProfiles(prev => {
        const filtered = prev.filter(p => p.id !== profileId);
        if (reserveProfiles.length > 0) {
          const [nextProfile, ...remaining] = reserveProfiles;
          setReserveProfiles(remaining);
          return [...filtered, nextProfile];
        }
        return filtered;
      });
      
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
      // Follow the user
      const { error } = await supabase.from('follows').insert({
        follower_id: user.id,
        following_id: profileId,
        status: 'approved',
      });

      if (error) throw error;

      // Add to hidden profiles so they don't reappear
      const newHidden = new Set(hiddenProfiles).add(profileId);
      setHiddenProfiles(newHidden);
      saveHiddenProfiles(newHidden);

      // Update following set
      setFollowingIds(prev => new Set(prev).add(profileId));

      // Remove from visible and add from reserve
      setProfiles(prev => {
        const filtered = prev.filter(p => p.id !== profileId);
        if (reserveProfiles.length > 0) {
          const [nextProfile, ...remaining] = reserveProfiles;
          setReserveProfiles(remaining);
          return [...filtered, nextProfile];
        }
        return filtered;
      });

    } catch (error) {
      console.error('Error following user:', error);
      toast({
        title: 'Error',
        description: 'Failed to follow user.',
        variant: 'destructive',
      });
    }
  }, [user, hiddenProfiles, reserveProfiles]);

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

  if (profiles.length === 0) {
    return null; // Hide section if no profiles to show
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="py-5">
      {/* Section Header - Collapsible Trigger */}
      <div className="flex items-center justify-between px-5 mb-4">
        <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <h3 className="text-base font-semibold text-foreground">Discover People</h3>
          <ChevronDown 
            className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${
              isOpen ? '' : '-rotate-90'
            }`} 
          />
        </CollapsibleTrigger>
        <button
          className="text-sm text-primary font-medium flex items-center gap-0.5 hover:opacity-80 transition-opacity"
          onClick={() => navigate('/directory')}
        >
          See all
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Collapsible Content - Manual Scroll with Animated Cards */}
      <CollapsibleContent>
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-3 px-5">
            <AnimatePresence mode="popLayout">
              {profiles.map(profile => (
                <motion.div
                  key={profile.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: -20 }}
                  transition={{ 
                    duration: 0.3,
                    layout: { duration: 0.3 }
                  }}
                  className="flex-shrink-0"
                >
                  <GlassCard
                    variant="card"
                    hover
                    className="w-40 p-4 flex flex-col items-center text-center"
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
            </AnimatePresence>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}