import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Image as ImageIcon,
  Video as VideoIcon,
  X,
  Loader2,
  MessageSquare,
  Heart,
  PartyPopper,
  Sparkles,
  Shield,
  Settings2,
  BarChart3,
  Plus,
  MapPin,
  Users,
  FileText,
  Type as TypeIcon,
  Smile,
  Calendar,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentUserAvatar } from '@/hooks/useCurrentUserAvatar';
import { useFeedData, type StudioAudience, type PostBackground } from '@/contexts/FeedDataContext';
import { toast } from '@/hooks/use-toast';
import { useStudioDraft } from '@/hooks/useStudioDraft';
import { useLinkPreview } from '@/hooks/useLinkPreview';
import { TopicTagSelector } from './shared/TopicTagSelector';
import { AudienceSelector } from './shared/AudienceSelector';
import { CrossPostToggles, type CrossPostState } from './shared/CrossPostToggles';
import {
  PollCreator,
  PollData,
  CharacterCounter,
  FeelingActivityPicker,
  FeelingActivity,
  LocationPicker,
  Location,
  ScheduleSelector,
  GifPicker,
  GifData,
  ThreadComposer,
  ThreadItem,
  POST_BACKGROUND_PRESETS,
  CheckInPicker,
  WithPeoplePicker,
  CustomAudienceDialog,
  LifeEventDialog,
  FundraiserDialog,
  ComposerLinkPreview,
  computePollClosesAt,
} from './post';
import type {
  FeedCheckIn,
  FeedTaggedPerson,
  FeedCustomAudience,
  FeedCommentPermission,
  FeedLifeEvent,
  FeedFundraiser,
  FeedPoll,
  FeedLinkPreview,
} from '@/components/feed/CrossroadFeed';
import { cn } from '@/lib/utils';

const MAX_CHARACTERS = 500;

interface PostComposerProps {
  onBack: () => void;
  onSuccess: () => void;
}

type ContentWarningType = 'sensitive' | 'triggering' | 'graphic' | 'other' | null;
type ComposerMode = 'simple' | 'thread';

// ---- Helpers ----------------------------------------------------------------

function deriveTitle(state: ComposerState): string {
  if (state.composerMode === 'thread') {
    const first = state.threadItems.find((t) => t.content.trim().length > 0);
    if (first) return first.content.slice(0, 40);
    return 'Thread';
  }
  if (state.poll) return 'Poll';
  if (state.linkPreview) return 'Link post';
  const c = state.content.trim();
  if (c.length > 0) return c.slice(0, 40);
  return 'Post';
}

async function renderBackgroundToPng(bg: PostBackground, caption: string): Promise<string | undefined> {
  try {
    const W = 720;
    const H = 1280;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (bg.type === 'gradient' && bg.value.startsWith('linear-gradient')) {
      const match = bg.value.match(/linear-gradient\([^,]+,\s*([^)]+\)),\s*([^)]+\))\)/);
      const grad = ctx.createLinearGradient(0, 0, W, H);
      if (match) {
        grad.addColorStop(0, match[1]);
        grad.addColorStop(1, match[2]);
      } else {
        grad.addColorStop(0, '#1f2937');
        grad.addColorStop(1, '#0f172a');
      }
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = bg.value;
    }
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = bg.textColor || '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '600 56px system-ui, -apple-system, sans-serif';
    const lines = wrapLines(ctx, caption || ' ', W - 120);
    const lineHeight = 72;
    const totalH = lines.length * lineHeight;
    let y = H / 2 - totalH / 2 + lineHeight / 2;
    for (const line of lines) {
      ctx.fillText(line, W / 2, y);
      y += lineHeight;
    }

    return await new Promise<string | undefined>((resolve) => {
      canvas.toBlob((blob) => resolve(blob ? URL.createObjectURL(blob) : undefined), 'image/png');
    });
  } catch (e) {
    console.warn('Background→PNG render failed', e);
    return undefined;
  }
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 8);
}

// ---- Composer state shape ---------------------------------------------------

