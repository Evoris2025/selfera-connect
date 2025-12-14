import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/AppLayout';
import { PostCard } from '@/components/PostCard';
import { PostCardSkeleton } from '@/components/SkeletonLoader';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

export default function Feed() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('following');
  const [loading, setLoading] = useState(false);

  return (
    <AppLayout>
      <div className="p-4">
        {/* Feed Tabs */}
        <div className="mb-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full bg-secondary">
              <TabsTrigger value="following" className="flex-1 text-xs">
                {t('feed.following')}
              </TabsTrigger>
              <TabsTrigger value="trending" className="flex-1 text-xs">
                {t('feed.trending')}
              </TabsTrigger>
              <TabsTrigger value="topics" className="flex-1 text-xs">
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
