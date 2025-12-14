import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Globe, Calendar, Settings, Lock, Grid3X3, BookOpen, Play, MessageCircle, Heart, Users } from 'lucide-react';
import { DiscoverRow } from '@/components/DiscoverRow';
import { RearrangeableGrid } from '@/components/profile/RearrangeableGrid';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Mock user data with full social metrics
const mockUser = {
  name: 'Alex Johnson',
  handle: 'alexj',
  avatar: '',
  bio: 'Advocate for mental health awareness 💙 Sharing my journey one day at a time. DM for collabs ✨',
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
    community: 12,
  },
};

// Mock posts grid - using valid UUIDs for database compatibility
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

function StatButton({ count, label, onClick }: { count: number; label: string; onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center group"
    >
      <motion.span 
        key={count}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="font-bold text-foreground text-lg group-hover:text-primary transition-colors"
      >
        {formatCount(count)}
      </motion.span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </button>
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
    
    // Haptic feedback simulation
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
      <div className="flex flex-col">
        {/* Profile Header - Instagram Style */}
        <div className="px-4 pt-4 pb-5">
          {/* Top Row: Avatar + Stats */}
          <div className="flex items-center gap-6">
            {/* Avatar with gradient ring */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="relative"
            >
              <div className="w-20 h-20 rounded-full p-[3px] gradient-brand">
                <Avatar className="w-full h-full ring-2 ring-background">
                  <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
                  <AvatarFallback className="bg-secondary text-secondary-foreground text-2xl">
                    {mockUser.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </motion.div>

            {/* Stats Row */}
            <div className="flex-1 flex justify-around">
              <StatButton count={mockUser.stats.posts} label="Posts" />
              <StatButton count={followerCount} label="Followers" />
              <StatButton count={mockUser.stats.following} label="Following" />
              <StatButton 
                count={mockUser.stats.community} 
                label="Community" 
                onClick={() => navigate('/community')}
              />
            </div>
          </div>

          {/* Name + Handle + Bio */}
          <div className="mt-4">
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-foreground">{mockUser.name}</h1>
              {mockUser.isVerified && <VerifiedBadge />}
              {mockUser.isPrivate && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
            </div>
            <p className="text-sm text-muted-foreground">@{mockUser.handle}</p>
          </div>

          {/* Bio */}
          <p className="mt-2 text-sm text-foreground whitespace-pre-line">{mockUser.bio}</p>
          
          {/* Website Link */}
          {mockUser.website && (
            <a 
              href={`https://${mockUser.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary font-medium hover:underline mt-1 inline-block"
            >
              {mockUser.website}
            </a>
          )}

        {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            {isOwnProfile ? (
              <>
                <Button variant="outline" size="sm" className="flex-1 h-9 font-semibold">
                  Edit profile
                </Button>
                <Button variant="outline" size="sm" className="flex-1 h-9 font-semibold">
                  Share profile
                </Button>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <Settings className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <motion.div className="flex-1" whileTap={{ scale: 0.95 }}>
                  <Button
                    variant={isFollowing ? 'outline' : 'default'}
                    size="sm"
                    className={cn(
                      'w-full h-9 font-semibold transition-all',
                      !isFollowing && 'bg-primary hover:bg-primary/90 animate-glow-pulse'
                    )}
                    onClick={handleFollow}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                </motion.div>
                <Button variant="outline" size="sm" className="flex-1 h-9 font-semibold">
                  Message
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Discover People Row */}
        <DiscoverRow />

        {/* Content Tabs - Instagram Grid Style */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full rounded-none bg-transparent border-y border-border h-12 grid grid-cols-3">
            <TabsTrigger 
              value="posts" 
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-foreground data-[state=active]:bg-transparent h-full"
            >
              <Grid3X3 className="h-5 w-5" />
            </TabsTrigger>
            <TabsTrigger 
              value="reels" 
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-foreground data-[state=active]:bg-transparent h-full"
            >
              <Play className="h-5 w-5" />
            </TabsTrigger>
            <TabsTrigger 
              value="library" 
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-foreground data-[state=active]:bg-transparent h-full"
            >
              <BookOpen className="h-5 w-5" />
            </TabsTrigger>
          </TabsList>

          {/* Posts Grid */}
          <TabsContent value="posts" className="mt-0">
            <RearrangeableGrid posts={mockPosts} isOwnProfile={isOwnProfile} />
          </TabsContent>

          {/* Reels Grid */}
          <TabsContent value="reels" className="mt-0">
            <div className="grid grid-cols-3 gap-0.5">
              {mockReels.map((reel, index) => (
                <motion.div
                  key={reel.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="aspect-[9/16] relative group cursor-pointer overflow-hidden"
                >
                  <img 
                    src={reel.thumbnail} 
                    alt="" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-xs font-semibold">
                    <Play className="h-3 w-3 fill-current" />
                    {formatCount(reel.views)}
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Library */}
          <TabsContent value="library" className="mt-0 p-4">
            <div className="text-center py-12 text-muted-foreground text-sm">
              {isOwnProfile ? 'Your mental health & wellbeing library' : 'Nothing in library yet'}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}