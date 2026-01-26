import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { ComposerBar } from '@/components/ComposerBar';
import { ExpressionsRow } from '@/components/ExpressionsRow';
import { CreatorStudio } from '@/components/creator';
import { PostViewerModal, CrossroadFeed, FeedPost } from '@/components/feed';
import { PullToRefresh } from '@/components/ui/PullToRefresh';
import { useMockSystem } from '@/contexts/MockSystemContext';
import { useMockFeedPosts } from '@/hooks/useMockFeedPosts';

type CreatorMode = 'expression' | 'post' | 'image' | 'video' | null;

export default function Feed() {
  const navigate = useNavigate();
  const { state } = useMockSystem();
  const { posts, loading, refreshing, loadingMore, hasMore, loadMore, refresh } = useMockFeedPosts();
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [creatorMode, setCreatorMode] = useState<CreatorMode>(null);
  
  // Modal state
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const selectedPost = useMemo(() => {
    if (!selectedPostId) return null;
    return posts.find((p) => p.id === selectedPostId) ?? null;
  }, [posts, selectedPostId]);

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

  const handlePostClick = useCallback((postId: string) => {
    setSelectedPostId(postId);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPostId(null);
  };

  const handleNavigateProfile = (authorId: string) => {
    setIsModalOpen(false);
    navigate(`/profile/${authorId}`);
  };

  return (
    <AppLayout onCreatePost={handleCreatePost} title="The Feed">
      <PullToRefresh 
        onRefresh={refresh} 
        className="flex flex-col bg-cinematic min-h-dvh"
        disabled={loading || refreshing}
      >
        {/* Composer Bar */}
        <div className="px-4 pt-3 pb-3">
          <ComposerBar onOpenComposer={handleOpenComposer} />
        </div>

        {/* Expressions/Stories Row */}
        <div className="mb-4">
          <ExpressionsRow />
        </div>
        
        {/* Crossroad Feed */}
        <CrossroadFeed
          posts={posts}
          loading={loading}
          refreshing={refreshing}
          loadingMore={loadingMore}
          hasMore={hasMore}
          onPostClick={handlePostClick}
          onLoadMore={loadMore}
          onRefresh={refresh}
        />
      </PullToRefresh>

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
