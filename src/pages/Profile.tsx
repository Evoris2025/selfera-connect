import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Globe, Calendar, Settings, Lock, Quote, Heart, Users, Sparkles, BookOpen, Pin } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { PostCard } from '@/components/PostCard';
import { TextPostCard } from '@/components/TextPostCard';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Mock user data with journey focus
const mockUser = {
  name: 'Alex Johnson',
  handle: 'alexj',
  avatar: '',
  bio: 'Advocate for mental health awareness. Sharing my journey one day at a time. 💙',
  pinnedReflection: "Recovery isn't linear. Some days I take three steps forward, others I take two steps back. But I'm still here, still trying, and that's what matters.",
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
    contributions: 156, // New: contribution count
    supportGiven: 89, // New: times helped others
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
    tone: 'progress' as const,
    isTextOnly: true,
  },
  {
    id: '2',
    author: {
      name: mockUser.name,
      handle: mockUser.handle,
      avatar: mockUser.avatar,
      isVerified: mockUser.isVerified,
    },
    content: 'Gratitude practice: Three things I\'m thankful for today - morning coffee, a supportive friend, and this community.',
    tags: ['Gratitude', 'Daily Practice'],
    commentCount: 12,
    createdAt: '3 days ago',
    tone: 'steady' as const,
    isTextOnly: true,
  },
];

const mockExpressions = [
  { id: '1', thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=200&h=300&fit=crop' },
  { id: '2', thumbnail: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=200&h=300&fit=crop' },
  { id: '3', thumbnail: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=200&h=300&fit=crop' },
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
        {/* Profile Header - Journey-focused */}
        <div className="px-4 pt-4 pb-5 bg-gradient-to-b from-card to-background">
          {/* Avatar + Basic Info */}
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20 flex-shrink-0 ring-2 ring-primary/20">
              <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
              <AvatarFallback className="bg-secondary text-secondary-foreground text-2xl">
                {mockUser.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-lg text-foreground truncate">{mockUser.name}</h1>
                {mockUser.isVerified && <VerifiedBadge />}
                {mockUser.isPrivate && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
              </div>
              <p className="text-sm text-muted-foreground">@{mockUser.handle}</p>
              
              {/* Meta info - inline */}
              <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {mockUser.joinedDate}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {mockUser.country}
                </span>
              </div>
            </div>
          </div>

          {/* Bio */}
          <p className="mt-4 text-sm text-foreground leading-relaxed">{mockUser.bio}</p>

          {/* Journey Stats - De-emphasized follower counts */}
          <div className="flex gap-4 mt-4 py-3 px-4 bg-card/50 rounded-xl border border-border/50">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10">
                <Heart className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <span className="font-semibold text-foreground text-sm">{mockUser.stats.supportGiven}</span>
                <span className="text-xs text-muted-foreground ml-1">support given</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <span className="font-semibold text-foreground text-sm">{mockUser.stats.contributions}</span>
                <span className="text-xs text-muted-foreground ml-1">contributions</span>
              </div>
            </div>
          </div>

          {/* Subtle follower info */}
          <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
            <button className="hover:text-foreground transition-colors">
              <span className="font-medium text-foreground">{mockUser.stats.followers.toLocaleString()}</span> followers
            </button>
            <button className="hover:text-foreground transition-colors">
              <span className="font-medium text-foreground">{mockUser.stats.following}</span> following
            </button>
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
                  variant={isFollowing ? 'outline' : 'default'}
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

        {/* Pinned Reflection */}
        {mockUser.pinnedReflection && (
          <div className="px-4 pb-4">
            <Card className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-primary/10 flex-shrink-0">
                  <Pin className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
                    Pinned Reflection
                  </p>
                  <p className="text-sm text-foreground leading-relaxed italic">
                    "{mockUser.pinnedReflection}"
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Content Tabs - Updated structure */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full rounded-none bg-transparent border-b border-border h-12 px-2">
            <TabsTrigger 
              value="posts" 
              className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent gap-1.5"
            >
              <Quote className="h-4 w-4" />
              <span className="hidden sm:inline">{t('profile.posts')}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="expressions" 
              className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent gap-1.5"
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Expressions</span>
            </TabsTrigger>
            {isOwnProfile && (
              <TabsTrigger 
                value="library" 
                className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent gap-1.5"
              >
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">{t('profile.library')}</span>
              </TabsTrigger>
            )}
            <TabsTrigger 
              value="about" 
              className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent gap-1.5"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">{t('profile.about')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-0 p-3 space-y-4">
            {mockPosts.map((post) => 
              post.isTextOnly ? (
                <TextPostCard key={post.id} {...post} />
              ) : (
                <PostCard key={post.id} {...post} />
              )
            )}
          </TabsContent>

          <TabsContent value="expressions" className="mt-0 p-3">
            <div className="grid grid-cols-3 gap-1">
              {mockExpressions.map((exp) => (
                <div 
                  key={exp.id}
                  className="aspect-[9/16] rounded-lg overflow-hidden bg-secondary cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <img 
                    src={exp.thumbnail} 
                    alt="" 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            {mockExpressions.length === 0 && (
              <div className="text-center py-12 text-muted-foreground text-sm">
                No expressions yet
              </div>
            )}
          </TabsContent>

          <TabsContent value="library" className="mt-0 p-3">
            <div className="text-center py-12 text-muted-foreground text-sm">
              {t('library.empty')}
            </div>
          </TabsContent>

          <TabsContent value="about" className="mt-0 p-3 space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold text-foreground mb-3 text-sm flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                About
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{mockUser.bio}</p>
            </Card>
            
            <Card className="p-4">
              <h3 className="font-semibold text-foreground mb-3 text-sm">Languages</h3>
              <div className="flex flex-wrap gap-2">
                {mockUser.languages.map((lang) => (
                  <span 
                    key={lang}
                    className="px-3 py-1 rounded-full bg-secondary text-sm text-muted-foreground"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}