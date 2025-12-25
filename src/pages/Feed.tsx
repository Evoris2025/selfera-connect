import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/AppLayout';
import { ComposerBar } from '@/components/ComposerBar';
import { ExpressionsRow } from '@/components/ExpressionsRow';
import { PostCard } from '@/components/PostCard';
import { PostCardSkeleton } from '@/components/SkeletonLoader';
import { CreatorStudio } from '@/components/creator';

// Mock data with rich media
const mockPosts = [
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
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=1000&fit=crop',
    },
    tags: ['selfcare', 'mindfulness', 'wellness'],
    commentCount: 32,
    createdAt: '2h',
    likes: 1247,
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
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&h=1000&fit=crop',
    },
    tags: ['recovery', 'mentalhealth', 'milestone'],
    commentCount: 156,
    createdAt: '6h',
    likes: 8234,
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
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&h=1000&fit=crop',
    },
    tags: ['meditation', 'mindfulness', 'morningroutine'],
    commentCount: 45,
    createdAt: '8h',
    likes: 2156,
  },
];

type CreatorMode = 'expression' | 'post' | 'image' | 'video' | null;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
  },
};

export default function Feed() {
  const navigate = useNavigate();
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
        
        {/* Posts Feed - Edge to edge for media posts */}
        <motion.div 
          className="flex flex-col"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence mode="popLayout">
            {loading ? (
              <div className="px-4 space-y-4">
                <PostCardSkeleton />
                <PostCardSkeleton />
                <PostCardSkeleton />
              </div>
            ) : (
              mockPosts.map((post) => (
                <motion.div
                  key={post.id}
                  variants={itemVariants}
                  layout
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={post.media ? '' : 'px-0'}
                >
                  <PostCard {...post} />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <CreatorStudio
        open={creatorOpen}
        onOpenChange={setCreatorOpen}
        initialMode={creatorMode}
      />
    </AppLayout>
  );
}
