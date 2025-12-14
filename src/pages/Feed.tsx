import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/AppLayout';
import { ComposerBar } from '@/components/ComposerBar';
import { ExpressionsRow } from '@/components/ExpressionsRow';
import { PostCard } from '@/components/PostCard';
import { TextPostCard } from '@/components/TextPostCard';
import { PostCardSkeleton } from '@/components/SkeletonLoader';
import { CreatorStudio } from '@/components/creator';
import { EmotionalContextBar, EmotionalState } from '@/components/EmotionalContextBar';

// Mock data for demo with tone assignments
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
    tone: 'inspiration' as const,
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
    tone: 'support' as const,
    isTextOnly: true,
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
    tone: 'progress' as const,
    isTextOnly: true,
  },
  {
    id: '4',
    author: {
      name: 'MindfulMoments',
      handle: 'mindfulmoments',
      avatar: '',
      isVerified: true,
    },
    content: "Finding peace in small moments. Today I watched the sunset and felt genuinely okay for the first time in weeks. Sometimes that's enough.",
    tags: ['Mindfulness', 'Daily wins'],
    commentCount: 45,
    createdAt: '8 hours ago',
    tone: 'steady' as const,
    isTextOnly: true,
  },
];

type CreatorMode = 'expression' | 'post' | 'image' | 'video' | null;

export default function Feed() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [creatorMode, setCreatorMode] = useState<CreatorMode>(null);
  const [emotionalState, setEmotionalState] = useState<EmotionalState>(null);

  // Filter posts based on emotional state
  const filteredPosts = useMemo(() => {
    if (!emotionalState) return mockPosts;
    return mockPosts.filter(post => post.tone === emotionalState);
  }, [emotionalState]);

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
      <div className="flex flex-col gap-4 p-3">
        {/* Emotional Context Bar */}
        <EmotionalContextBar 
          selectedState={emotionalState} 
          onStateChange={setEmotionalState} 
        />

        <ComposerBar onOpenComposer={handleOpenComposer} />
        <ExpressionsRow />
        
        {/* Posts Feed */}
        <div className="space-y-4">
          {loading ? (
            <>
              <PostCardSkeleton />
              <PostCardSkeleton />
              <PostCardSkeleton />
            </>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No posts match your current mood.</p>
              <button 
                onClick={() => setEmotionalState(null)}
                className="text-primary hover:underline mt-2"
              >
                Show all posts
              </button>
            </div>
          ) : (
            filteredPosts.map((post) => 
              post.isTextOnly ? (
                <TextPostCard 
                  key={post.id} 
                  id={post.id}
                  author={post.author}
                  content={post.content}
                  tags={post.tags}
                  commentCount={post.commentCount}
                  createdAt={post.createdAt}
                  tone={post.tone}
                />
              ) : (
                <PostCard key={post.id} {...post} />
              )
            )
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
