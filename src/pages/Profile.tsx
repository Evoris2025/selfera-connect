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

// Stat item for the card profile
function CardStatItem({ count, label }: { count: number; label: string }) {
  return (
    <div className="text-center flex-1">
      <p className="text-xl sm:text-2xl font-bold text-foreground">{formatCount(count)}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
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
        
        {/* ========== CLEAN CARD-STYLE PROFILE HERO ========== */}
        <motion.section
          ref={heroRef}
          className="relative w-full bg-background"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {/* Card Container */}
          <div className="max-w-lg mx-auto bg-card rounded-b-3xl shadow-xl overflow-hidden border-x border-b border-border/50">
            
            {/* Cover Image Banner */}
            <motion.div
              className="relative h-40 sm:h-48 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <motion.img
                src={mockUser.coverImage}
                alt=""
                className="w-full h-full object-cover"
                style={{ scale: avatarScale }}
              />
              {/* Subtle gradient overlay at bottom for avatar blending */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card to-transparent" />
              
              {/* Top Right Menu Button */}
              {isOwnProfile && (
                <motion.div
                  className="absolute top-3 right-3 z-10"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/50 transition-all duration-200 active:scale-95"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem className="gap-2 cursor-pointer">
                        <Share2 className="h-4 w-4" />
                        Share profile
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => navigate('/settings')}>
                        <Settings className="h-4 w-4" />
                        Settings
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </motion.div>
              )}
            </motion.div>

            {/* Avatar - Overlapping the cover */}
            <div className="relative flex justify-center -mt-16 sm:-mt-20">
              <motion.div
                className="relative"
                style={{ y: avatarY }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15, duration: 0.35, ease: 'easeOut' }}
              >
                {/* Avatar Ring */}
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1 bg-gradient-to-br from-primary via-primary/80 to-primary/60 shadow-lg">
                  <div className="w-full h-full rounded-full overflow-hidden border-4 border-card">
                    <img
                      src={mockUser.avatar}
                      alt={mockUser.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Profile Info - Centered */}
            <div className="px-6 pt-3 pb-5 text-center">
              
              {/* Name + Verified Badge */}
              <motion.div
                className="flex items-center justify-center gap-2 mb-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                  {mockUser.name}
                </h1>
                {mockUser.isVerified && <VerifiedBadge size="md" />}
                {mockUser.isPrivate && <Lock className="h-4 w-4 text-muted-foreground" />}
              </motion.div>

              {/* Handle */}
              <motion.p
                className="text-sm text-muted-foreground mb-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
              >
                @{mockUser.handle}
                {mockUser.location && (
                  <span className="inline-flex items-center gap-1 ml-2">
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                    <MapPin className="w-3 h-3" />
                    {mockUser.location}
                  </span>
                )}
              </motion.p>

              {/* Bio with Inline Hashtags */}
              <motion.p
                className="text-sm text-foreground/80 leading-relaxed mb-5 max-w-xs mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {renderBioWithHashtags(mockUser.bio)}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                className="flex items-center justify-center gap-3 mb-5"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                {!isOwnProfile && (
                  <>
                    <FollowButton
                      isFollowing={isFollowing}
                      onToggle={handleFollow}
                      size="md"
                      className="px-8 h-9 rounded-full font-semibold text-sm uppercase tracking-wide transition-all duration-200 active:scale-[0.97]"
                      variant="gradient"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-full border-border hover:bg-accent transition-all duration-200 active:scale-95"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </motion.div>

              {/* Stats Row */}
              <motion.div
                className="flex items-center justify-center border-t border-border pt-4"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <CardStatItem count={mockUser.stats.posts} label="Posts" />
                <div className="w-px h-8 bg-border" />
                <CardStatItem count={followerCount} label="Followers" />
                <div className="w-px h-8 bg-border" />
                <CardStatItem count={mockUser.stats.following} label="Following" />
                <div className="w-px h-8 bg-border" />
                <CardStatItem count={mockUser.stats.community || 0} label="Community" />
              </motion.div>
            </div>
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
