import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, Hash, Users } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { PostCard } from '@/components/PostCard';
import { CrisisWidget } from '@/components/CrisisWidget';
import { PostCardSkeleton } from '@/components/SkeletonLoader';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { VerifiedBadge } from '@/components/VerifiedBadge';

// Mock data for demo
const mockPosts = [
  {
    id: '1',
    author: {
      name: 'Wellness Center',
      handle: 'wellnesscenter',
      avatar: '',
      isVerified: true,
    },
    content: 'Remember: taking a break is not giving up. Your mental health matters more than any deadline. Take care of yourself today.',
    media: {
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop',
    },
    tags: ['Self-care', 'Mindfulness'],
    reactions: { support: 245, informative: 89, relatable: 156 },
    commentCount: 32,
    createdAt: '2 hours ago',
  },
  {
    id: '2',
    author: {
      name: 'Dr. Sarah Mitchell',
      handle: 'drsarahmitchell',
      avatar: '',
      isVerified: true,
    },
    content: 'Anxiety tip: Try the 5-4-3-2-1 grounding technique. Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste. This helps bring you back to the present moment.',
    tags: ['Anxiety', 'Awareness'],
    reactions: { support: 512, informative: 892, relatable: 234 },
    commentCount: 78,
    createdAt: '4 hours ago',
  },
  {
    id: '3',
    author: {
      name: 'Jamie',
      handle: 'jamie_journey',
      avatar: '',
    },
    content: 'Today marks 1 year since I started my recovery journey. It hasn\'t been easy, but I\'m grateful for this community and everyone who has supported me. There is hope.',
    tags: ['Recovery', 'Support'],
    reactions: { support: 1204, informative: 45, relatable: 678 },
    commentCount: 156,
    createdAt: '6 hours ago',
  },
];

const trendingTags = [
  { name: 'Self-care', count: 2340 },
  { name: 'Anxiety', count: 1892 },
  { name: 'Mindfulness', count: 1567 },
  { name: 'Recovery', count: 1234 },
  { name: 'Support', count: 987 },
];

const suggestedAccounts = [
  { name: 'Mind Matters', handle: 'mindmatters', isVerified: true },
  { name: 'Therapy Tips', handle: 'therapytips', isVerified: true },
  { name: 'Community Care', handle: 'communitycare', isVerified: false },
];

function RightSidebar() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Crisis Widget */}
      <CrisisWidget />

      {/* Trending Tags */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Trending Topics</h3>
        </div>
        <div className="space-y-3">
          {trendingTags.map((tag) => (
            <button
              key={tag.name}
              className="flex items-center justify-between w-full hover:bg-secondary rounded-lg p-2 -m-2 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground font-medium">{tag.name}</span>
              </div>
              <span className="text-sm text-muted-foreground">{tag.count.toLocaleString()}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Suggested Accounts */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Suggested</h3>
        </div>
        <div className="space-y-4">
          {suggestedAccounts.map((account) => (
            <div key={account.handle} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-secondary text-secondary-foreground">
                    {account.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-foreground">{account.name}</span>
                    {account.isVerified && <VerifiedBadge className="h-3.5 w-3.5" />}
                  </div>
                  <p className="text-sm text-muted-foreground">@{account.handle}</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Follow
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Feed() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('following');
  const [loading, setLoading] = useState(false);

  return (
    <AppLayout rightSidebar={<RightSidebar />}>
      <div className="max-w-2xl mx-auto p-4">
        {/* Feed Tabs */}
        <div className="mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full bg-secondary">
              <TabsTrigger value="following" className="flex-1">
                {t('feed.following')}
              </TabsTrigger>
              <TabsTrigger value="trending" className="flex-1">
                {t('feed.trending')}
              </TabsTrigger>
              <TabsTrigger value="topics" className="flex-1">
                {t('feed.topics')}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Posts */}
        <div className="space-y-4">
          {loading ? (
            <>
              <PostCardSkeleton />
              <PostCardSkeleton />
              <PostCardSkeleton />
            </>
          ) : (
            mockPosts.map((post) => <PostCard key={post.id} {...post} />)
          )}
        </div>
      </div>
    </AppLayout>
  );
}
