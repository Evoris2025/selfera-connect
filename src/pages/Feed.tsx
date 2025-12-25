import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { ComposerBar } from '@/components/ComposerBar';
import { ExpressionsRow } from '@/components/ExpressionsRow';
import { CreatorStudio } from '@/components/creator';
import { PostViewerModal, CrossroadFeed, FeedPost } from '@/components/feed';
import { useFeedPosts } from '@/hooks/useFeedPosts';

type CreatorMode = 'expression' | 'post' | 'image' | 'video' | null;

export default function Feed() {
  const navigate = useNavigate();
  const { posts, loading, loadingMore, hasMore, loadMore } = useFeedPosts();
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
          posts={posts}
          loading={loading}
          loadingMore={loadingMore}
          hasMore={hasMore}
          onPostClick={handlePostClick}
          onLoadMore={loadMore}
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
