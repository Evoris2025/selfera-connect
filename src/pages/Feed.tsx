import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/AppLayout';
import { ComposerBar } from '@/components/ComposerBar';
import { ExpressionsRow } from '@/components/ExpressionsRow';
import { PostCard } from '@/components/PostCard';
import { PostCardSkeleton } from '@/components/SkeletonLoader';
import { CreatorStudio } from '@/components/creator';

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
    content: "Today marks 1 year since I started my recovery journey. It hasn't been easy, but I'm grateful for this community and everyone who has supported me. There is hope.",
    tags: ['Recovery', 'Support'],
    commentCount: 156,
    createdAt: '6 hours ago',
  },
];

type CreatorMode = 'expression' | 'post' | 'image' | 'video' | null;

export default function Feed() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [creatorMode, setCreatorMode] = useState<CreatorMode>(null);

  const handleOpenComposer = (mode?: 'text' | 'video' | 'image' | 'reel') => {
    const modeMap: Record<string, CreatorMode> = {
      text: 'post',
      video: 'video',
      image: 'image',
      reel: 'expression',
    };
    setCreatorMode(mode ? modeMap[mode] : null);
    setCreatorOpen(true);
  };

  const handleCreatePost = () => {
    setCreatorMode(null);
    setCreatorOpen(true);
  };

  return (
    <AppLayout onCreatePost={handleCreatePost}>
      <div className="flex flex-col gap-3 p-3">
        <ComposerBar onOpenComposer={handleOpenComposer} />
        <ExpressionsRow />
        <div className="space-y-3">
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

      <CreatorStudio
        open={creatorOpen}
        onOpenChange={setCreatorOpen}
        initialMode={creatorMode}
      />
    </AppLayout>
  );
}
