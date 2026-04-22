import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MoreHorizontal,
  Flag,
  Ban,
  VolumeX,
  BookOpen,
  MapPin,
  Briefcase,
  Heart as HeartIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EraVerifiedTick, calculateVerificationTier } from './EraVerifiedTick';
import { EraVerifiedTooltip } from './profile/EraVerifiedTooltip';
import { AccountTypeBadge, AccountType } from './AccountTypeBadge';
import { Hashtag } from './Hashtag';
import { CommentButton, ShareButton, CommentSheet, CommunityButton } from './interactions';
import { CinematicAvatar } from './ui/CinematicAvatar';
import { ImmersiveMedia } from './ui/ImmersiveMedia';
import { ReactionButton, ReactionType } from './feed/ReactionPicker';
import { ReportModal } from './moderation/ReportModal';
import { PostCardLinkPreview } from './creator/post/PostCardLinkPreview';
import { isPollExpired } from './creator/post/PollCreator';
import { useFeedReactions } from '@/hooks/useFeedReactions';
import { useFeedLibrary } from '@/hooks/useFeedLibrary';
import { useFeedSafety } from '@/hooks/useFeedSafety';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import type {
  FeedCheckIn,
  FeedTaggedPerson,
  FeedLinkPreview,
  FeedCommentPermission,
  FeedLifeEvent,
  FeedFundraiser,
  FeedPostBackground,
  FeedPoll,
} from './feed/CrossroadFeed';

interface PostCardProps {
  id: string;
  authorId?: string;
  author: {
    name: string;
    handle: string;
    avatar?: string;
    isVerified?: boolean;
    accountType?: AccountType;
    email?: string;
  };
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
  hasContentWarning?: boolean;
  contentWarningType?: string;
  onPostClick?: (postId: string) => void;
  // Phase 4 additive fields — every one optional, defaults preserve old behavior
  background?: FeedPostBackground;
  checkIn?: FeedCheckIn;
  taggedPeople?: FeedTaggedPerson[];
  linkPreview?: FeedLinkPreview;
  commentPermission?: FeedCommentPermission;
  reactionsDisabled?: boolean;
  lifeEvent?: FeedLifeEvent;
  fundraiser?: FeedFundraiser;
  poll?: FeedPoll;
  thread?: Array<{ id: string; content: string; mediaUrl?: string; mediaType?: 'image' | 'video' | 'gif' }>;
}

function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

