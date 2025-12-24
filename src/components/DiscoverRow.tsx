import { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { FollowButton } from '@/components/interactions';
import { CinematicAvatar } from '@/components/ui/CinematicAvatar';
import { GlassCard } from '@/components/ui/GlassCard';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { motion, useAnimationControls } from 'framer-motion';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

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

const CARD_WIDTH = 168; // w-40 (160px) + gap (8px approximate)
const SCROLL_SPEED = 40; // seconds for full loop

export function DiscoverRow() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<SuggestedProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [isOpen, setIsOpen] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const controls = useAnimationControls();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProfiles();
  }, [user]);

  // Start marquee animation when profiles are loaded
  useEffect(() => {
    if (profiles.length > 0 && isOpen) {
      startMarquee();
    }
  }, [profiles, isOpen]);

  // Handle pause/resume
  useEffect(() => {
    if (isPaused) {
      controls.stop();
    } else if (profiles.length > 0 && isOpen) {
      startMarquee();
    }
  }, [isPaused]);

  const startMarquee = () => {
    const totalWidth = profiles.length * CARD_WIDTH;
    controls.start({
      x: -totalWidth,
      transition: {
        x: {
          repeat: Infinity,
          repeatType: "loop",
          duration: SCROLL_SPEED,
          ease: "linear",
        },
      },
    });
  };

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

  // Duplicate profiles for seamless loop
  const duplicatedProfiles = [...profiles, ...profiles];

  const renderProfileCard = (profile: SuggestedProfile, index: number) => (
    <div
      key={`${profile.id}-${index}`}
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
    </div>
  );

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

      {/* Collapsible Content - Marquee */}
      <CollapsibleContent className="overflow-hidden">
        <div 
          ref={containerRef}
          className="overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          <motion.div
            className="flex gap-3 px-5"
            animate={controls}
            initial={{ x: 0 }}
          >
            {duplicatedProfiles.map((profile, index) => renderProfileCard(profile, index))}
          </motion.div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
