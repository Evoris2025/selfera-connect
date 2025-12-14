import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/AppLayout';
import { ComposerBar } from '@/components/ComposerBar';
import { ExpressionsRow } from '@/components/ExpressionsRow';
import { PostCard } from '@/components/PostCard';
import { PostCardSkeleton } from '@/components/SkeletonLoader';
import { CreatorStudio } from '@/components/creator';
import { Hashtag } from '@/components/Hashtag';

// Trending hashtags
const trendingHashtags = ['mentalhealth', 'selfcare', 'anxiety', 'recovery', 'mindfulness'];

// Mock data for demo with hashtags
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
    tags: ['selfcare', 'mindfulness', 'wellness'],
    commentCount: 32,
    createdAt: '2h',
    likes: 1247,
  },
  {
    id: '2',
    author: {
      name: 'Dr. Sarah Mitchell',
      handle: 'drsarahmitchell',
      avatar: '',
      isVerified: true,
    },
    content: 'Anxiety tip: Try the 5-4-3-2-1 grounding technique. Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste. This helps bring you back to the present moment. #anxiety #mentalhealth #copingskills',
    tags: ['anxiety', 'mentalhealth', 'copingskills'],
    commentCount: 78,
    createdAt: '4h',
    likes: 3891,
  },
  {
    id: '3',
    author: {
      name: 'Jamie',
      handle: 'jamie_journey',
      avatar: '',
    },
    content: "Today marks 1 year since I started my recovery journey. It hasn't been easy, but I'm grateful for this community and everyone who has supported me. There is hope. 💙 #recovery #mentalhealth #oneyear",
    tags: ['recovery', 'mentalhealth', 'milestone'],
    commentCount: 156,
    createdAt: '6h',
    likes: 8234,
  },
  {
    id: '4',
    author: {
      name: 'MindfulMoments',
      handle: 'mindfulmoments',
      avatar: '',
      isVerified: true,
    },
    content: "Morning meditation complete ✨ 10 minutes of stillness can change your entire day. Who else meditates in the morning? #meditation #mindfulness #morningroutine",
    media: {
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&h=600&fit=crop',
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
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
  },
};

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
        {/* Trending Hashtags */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {trendingHashtags.map((tag, index) => (
            <motion.div
              key={tag}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Hashtag tag={tag} size="md" animated />
            </motion.div>
          ))}
        </div>

        <ComposerBar onOpenComposer={handleOpenComposer} />
        <ExpressionsRow />
        
        {/* Posts Feed with animations */}
        <motion.div 
          className="space-y-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence mode="popLayout">
            {loading ? (
              <>
                <PostCardSkeleton />
                <PostCardSkeleton />
                <PostCardSkeleton />
              </>
            ) : (
              mockPosts.map((post) => (
                <motion.div
                  key={post.id}
                  variants={itemVariants}
                  layout
                  exit={{ opacity: 0, scale: 0.95 }}
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