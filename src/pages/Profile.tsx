import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Globe, Calendar, Settings, BadgeCheck, Lock } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PostCard } from '@/components/PostCard';
import { VerifiedBadge } from '@/components/VerifiedBadge';

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
    reactions: { support: 89, informative: 12, relatable: 45 },
    commentCount: 8,
    createdAt: '1 day ago',
  },
];

export default function Profile() {
  const { handle } = useParams();
  const { t } = useTranslation();
  const [isFollowing, setIsFollowing] = useState(false);
  const isOwnProfile = !handle || handle === mockUser.handle;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        {/* Profile Header */}
        <div className="relative">
          {/* Cover */}
          <div className="h-32 md:h-48 bg-gradient-to-br from-[hsl(217,91%,60%)]/30 via-[hsl(270,70%,60%)]/30 to-[hsl(25,95%,53%)]/30" />

          {/* Profile Info */}
          <div className="px-4 pb-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 md:-mt-20 mb-4">
              <Avatar className="h-28 w-28 md:h-36 md:w-36 border-4 border-background">
                <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
                <AvatarFallback className="bg-secondary text-secondary-foreground text-3xl">
                  {mockUser.name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="mt-4 md:mt-0 flex gap-2">
                {isOwnProfile ? (
                  <>
                    <Button variant="outline">{t('profile.editProfile')}</Button>
                    <Button variant="ghost" size="icon">
                      <Settings className="h-5 w-5" />
                    </Button>
                  </>
                ) : (
                  <Button
                    variant={isFollowing ? 'outline' : 'gradient'}
                    onClick={() => setIsFollowing(!isFollowing)}
                  >
                    {isFollowing ? t('profile.following') : t('profile.follow')}
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-foreground">{mockUser.name}</h1>
                  {mockUser.isVerified && <VerifiedBadge className="h-5 w-5" />}
                  {mockUser.isPrivate && <Lock className="h-4 w-4 text-muted-foreground" />}
                </div>
                <p className="text-muted-foreground">@{mockUser.handle}</p>
              </div>

              <p className="text-foreground">{mockUser.bio}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {mockUser.country}
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  {mockUser.languages.join(', ')}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {mockUser.joinedDate}
                </div>
              </div>

              <div className="flex items-center gap-6">
                <button className="hover:underline">
                  <span className="font-semibold text-foreground">{mockUser.stats.posts}</span>{' '}
                  <span className="text-muted-foreground">{t('profile.posts')}</span>
                </button>
                <button className="hover:underline">
                  <span className="font-semibold text-foreground">{mockUser.stats.followers.toLocaleString()}</span>{' '}
                  <span className="text-muted-foreground">{t('profile.followers')}</span>
                </button>
                <button className="hover:underline">
                  <span className="font-semibold text-foreground">{mockUser.stats.following}</span>{' '}
                  <span className="text-muted-foreground">{t('profile.following')}</span>
                </button>
              </div>

              {mockUser.userType !== 'individual' && !mockUser.isVerified && (
                <Button variant="subtle" size="sm">
                  <BadgeCheck className="h-4 w-4 mr-2" />
                  {t('profile.applyVerification')}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="px-4">
          <Tabs defaultValue="posts">
            <TabsList className="w-full bg-secondary">
              <TabsTrigger value="posts" className="flex-1">
                {t('profile.posts')}
              </TabsTrigger>
              {isOwnProfile && (
                <TabsTrigger value="saved" className="flex-1">
                  {t('profile.saved')}
                </TabsTrigger>
              )}
              <TabsTrigger value="about" className="flex-1">
                {t('profile.about')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="mt-4 space-y-4">
              {mockPosts.map((post) => (
                <PostCard key={post.id} {...post} />
              ))}
            </TabsContent>

            <TabsContent value="saved" className="mt-4">
              <div className="text-center py-12 text-muted-foreground">
                No saved posts yet
              </div>
            </TabsContent>

            <TabsContent value="about" className="mt-4">
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-4">About</h3>
                <p className="text-muted-foreground">{mockUser.bio}</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}
