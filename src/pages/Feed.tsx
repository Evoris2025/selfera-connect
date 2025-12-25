import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { ComposerBar } from '@/components/ComposerBar';
import { ExpressionsRow } from '@/components/ExpressionsRow';
import { PostCardSkeleton } from '@/components/SkeletonLoader';
import { CreatorStudio } from '@/components/creator';
import { PostViewerModal, CrossroadFeed, FeedPost } from '@/components/feed';
import { ContentType } from '@/hooks/useCrossroadScroll';

// Helper to determine content type
function getContentType(media?: { type: 'image' | 'video' }): ContentType {
  if (!media) return 'text';
  if (media.type === 'video') return 'video';
  return 'image';
}

// Mock data with rich media and content types
const mockPosts: FeedPost[] = [
  {
    id: '1',
    authorId: 'author-1-uuid',
    author: {
      name: 'Wellness Center',
      handle: 'wellnesscenter',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
      isVerified: true,
    },
    content: 'Remember: taking a break is not giving up. Your mental health matters more than any deadline.',
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=1000&fit=crop',
    },
    tags: ['selfcare', 'mindfulness', 'wellness'],
    commentCount: 32,
    createdAt: '2h',
    likes: 1247,
    contentType: 'image',
  },
  {
    id: '2',
    authorId: 'author-2-uuid',
    author: {
      name: 'Dr. Sarah Mitchell',
      handle: 'drsarahmitchell',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop',
      isVerified: true,
    },
    content: 'Anxiety tip: Try the 5-4-3-2-1 grounding technique. Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste. #anxiety #mentalhealth',
    tags: ['anxiety', 'mentalhealth', 'copingskills'],
    commentCount: 78,
    createdAt: '4h',
    likes: 3891,
    contentType: 'text',
  },
  {
    id: '3',
    authorId: 'author-3-uuid',
    author: {
      name: 'Jamie',
      handle: 'jamie_journey',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    },
    content: "Today marks 1 year since I started my recovery journey. It hasn't been easy, but I'm grateful for this community. 💙",
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&h=1000&fit=crop',
    },
    tags: ['recovery', 'mentalhealth', 'milestone'],
    commentCount: 156,
    createdAt: '6h',
    likes: 8234,
    contentType: 'image',
  },
  {
    id: '4',
    authorId: 'author-4-uuid',
    author: {
      name: 'MindfulMoments',
      handle: 'mindfulmoments',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
      isVerified: true,
    },
    content: "Morning meditation complete ✨ 10 minutes of stillness can change your entire day.",
    media: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&h=1000&fit=crop',
    },
    tags: ['meditation', 'mindfulness', 'morningroutine'],
    commentCount: 45,
    createdAt: '8h',
    likes: 2156,
    contentType: 'image',
  },
  {
    id: '5',
    authorId: 'author-5-uuid',
    author: {
      name: 'TherapyTalks',
      handle: 'therapytalks',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
      isVerified: true,
    },
    content: "Your feelings are valid. Even when they're confusing, even when they feel too big, even when others don't understand. They are yours, and they matter.",
    tags: ['mentalhealth', 'validation', 'therapy'],
    commentCount: 234,
    createdAt: '10h',
    likes: 5672,
    contentType: 'text',
  },
];

type CreatorMode = 'expression' | 'post' | 'image' | 'video' | null;

export default function Feed() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [creatorMode, setCreatorMode] = useState<CreatorMode>(null);
  
  // Modal state
  const [selectedPost, setSelectedPost] = useState<FeedPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handlePostClick = (post: FeedPost) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  const handleNavigateProfile = (authorId: string) => {
    setIsModalOpen(false);
    navigate(`/profile/${authorId}`);
  };

  const handleLoadMore = () => {
    // Future: fetch more posts with cursor pagination
    console.log('Load more triggered');
  };

  return (
    <AppLayout onCreatePost={handleCreatePost} title="The Feed">
      <div className="flex flex-col bg-cinematic min-h-screen">
        {/* Composer Bar */}
        <div className="px-4 pt-3 pb-3">
          <ComposerBar onOpenComposer={handleOpenComposer} />
        </div>

        {/* Expressions/Stories Row */}
        <div className="mb-4">
          <ExpressionsRow />
        </div>
        
        {/* Crossroad Feed with dual-axis scrolling */}
        <CrossroadFeed
          posts={mockPosts}
          loading={loading}
          onPostClick={handlePostClick}
          onLoadMore={handleLoadMore}
        />
      </div>

      {/* Post Viewer Modal */}
      {selectedPost && (
        <PostViewerModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          post={selectedPost}
          contentType={selectedPost.contentType}
          onNavigateProfile={handleNavigateProfile}
        />
      )}

      <CreatorStudio
        open={creatorOpen}
        onOpenChange={setCreatorOpen}
        initialMode={creatorMode}
      />
    </AppLayout>
  );
}