function PostCardBase(props: PostCardProps) {
  const {
    id,
    authorId,
    author,
    content,
    media,
    tags,
    commentCount,
    createdAt,
    likes = 0,
    hasContentWarning,
    contentWarningType,
    onPostClick,
    background,
    checkIn,
    taggedPeople,
    linkPreview,
    commentPermission,
    reactionsDisabled,
    lifeEvent,
    fundraiser,
    poll,
    thread,
  } = props;

  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isBlocked, isMuted, blockUser, muteUser } = useFeedSafety();
  const [showContent, setShowContent] = useState(!hasContentWarning);
  const [showHeartOverlay, setShowHeartOverlay] = useState(false);
  const [showCommentSheet, setShowCommentSheet] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [pollSelection, setPollSelection] = useState<number[]>([]);
  const { reactionCount, currentReaction, setReaction } = useFeedReactions(id, likes);
  const { inLibrary, toggleLibrary } = useFeedLibrary(id);

  if (authorId && isBlocked(authorId)) return null;

  // TODO: replace with real follower-state lookup. For now, treat viewer as a follower.
  const isFollowerOfAuthor = true;
  const canComment =
    commentPermission === 'nobody'
      ? false
      : commentPermission === 'followers'
        ? isFollowerOfAuthor
        : true;
  const showReactions = !reactionsDisabled;

  const handleCreatorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (authorId) navigate(`/profile/${authorId}`);
  };

  const handlePostContentClick = () => onPostClick?.(id);

  const handleDoubleTap = async () => {
    if (!user || !showReactions) return;
    setShowHeartOverlay(true);
    setTimeout(() => setShowHeartOverlay(false), 1000);
    if (navigator.vibrate) navigator.vibrate([10, 50, 10]);
    if (!currentReaction) await setReaction('like');
  };

  const handleReaction = async (type: ReactionType | null) => {
    if (!user || !showReactions) return;
    await setReaction(type);
  };

  const handleLibraryToggle = async () => {
    if (!user) return;
    await toggleLibrary();
  };

  const renderContent = (text: string) => {
    const parts = text.split(/(#\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('#')) {
        return <Hashtag key={i} tag={part} size="sm" className="inline mx-0.5" />;
      }
      return part;
    });
  };

  // Render priority: thread > media > poll > linkPreview > background > plain
  const hasThread = thread && thread.length > 0;
  const hasMedia = !!media;
  const hasPoll = !!poll && poll.options.length > 0;
  const hasLinkPreview = !!linkPreview;
  const hasBackground = !!background && !hasMedia && !hasPoll && !hasLinkPreview && !hasThread;

  // Byline extras (rendered above main content area when present)
  const bylineExtras = (
    <>
      {taggedPeople && taggedPeople.length > 0 && (
        <p className="text-xs text-muted-foreground mt-0.5">
          — with{' '}
          <span className="text-foreground/80 font-medium">
            {taggedPeople.slice(0, 2).map(p => p.name).join(', ')}
          </span>
          {taggedPeople.length > 2 && ` and ${taggedPeople.length - 2} other${taggedPeople.length - 2 === 1 ? '' : 's'}`}
        </p>
      )}
      {checkIn && (
        <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-xs">
          <MapPin className="h-3 w-3 text-emerald-500" />
          <span className="font-medium">at {checkIn.name}</span>
          {checkIn.category && <span className="text-muted-foreground">· {checkIn.category}</span>}
        </div>
      )}
    </>
  );

  const lifeEventCard = lifeEvent ? (
    <div className="flex items-center gap-2 px-3 py-2 mb-3 rounded-lg border border-border bg-secondary/40">
      <span className="text-xl">{lifeEvent.icon || '🏁'}</span>
      <div>
        <p className="text-xs text-muted-foreground">Life event</p>
        <p className="text-sm font-medium">{lifeEvent.label}</p>
      </div>
    </div>
  ) : null;

  const fundraiserCard = fundraiser ? (
    <div className="px-4 py-3 mb-3 rounded-xl border border-orange-500/40 bg-orange-500/10">
      <p className="text-xs uppercase tracking-wide text-orange-600 font-semibold mb-1">Fundraiser</p>
      <p className="text-sm font-semibold mb-1">{fundraiser.title}</p>
      <p className="text-xs text-muted-foreground">
        Goal: {fundraiser.currency} {fundraiser.goal.toLocaleString()}
      </p>
      {/* TODO: wire "Donate" button to payments later. */}
      <Button size="sm" variant="outline" className="mt-2 h-7 text-xs" disabled>
        Donate
      </Button>
    </div>
  ) : null;

  const pollClosed = poll ? isPollExpired(poll.closesAt) : false;
  const togglePollOption = (i: number) => {
    if (pollClosed || !poll) return;
    if (poll.multiSelect) {
      setPollSelection(s => s.includes(i) ? s.filter(x => x !== i) : [...s, i]);
    } else {
      setPollSelection([i]);
    }
  };
  const formatPollClosing = (closesAt?: number) => {
    if (!closesAt) return '';
    const ms = closesAt - Date.now();
    if (ms <= 0) return 'Poll closed';
    const mins = Math.floor(ms / 60000);
    if (mins < 60) return `Closes in ${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `Closes in ${hrs}h`;
    return `Closes in ${Math.floor(hrs / 24)}d`;
  };

  const pollBlock = hasPoll && poll ? (
    <div className="rounded-xl border border-border bg-secondary/40 p-3 space-y-2">
      <div className="space-y-1.5">
        {poll.options.map((opt, i) => {
          const selected = pollSelection.includes(i);
          return (
            <button
              key={i}
              onClick={() => togglePollOption(i)}
              disabled={pollClosed}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg border text-left transition',
                selected ? 'border-primary bg-primary/10' : 'border-border hover:bg-secondary',
                pollClosed && 'opacity-60 cursor-not-allowed'
              )}
            >
              <div className={cn(
                'h-4 w-4 shrink-0 flex items-center justify-center border-2',
                poll.multiSelect ? 'rounded' : 'rounded-full',
                selected ? 'border-primary bg-primary' : 'border-muted-foreground/40'
              )}>
                {selected && <div className={cn('h-2 w-2 bg-primary-foreground', poll.multiSelect ? 'rounded-sm' : 'rounded-full')} />}
              </div>
              {opt.image && (
                <img src={opt.image} alt="" className="h-8 w-8 rounded object-cover" />
              )}
              <span className="text-sm flex-1">{opt.text || `Option ${i + 1}`}</span>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        {pollClosed ? 'Poll closed' : formatPollClosing(poll.closesAt)}
        {poll.multiSelect && !pollClosed && ' · Multiple answers allowed'}
      </p>
    </div>
  ) : null;

  const threadBlock = hasThread && thread ? (
    <div className="space-y-2">
      {thread.map((item, i) => (
        <div key={item.id} className="rounded-xl border border-border bg-secondary/30 p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-medium text-primary">{i + 1}</span>
            <span className="text-xs text-muted-foreground">in thread</span>
          </div>
          <p className="text-[15px] text-foreground leading-relaxed">{renderContent(item.content)}</p>
          {item.mediaUrl && (
            <div className="mt-2 rounded-lg overflow-hidden bg-muted">
              {item.mediaType === 'video' ? (
                <video src={item.mediaUrl} className="w-full max-h-72 object-cover" controls />
              ) : (
                <img src={item.mediaUrl} alt="" className="w-full max-h-72 object-cover" />
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  ) : null;

  const linkPreviewBlock = hasLinkPreview && linkPreview ? (
    <PostCardLinkPreview preview={linkPreview} className="mt-2" />
  ) : null;

  const backgroundBlock = hasBackground && background ? (
    <div
      className="rounded-xl flex items-center justify-center px-6 py-12 min-h-[240px]"
      style={{ background: background.value, color: background.textColor || '#fff' }}
    >
      <p className="text-2xl font-semibold text-center leading-snug whitespace-pre-wrap">
        {renderContent(content)}
      </p>
    </div>
  ) : null;

  const actionBar = (
    <div className="flex items-center gap-5 pt-1">
      {showReactions && (
        <ReactionButton
          postId={id}
          currentReaction={currentReaction}
          count={reactionCount}
          onReact={handleReaction}
        />
      )}
      {canComment && (
        <CommentButton count={commentCount} onClick={() => setShowCommentSheet(true)} />
      )}
      {!canComment && commentPermission === 'followers' && (
        <span className="text-xs text-muted-foreground" title="Only followers can comment">
          Comments limited
        </span>
      )}
      <ShareButton postId={id} />
      {authorId && <CommunityButton authorId={authorId} authorName={author.name} />}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleLibraryToggle}
        className={cn(
          'transition-colors ml-auto',
          inLibrary ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <BookOpen className={cn('h-5 w-5', inLibrary && 'fill-current')} />
      </motion.button>
    </div>
  );

  // ---------- Text-style branch (no immersive media) -------------------------
  if (!hasMedia) {
    return (
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="px-4 py-5 border-b border-border/50"
      >
        <div className="flex items-start gap-3 mb-3">
          <motion.button
            onClick={handleCreatorClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="cursor-pointer flex-shrink-0"
          >
            <CinematicAvatar
              src={author.avatar}
              alt={author.name}
              fallback={author.name.charAt(0)}
              size="md"
              ring="muted"
            />
          </motion.button>

          <div className="flex-1 min-w-0">
            <button onClick={handleCreatorClick} className="text-left hover:underline">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-foreground text-[15px]">{author.name}</span>
                {author.isVerified && (
                  <EraVerifiedTooltip tier={calculateVerificationTier(0, false, author.email)} userEmail={author.email} size="sm" />
                )}
                {author.accountType && <AccountTypeBadge type={author.accountType} size="sm" />}
              </div>
              <p className="text-muted-foreground text-sm">@{author.handle} · {createdAt}</p>
            </button>
            {bylineExtras}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground flex-shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card">
              <DropdownMenuItem className="gap-2" onClick={() => setShowReportModal(true)}>
                <Flag className="h-4 w-4" />
                {t('safety.report')}
              </DropdownMenuItem>
              {authorId && (
                <>
                  <DropdownMenuItem className="gap-2" onClick={() => muteUser(authorId)}>
                    <VolumeX className="h-4 w-4" />
                    {isMuted(authorId) ? 'Unmute' : t('safety.mute')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2 text-destructive" onClick={() => blockUser(authorId)}>
                    <Ban className="h-4 w-4" />
                    {t('safety.block')}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {lifeEventCard}
        {fundraiserCard}

        {/* Priority body */}
        {hasThread ? (
          threadBlock
        ) : hasPoll ? (
          <>
            {content && (
              <button onClick={handlePostContentClick} className="text-left w-full">
                <p className="text-[15px] text-foreground leading-relaxed mb-3">{renderContent(content)}</p>
              </button>
            )}
            {pollBlock}
          </>
        ) : hasLinkPreview ? (
          <>
            {content && (
              <button onClick={handlePostContentClick} className="text-left w-full">
                <p className="text-[15px] text-foreground leading-relaxed mb-3">{renderContent(content)}</p>
              </button>
            )}
            {linkPreviewBlock}
          </>
        ) : hasBackground ? (
          backgroundBlock
        ) : (
          <button onClick={handlePostContentClick} className="text-left w-full">
            <p className="text-[15px] text-foreground leading-relaxed mb-3">{renderContent(content)}</p>
          </button>
        )}

        {tags.length > 0 && !content.includes('#') && (
          <div className="flex flex-wrap gap-1.5 mt-3 mb-1">
            {tags.map((tag) => (
              <Hashtag key={tag} tag={tag} size="sm" />
            ))}
          </div>
        )}

        {actionBar}

        <CommentSheet
          open={showCommentSheet}
          onOpenChange={setShowCommentSheet}
          postId={id}
          commentCount={commentCount}
        />

        <ReportModal
          open={showReportModal}
          onOpenChange={setShowReportModal}
          targetType="post"
          targetId={id}
          targetLabel={`${author.name}'s post`}
        />
      </motion.article>
    );
  }

  // Media post - edge-to-edge immersive
  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full"
    >
      {hasContentWarning && !showContent ? (
        <div
          className="aspect-[4/5] bg-card/80 backdrop-blur-xl flex items-center justify-center cursor-pointer"
          onClick={() => setShowContent(true)}
        >
          <div className="text-center px-8">
            <div className="w-14 h-14 rounded-full bg-warning/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <span className="text-base text-warning font-medium block mb-2">{contentWarningType || 'Sensitive Content'}</span>
            <p className="text-muted-foreground text-sm">Tap to view</p>
          </div>
        </div>
      ) : (
        <ImmersiveMedia
          src={media!.url}
          type={media!.type}
          poster={media!.thumbnail}
          aspectRatio="portrait"
          overlay="full"
          onDoubleTap={handleDoubleTap}
          showHeartOnDoubleTap={showReactions}
          onClick={handlePostContentClick}
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="absolute top-4 left-4 right-4 flex items-center justify-between z-20"
          >
            <motion.button
              onClick={handleCreatorClick}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2"
            >
              <CinematicAvatar
                src={author.avatar}
                alt={author.name}
                fallback={author.name.charAt(0)}
                size="sm"
                ring="gradient"
              />
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-foreground text-[15px] drop-shadow-md">{author.name}</span>
                {author.isVerified && (
                  <EraVerifiedTooltip tier={calculateVerificationTier(0, false, author.email)} userEmail={author.email} size="sm" />
                )}
                {author.accountType && <AccountTypeBadge type={author.accountType} size="sm" />}
                <span className="text-foreground/70 text-sm drop-shadow-sm">@{author.handle}</span>
              </div>
            </motion.button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full glass-subtle">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-card">
                <DropdownMenuItem className="gap-2" onClick={() => setShowReportModal(true)}>
                  <Flag className="h-4 w-4" />
                  {t('safety.report')}
                </DropdownMenuItem>
                {authorId && (
                  <>
                    <DropdownMenuItem className="gap-2" onClick={() => muteUser(authorId)}>
                      <VolumeX className="h-4 w-4" />
                      {isMuted(authorId) ? 'Unmute' : t('safety.mute')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="gap-2 text-destructive" onClick={() => blockUser(authorId)}>
                      <Ban className="h-4 w-4" />
                      {t('safety.block')}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>

          <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {(taggedPeople?.length || checkIn || lifeEvent) && (
                <div className="mb-2 space-y-1">{bylineExtras}{lifeEventCard}</div>
              )}
              {fundraiserCard}

              <p className="text-[15px] text-foreground leading-relaxed mb-2 drop-shadow-md">
                <span className="font-semibold mr-1.5">{author.handle}</span>
                {renderContent(content)}
              </p>

              {tags.length > 0 && !content.includes('#') && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {tags.map((tag) => (
                    <span key={tag} className="text-sm text-foreground/80 font-medium">#{tag}</span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-5">
                  {showReactions && (
                    <ReactionButton
                      postId={id}
                      currentReaction={currentReaction}
                      count={reactionCount}
                      onReact={handleReaction}
                    />
                  )}
                  {canComment && (
                    <CommentButton count={commentCount} onClick={() => setShowCommentSheet(true)} />
                  )}
                  <ShareButton postId={id} />
                  {authorId && <CommunityButton authorId={authorId} authorName={author.name} />}
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleLibraryToggle}
                  className={cn(
                    'transition-colors p-2',
                    inLibrary ? 'text-primary' : 'text-foreground/80 hover:text-foreground'
                  )}
                >
                  <BookOpen className={cn('h-6 w-6', inLibrary && 'fill-current')} />
                </motion.button>
              </div>

              {commentCount > 0 && canComment && (
                <button
                  onClick={() => setShowCommentSheet(true)}
                  className="text-sm text-muted-foreground mt-2 hover:text-foreground transition-colors"
                >
                  View all {formatCount(commentCount)} comments
                </button>
              )}
            </motion.div>
          </div>
        </ImmersiveMedia>
      )}

      <CommentSheet
        open={showCommentSheet}
        onOpenChange={setShowCommentSheet}
        postId={id}
        commentCount={commentCount}
      />

      <ReportModal
        open={showReportModal}
        onOpenChange={setShowReportModal}
        targetType="post"
        targetId={id}
        targetLabel={`${author.name}'s post`}
      />
    </motion.article>
  );
}

export const PostCard = memo(PostCardBase);
PostCard.displayName = 'PostCard';
