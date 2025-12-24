import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MoreVertical, Lock, MapPin, MessageCircle, Pencil, Share2, Settings, Play } from 'lucide-react';
import { DiscoverRow } from '@/components/DiscoverRow';
import { RearrangeableGrid } from '@/components/profile/RearrangeableGrid';
import { RearrangeableTabBar } from '@/components/profile/RearrangeableTabBar';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { FollowButton } from '@/components/interactions';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock user data with full social metrics
const mockUser = {
  name: 'Alex Johnson',
  handle: 'alexj',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
  coverImage: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&h=600&fit=crop',
  bio: 'Advocating for mental health awareness. Sharing my journey one day at a time. #mindfulness #wellbeing #traveller #bookreader',
  location: 'Los Angeles, CA',
  website: 'linktr.ee/alexj',
  country: 'United States',
  languages: ['English', 'Spanish'],
  joinedDate: 'March 2024',
  isVerified: true,
  isPrivate: false,
  userType: 'individual' as const,
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

// Stat item for the hero section
function HeroStatItem({ count, label }: { count: number; label: string }) {
  return (
    <div className="text-center">
      <p className="text-lg sm:text-xl font-bold text-white">{formatCount(count)}</p>
      <p className="text-[10px] uppercase tracking-wider text-white/60">{label}</p>
    </div>
  );
}

// Render bio with inline hashtags styled
function renderBioWithHashtags(bio: string) {
  return bio.split(/(#\w+)/g).map((part, index) =>
    part.startsWith('#') ? (
      <span
        key={index}
        className="text-primary hover:text-primary/80 cursor-pointer transition-colors"
      >
        {part}
      </span>
    ) : (
      <span key={index}>{part}</span>
    )
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

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  
  // Subtle parallax for avatar
  const avatarScale = useTransform(scrollY, [0, 300], [1, 0.92]);
  const avatarY = useTransform(scrollY, [0, 300], [0, 15]);

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
        
        {/* ========== SPOTIFY-STYLE HERO SECTION ========== */}
        <motion.section
          ref={heroRef}
          className="relative w-full h-[52vh] sm:h-[50vh] min-h-[400px] max-h-[550px] overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          {/* Background Image with Blur */}
          <div className="absolute inset-0">
            <motion.img
              src={mockUser.coverImage}
              alt=""
              className="w-full h-full object-cover scale-110 blur-sm"
              initial={{ scale: 1.15, opacity: 0 }}
              animate={{ scale: 1.1, opacity: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>

          {/* Layered Gradient Overlays for Spotify-like depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/70 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/40" />
          
          {/* Subtle accent color wash */}
          <div
            className="absolute inset-0 opacity-25 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 90% 60% at 20% 60%, hsl(var(--primary) / 0.2), transparent 60%)',
            }}
          />

          {/* Top Actions Bar */}
          <motion.div
            className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center px-4 pt-12 sm:pt-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
          >
            <div className="w-10" />
            {isOwnProfile && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-white/80 hover:text-white hover:bg-black/40 transition-all duration-200 active:scale-95"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 glass-heavy border-border/30">
                  <DropdownMenuItem className="gap-3 cursor-pointer">
                    <Pencil className="h-4 w-4" />
                    Edit profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-3 cursor-pointer">
                    <Share2 className="h-4 w-4" />
                    Share profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-3 cursor-pointer" onClick={() => navigate('/settings')}>
                    <Settings className="h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </motion.div>

          {/* Split Layout Container: 50/50 on desktop, stacked on mobile */}
          <div className="absolute inset-0 flex flex-col sm:flex-row items-center sm:items-center justify-end sm:justify-center px-5 sm:px-8 lg:px-16 pb-8 sm:pb-0 pt-20 sm:pt-0">
            
            {/* Left Column - Avatar Dominance (50% on desktop) */}
            <motion.div
              className="w-full sm:w-1/2 flex items-center justify-center sm:justify-end sm:pr-6 lg:pr-10 mb-5 sm:mb-0"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.4, ease: 'easeOut' }}
            >
              <motion.div
                className="relative"
                style={{ scale: avatarScale, y: avatarY }}
              >
                {/* Soft glow behind avatar */}
                <div
                  className="absolute -inset-6 rounded-2xl blur-3xl opacity-40 pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, rgba(255,255,255,0.15), transparent 70%)',
                  }}
                />

                {/* Main Avatar - Large rounded square (Spotify artist style) */}
                <div className="relative w-36 h-36 sm:w-48 sm:h-48 lg:w-56 lg:h-56 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                  <img
                    src={mockUser.avatar}
                    alt={mockUser.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Inner vignette for premium feel */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'radial-gradient(circle at center, transparent 50%, rgba(0,0,0,0.25) 100%)',
                    }}
                  />
                  {/* Subtle edge blend gradient */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'linear-gradient(135deg, transparent 60%, rgba(0,0,0,0.4) 100%)',
                    }}
                  />
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column - Professional Typography (50% on desktop) */}
            <motion.div
              className="w-full sm:w-1/2 flex flex-col items-center sm:items-start sm:pl-4 lg:pl-8"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.4, ease: 'easeOut' }}
            >
              {/* Glassmorphism Container */}
              <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-5 sm:p-6 border border-white/10 max-w-sm w-full shadow-2xl">
                
                {/* Name + Verified + Private Lock */}
                <motion.div
                  className="flex items-center gap-2 flex-wrap mb-1"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.35 }}
                >
                  <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    {mockUser.name}
                  </h1>
                  {mockUser.isVerified && <VerifiedBadge size="md" />}
                  {mockUser.isPrivate && <Lock className="h-4 w-4 text-white/50" />}
                </motion.div>

                {/* Handle + Location Line */}
                <motion.div
                  className="flex items-center gap-2 text-white/50 text-sm mb-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                >
                  <span>@{mockUser.handle}</span>
                  {mockUser.location && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-white/30" />
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {mockUser.location}
                      </span>
                    </>
                  )}
                </motion.div>

                {/* Bio with Inline Hashtags */}
                <motion.p
                  className="text-white/75 text-sm sm:text-base leading-relaxed mb-4 line-clamp-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {renderBioWithHashtags(mockUser.bio)}
                </motion.p>

                {/* Stats Row */}
                <motion.div
                  className="flex items-center justify-start gap-5 sm:gap-6 mb-5"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <HeroStatItem count={mockUser.stats.posts} label="Posts" />
                  <HeroStatItem count={followerCount} label="Followers" />
                  <HeroStatItem count={mockUser.stats.following} label="Following" />
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {isOwnProfile ? (
                    <Button
                      variant="outline"
                      className="flex-1 border-white/20 bg-white/5 hover:bg-white/10 text-white rounded-full h-10 font-semibold transition-all duration-200 active:scale-[0.97]"
                      onClick={() => navigate('/settings')}
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <FollowButton
                        isFollowing={isFollowing}
                        onToggle={handleFollow}
                        size="md"
                        className="flex-1 rounded-full h-10 font-semibold transition-all duration-200 active:scale-[0.97] hover:shadow-lg hover:shadow-primary/25"
                        variant="gradient"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 border-white/20 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all duration-200 active:scale-[0.97]"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* ========== CONTENT BELOW HERO ========== */}
        
        {/* Discover People Row */}
        <DiscoverRow />

        {/* Content Tabs */}
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
                {isOwnProfile ? "Communities you've joined" : 'No communities yet'}
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
                {isOwnProfile ? 'Your saved content' : 'Library is private'}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppLayout>
  );
}
