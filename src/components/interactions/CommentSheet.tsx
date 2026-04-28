import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Flag, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { Drawer } from '@/components/ui/drawer';
import { BrandDrawerContent, BrandSheetTitle } from '@/components/ui/sheet-system';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useFeedComments } from '@/hooks/useFeedComments';
import { useComments } from '@/hooks/useComments';
import { EraVerifiedTick } from '@/components/EraVerifiedTick';
import { EraVerifiedTooltip } from '@/components/profile/EraVerifiedTooltip';
import { ReportModal } from '@/components/moderation/ReportModal';

interface CommentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  commentCount: number;
}

const springConfig = { type: "spring" as const, stiffness: 400, damping: 30 };

// Check if postId is a valid UUID (real post) or mock
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function CommentSheet({ open, onOpenChange, postId }: CommentSheetProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isRealPost = UUID_RE.test(postId);
  
  // Use FeedDataContext for simulated posts, real comments for UUID posts
  const realComments = useComments(postId);
  const feedComments = useFeedComments(postId);
  
  // Determine which hook to use based on post ID format
  const { comments, commentCount, addComment } = isRealPost ? realComments : feedComments;
  const [comment, setComment] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [reportingCommentId, setReportingCommentId] = useState<string | null>(null);
  const [reportingCommentAuthor, setReportingCommentAuthor] = useState<string>('');

  const handleSendComment = async () => {
    if (!comment.trim()) return;
    
    setIsSending(true);
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    if (isRealPost) {
      await addComment(comment);
    } else {
      await addComment(comment);
    }
    
    setComment('');
    setIsSending(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <BrandDrawerContent maxHeight="85vh">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springConfig}
          className="flex flex-col h-full"
        >
          <BrandSheetTitle
            setup={t('comments.title').toLowerCase()}
            emphasis={String(commentCount)}
            srDescription={`${commentCount} comments`}
          />
          
          {/* Comments list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {comments.map((c, index) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springConfig, delay: index * 0.05 }}
                className="flex gap-3 group"
              >
                <Avatar size="sm" className="flex-shrink-0">
                  <AvatarImage src={c.author.avatar} />
                  <AvatarFallback className="bg-secondary text-secondary-foreground text-label">
                    {c.author.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1">
                      <span className="font-medium text-body text-foreground">{c.author.name}</span>
                      {c.author.isVerified && (
                        <EraVerifiedTooltip userEmail={c.author.email} size="sm" />
                      )}
                    </span>
                    <span className="text-label text-muted-foreground">{c.createdAt}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          className="gap-2"
                          onClick={() => {
                            setReportingCommentId(c.id);
                            setReportingCommentAuthor(c.author.name);
                          }}
                        >
                          <Flag className="h-4 w-4" />
                          Report comment
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="text-body text-foreground mt-0.5">{c.content}</p>
                </div>
              </motion.div>
            ))}
            
            {comments.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>{t('comments.empty')}</p>
              </div>
            )}
          </div>
          
          {/* Comment input */}
          <div className="p-4 border-t border-border/50 bg-background">
            <div className="flex items-center gap-3">
              <Avatar size="sm" className="flex-shrink-0">
                <AvatarFallback className="bg-secondary text-secondary-foreground text-label">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder={t('comments.placeholder')}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendComment();
                    }
                  }}
                />
                <motion.div whileTap={{ scale: 0.9 }}>
                  <Button 
                    size="icon" 
                    disabled={!comment.trim() || isSending}
                    onClick={handleSendComment}
                  >
                    <motion.div
                      animate={isSending ? { x: [0, 3, 0] } : {}}
                      transition={{ duration: 0.15 }}
                    >
                      <Send className="h-4 w-4" />
                    </motion.div>
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </BrandDrawerContent>

      {/* Comment Report Modal */}
      <ReportModal
        open={!!reportingCommentId}
        onOpenChange={(open) => {
          if (!open) {
            setReportingCommentId(null);
            setReportingCommentAuthor('');
          }
        }}
        targetType="comment"
        targetId={reportingCommentId || ''}
        targetLabel={`${reportingCommentAuthor}'s comment`}
      />
    </Drawer>
  );
}
