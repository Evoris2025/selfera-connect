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
    community: 24,
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

// Elevated cinematic stat display
function HeroStatItem({ count, label, delay = 0, align = 'center' }: { count: number; label: string; delay?: number; align?: 'left' | 'right' | 'center' }) {
  return (
    <motion.button 
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "flex flex-col gap-0.5 group",
        align === 'left' && "items-start",
        align === 'right' && "items-end",
        align === 'center' && "items-center"
      )}
    >
      <span 
        className="text-[28px] sm:text-[32px] font-bold text-white tracking-tight"
        style={{ 
          textShadow: '0 2px 20px rgba(0,0,0,0.5), 0 0 40px rgba(251,146,60,0.15)' 
        }}
      >
        {formatCount(count)}
      </span>
      <span className="text-[9px] sm:text-[10px] text-white/50 font-semibold uppercase tracking-[0.15em] group-hover:text-white/70 transition-colors">{label}</span>
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
      <div className="flex flex-col min-h-screen relative">
        {/* Full Page Background Cover Image - Cinematic Treatment */}
        <div className="fixed inset-0 z-0">
          <motion.img 
            src={mockUser.coverImage} 
            alt=""
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full object-cover"
            style={{ filter: 'contrast(1.05) saturate(1.1)' }}
          />
          {/* Vignette effect - opens up toward center */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse 80% 60% at 50% 30%, transparent 0%, hsl(230 25% 4% / 0.4) 60%, hsl(230 25% 4% / 0.85) 100%)'
            }}
          />
          {/* Bottom gradient for content readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          {/* Top subtle fade */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-transparent" />
          {/* Film grain overlay */}
          <div 
            className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay"
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
            }}
          />
        </div>

        {/* Content - Above background */}
        <div className="relative z-10">
          {/* Top Actions - Glass Style */}
          <div className="absolute top-4 right-4 flex gap-2 z-20">
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

          {/* Elevated Cinematic Hero Section */}
          <div className="pt-20 pb-8 relative">
            {/* Centered ambient light source */}
            <div className="absolute inset-0 flex items-start justify-center pointer-events-none overflow-hidden">
              <div 
                className="w-[500px] h-[400px] -mt-20 rounded-full opacity-60"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(251,146,60,0.25) 0%, rgba(244,114,182,0.12) 35%, transparent 70%)',
                  filter: 'blur(60px)',
                }}
              />
            </div>

            {/* Stats + Avatar Row - Full Width Distribution */}
            <div className="flex items-center justify-between px-6 sm:px-12 md:px-16 max-w-lg mx-auto relative">
              {/* Left Stats - Following & Followers */}
              <div className="flex flex-col gap-5 flex-1">
                <HeroStatItem count={followerCount} label="Followers" delay={0.25} align="center" />
                <HeroStatItem count={mockUser.stats.following} label="Following" delay={0.3} align="center" />
              </div>

              {/* Centered Avatar with True Ambient Glow */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="relative flex-shrink-0"
              >
                {/* Outer ambient glow - softer, more natural */}
                <motion.div 
                  animate={{ 
                    opacity: [0.5, 0.7, 0.5],
                    scale: [1, 1.05, 1] 
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="absolute -inset-8 sm:-inset-10 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(251,146,60,0.35) 0%, rgba(244,114,182,0.2) 40%, transparent 70%)',
                    filter: 'blur(30px)',
                  }}
                />
                
                {/* Secondary glow layer */}
                <div 
                  className="absolute -inset-4 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(251,191,36,0.3) 0%, rgba(251,146,60,0.15) 50%, transparent 80%)',
                    filter: 'blur(20px)',
                  }}
                />

                {/* Avatar container with luminous thin ring */}
                <div className="relative">
                  {/* Animated gradient ring - thin and luminous */}
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-[3px] rounded-full"
                    style={{
                      background: 'conic-gradient(from 0deg, #fbbf24, #f97316, #ec4899, #a855f7, #fbbf24)',
                      padding: '2.5px',
                    }}
                  >
                    <div className="w-full h-full rounded-full bg-background" />
                  </motion.div>
                  
                  {/* Inner glow on ring */}
                  <div 
                    className="absolute -inset-[3px] rounded-full"
                    style={{
                      boxShadow: 'inset 0 0 20px rgba(251,191,36,0.4), 0 0 30px rgba(251,146,60,0.3), 0 0 60px rgba(244,114,182,0.2)',
                    }}
                  />
                  
                  {/* Avatar image */}
                  <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden">
                    <img 
                      src={mockUser.avatar} 
                      alt={mockUser.name}
                      className="w-full h-full object-cover"
                      style={{ filter: 'contrast(1.05) saturate(1.1)' }}
                    />
                    {/* Subtle inner shadow for depth */}
                    <div className="absolute inset-0 rounded-full" style={{ boxShadow: 'inset 0 0 30px rgba(0,0,0,0.3)' }} />
                  </div>
                </div>
              </motion.div>

              {/* Right Stats - Posts & Community */}
              <div className="flex flex-col gap-5 flex-1">
                <HeroStatItem count={mockUser.stats.posts} label="Posts" delay={0.35} align="center" />
                <HeroStatItem count={mockUser.stats.community} label="Community" delay={0.4} align="center" />
              </div>
            </div>

            {/* Centered Name & Handle - Refined Typography */}
            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="text-center mt-7"
            >
              <div className="flex items-center justify-center gap-2">
                <h1 
                  className="text-[26px] sm:text-[28px] font-bold text-white tracking-tight"
                  style={{ textShadow: '0 2px 30px rgba(0,0,0,0.5)' }}
                >
                  {mockUser.name}
                </h1>
                {mockUser.isVerified && <VerifiedBadge size="md" />}
                {mockUser.isPrivate && <Lock className="h-4 w-4 text-white/60" />}
              </div>
              <p className="text-white/50 text-sm mt-1 font-medium tracking-wide">@{mockUser.handle}</p>
              
              {/* Location - subtle */}
              {mockUser.location && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.55 }}
                  className="flex items-center justify-center gap-1.5 text-white/40 text-[13px] mt-2.5"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{mockUser.location}</span>
                </motion.div>
              )}
            </motion.div>
          </div>

        {/* Profile Content - Below Hero */}
        <div className="px-5 pt-2 pb-4">
          {/* Bio */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="text-foreground/90 text-[15px] leading-relaxed text-center mb-4"
          >
            {mockUser.bio}
          </motion.p>

          {/* Interest Tags Row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex flex-wrap justify-center gap-2 mb-5"
          >
            {mockUser.interests.map((interest, index) => (
              <motion.span
                key={interest}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.05 }}
                className="px-3 py-1.5 text-xs font-medium rounded-full glass border border-border/30 text-muted-foreground"
              >
                {interest}
              </motion.span>
            ))}
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
      </div>
    </AppLayout>
  );
}