interface ComposerState {
  content: string;
  selectedTags: string[];
  audience: StudioAudience;
  customAudience: FeedCustomAudience;
  contentWarning: boolean;
  contentWarningType: ContentWarningType;
  contentWarningReason: string;
  mediaPreviewUrls: string[];
  mediaTypes: Array<'image' | 'video'>;
  selectedGifUrl: string | null;
  background: PostBackground | null;
  composerMode: ComposerMode;
  threadItems: ThreadItem[];
  poll: PollData | null;
  feeling: FeelingActivity | null;
  location: Location | null;
  scheduledDate: number | null;
  checkIn: FeedCheckIn | null;
  taggedPeople: FeedTaggedPerson[];
  commentPermission: FeedCommentPermission;
  reactionsDisabled: boolean;
  lifeEvent: FeedLifeEvent | null;
  fundraiser: FeedFundraiser | null;
  linkPreview: FeedLinkPreview | null;
  crossPost: CrossPostState;
}

const DEFAULT_STATE: ComposerState = {
  content: '',
  selectedTags: [],
  audience: 'public',
  customAudience: { include: [], exclude: [] },
  contentWarning: false,
  contentWarningType: null,
  contentWarningReason: '',
  mediaPreviewUrls: [],
  mediaTypes: [],
  selectedGifUrl: null,
  background: null,
  composerMode: 'simple',
  threadItems: [{ id: 'thread-1', content: '' }],
  poll: null,
  feeling: null,
  location: null,
  scheduledDate: null,
  checkIn: null,
  taggedPeople: [],
  commentPermission: 'everyone',
  reactionsDisabled: false,
  lifeEvent: null,
  fundraiser: null,
  linkPreview: null,
  crossPost: { alsoShareAsExpression: false, alsoShareAsPost: false },
};

// ---- Component --------------------------------------------------------------

