import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Settings, Lock, Play, MapPin, MessageCircle } from 'lucide-react';
import { DiscoverRow } from '@/components/DiscoverRow';
import { RearrangeableGrid } from '@/components/profile/RearrangeableGrid';
import { RearrangeableTabBar } from '@/components/profile/RearrangeableTabBar';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { FollowButton } from '@/components/interactions';
import { CinematicAvatar } from '@/components/ui/CinematicAvatar';
import { GlassCard } from '@/components/ui/GlassCard';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Mock user data with full social metrics
const mockUser = {
  name: 'Alex Johnson',
  handle: 'alexj',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
  coverImage: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&h=600&fit=crop',
  bio: 'Advocate for mental health awareness 💙 Sharing my journey one day at a time.',
  location: 'Los Angeles, CA',
  website: 'linktr.ee/alexj',
  country: 'United States',
  languages: ['English', 'Spanish'],
  joinedDate: 'March 2024',
  isVerified: true,
  isPrivate: false,
  userType: 'individual' as const,
  interests: ['@bookreader', '@traveler', '@mindfulness', '@wellness'],
  stats: {
    posts: 147,
    followers: 12400,
    following: 567,
  },
};

// Mock posts grid
const mockPosts = [
  { id: 'a1b2c3d4-e5f6-4789-abcd-ef0123456789', thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=400&fit=crop', likes: 1234, comments: 56, isVideo: false },
  { id: 'b2c3d4e5-f6a7-4890-bcde-f01234567890', thumbnail: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&h=400&fit=crop', likes: 892, comments: 34, isVideo: false },
  { id: 'c3d4e5f6-a7b8-4901-cdef-012345678901', thumbnail: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&h=400&fit=crop', likes: 2341, comments: 89, isVideo: true },
  { id: 'd4e5f6a7-b8c9-4012-def0-123456789012', thumbnail: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&h=400&fit=crop', likes: 567, comments: 23, isVideo: false },
  { id: 'e5f6a7b8-c9d0-4123-ef01-234567890123', thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', likes: 3456, comments: 128, isVideo: false },
  { id: 'f6a7b8c9-d0e1-4234-f012-345678901234', thumbnail: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop', likes: 789, comments: 45, isVideo: true },
];

const mockReels = [
  { id: '1', thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=300&h=500&fit=crop', views: 45600 },
  { id: '2', thumbnail: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=300&h=500&fit=crop', views: 23400 },
  { id: '3', thumbnail: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=300&h=500&fit=crop', views: 67800 },
];

function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

// Cinematic stat display
function StatItem({ count, label }: { count: number; label: string }) {
  return (
    <motion.button 
      whileTap={{ scale: 0.95 }}
      className="flex flex-col items-center flex-1"
    >
      <motion.span 
        key={count}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl font-bold text-foreground tracking-tight"
      >
        {formatCount(count)}
      </motion.span>
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
    </motion.button>
  );
}

export default function Profile() {
  const { handle } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [followerCount, setFollowerCount] = useState(mockUser.stats.followers);
  const isOwnProfile = !handle || handle === mockUser.handle;

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    setFollowerCount(prev => isFollowing ? prev - 1 : prev + 1);
    
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  const handleCreatePost = () => {
    toast({
      title: 'Create Post',
      description: 'Opening composer...',
    });
  };

  return (
    <AppLayout showHeader={false} onCreatePost={handleCreatePost}>
      <div className="flex flex-col min-h-screen bg-background">
        {/* Cinematic Hero Section - Full Bleed */}
        <div className="relative">
          {/* Background Image with Cinematic Gradient Overlay */}
          <div className="h-[320px] relative overflow-hidden">
            <motion.img 
              src={mockUser.coverImage} 
              alt=""
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full object-cover"
            />
            {/* Multi-layer cinematic gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-transparent" />
          </div>

          {/* Top Actions - Glass Style */}
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            {isOwnProfile && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 rounded-full glass-heavy"
                  onClick={() => navigate('/settings')}
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </motion.div>
            )}
          </div>

          {/* Profile Info - Positioned at bottom of hero */}
          <div className="absolute bottom-0 left-0 right-0 px-5">
            {/* Large Avatar with Premium Gradient Ring */}
            <motion.div 
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="mb-4"
            >
              <CinematicAvatar
                src={mockUser.avatar}
                alt={mockUser.name}
                fallback={mockUser.name.charAt(0)}
                size="2xl"
                ring="gradient"
              />
            </motion.div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="px-5 pt-2 pb-4">
          {/* Name & Handle */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="mb-2"
          >
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">{mockUser.name}</h1>
              {mockUser.isVerified && <VerifiedBadge size="md" />}
              {mockUser.isPrivate && <Lock className="h-4 w-4 text-muted-foreground" />}
            </div>
            <p className="text-muted-foreground text-sm">@{mockUser.handle}</p>
          </motion.div>

          {/* Bio */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-foreground/90 text-[15px] leading-relaxed mb-3"
          >
            {mockUser.bio}
          </motion.p>

          {/* Location */}
          {mockUser.location && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="flex items-center gap-1.5 text-muted-foreground text-sm mb-4"
            >
              <MapPin className="h-3.5 w-3.5" />
              <span>{mockUser.location}</span>
            </motion.div>
          )}

          {/* Interest Tags Row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-wrap gap-2 mb-5"
          >
            {mockUser.interests.map((interest, index) => (
              <motion.span
                key={interest}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className="px-3 py-1.5 text-xs font-medium rounded-full glass border border-border/30 text-muted-foreground"
              >
                {interest}
              </motion.span>
            ))}
          </motion.div>

          {/* Stats Row - Premium Glass Style */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
          >
            <GlassCard variant="subtle" className="py-4 px-2 mb-5">
              <div className="flex justify-around">
                <StatItem count={followerCount} label="Followers" />
                <div className="w-px bg-border/50" />
                <StatItem count={mockUser.stats.following} label="Following" />
                <div className="w-px bg-border/50" />
                <StatItem count={mockUser.stats.posts} label="Creations" />
              </div>
            </GlassCard>
          </motion.div>

          {/* Action Buttons - Premium Gradient & Glass */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex gap-3 mb-6"
          >
            {isOwnProfile ? (
              <>
                <Button 
                  variant="outline" 
                  className="flex-1 h-12 rounded-2xl glass-subtle border-border/30 font-semibold hover:bg-secondary/50 transition-all duration-300"
                >
                  Edit profile
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 h-12 rounded-2xl glass-subtle border-border/30 font-semibold hover:bg-secondary/50 transition-all duration-300"
                >
                  Share profile
                </Button>
              </>
            ) : (
              <>
                <FollowButton
                  isFollowing={isFollowing}
                  onToggle={handleFollow}
                  size="lg"
                  className="flex-1 h-12 rounded-2xl"
                  variant="gradient"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  className="h-12 w-12 rounded-2xl glass-subtle border-border/30"
                >
                  <MessageCircle className="h-5 w-5" />
                </Button>
              </>
            )}
          </motion.div>
        </div>

        {/* Discover People Row - Premium Glass Cards */}
        <DiscoverRow />

        {/* Content Tabs - Minimal Style */}
        <RearrangeableTabBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isOwnProfile={isOwnProfile}
        />

        {/* Tab Content */}
        <div className="mt-0">
          <AnimatePresence mode="wait">
            {activeTab === 'posts' && (
              <motion.div
                key="posts"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <RearrangeableGrid posts={mockPosts} isOwnProfile={isOwnProfile} />
              </motion.div>
            )}

            {activeTab === 'expressions' && (
              <motion.div
                key="expressions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16 text-muted-foreground text-sm"
              >
                {isOwnProfile ? 'Your expressions will appear here' : 'No expressions yet'}
              </motion.div>
            )}

            {activeTab === 'reels' && (
              <motion.div
                key="reels"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-3 gap-0.5"
              >
                {mockReels.map((reel, index) => (
                  <motion.div
                    key={reel.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    className="aspect-[9/16] relative group cursor-pointer overflow-hidden"
                  >
                    <img 
                      src={reel.thumbnail} 
                      alt="" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-xs font-medium">
                      <Play className="h-3 w-3 fill-current" />
                      {formatCount(reel.views)}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeTab === 'community' && (
              <motion.div
                key="community"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16 text-muted-foreground text-sm"
              >
                {isOwnProfile ? 'Communities you\'ve joined' : 'No communities yet'}
              </motion.div>
            )}

            {activeTab === 'library' && (
              <motion.div
                key="library"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16 text-muted-foreground text-sm"
              >
                {isOwnProfile ? 'Your mental health & wellbeing library' : 'Nothing in library yet'}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppLayout>
  );
}
