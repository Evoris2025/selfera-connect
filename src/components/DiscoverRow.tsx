import { useState, useEffect, useCallback } from 'react';
import { ChevronRight, ChevronDown, Check } from 'lucide-react';
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
import { Button } from '@/components/ui/button';

const VISIBLE_COUNT = 8;
const FETCH_COUNT = 20;
const HIDDEN_PROFILES_KEY = 'selfera_hidden_discover_profiles';
const CHECKMARK_DELAY = 600; // ms to show checkmark before dismissing

// Fallback mock profiles when no real users exist - always have enough to show
const mockProfiles: SuggestedProfile[] = [
  { id: 'mock-1', display_name: 'Sarah Chen', handle: 'sarahc', avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop', bio: 'Mental health advocate', isFollowing: false },
  { id: 'mock-2', display_name: 'Mind Matters', handle: 'mindmatters', avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop', bio: 'Daily wellness tips', isFollowing: false },
  { id: 'mock-3', display_name: 'James Wilson', handle: 'jwilson', avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop', bio: 'Sharing my journey', isFollowing: false },
  { id: 'mock-4', display_name: 'Wellness Hub', handle: 'wellnesshub', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop', bio: 'Your daily dose of calm', isFollowing: false },
  { id: 'mock-5', display_name: 'Emma Roberts', handle: 'emmar', avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop', bio: 'Mindfulness coach', isFollowing: false },
  { id: 'mock-6', display_name: 'Alex Turner', handle: 'alext', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop', bio: 'Daily reflections', isFollowing: false },
  { id: 'mock-7', display_name: 'Calm Corner', handle: 'calmcorner', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop', bio: 'Peace of mind', isFollowing: false },
  { id: 'mock-8', display_name: 'Mike Chen', handle: 'mikec', avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop', bio: 'Growth mindset', isFollowing: false },
  { id: 'mock-9', display_name: 'Luna Park', handle: 'lunapark', avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop', bio: 'Finding inner peace', isFollowing: false },
  { id: 'mock-10', display_name: 'David Lee', handle: 'davidlee', avatar_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&h=200&fit=crop', bio: 'Mental wellness journey', isFollowing: false },
  { id: 'mock-11', display_name: 'Zen Garden', handle: 'zengarden', avatar_url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200&h=200&fit=crop', bio: 'Meditation & mindfulness', isFollowing: false },
  { id: 'mock-12', display_name: 'Hope Rising', handle: 'hoperising', avatar_url: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=200&h=200&fit=crop', bio: 'Spreading positivity', isFollowing: false },
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
  const [pendingFollows, setPendingFollows] = useState<Set<string>>(new Set());

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
        let availableMocks = mockProfiles.filter(p => !hidden.has(p.id));
        
        // If all mocks are hidden, reset hidden profiles and show all mocks
        if (availableMocks.length === 0) {
          localStorage.removeItem(HIDDEN_PROFILES_KEY);
          setHiddenProfiles(new Set());
          availableMocks = [...mockProfiles];
        }
        
        setProfiles(availableMocks.slice(0, VISIBLE_COUNT));
        setReserveProfiles(availableMocks.slice(VISIBLE_COUNT));
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
      // On error, show mock profiles as fallback
      const hidden = loadHiddenProfiles();
      let availableMocks = mockProfiles.filter(p => !hidden.has(p.id));
      
      // If all mocks are hidden, reset and show all
      if (availableMocks.length === 0) {
        localStorage.removeItem(HIDDEN_PROFILES_KEY);
        setHiddenProfiles(new Set());
        availableMocks = [...mockProfiles];
      }
      
      setProfiles(availableMocks.slice(0, VISIBLE_COUNT));
      setReserveProfiles(availableMocks.slice(VISIBLE_COUNT));
    } finally {
      setLoading(false);
    }
  };

  const dismissProfile = useCallback((profileId: string) => {
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
    
    // Clear pending state
    setPendingFollows(prev => {
      const newSet = new Set(prev);
      newSet.delete(profileId);
      return newSet;
    });
  }, [hiddenProfiles, reserveProfiles]);

  const handleFollowToggle = useCallback(async (profileId: string, isCurrentlyFollowing: boolean) => {
    // Only handle follow action for dismiss behavior (not unfollow)
    if (isCurrentlyFollowing || pendingFollows.has(profileId)) return;

    // Mark as pending (shows checkmark)
    setPendingFollows(prev => new Set(prev).add(profileId));

    // Handle mock profiles
    if (profileId.startsWith('mock-')) {
      // Wait for checkmark animation, then dismiss
      setTimeout(() => {
        dismissProfile(profileId);
      }, CHECKMARK_DELAY);
      return;
    }
    
    if (!user) {
      setPendingFollows(prev => {
        const newSet = new Set(prev);
        newSet.delete(profileId);
        return newSet;
      });
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

      // Update following set
      setFollowingIds(prev => new Set(prev).add(profileId));

      // Wait for checkmark animation, then dismiss
      setTimeout(() => {
        dismissProfile(profileId);
      }, CHECKMARK_DELAY);

    } catch (error) {
      console.error('Error following user:', error);
      setPendingFollows(prev => {
        const newSet = new Set(prev);
        newSet.delete(profileId);
        return newSet;
      });
      toast({
        title: 'Error',
        description: 'Failed to follow user.',
        variant: 'destructive',
      });
    }
  }, [user, pendingFollows, dismissProfile]);

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

  // Always show the row - we reset hidden profiles if all are hidden

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

      {/* Collapsible Content - Infinite Marquee Scroll */}
      <CollapsibleContent>
        <div className="overflow-hidden relative">
          {/* Gradient masks for smooth edges */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          
          <motion.div
            className="flex gap-3 px-5"
            animate={{
              x: [0, -((profiles.length * 172) / 2)],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: profiles.length * 4,
                ease: "linear",
              },
            }}
            whileHover={{ animationPlayState: "paused" }}
            style={{ animationPlayState: "running" }}
            onHoverStart={(e) => {
              const target = e.target as HTMLElement;
              target.style.animationPlayState = "paused";
            }}
            onHoverEnd={(e) => {
              const target = e.target as HTMLElement;
              target.style.animationPlayState = "running";
            }}
          >
            {/* Duplicate profiles for seamless loop */}
            {[...profiles, ...profiles].map((profile, index) => {
              const isPending = pendingFollows.has(profile.id);
              const uniqueKey = `${profile.id}-${index}`;
              
              return (
                <motion.div
                  key={uniqueKey}
                  className="flex-shrink-0"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
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

                    {/* Follow Button with Checkmark Animation */}
                    <motion.div
                      animate={isPending ? {
                        scale: [1, 1.08, 1],
                        transition: {
                          duration: 1.6,
                          repeat: Infinity,
                          repeatDelay: 0.4,
                          ease: "easeInOut"
                        }
                      } : {}}
                      className="w-full"
                    >
                      <Button
                        size="sm"
                        onClick={() => handleFollowToggle(profile.id, profile.isFollowing)}
                        disabled={isPending}
                        className={`w-full h-8 text-xs font-semibold rounded-lg transition-all duration-300 overflow-hidden ${
                          isPending 
                            ? 'bg-blue-500 hover:bg-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.5)]' 
                            : 'bg-gradient-to-r from-primary via-pink-500 to-orange-400 hover:opacity-90 text-white'
                        }`}
                      >
                        <AnimatePresence mode="wait">
                          {isPending ? (
                            <motion.div
                              key="check"
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ 
                                scale: [0, 1.4, 1],
                                opacity: 1,
                              }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ 
                                duration: 0.5,
                                ease: [0.34, 1.56, 0.64, 1],
                                times: [0, 0.6, 1]
                              }}
                              className="flex items-center justify-center"
                            >
                              <Check className="h-5 w-5" strokeWidth={3.5} />
                            </motion.div>
                          ) : (
                            <motion.span
                              key="follow"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.15 }}
                            >
                              Follow
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </Button>
                    </motion.div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}