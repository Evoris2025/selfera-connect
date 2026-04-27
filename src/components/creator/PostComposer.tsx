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
  UserPlus,
  Hash,
  Film,
  Maximize2,
  Minimize2,
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
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [mediaSheetOpen, setMediaSheetOpen] = useState(false);
  const [showTopicsError, setShowTopicsError] = useState(false);
  const [dismissedUrls, setDismissedUrls] = useState<Set<string>>(new Set());
  const [textareaExpanded, setTextareaExpanded] = useState(true);
  const [bgSheetOpen, setBgSheetOpen] = useState(false);
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
  // Background tints the textarea region only — media renders on its own neutral surface,
  // so Aa stays available even when media is attached.
  const canShowBackground = !hasPoll && !hasLinkPreview && !hasThread;

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
    });
    event.target.value = '';
  };

  const removeMedia = (i: number) =>
    update({
      mediaPreviewUrls: state.mediaPreviewUrls.filter((_, j) => j !== i),
      mediaTypes: state.mediaTypes.filter((_, j) => j !== i),
    });

  const handleGifSelect = (gif: GifData) =>
    update({ selectedGifUrl: gif.url, mediaPreviewUrls: [], mediaTypes: [] });

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
      className={cn(
        'w-full max-w-[640px] mx-auto flex flex-col bg-white/[0.03] border border-white/[0.06] backdrop-blur-md shadow-2xl overflow-hidden',
        'rounded-none sm:rounded-3xl',
        'flex-1 min-h-0 sm:min-h-0 sm:max-h-[820px]'
      )}
    >
      {/* Header */}
      <div className="relative shrink-0">
        <div className="flex items-center justify-between h-14 px-3">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-white/5 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-base font-bold tracking-tight">
            <span className="font-medium text-white">
              {state.scheduledDate ? 'schedule ' : 'create '}
            </span>
            <span className="bg-gradient-to-r from-fuchsia-500 via-violet-500 to-teal-400 bg-clip-text text-transparent">
              POST.
            </span>
          </h1>
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-white/5 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-fuchsia-500/40 to-transparent opacity-60" />
      </div>

      {/* Body region (hero + textarea + Add row). Sized to content so the
          Post button sits in real whitespace below it. */}
      <div className="shrink-0 flex flex-col">
        <div className="flex flex-col">
      {/* Hero identity block */}
      <div className="shrink-0 flex flex-col items-center text-center gap-3 px-5 pt-6 pb-6">
        <div
          className="rounded-full p-1 shrink-0"
          style={{
            background:
              'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-muted)))',
          }}
        >
          <Avatar className="h-32 w-32 border-2 border-background">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="bg-secondary text-secondary-foreground text-3xl font-semibold">
              {userInitial}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex flex-col items-center min-w-0">
          <h1 className="text-4xl font-bold tracking-tight text-foreground leading-none truncate max-w-full">
            {displayName}
          </h1>
          <p className="text-base text-foreground/55 mt-1">@{displayName.toLowerCase()}</p>
          <div className="mt-2">
            <AudienceSelector value={state.audience} onChange={handleAudienceChange} variant="ghost" />
          </div>
        </div>
      </div>

      {/* Branded gradient hairline transition */}
      <div className="h-px w-full bg-gradient-to-r from-fuchsia-500/40 via-violet-500/40 to-teal-400/40 opacity-60 shrink-0" />

      {/* Textarea region — sits directly on the composer background */}
      <div className="relative shrink-0 flex flex-col px-5 py-4">
        {/* Top-right cluster: expand toggle + character counter */}
        <div className="absolute top-2 right-3 z-10 flex items-center gap-1 pointer-events-none">
          <button
            type="button"
            onClick={() => setTextareaExpanded((v) => !v)}
            title={textareaExpanded ? 'Collapse' : 'Expand'}
            aria-label={textareaExpanded ? 'Collapse textarea' : 'Expand textarea'}
            className="pointer-events-auto w-7 h-7 rounded-md flex items-center justify-center text-foreground/40 hover:text-foreground hover:bg-white/5 transition"
          >
            {textareaExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          <span className="text-xs text-foreground/40">
            {state.content.length}/{MAX_CHARACTERS}
          </span>
        </div>
        <AnimatePresence mode="wait">
          {state.composerMode === 'simple' ? (
            <motion.div
              key="simple"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col min-h-0"
            >
              {state.background ? (
                <div
                  className="rounded-xl p-6 flex-1 min-h-[200px] flex items-center justify-center"
                  style={backgroundStyle}
                >
                  <Textarea
                    placeholder={`What's on your mind, ${displayName}?`}
                    value={state.content}
                    onChange={(e) => update({ content: e.target.value })}
                    onFocus={() => setComposerFocused(true)}
                    onBlur={() => setComposerFocused(false)}
                    maxLength={MAX_CHARACTERS}
                    className="flex-1 min-h-[200px] max-h-none resize-none border-0 bg-transparent p-0 text-2xl font-semibold text-center focus-visible:ring-0 placeholder:text-current placeholder:opacity-60"
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
                  className={cn(
                    'flex-1 resize-none border-0 bg-transparent p-0 text-lg focus-visible:ring-0 placeholder:text-foreground/35',
                    'transition-[min-height,max-height] duration-200',
                    textareaExpanded ? 'min-h-[60vh] max-h-[75vh]' : 'min-h-[160px] max-h-[40vh]'
                  )}
                />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="thread"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 min-h-0"
            >
              <ThreadComposer
                items={state.threadItems}
                onItemsChange={(items) => update({ threadItems: items })}
                maxCharacters={MAX_CHARACTERS}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content-warning reason inline */}
        {state.contentWarning && (
          <div className="mt-3 flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <Input
              value={state.contentWarningReason}
              onChange={(e) => update({ contentWarningReason: e.target.value })}
              placeholder="Reason (optional)"
              className="h-7 text-xs bg-transparent border-amber-500/30 focus-visible:ring-amber-500/40"
            />
          </div>
        )}

        {/* Selected topic chips — only when chosen */}
        {state.selectedTags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {state.selectedTags.map((tagId) => (
              <span
                key={tagId}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-white/[0.08] text-foreground/85"
              >
                #{tagId.length > 24 ? `${tagId.slice(0, 12)}…` : tagId}
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

        {/* Active context chips */}
        {(state.feeling ||
          state.location ||
          state.checkIn ||
          state.taggedPeople.length > 0 ||
          state.lifeEvent ||
          state.fundraiser ||
          state.scheduledDate) && (
          <div className="mt-3 flex flex-wrap gap-2">
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
                <UserPlus className="h-3 w-3" />
                tag {state.taggedPeople.length}
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
          <div className="mt-3">
            <ComposerLinkPreview
              preview={preview}
              loading={previewLoading}
              onDismiss={dismissPreview}
            />
          </div>
        )}

        {/* GIF preview */}
        {state.selectedGifUrl && (
          <div className="relative my-3 mx-auto w-fit max-w-full rounded-2xl overflow-hidden border border-white/10 bg-white/[0.02]">
            <img src={state.selectedGifUrl} alt="" className="max-h-[200px] w-auto h-auto object-contain" />
            <button
              onClick={() => update({ selectedGifUrl: null })}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur flex items-center justify-center text-white/85 hover:bg-black/80 transition-colors"
              aria-label="Remove GIF"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Media previews */}
        {state.mediaPreviewUrls.length > 0 && (
          state.mediaPreviewUrls.length === 1 ? (
            <div className="relative my-3 mx-auto w-fit max-w-full rounded-2xl overflow-hidden border border-white/10 bg-white/[0.02]">
              {state.mediaTypes[0] === 'video' ? (
                <video src={state.mediaPreviewUrls[0]} className="max-h-[200px] w-auto h-auto object-contain block" controls={false} />
              ) : (
                <img src={state.mediaPreviewUrls[0]} alt="" className="max-h-[200px] w-auto h-auto object-contain block" />
              )}
              <button
                onClick={() => removeMedia(0)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur flex items-center justify-center text-white/85 hover:bg-black/80 transition-colors"
                aria-label="Remove media"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="grid gap-2 my-3 grid-cols-2 max-w-[320px] mx-auto">
              {state.mediaPreviewUrls.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-white/[0.02]">
                  {state.mediaTypes[index] === 'video' ? (
                    <video src={url} className="w-full h-full object-cover" controls={false} />
                  ) : (
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  )}
                  <button
                    onClick={() => removeMedia(index)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur flex items-center justify-center text-white/85 hover:bg-black/80 transition-colors"
                    aria-label="Remove media"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )
        )}

        {/* Poll */}
        {state.poll && (
          <div className="mt-3">
            <PollCreator poll={state.poll} onPollChange={(p) => update({ poll: p })} />
          </div>
        )}
      </div>

      {/* Action bar: Add to your post (flex-1) + Feeling / More / Aa button group */}
      <div className="shrink-0 px-4 pt-1 pb-2 flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => setAddSheetOpen(true)}
          className="flex-1 justify-between rounded-2xl h-11 px-4 bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:shadow-[0_0_24px_-8px_rgba(217,70,239,0.4)] transition-all"
        >
          <span className="text-sm font-medium text-foreground/85">Add to your post</span>
          <Plus className="h-4 w-4 text-foreground/60" />
        </Button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMediaSheetOpen(true)}
            title="Feeling"
            aria-label="Feeling"
            className="h-11 w-11 rounded-2xl flex items-center justify-center bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] text-foreground/70 hover:text-foreground transition"
          >
            <Smile className="h-[18px] w-[18px]" />
          </button>
          <button
            type="button"
            onClick={() => setAdvancedOpen(true)}
            title="More"
            aria-label="More"
            className="h-11 w-11 rounded-2xl flex items-center justify-center bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] text-foreground/70 hover:text-foreground transition"
          >
            <Settings2 className="h-[18px] w-[18px]" />
          </button>
          {canShowBackground && state.composerMode === 'simple' && (
            <button
              type="button"
              onClick={() => setBgSheetOpen(true)}
              className={cn(
                'h-11 w-11 rounded-2xl flex items-center justify-center text-sm font-bold transition border',
                state.background
                  ? 'border-fuchsia-500/60 ring-2 ring-fuchsia-500/40'
                  : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] text-foreground/70 hover:text-foreground'
              )}
              style={state.background ? backgroundStyle : undefined}
              aria-label="Background style"
              title="Background"
            >
              Aa
            </button>
          )}
        </div>
      </div>

        </div>
      </div>
      {/* /centered body region */}

      {/* Spacer pushes the Post button into the dead space below. */}
      <div className="flex-1 min-h-0" />

      {/* Post CTA — anchored near the global app navbar with a small breathing gap */}
      <div className="shrink-0 mt-auto flex items-center justify-center px-4 pt-6 pb-4 mb-[72px] lg:mb-0">
        <Button
          onClick={handleSubmit}
          disabled={!canPost || isSubmitting}
          className={cn(
            'w-full h-14 rounded-2xl text-base font-semibold text-primary-foreground transition active:scale-[0.99]',
            canPost && !isSubmitting
              ? 'bg-primary hover:opacity-95'
              : 'bg-white/10 text-white/40 opacity-100 cursor-not-allowed'
          )}
          style={
            canPost && !isSubmitting
              ? { boxShadow: '0 8px 24px -8px hsl(var(--primary) / 0.5)' }
              : undefined
          }
        >
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : state.scheduledDate ? (
            'Schedule'
          ) : (
            'Post'
          )}
        </Button>
      </div>

      {showTopicsError && state.selectedTags.length === 0 && (
        <p className="text-xs text-destructive px-5 pb-2">Please select at least one topic.</p>
      )}

      {/* Background — bottom sheet swatch picker */}
      <Sheet open={bgSheetOpen} onOpenChange={setBgSheetOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl bg-background/95 backdrop-blur-md border-white/10 px-5 pt-3 pb-[calc(env(safe-area-inset-bottom)+24px)]"
        >
          <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mt-2" />
          <div className="text-[11px] text-white/40 uppercase tracking-wide mb-3 mt-4">Background</div>
          <div className="grid grid-cols-5 gap-3">
            <button
              type="button"
              onClick={() => { update({ background: null }); setBgSheetOpen(false); }}
              className={cn(
                'h-14 w-14 rounded-full flex items-center justify-center transition bg-secondary',
                !state.background ? 'ring-2 ring-white' : 'hover:ring-2 hover:ring-white/30'
              )}
              aria-label="Plain background"
            >
              <TypeIcon className="h-5 w-5" />
            </button>
            {POST_BACKGROUND_PRESETS.map((preset, i) => {
              const active = state.background?.value === preset.value;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => { update({ background: preset }); setBgSheetOpen(false); }}
                  className={cn(
                    'h-14 w-14 rounded-full transition',
                    active ? 'ring-2 ring-white' : 'hover:ring-2 hover:ring-white/30'
                  )}
                  style={{ background: preset.value }}
                  aria-label={`Background ${i + 1}`}
                />
              );
            })}
          </div>
        </SheetContent>
      </Sheet>

      {/* Add to your post — bottom sheet with icon-tile grid */}
      <Sheet open={addSheetOpen} onOpenChange={setAddSheetOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl bg-background/95 backdrop-blur-md border-white/10 px-5 pt-1 pb-[calc(env(safe-area-inset-bottom)+32px)] max-h-[80vh] overflow-y-auto [&>button]:hidden"
        >
          <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mt-3 mb-4" />
          <SheetHeader className="text-left mb-1">
            <SheetTitle className="text-lg font-semibold text-white">Add to your post</SheetTitle>
            <SheetDescription className="sr-only">Pick what to add</SheetDescription>
          </SheetHeader>

          {/* Media */}
          <p className="text-[11px] font-medium text-white/40 uppercase tracking-wider px-1 mb-3 mt-3">
            Media
          </p>
          <div className="grid grid-cols-3 gap-3">
            <Tile
              tone="teal"
              icon={<ImageIcon className="h-5 w-5" />}
              label="Photo"
              onClick={() => { setAddSheetOpen(false); photoInputRef.current?.click(); }}
            />
            <Tile
              tone="teal"
              icon={<VideoIcon className="h-5 w-5" />}
              label="Video"
              onClick={() => { setAddSheetOpen(false); videoInputRef.current?.click(); }}
            />
            <TileSlot tone="teal" icon={<Film className="h-5 w-5" />} label="GIF">
              <GifPicker onSelect={(g) => { handleGifSelect(g); setAddSheetOpen(false); }} />
            </TileSlot>
          </div>

          {/* Social */}
          <p className="text-[11px] font-medium text-white/40 uppercase tracking-wider px-1 mb-3 mt-5">
            Social
          </p>
          <div className="grid grid-cols-3 gap-3">
            <Tile
              tone="violet"
              icon={<BarChart3 className="h-5 w-5" />}
              label="Poll"
              active={hasPoll}
              onClick={() => {
                update({
                  poll: hasPoll
                    ? null
                    : { options: [{ text: '' }, { text: '' }], multiSelect: false, durationHours: 24 },
                });
              }}
            />
            <TileSlot
              tone="violet"
              icon={<MapPin className="h-5 w-5" />}
              label="Check in"
              active={!!state.checkIn}
            >
              <CheckInPicker value={state.checkIn} onChange={(v) => update({ checkIn: v })} />
            </TileSlot>
            <TileSlot
              tone="violet"
              icon={<UserPlus className="h-5 w-5" />}
              label="Tag people"
              active={state.taggedPeople.length > 0}
            >
              <WithPeoplePicker value={state.taggedPeople} onChange={(v) => update({ taggedPeople: v })} />
            </TileSlot>
            <Tile
              tone="violet"
              icon={<MessageSquare className="h-5 w-5" />}
              label="Thread"
              active={hasThread}
              onClick={() => { toggleThreadMode(); }}
            />
            <Tile
              tone="violet"
              icon={<Smile className="h-5 w-5" />}
              label="Feeling"
              active={!!state.feeling}
              onClick={() => { setAddSheetOpen(false); setMediaSheetOpen(true); }}
            />
          </div>

          {/* Content */}
          <p className="text-[11px] font-medium text-white/40 uppercase tracking-wider px-1 mb-3 mt-5">
            Content
          </p>
          <div className="grid grid-cols-3 gap-3">
            <Tile
              tone="pink"
              icon={<Hash className="h-5 w-5" />}
              label="Topics"
              active={state.selectedTags.length > 0}
              onClick={() => {
                setAddSheetOpen(false);
                setShowTopicsError(false);
                setTopicsOpen(true);
              }}
            />
            <Tile
              tone="pink"
              icon={<Shield className="h-5 w-5" />}
              label="Content warning"
              active={state.contentWarning}
              onClick={() => update({ contentWarning: !state.contentWarning })}
            />
            <Tile
              tone="pink"
              icon={<Sparkles className="h-5 w-5" />}
              label="Share as Expression"
              active={state.crossPost.alsoShareAsExpression}
              onClick={() =>
                update({
                  crossPost: {
                    ...state.crossPost,
                    alsoShareAsExpression: !state.crossPost.alsoShareAsExpression,
                  },
                })
              }
            />
          </div>

          {/* More — ghost text link, not a tile */}
          <button
            type="button"
            onClick={() => { setAddSheetOpen(false); setAdvancedOpen(true); }}
            className="block w-full text-sm text-white/60 hover:text-white text-center mt-5 py-2 transition-colors"
          >
            More
          </button>
        </SheetContent>
      </Sheet>


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

      {/* Extras sheet (Feeling / Schedule / Life event / Fundraiser) */}
      <Sheet open={mediaSheetOpen} onOpenChange={setMediaSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl bg-background/95 backdrop-blur-md border-white/10">
          <SheetHeader className="text-left">
            <SheetTitle>More</SheetTitle>
            <SheetDescription>Add a feeling, schedule, life event or fundraiser.</SheetDescription>
          </SheetHeader>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/[0.04]">
              <FeelingActivityPicker
                value={state.feeling}
                onChange={(v) => { update({ feeling: v }); setMediaSheetOpen(false); }}
              />
            </div>
            <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/[0.04]">
              <ScheduleSelector
                value={state.scheduledDate ? new Date(state.scheduledDate) : null}
                onChange={(d) => { update({ scheduledDate: d ? d.getTime() : null }); setMediaSheetOpen(false); }}
              />
            </div>
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

      {/* Subtle focus ring on the whole card when textarea is focused */}
      {composerFocused && (
        <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-fuchsia-500/20" />
      )}
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

/**
 * Category tone palette for sheet tiles. Mapped to real SelfERA brand tokens
 * defined in src/index.css:
 *   media  → --informative  (cool informative blue/teal)
 *   social → --gradient-end (brand violet)
 *   content → --gradient-mid (brand magenta/rose)
 *
 * Tiles use an outline-only treatment: shared dark surface, brand-coloured
 * border + matching icon. No filled background tints.
 */
type TileTone = 'teal' | 'violet' | 'pink';

const TILE_TOKEN: Record<TileTone, string> = {
  teal: '--informative',
  violet: '--gradient-end',
  pink: '--gradient-mid',
};

function toneStyle(
  tone: TileTone,
  active?: boolean
): { border: React.CSSProperties; icon: React.CSSProperties; box: React.CSSProperties } {
  const v = TILE_TOKEN[tone];
  return {
    border: { borderColor: `hsl(var(${v}) / ${active ? 0.85 : 0.35})` },
    icon: { color: `hsl(var(${v}))` },
    box: active
      ? { boxShadow: `inset 0 0 12px 0 hsl(var(${v}) / 0.15)` }
      : {},
  };
}

/**
 * Icon-tile button used inside the "Add to your post" bottom sheet.
 * Compact 80px tile, outline-only, brand-tinted border + icon.
 */
function Tile({
  icon,
  label,
  onClick,
  active,
  tone = 'violet',
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  tone?: TileTone;
}) {
  const s = toneStyle(tone, active);
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      style={{ ...s.border, ...s.box }}
      className={cn(
        'group flex flex-col items-center justify-center gap-1.5 h-20 rounded-xl p-2 transition cursor-pointer border bg-white/[0.03] hover:bg-white/[0.05]'
      )}
    >
      <span className="flex items-center justify-center" style={s.icon}>
        {icon}
      </span>
      <span className="text-xs text-white/75 leading-tight text-center line-clamp-1">
        {label}
      </span>
    </button>
  );
}

/**
 * Wraps a picker (which renders its own trigger button) as a Tile.
 */
function TileSlot({
  icon,
  label,
  children,
  active,
  tone = 'violet',
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  active?: boolean;
  tone?: TileTone;
}) {
  const s = toneStyle(tone, active);
  return (
    <div
      style={{ ...s.border, ...s.box }}
      className={cn(
        'relative h-20 rounded-xl border transition bg-white/[0.03] hover:bg-white/[0.05]',
        '[&>button]:!w-full [&>button]:!h-full',
        '[&>button]:!flex [&>button]:!flex-col [&>button]:!items-center [&>button]:!justify-center [&>button]:!gap-1.5',
        '[&>button]:!p-2 [&>button]:!rounded-xl',
        '[&>button]:!bg-transparent [&>button:hover]:!bg-transparent',
        '[&>button]:!border-0 [&>button]:!shadow-none',
        '[&>button]:!text-transparent',
        '[&>button>span]:hidden',
        '[&>button>svg]:hidden'
      )}
    >
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1.5 z-10 p-2">
        <span className="flex items-center justify-center" style={s.icon}>
          {icon}
        </span>
        <span className="text-xs text-white/75 leading-tight text-center line-clamp-1">
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}
