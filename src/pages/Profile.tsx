import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Globe, Calendar, Settings, Lock } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PostCard } from '@/components/PostCard';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { DiscoverRow } from '@/components/DiscoverRow';
import { toast } from '@/hooks/use-toast';

// Mock user data
const mockUser = {
  name: 'Alex Johnson',
  handle: 'alexj',
  avatar: '',
  bio: 'Advocate for mental health awareness. Sharing my journey one day at a time. 💙',
  country: 'United States',
  languages: ['English', 'Spanish'],
  joinedDate: 'March 2024',
  isVerified: false,
  isPrivate: false,
  userType: 'individual' as const,
  stats: {
    posts: 47,
    followers: 1234,
    following: 567,
  },
};

const mockPosts = [
  {
    id: '1',
    author: {
      name: mockUser.name,
      handle: mockUser.handle,
      avatar: mockUser.avatar,
      isVerified: mockUser.isVerified,
    },
    content: 'Today was a good day. Small wins matter. Remember to celebrate your progress, no matter how small.',
    tags: ['Self-care', 'Mindfulness'],
    commentCount: 8,
    createdAt: '1 day ago',
  },
];

export default function Profile() {
  const { handle } = useParams();
  const { t } = useTranslation();
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const isOwnProfile = !handle || handle === mockUser.handle;

  const handleCreatePost = () => {
    toast({
      title: 'Create Post',
      description: 'Opening composer...',
    });
  };

  return (
    <AppLayout showHeader={false} onCreatePost={handleCreatePost}>
      <div className="flex flex-col">
        {/* Profile Header - Compact Mobile Style */}
        <div className="px-4 pt-4 pb-3 bg-background">
          {/* Top Row: Avatar + Stats + Actions */}
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <Avatar className="h-20 w-20 flex-shrink-0">
              <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
              <AvatarFallback className="bg-secondary text-secondary-foreground text-2xl">
                {mockUser.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            {/* Stats */}
            <div className="flex-1 flex justify-around">
              <button className="flex flex-col items-center">
                <span className="font-bold text-foreground text-lg">{mockUser.stats.posts}</span>
                <span className="text-xs text-muted-foreground">{t('profile.posts')}</span>
              </button>
              <button className="flex flex-col items-center">
                <span className="font-bold text-foreground text-lg">{mockUser.stats.followers.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground">{t('profile.followers')}</span>
              </button>
              <button className="flex flex-col items-center">
                <span className="font-bold text-foreground text-lg">{mockUser.stats.following}</span>
                <span className="text-xs text-muted-foreground">{t('profile.following')}</span>
              </button>
            </div>
          </div>

          {/* Name + Handle */}
          <div className="mt-3">
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-foreground">{mockUser.name}</h1>
              {mockUser.isVerified && <VerifiedBadge className="h-4 w-4" />}
              {mockUser.isPrivate && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
            </div>
            <p className="text-sm text-muted-foreground">@{mockUser.handle}</p>
          </div>

          {/* Bio */}
          <p className="mt-2 text-sm text-foreground">{mockUser.bio}</p>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {mockUser.country}
            </div>
            <div className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              {mockUser.languages.join(', ')}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {mockUser.joinedDate}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            {isOwnProfile ? (
              <>
                <Button variant="outline" size="sm" className="flex-1 h-9">
                  {t('profile.editProfile')}
                </Button>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <Settings className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant={isFollowing ? 'outline' : 'gradient'}
                  size="sm"
                  className="flex-1 h-9"
                  onClick={() => setIsFollowing(!isFollowing)}
                >
                  {isFollowing ? t('profile.following') : t('profile.follow')}
                </Button>
                <Button variant="outline" size="sm" className="h-9">
                  {t('nav.interactions')}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Discover Row */}
        <DiscoverRow />

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full rounded-none bg-transparent border-b border-border h-11">
            <TabsTrigger 
              value="posts" 
              className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              {t('profile.posts')}
            </TabsTrigger>
            {isOwnProfile && (
              <TabsTrigger 
                value="library" 
                className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                {t('profile.library')}
              </TabsTrigger>
            )}
            <TabsTrigger 
              value="about" 
              className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              {t('profile.about')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-0 p-3 space-y-3">
            {mockPosts.map((post) => (
              <PostCard key={post.id} {...post} />
            ))}
          </TabsContent>

          <TabsContent value="library" className="mt-0 p-3">
            <div className="text-center py-12 text-muted-foreground text-sm">
              {t('library.empty')}
            </div>
          </TabsContent>

          <TabsContent value="about" className="mt-0 p-3">
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="font-semibold text-foreground mb-2 text-sm">About</h3>
              <p className="text-sm text-muted-foreground">{mockUser.bio}</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
