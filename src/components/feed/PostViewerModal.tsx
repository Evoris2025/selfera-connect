import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CinematicAvatar } from '@/components/ui/CinematicAvatar';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { ReactionButton, ReactionType } from './ReactionPicker';
import { cn } from '@/lib/utils';
import { 
  modalBackdropVariants, 
  modalContentVariants, 
  modalTransition,
  springTransitions,
  buttonPressTransition
} from '@/hooks/useMicroAnimations';

export type PostContentType = 'image' | 'video' | 'text' | 'reel' | 'live';

interface PostAuthor {
  name: string;
  handle: string;
  avatar?: string;
  isVerified?: boolean;
}

interface PostViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    id: string;
    authorId?: string;
    author: PostAuthor;
    content: string;
    media?: {
      type: 'image' | 'video';
      url: string;
      thumbnail?: string;
    };
    tags: string[];
    commentCount: number;
    createdAt: string;
    likes?: number;
  };
  contentType: PostContentType;
  onNavigateProfile?: (authorId: string) => void;
}

export function PostViewerModal({ 
  isOpen, 
  onClose, 
  post, 
  contentType,
  onNavigateProfile 
}: PostViewerModalProps) {
  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleProfileClick = () => {
    if (post.authorId && onNavigateProfile) {
      onNavigateProfile(post.authorId);
    }
  };

  // Render different viewer based on content type
  const renderViewer = () => {
    switch (contentType) {
      case 'image':
      case 'video':
        return <MediaPostViewer post={post} onProfileClick={handleProfileClick} />;
      case 'text':
        return <TextPostViewer post={post} onProfileClick={handleProfileClick} />;
      case 'reel':
        return <ReelViewer post={post} onProfileClick={handleProfileClick} />;
      case 'live':
        return <LiveViewer post={post} onProfileClick={handleProfileClick} />;
      default:
        return <MediaPostViewer post={post} onProfileClick={handleProfileClick} />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={modalBackdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.2 }}
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md"
        >
          <motion.div
            variants={modalContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={modalTransition}
            className="relative w-full max-w-5xl max-h-[90vh] mx-4"
          >
            {/* Close Button with press animation */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, ...springTransitions.snappy }}
              className="absolute -top-12 right-0 z-10"
            >
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={buttonPressTransition}
                onClick={onClose}
                className="p-2 rounded-full text-foreground/80 hover:text-foreground hover:bg-foreground/10 transition-colors"
              >
                <X className="h-6 w-6" />
              </motion.button>
            </motion.div>

            {renderViewer()}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Media Post Viewer (Instagram-style)
function MediaPostViewer({ post, onProfileClick }: { post: PostViewerModalProps['post']; onProfileClick: () => void }) {
  return (
    <div className="flex bg-card rounded-xl overflow-hidden shadow-elevated max-h-[85vh]">
      {/* Media Side */}
      <div className="flex-1 bg-black flex items-center justify-center min-w-0">
        {post.media?.type === 'video' ? (
          <video
            src={post.media.url}
            poster={post.media.thumbnail}
            controls
            className="max-h-[85vh] w-full object-contain"
          />
        ) : (
          <img
            src={post.media?.url}
            alt="Post media"
            className="max-h-[85vh] w-full object-contain"
          />
        )}
      </div>

      {/* Details Side */}
      <div className="w-[380px] flex-shrink-0 flex flex-col border-l border-border">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <button onClick={onProfileClick} className="cursor-pointer">
            <CinematicAvatar
              src={post.author.avatar}
              alt={post.author.name}
              fallback={post.author.name.charAt(0)}
              size="md"
              ring="gradient"
              interactive
            />
          </button>
          <div className="flex-1 min-w-0">
            <button onClick={onProfileClick} className="flex items-center gap-1.5 hover:underline">
              <span className="font-semibold text-foreground truncate">{post.author.name}</span>
              {post.author.isVerified && <VerifiedBadge size="sm" />}
            </button>
            <p className="text-sm text-muted-foreground">@{post.author.handle}</p>
          </div>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>

        {/* Caption & Comments */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Caption */}
          <div className="flex gap-3 mb-4">
            <CinematicAvatar
              src={post.author.avatar}
              alt={post.author.name}
              fallback={post.author.name.charAt(0)}
              size="sm"
            />
            <div>
              <p className="text-sm">
                <span className="font-semibold mr-1.5">{post.author.handle}</span>
                {post.content}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{post.createdAt}</p>
            </div>
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {post.tags.map(tag => (
                <span key={tag} className="text-sm text-primary hover:underline cursor-pointer">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Placeholder for comments */}
          <p className="text-sm text-muted-foreground">View all {post.commentCount} comments</p>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <ReactionButton
                postId={post.id}
                currentReaction={null}
                count={post.likes || 0}
                onReact={() => {}}
              />
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <MessageCircle className="h-6 w-6" />
              </button>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <Send className="h-6 w-6" />
              </button>
            </div>
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <Bookmark className="h-6 w-6" />
            </button>
          </div>
          <p className="font-semibold text-sm mb-1">{(post.likes || 0).toLocaleString()} likes</p>
          <p className="text-xs text-muted-foreground uppercase">{post.createdAt}</p>
        </div>
      </div>
    </div>
  );
}

// Text Post Viewer (Facebook/X-style)
function TextPostViewer({ post, onProfileClick }: { post: PostViewerModalProps['post']; onProfileClick: () => void }) {
  return (
    <div className="bg-card rounded-xl overflow-hidden shadow-elevated max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onProfileClick} className="cursor-pointer">
          <CinematicAvatar
            src={post.author.avatar}
            alt={post.author.name}
            fallback={post.author.name.charAt(0)}
            size="md"
            ring="gradient"
            interactive
          />
        </button>
        <div className="flex-1">
          <button onClick={onProfileClick} className="flex items-center gap-1.5 hover:underline">
            <span className="font-semibold text-foreground">{post.author.name}</span>
            {post.author.isVerified && <VerifiedBadge size="sm" />}
          </button>
          <p className="text-sm text-muted-foreground">{post.createdAt}</p>
        </div>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="p-6">
        <p className="text-lg leading-relaxed">{post.content}</p>
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map(tag => (
              <span key={tag} className="text-primary hover:underline cursor-pointer">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <ReactionButton
              postId={post.id}
              currentReaction={null}
              count={post.likes || 0}
              onReact={() => {}}
            />
            <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
              <MessageCircle className="h-5 w-5" />
              <span className="text-sm">{post.commentCount}</span>
            </button>
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <Send className="h-5 w-5" />
            </button>
          </div>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <Bookmark className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Comments placeholder */}
      <div className="p-4 border-t border-border">
        <p className="text-sm text-muted-foreground mb-4">View all {post.commentCount} comments</p>
        <div className="flex gap-3">
          <CinematicAvatar size="sm" fallback="Y" />
          <input
            type="text"
            placeholder="Add a comment..."
            className="flex-1 bg-transparent text-sm focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}

// Reel Viewer (Instagram Reels-style)
function ReelViewer({ post, onProfileClick }: { post: PostViewerModalProps['post']; onProfileClick: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative h-[85vh] w-full max-w-md mx-auto bg-black rounded-xl overflow-hidden"
    >
      {/* Video */}
      <video
        src={post.media?.url}
        poster={post.media?.thumbnail}
        className="absolute inset-0 w-full h-full object-cover"
        loop
        autoPlay
        muted
        playsInline
      />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 pointer-events-none" />

      {/* Right actions with stagger */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.2 } }
        }}
        className="absolute right-4 bottom-32 flex flex-col items-center gap-6"
      >
        {[
          { icon: Heart, count: post.likes, label: 'Like' },
          { icon: MessageCircle, count: post.commentCount, label: 'Comment' },
          { icon: Send, label: 'Share' },
          { icon: Bookmark, label: 'Save' },
        ].map(({ icon: Icon, count, label }) => (
          <motion.button
            key={label}
            variants={{
              hidden: { opacity: 0, x: 20, scale: 0.8 },
              visible: { opacity: 1, x: 0, scale: 1 }
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.85 }}
            transition={buttonPressTransition}
            className="flex flex-col items-center gap-1"
          >
            <div className="w-12 h-12 rounded-full bg-background/20 backdrop-blur flex items-center justify-center transition-colors hover:bg-background/30">
              <Icon className="h-6 w-6 text-foreground" />
            </div>
            {count !== undefined && (
              <span className="text-xs font-medium text-foreground">{count}</span>
            )}
          </motion.button>
        ))}
      </motion.div>

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-16 p-4">
        <button onClick={onProfileClick} className="flex items-center gap-2 mb-3">
          <CinematicAvatar
            src={post.author.avatar}
            alt={post.author.name}
            fallback={post.author.name.charAt(0)}
            size="sm"
            ring="gradient"
          />
          <span className="font-semibold text-foreground">{post.author.handle}</span>
          {post.author.isVerified && <VerifiedBadge size="sm" />}
          <Button size="sm" variant="outline" className="ml-2 h-7 text-xs">
            Follow
          </Button>
        </button>
        <p className="text-sm text-foreground/90 line-clamp-2">{post.content}</p>
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {post.tags.map(tag => (
              <span key={tag} className="text-sm text-foreground/70">#{tag}</span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Live Viewer (Instagram Live-style)
function LiveViewer({ post, onProfileClick }: { post: PostViewerModalProps['post']; onProfileClick: () => void }) {
  return (
    <div className="relative h-[85vh] w-full max-w-md mx-auto bg-black rounded-xl overflow-hidden">
      {/* Video placeholder */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-pink-900/50 flex items-center justify-center">
        <p className="text-foreground/50">Live stream placeholder</p>
      </div>

      {/* Live badge & viewers */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
        <button onClick={onProfileClick} className="flex items-center gap-2">
          <CinematicAvatar
            src={post.author.avatar}
            alt={post.author.name}
            fallback={post.author.name.charAt(0)}
            size="sm"
            ring="gradient"
          />
          <div>
            <span className="font-semibold text-foreground text-sm">{post.author.name}</span>
            <p className="text-xs text-foreground/60">Live now</p>
          </div>
          <Button size="sm" variant="outline" className="ml-2 h-7 text-xs">
            Follow
          </Button>
        </button>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 bg-background/20 backdrop-blur rounded-full">
            <span className="text-xs font-medium text-foreground">1.2K</span>
          </div>
          <div className="px-2 py-1 bg-red-500 rounded text-xs font-bold text-white">
            LIVE
          </div>
        </div>
      </div>

      {/* Chat overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="space-y-2 mb-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-2 bg-background/20 backdrop-blur rounded-lg px-3 py-2">
              <CinematicAvatar size="xs" fallback={`U${i}`} />
              <p className="text-sm text-foreground/90">Sample comment message...</p>
            </div>
          ))}
        </div>

        {/* Comment input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Comment..."
            className="flex-1 bg-background/30 backdrop-blur rounded-full px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="flex gap-2">
            <motion.button whileTap={{ scale: 0.9 }}>❤️</motion.button>
            <motion.button whileTap={{ scale: 0.9 }}>🙌</motion.button>
            <motion.button whileTap={{ scale: 0.9 }}>🔥</motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