export function PostComposer({ onBack, onSuccess }: PostComposerProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { avatarUrl, displayName: avatarDisplayName } = useCurrentUserAvatar();
  const { createPost, createExpression, schedulePublish, getDraft } = useFeedData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [state, setState] = useState<ComposerState>(DEFAULT_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [composerFocused, setComposerFocused] = useState(false);
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [lifeEventOpen, setLifeEventOpen] = useState(false);
  const [fundraiserOpen, setFundraiserOpen] = useState(false);
  const [topicsOpen, setTopicsOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [mediaSheetOpen, setMediaSheetOpen] = useState(false);
  const [showTopicsError, setShowTopicsError] = useState(false);
  const [dismissedUrls, setDismissedUrls] = useState<Set<string>>(new Set());
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // ---- Resume from draft ----
  const draftIdParam = searchParams.get('draftId') || undefined;
  useEffect(() => {
    if (!draftIdParam) return;
    const draft = getDraft(draftIdParam);
    if (!draft || draft.kind !== 'post') return;
    const data = draft.data as Partial<ComposerState>;
    setState((prev) => ({ ...prev, ...DEFAULT_STATE, ...data }));
  }, [draftIdParam, getDraft]);

  // ---- Link preview ----
  const { preview, loading: previewLoading, clear: clearPreview } = useLinkPreview(state.content);
  const previewUrl = preview?.url;
  const showLinkPreview = !!preview && !!previewUrl && !dismissedUrls.has(previewUrl);

  useEffect(() => {
    if (showLinkPreview && preview) {
      setState((s) =>
        s.linkPreview?.url === preview.url
          ? s
          : { ...s, linkPreview: { url: preview.url, title: preview.title, description: preview.description, image: preview.image, siteName: preview.siteName } }
      );
    } else if (!showLinkPreview && state.linkPreview) {
      setState((s) => ({ ...s, linkPreview: null }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showLinkPreview, preview?.url]);

  const dismissPreview = () => {
    if (previewUrl) setDismissedUrls((s) => new Set(s).add(previewUrl));
    clearPreview();
  };

  // ---- Derived flags ----
  const hasMedia = state.mediaPreviewUrls.length > 0 || !!state.selectedGifUrl;
  const hasPoll = !!state.poll;
  const hasThread = state.composerMode === 'thread';
  const hasLinkPreview = showLinkPreview;
  const canShowBackground = !hasMedia && !hasPoll && !hasLinkPreview && !hasThread;

  const hasContent =
    state.composerMode === 'thread'
      ? state.threadItems.some((t) => t.content.trim().length > 0)
      : state.content.trim().length > 0 || hasMedia || !!state.poll;
  const canPost = hasContent && state.selectedTags.length > 0;
  const hasUserInput =
    state.content.length > 0 ||
    hasMedia ||
    hasPoll ||
    state.composerMode === 'thread' ||
    state.taggedPeople.length > 0 ||
    !!state.checkIn ||
    !!state.lifeEvent ||
    !!state.fundraiser;

  // ---- Drafts ----
  const draftTitle = useMemo(() => deriveTitle(state), [state]);
  const { discard } = useStudioDraft<Record<string, unknown>>({
    kind: 'post',
    data: state as unknown as Record<string, unknown>,
    title: draftTitle,
    enabled: hasUserInput,
    existingDraftId: draftIdParam,
  });

  const update = <K extends keyof ComposerState>(patch: Pick<ComposerState, K>) =>
    setState((s) => ({ ...s, ...patch }));

  const displayName = avatarDisplayName || user?.email?.split('@')[0] || 'You';
  const userInitial = displayName.charAt(0).toUpperCase();

  const handleMediaSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    const newUrls = files.map((f) => URL.createObjectURL(f)).slice(0, 4);
    const newTypes = files.map((f) => (f.type.startsWith('video') ? 'video' : 'image') as 'image' | 'video');
    update({
      mediaPreviewUrls: [...state.mediaPreviewUrls, ...newUrls].slice(0, 4),
      mediaTypes: [...state.mediaTypes, ...newTypes].slice(0, 4),
      selectedGifUrl: null,
      background: null,
    });
    event.target.value = '';
  };

  const removeMedia = (i: number) =>
    update({
      mediaPreviewUrls: state.mediaPreviewUrls.filter((_, j) => j !== i),
      mediaTypes: state.mediaTypes.filter((_, j) => j !== i),
    });

  const handleGifSelect = (gif: GifData) =>
    update({ selectedGifUrl: gif.url, mediaPreviewUrls: [], mediaTypes: [], background: null });

  const toggleThreadMode = () => {
    if (state.composerMode === 'simple') {
      update({
        composerMode: 'thread',
        threadItems: [{ id: `thread-${Date.now()}`, content: state.content }],
      });
    } else {
      update({
        composerMode: 'simple',
        content: state.threadItems[0]?.content || '',
      });
    }
  };

  const handleAudienceChange = (next: StudioAudience) => {
    update({ audience: next });
    if (next === 'custom') setCustomDialogOpen(true);
  };

  // ---- Build payload ----
  const buildPostPayload = () => {
    let mediaUrl: string | undefined;
    let mediaType: 'image' | 'video' | undefined;
    if (state.selectedGifUrl) {
      mediaUrl = state.selectedGifUrl;
      mediaType = 'image';
    } else if (state.mediaPreviewUrls.length > 0) {
      mediaUrl = state.mediaPreviewUrls[0];
      mediaType = state.mediaTypes[0] || 'image';
    }

    const baseContent =
      state.composerMode === 'thread'
        ? state.threadItems.map((it) => it.content).join('\n\n---\n\n')
        : state.content.trim();

    let enrichedContent = baseContent;
    if (state.feeling) {
      const prefix =
        state.feeling.type === 'feeling'
          ? `${state.feeling.emoji} Feeling ${state.feeling.label}`
          : `${state.feeling.emoji} ${state.feeling.label}`;
      enrichedContent = `${prefix}\n\n${enrichedContent}`;
    }
    if (state.location) {
      enrichedContent = `📍 at ${state.location.name}\n\n${enrichedContent}`;
    }

    const contentType: 'text' | 'image' | 'video' =
      state.composerMode === 'thread'
        ? 'text'
        : mediaType === 'video'
        ? 'video'
        : mediaType === 'image'
        ? 'image'
        : 'text';

    let feedPoll: FeedPoll | undefined;
    if (state.poll) {
      const durationMs = state.poll.durationMs ?? state.poll.durationHours * 3_600_000;
      feedPoll = {
        options: state.poll.options.map((o) => ({ text: o.text, image: o.image })),
        multiSelect: !!state.poll.multiSelect,
        durationMs,
        closesAt: computePollClosesAt(Date.now(), durationMs),
      };
    }

    return {
      authorId: user?.id || `sim-user-${Date.now()}`,
      author: {
        name: displayName,
        handle: displayName.toLowerCase().replace(/\s+/g, ''),
        avatar: '',
        isVerified: false,
        email: user?.email,
      },
      content: enrichedContent,
      tags: state.selectedTags,
      contentType,
      media: mediaUrl && mediaType ? { type: mediaType, url: mediaUrl } : undefined,
      audience: state.audience,
      customAudience: state.audience === 'custom' ? state.customAudience : undefined,
      background: canShowBackground && state.background ? state.background : undefined,
      checkIn: state.checkIn || undefined,
      taggedPeople: state.taggedPeople.length > 0 ? state.taggedPeople : undefined,
      linkPreview: state.linkPreview || undefined,
      commentPermission: state.commentPermission,
      reactionsDisabled: state.reactionsDisabled,
      lifeEvent: state.lifeEvent || undefined,
      fundraiser: state.fundraiser || undefined,
      poll: feedPoll,
      thread:
        state.composerMode === 'thread'
          ? state.threadItems.map((it) => ({
              id: it.id,
              content: it.content,
              mediaUrl: it.mediaUrl,
              mediaType: it.mediaType,
            }))
          : undefined,
    };
  };

  const handleSubmit = async () => {
    if (!canPost) {
      if (state.selectedTags.length === 0) {
        setShowTopicsError(true);
        setTopicsOpen(true);
      }
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = buildPostPayload();

      if (state.scheduledDate && state.scheduledDate > Date.now()) {
        schedulePublish({
          kind: 'post',
          scheduledAt: state.scheduledDate,
          payload: payload as unknown as Record<string, unknown>,
        });
        toast({
          title: 'Scheduled',
          description: `Your post will publish ${new Date(state.scheduledDate).toLocaleString()}.`,
        });
        discard();
        navigate('/feed');
        return;
      }

      createPost(payload);

      if (state.crossPost.alsoShareAsExpression) {
        let mediaUrlForExpr = payload.media?.url;
        let mediaTypeForExpr: 'image' | 'video' = (payload.media?.type as 'image' | 'video') || 'image';
        if (!mediaUrlForExpr && state.background && payload.content) {
          const png = await renderBackgroundToPng(state.background, payload.content);
          if (png) {
            mediaUrlForExpr = png;
            mediaTypeForExpr = 'image';
          }
        }
        if (mediaUrlForExpr) {
          createExpression({
            userId: payload.authorId,
            userName: payload.author.name,
            userAvatar: payload.author.avatar,
            mediaUrl: mediaUrlForExpr,
            mediaType: mediaTypeForExpr,
            caption: payload.content,
            hasUnseenExpression: true,
            mode: 'story',
          });
        }
      }

      discard();
      onSuccess();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: 'Error',
        description: 'Failed to create post. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---- Render ----
  const backgroundStyle = state.background
    ? { background: state.background.value, color: state.background.textColor || '#ffffff' }
    : undefined;

  const utilityActive =
    'border border-transparent bg-gradient-to-r from-fuchsia-500/20 via-violet-500/20 to-teal-400/20 text-foreground';
  const utilityIdle = 'bg-white/[0.04] hover:bg-white/[0.08] text-foreground/80';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex flex-col w-full max-h-[90vh] bg-background"
    >
      {/* Header */}
      <div className="relative">
        <div className="flex items-center justify-between px-3 py-3">
          <button
            onClick={onBack}
            className="p-2 -ml-1 rounded-full hover:bg-white/5 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-foreground/60" />
            <h2 className="text-sm font-semibold gradient-brand-text">
              {state.scheduledDate ? 'Schedule Post' : 'Create Post'}
            </h2>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!canPost || isSubmitting}
              className={cn(
                'h-8 px-4 rounded-full text-xs font-semibold transition-all',
                canPost && !isSubmitting
                  ? 'gradient-brand text-white shadow-md shadow-fuchsia-500/20'
                  : 'bg-white/5 text-foreground/40 hover:bg-white/5'
              )}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : state.scheduledDate ? (
                'Schedule'
              ) : (
                'Post'
              )}
            </Button>
            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-white/5 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        {/* gradient hairline */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-fuchsia-500/40 to-transparent opacity-60" />
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {/* Identity row */}
        <div className="flex items-center gap-3">
          <div className="rounded-full p-[2px] bg-gradient-to-br from-fuchsia-500 via-violet-500 to-teal-400">
            <Avatar className="h-10 w-10 border-2 border-background">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
                {userInitial}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
            <div className="leading-tight">
              <p className="font-semibold text-sm">{displayName}</p>
              <p className="text-[11px] text-foreground/50">@{displayName.toLowerCase()}</p>
            </div>
            <AudienceSelector value={state.audience} onChange={handleAudienceChange} size="sm" />
          </div>
          {state.composerMode === 'simple' && state.content.length > 0 && (
            <CharacterCounter current={state.content.length} max={MAX_CHARACTERS} />
          )}
        </div>

        {/* Composer hero card */}
        <div className="relative">
          {/* Gradient ring on focus or when warning is on */}
          <div
            className={cn(
              'absolute -inset-px rounded-2xl pointer-events-none transition-opacity duration-200',
              composerFocused || state.contentWarning ? 'opacity-100' : 'opacity-0'
            )}
            style={{
              background: state.contentWarning
                ? 'linear-gradient(135deg, hsl(35 95% 55%), hsl(15 90% 55%))'
                : 'linear-gradient(135deg, hsl(310 90% 60%), hsl(265 85% 60%), hsl(180 70% 50%))',
              padding: '1px',
              WebkitMask:
                'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
            }}
          />
          <div className="relative rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-md p-4">
            {state.contentWarning && (
              <div className="mb-3 flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <Input
                  value={state.contentWarningReason}
                  onChange={(e) => update({ contentWarningReason: e.target.value })}
                  placeholder="Reason (optional)"
                  className="h-7 text-xs bg-transparent border-amber-500/30 focus-visible:ring-amber-500/40"
                />
              </div>
            )}

            <AnimatePresence mode="wait">
              {state.composerMode === 'simple' ? (
                <motion.div
                  key="simple"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {state.background ? (
                    <div
                      className="rounded-xl p-6 min-h-[220px] flex items-center justify-center -mx-1"
                      style={backgroundStyle}
                    >
                      <Textarea
                        placeholder={`What's on your mind, ${displayName}?`}
                        value={state.content}
                        onChange={(e) => update({ content: e.target.value })}
                        onFocus={() => setComposerFocused(true)}
                        onBlur={() => setComposerFocused(false)}
                        maxLength={MAX_CHARACTERS}
                        className="resize-none border-0 bg-transparent p-0 text-2xl font-semibold text-center focus-visible:ring-0 placeholder:text-current placeholder:opacity-60"
                        style={{ color: 'inherit' }}
                      />
                    </div>
                  ) : (
                    <Textarea
                      placeholder={`What's on your mind, ${displayName}?`}
                      value={state.content}
                      onChange={(e) => update({ content: e.target.value })}
                      onFocus={() => setComposerFocused(true)}
                      onBlur={() => setComposerFocused(false)}
                      maxLength={MAX_CHARACTERS}
                      className="min-h-[200px] max-h-[50vh] resize-none border-0 bg-transparent p-0 text-base focus-visible:ring-0 placeholder:text-foreground/40"
                    />
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="thread"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <ThreadComposer
                    items={state.threadItems}
                    onItemsChange={(items) => update({ threadItems: items })}
                    maxCharacters={MAX_CHARACTERS}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Selected topic chips + Aa popover footer */}
            <div className="mt-3 flex items-end justify-between gap-2">
              <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
                {state.selectedTags.length === 0 ? (
                  <span className="text-[11px] text-foreground/40">
                    {state.selectedTags.length}/5 topics
                  </span>
                ) : (
                  <span className="text-[11px] text-foreground/50 mr-1 self-center">
                    {state.selectedTags.length}/5
                  </span>
                )}
              </div>

              {canShowBackground && state.composerMode === 'simple' && (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className={cn(
                        'shrink-0 h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold transition',
                        state.background
                          ? 'ring-2 ring-fuchsia-500/60'
                          : 'bg-white/[0.06] hover:bg-white/[0.12] text-foreground/70'
                      )}
                      style={state.background ? backgroundStyle : undefined}
                      aria-label="Background style"
                      title="Background"
                    >
                      Aa
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="end"
                    className="w-auto p-3 bg-background/95 backdrop-blur-md border-white/10"
                  >
                    <div className="grid grid-cols-5 gap-2">
                      <button
                        type="button"
                        onClick={() => update({ background: null })}
                        className={cn(
                          'h-9 w-9 rounded-lg border-2 flex items-center justify-center transition bg-secondary',
                          !state.background ? 'border-fuchsia-500' : 'border-transparent hover:border-foreground/30'
                        )}
                        title="Plain"
                        aria-label="Plain background"
                      >
                        <TypeIcon className="h-4 w-4" />
                      </button>
                      {POST_BACKGROUND_PRESETS.map((preset, i) => {
                        const active = state.background?.value === preset.value;
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => update({ background: preset })}
                            className={cn(
                              'h-9 w-9 rounded-lg border-2 transition',
                              active ? 'border-fuchsia-500' : 'border-transparent hover:border-foreground/30'
                            )}
                            style={{ background: preset.value }}
                            aria-label={`Background ${i + 1}`}
                          />
                        );
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>
        </div>

        {/* Selected topic chips (above utility row, below card) */}
        {state.selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {state.selectedTags.map((tagId) => (
              <span
                key={tagId}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-white/10 text-foreground/90"
              >
                #{tagId.length > 24 ? `${tagId.slice(0, 4)}…` : tagId}
                <button
                  onClick={() =>
                    update({ selectedTags: state.selectedTags.filter((t) => t !== tagId) })
                  }
                  className="hover:text-foreground"
                  aria-label="Remove topic"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Active context chips: feeling, location, check-in, with, life event, fundraiser, schedule */}
        {(state.feeling ||
          state.location ||
          state.checkIn ||
          state.taggedPeople.length > 0 ||
          state.lifeEvent ||
          state.fundraiser ||
          state.scheduledDate) && (
          <div className="flex flex-wrap gap-2">
            {state.feeling && (
              <Chip onRemove={() => update({ feeling: null })}>
                <span>{state.feeling.emoji}</span>
                <span>{state.feeling.label}</span>
              </Chip>
            )}
            {state.location && (
              <Chip onRemove={() => update({ location: null })}>
                <MapPin className="h-3 w-3" />
                {state.location.name}
              </Chip>
            )}
            {state.checkIn && (
              <Chip onRemove={() => update({ checkIn: null })}>
                <MapPin className="h-3 w-3" />
                {state.checkIn.name}
              </Chip>
            )}
            {state.taggedPeople.length > 0 && (
              <Chip onRemove={() => update({ taggedPeople: [] })}>
                <Users className="h-3 w-3" />
                with {state.taggedPeople.length}
              </Chip>
            )}
            {state.lifeEvent && (
              <Chip onRemove={() => update({ lifeEvent: null })}>
                <span>{state.lifeEvent.icon}</span>
                {state.lifeEvent.label}
              </Chip>
            )}
            {state.fundraiser && (
              <Chip onRemove={() => update({ fundraiser: null })}>
                <Sparkles className="h-3 w-3" />
                {state.fundraiser.title}
              </Chip>
            )}
            {state.scheduledDate && (
              <Chip onRemove={() => update({ scheduledDate: null })}>
                <Calendar className="h-3 w-3" />
                {new Date(state.scheduledDate).toLocaleString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Chip>
            )}
          </div>
        )}

        {/* Link preview */}
        {(showLinkPreview || previewLoading) && (
          <ComposerLinkPreview
            preview={preview}
            loading={previewLoading}
            onDismiss={dismissPreview}
          />
        )}

        {/* GIF preview */}
        {state.selectedGifUrl && (
          <div className="relative rounded-xl overflow-hidden bg-secondary">
            <img src={state.selectedGifUrl} alt="" className="w-full max-h-64 object-contain" />
            <button
              onClick={() => update({ selectedGifUrl: null })}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>
        )}

        {/* Media previews */}
        {state.mediaPreviewUrls.length > 0 && (
          <div className={cn('grid gap-2', state.mediaPreviewUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2')}>
            {state.mediaPreviewUrls.map((url, index) => (
              <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-secondary">
                {state.mediaTypes[index] === 'video' ? (
                  <video src={url} className="w-full h-full object-cover" controls={false} />
                ) : (
                  <img src={url} alt="" className="w-full h-full object-cover" />
                )}
                <button
                  onClick={() => removeMedia(index)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Poll (only renders inputs when toggled on; PollCreator handles its own visibility) */}
        {state.poll && (
          <PollCreator poll={state.poll} onPollChange={(p) => update({ poll: p })} />
        )}

        {/* Slim utility row */}
        <div className="flex flex-wrap gap-2">
          <UtilityPill
            icon={<Plus className="h-3.5 w-3.5" />}
            label={`Topics (${state.selectedTags.length}/5)`}
            active={state.selectedTags.length > 0}
            onClick={() => {
              setShowTopicsError(false);
              setTopicsOpen(true);
            }}
            classNameActive={utilityActive}
            classNameIdle={cn(utilityIdle, showTopicsError && 'ring-1 ring-destructive/60')}
          />
          <UtilityPill
            icon={<BarChart3 className="h-3.5 w-3.5" />}
            label="Poll"
            active={hasPoll}
            onClick={() =>
              update({
                poll: hasPoll
                  ? null
                  : { options: [{ text: '' }, { text: '' }], multiSelect: false, durationHours: 24 },
              })
            }
            classNameActive={utilityActive}
            classNameIdle={utilityIdle}
          />
          <UtilityPill
            icon={<Shield className="h-3.5 w-3.5" />}
            label="Warning"
            active={state.contentWarning}
            onClick={() => update({ contentWarning: !state.contentWarning })}
            classNameActive={utilityActive}
            classNameIdle={utilityIdle}
          />
          <UtilityPill
            icon={<Sparkles className="h-3.5 w-3.5 text-fuchsia-400" />}
            label="Expression"
            active={state.crossPost.alsoShareAsExpression}
            onClick={() =>
              update({
                crossPost: {
                  ...state.crossPost,
                  alsoShareAsExpression: !state.crossPost.alsoShareAsExpression,
                },
              })
            }
            classNameActive={utilityActive}
            classNameIdle={utilityIdle}
          />
          <UtilityPill
            icon={<Settings2 className="h-3.5 w-3.5" />}
            label="More"
            active={false}
            onClick={() => setAdvancedOpen(true)}
            classNameActive={utilityActive}
            classNameIdle={utilityIdle}
          />
        </div>

        {showTopicsError && state.selectedTags.length === 0 && (
          <p className="text-xs text-destructive -mt-2">Please select at least one topic.</p>
        )}
        {/* Bottom action bar — in normal flow, separated by hairline */}
        <div className="mt-4 border-t border-white/5 pt-3">
          <div className="flex justify-around py-3">
            <BottomAction
              icon={<Plus className="h-5 w-5" />}
              label="Media"
              onClick={() => setMediaSheetOpen(true)}
            />
            <BottomAction
              icon={<MessageSquare className="h-5 w-5" />}
              label="Thread"
              active={hasThread}
              onClick={toggleThreadMode}
            />
            <CheckInBottomAction
              value={state.checkIn}
              onChange={(v) => update({ checkIn: v })}
            />
            <WithBottomAction
              value={state.taggedPeople}
              onChange={(v) => update({ taggedPeople: v })}
            />
          </div>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleMediaSelect}
        className="hidden"
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={handleMediaSelect}
        className="hidden"
      />

      {/* Media picker sheet */}
      <Sheet open={mediaSheetOpen} onOpenChange={setMediaSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl bg-background/95 backdrop-blur-md border-white/10">
          <SheetHeader className="text-left">
            <SheetTitle>Add media</SheetTitle>
            <SheetDescription>Choose what to attach to your post.</SheetDescription>
          </SheetHeader>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <SheetTile
              icon={<ImageIcon className="h-5 w-5" />}
              label="Photo"
              onClick={() => {
                setMediaSheetOpen(false);
                setTimeout(() => photoInputRef.current?.click(), 100);
              }}
            />
            <SheetTile
              icon={<VideoIcon className="h-5 w-5" />}
              label="Video"
              onClick={() => {
                setMediaSheetOpen(false);
                setTimeout(() => videoInputRef.current?.click(), 100);
              }}
            />
            <div className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-colors">
              <GifPicker onSelect={(g) => { setMediaSheetOpen(false); handleGifSelect(g); }} />
              <span className="text-[11px] text-foreground/70">GIF</span>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/[0.04]">
              <FeelingActivityPicker
                value={state.feeling}
                onChange={(v) => { update({ feeling: v }); setMediaSheetOpen(false); }}
              />
              <span className="text-xs text-foreground/70 sr-only">Feeling</span>
            </div>
            <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/[0.04]">
              <ScheduleSelector
                value={state.scheduledDate ? new Date(state.scheduledDate) : null}
                onChange={(d) => { update({ scheduledDate: d ? d.getTime() : null }); setMediaSheetOpen(false); }}
              />
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button
              onClick={() => { setMediaSheetOpen(false); setLifeEventOpen(true); }}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-sm"
            >
              <PartyPopper className="h-4 w-4" /> Life event
            </button>
            <button
              onClick={() => { setMediaSheetOpen(false); setFundraiserOpen(true); }}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-sm"
            >
              <Sparkles className="h-4 w-4" /> Fundraiser
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Topics sheet */}
      <Sheet open={topicsOpen} onOpenChange={setTopicsOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl bg-background/95 backdrop-blur-md border-white/10 max-h-[85dvh] overflow-y-auto"
        >
          <SheetHeader className="text-left">
            <SheetTitle>Add topics</SheetTitle>
            <SheetDescription>Pick up to 5 topics to help others find your post.</SheetDescription>
          </SheetHeader>
          <div className="mt-4">
            <TopicTagSelector
              selectedTags={state.selectedTags}
              onTagsChange={(tags) => {
                update({ selectedTags: tags });
                if (tags.length > 0) setShowTopicsError(false);
              }}
              maxTags={5}
            />
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              size="sm"
              onClick={() => setTopicsOpen(false)}
              className="gradient-brand text-white rounded-full px-4"
            >
              Done
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Advanced sheet */}
      <Sheet open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl bg-background/95 backdrop-blur-md border-white/10">
          <SheetHeader className="text-left">
            <SheetTitle>Advanced</SheetTitle>
            <SheetDescription>Fine-tune comments, reactions and cross-posting.</SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm">Who can comment</Label>
              <Select
                value={state.commentPermission}
                onValueChange={(v) => update({ commentPermission: v as FeedCommentPermission })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyone">Everyone</SelectItem>
                  <SelectItem value="followers">Followers only</SelectItem>
                  <SelectItem value="nobody">Nobody</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="reactions-off" className="text-sm flex items-center gap-2">
                <Heart className="h-4 w-4 text-muted-foreground" />
                Turn off reactions
              </Label>
              <Switch
                id="reactions-off"
                checked={state.reactionsDisabled}
                onCheckedChange={(v) => update({ reactionsDisabled: v })}
              />
            </div>
            {state.contentWarning && (
              <div className="space-y-1.5">
                <Label className="text-sm">Warning type</Label>
                <Select
                  value={state.contentWarningType || ''}
                  onValueChange={(v) => update({ contentWarningType: v as ContentWarningType })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select warning type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sensitive">Sensitive content</SelectItem>
                    <SelectItem value="triggering">Potentially triggering</SelectItem>
                    <SelectItem value="graphic">Graphic content</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="pt-2 border-t border-white/5">
              <CrossPostToggles
                source="post"
                value={state.crossPost}
                onChange={(v) => update({ crossPost: v })}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Dialogs */}
      <CustomAudienceDialog
        open={customDialogOpen}
        onOpenChange={setCustomDialogOpen}
        value={state.customAudience}
        onSave={(v) => update({ customAudience: v })}
      />
      <LifeEventDialog
        open={lifeEventOpen}
        onOpenChange={setLifeEventOpen}
        value={state.lifeEvent}
        onSave={(v) => update({ lifeEvent: v })}
      />
      <FundraiserDialog
        open={fundraiserOpen}
        onOpenChange={setFundraiserOpen}
        value={state.fundraiser}
        onSave={(v) => update({ fundraiser: v })}
      />
    </motion.div>
  );
}

// ---- Local UI atoms ---------------------------------------------------------

function Chip({
  children,
  onRemove,
}: {
  children: React.ReactNode;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full bg-white/10 text-foreground/90">
      {children}
      <button onClick={onRemove} className="hover:text-foreground" aria-label="Remove">
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

function UtilityPill({
  icon,
  label,
  active,
  onClick,
  classNameActive,
  classNameIdle,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  classNameActive: string;
  classNameIdle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium transition-all',
        active ? classNameActive : classNameIdle
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function SheetTile({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-colors text-foreground/80 hover:text-foreground"
    >
      {icon}
      <span className="text-[11px]">{label}</span>
    </button>
  );
}

function BottomAction({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-lg transition-colors',
        'text-foreground/60 hover:text-foreground',
        active && 'text-foreground'
      )}
    >
      {icon}
      <span className="text-[11px] leading-none">{label}</span>
    </button>
  );
}

/** Wraps the existing CheckInPicker so it visually matches the bottom bar. */
function CheckInBottomAction({
  value,
  onChange,
}: {
  value: FeedCheckIn | null;
  onChange: (v: FeedCheckIn | null) => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-0.5 py-1 [&>button]:!p-0 [&>button]:!h-auto [&>button]:!bg-transparent [&>button]:flex [&>button]:flex-col [&>button]:items-center [&>button]:gap-0.5 [&>button]:text-foreground/70 [&>button:hover]:text-foreground">
      <CheckInPicker value={value} onChange={onChange} />
    </div>
  );
}

function WithBottomAction({
  value,
  onChange,
}: {
  value: FeedTaggedPerson[];
  onChange: (v: FeedTaggedPerson[]) => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-0.5 py-1 [&>button]:!p-0 [&>button]:!h-auto [&>button]:!bg-transparent [&>button]:flex [&>button]:flex-col [&>button]:items-center [&>button]:gap-0.5 [&>button]:text-foreground/70 [&>button:hover]:text-foreground">
      <WithPeoplePicker value={value} onChange={onChange} />
    </div>
  );
}
