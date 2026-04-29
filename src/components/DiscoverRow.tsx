import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronRight, ChevronDown, Check } from 'lucide-react';
import { CinematicAvatar } from '@/components/ui/CinematicAvatar';
import { GlassCard } from '@/components/ui/GlassCard';
import { EraVerifiedTick } from '@/components/EraVerifiedTick';
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
const CHECKMARK_DELAY = 600;

// Fallback mock profiles
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
  is_verified?: boolean;
  email?: string | null;
}

const loadHiddenProfiles = (): Set<string> => {
  try {
    const stored = localStorage.getItem(HIDDEN_PROFILES_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
};

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
  const [hiddenProfiles, setHiddenProfiles] = useState<Set<string>>(loadHiddenProfiles);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [isOpen, setIsOpen] = useState(true);
  const [pendingFollows, setPendingFollows] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProfiles(true);
  }, [user]);

  const fetchProfiles = async (isInitial = false) => {
    if (loadingMore && !isInitial) return;
    
    try {
      if (isInitial) {
        setLoading(true);
        setOffset(0);
      } else {
        setLoadingMore(true);
      }
      
      const hidden = loadHiddenProfiles();
      const currentOffset = isInitial ? 0 : offset;
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, handle, avatar_url, bio, is_verified, email')
        .neq('id', user?.id || '')
        .range(currentOffset, currentOffset + FETCH_COUNT - 1);

      if (profilesError) throw profilesError;

      // Fetch current user's follows
      let followingSet = followingIds;
      if (user && isInitial) {
        const { data: followsData, error: followsError } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id)
          .eq('status', 'approved');

        if (!followsError && followsData) {
          followingSet = new Set(followsData.map(f => f.following_id));
          setFollowingIds(followingSet);
        }
      }
      
      // Filter out hidden and already-followed profiles
      const newProfiles = (profilesData || [])
        .filter(p => !hidden.has(p.id) && !followingSet.has(p.id))
        .map(p => ({
          ...p,
          isFollowing: false,
        }));
      
      if (newProfiles.length < FETCH_COUNT) {
        setHasMore(false);
      }

      if (isInitial) {
        if (newProfiles.length > 0) {
          setProfiles(newProfiles.slice(0, VISIBLE_COUNT));
          setOffset(VISIBLE_COUNT);
        } else {
          // Use mock profiles as fallback
          let availableMocks = mockProfiles.filter(p => !hidden.has(p.id));
          if (availableMocks.length === 0) {
            localStorage.removeItem(HIDDEN_PROFILES_KEY);
            setHiddenProfiles(new Set());
            availableMocks = [...mockProfiles];
          }
          setProfiles(availableMocks.slice(0, VISIBLE_COUNT));
          setHasMore(availableMocks.length > VISIBLE_COUNT);
        }
      } else {
        setProfiles(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const uniqueNew = newProfiles.filter(p => !existingIds.has(p.id));
          return [...prev, ...uniqueNew];
        });
        setOffset(prev => prev + newProfiles.length);
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
      if (isInitial) {
        const hidden = loadHiddenProfiles();
        let availableMocks = mockProfiles.filter(p => !hidden.has(p.id));
        if (availableMocks.length === 0) {
          localStorage.removeItem(HIDDEN_PROFILES_KEY);
          setHiddenProfiles(new Set());
          availableMocks = [...mockProfiles];
        }
        setProfiles(availableMocks.slice(0, VISIBLE_COUNT));
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Handle scroll to load more
  const handleScroll = useCallback(() => {
    if (!scrollRef.current || loadingMore || !hasMore) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const scrollEnd = scrollWidth - clientWidth;
    
    // Load more when within 100px of the end
    if (scrollEnd - scrollLeft < 100) {
      fetchProfiles(false);
    }
  }, [loadingMore, hasMore]);

  const dismissProfile = useCallback((profileId: string) => {
    const newHidden = new Set(hiddenProfiles).add(profileId);
    setHiddenProfiles(newHidden);
    saveHiddenProfiles(newHidden);
    
    setProfiles(prev => prev.filter(p => p.id !== profileId));
    
    setPendingFollows(prev => {
      const newSet = new Set(prev);
      newSet.delete(profileId);
      return newSet;
    });
  }, [hiddenProfiles]);

  const handleFollowToggle = useCallback(async (profileId: string, isCurrentlyFollowing: boolean) => {
    if (isCurrentlyFollowing || pendingFollows.has(profileId)) return;

    setPendingFollows(prev => new Set(prev).add(profileId));

    if (profileId.startsWith('mock-')) {
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
      const { error } = await supabase.from('follows').insert({
        follower_id: user.id,
        following_id: profileId,
        status: 'approved',
      });

      if (error) throw error;

      setFollowingIds(prev => new Set(prev).add(profileId));

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
      <div className="py-5 px-4">
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
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="py-5">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-3 min-w-0 px-4 mb-4">
        <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-80 transition-opacity min-w-0 flex-1">
          <h3 className="text-title font-semibold text-foreground truncate min-w-0">Discover People</h3>
          <ChevronDown 
            className={`h-4 w-4 text-muted-foreground transition-transform duration-300 flex-shrink-0 ${
              isOpen ? '' : '-rotate-90'
            }`} 
          />
        </CollapsibleTrigger>
        <button
          className="text-body text-primary font-medium flex items-center gap-0.5 hover:opacity-80 transition-opacity flex-shrink-0"
          onClick={() => navigate('/directory')}
        >
          See all
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Manual Horizontal Scroll */}
      <CollapsibleContent>
        <div className="relative">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory rail-fade-right -mx-4 pl-4 pr-10"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {profiles.map((profile) => {
              const isPending = pendingFollows.has(profile.id);
              
              return (
                <motion.div
                  key={profile.id}
                  className="flex-shrink-0 snap-start"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <GlassCard
                    variant="card"
                    hover
                    className="w-44 p-4 flex flex-col items-center text-center"
                  >
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

                    <div className="flex items-center justify-center gap-1 mb-0.5 w-full">
                      <p className="text-body font-semibold text-foreground truncate">
                        {profile.display_name || 'User'}
                      </p>
                      {profile.is_verified && (
                        <EraVerifiedTick size="sm" userEmail={profile.email || undefined} />
                      )}
                    </div>
                    
                    <p className="text-label text-muted-foreground truncate w-full mb-3">
                      @{profile.handle || 'user'}
                    </p>

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
                        className={`w-full h-8 text-label font-semibold rounded-lg transition-all duration-300 overflow-hidden ${
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
            
            {/* Loading indicator */}
            {loadingMore && (
              <div className="flex-shrink-0 w-40 h-44 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
