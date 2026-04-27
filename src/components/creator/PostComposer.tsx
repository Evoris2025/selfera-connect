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
  ChevronDown,
  Check,
  Film,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  const [addSheetOpen, setAddSheetOpen] = useState(false);
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
      className={cn(
        'w-full max-w-[640px] mx-auto flex flex-col bg-white/[0.03] border border-white/[0.06] backdrop-blur-md shadow-2xl overflow-hidden',
        'rounded-none sm:rounded-3xl',
        'min-h-dvh sm:min-h-0 sm:max-h-[820px]'
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
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-foreground/60" />
            <h2 className="text-sm font-semibold gradient-brand-text">
              {state.scheduledDate ? 'Schedule Post' : 'Create Post'}
            </h2>
          </div>
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

      {/* Centered body region (hero + textarea + Add button) */}
      <div className="flex-1 min-h-0 flex flex-col overflow-y-auto">
        <div className="flex-1 flex flex-col justify-center">
      {/* Hero identity block */}
      <div className="shrink-0 flex flex-col items-center text-center gap-3 px-5 pt-6 pb-6">
        <div className="rounded-full p-1 bg-gradient-to-br from-fuchsia-500 via-violet-500 to-teal-400 shrink-0">
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
      <div className="flex-1 min-h-0 flex flex-col overflow-y-auto px-5 py-4">
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
                  className="flex-1 min-h-[160px] max-h-none resize-none border-0 bg-transparent p-0 text-lg focus-visible:ring-0 placeholder:text-foreground/35"
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
          <div className="relative rounded-xl overflow-hidden bg-secondary mt-3">
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
          <div className={cn('grid gap-2 mt-3', state.mediaPreviewUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2')}>
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

        {/* Poll */}
        {state.poll && (
          <div className="mt-3">
            <PollCreator poll={state.poll} onPollChange={(p) => update({ poll: p })} />
          </div>
        )}
      </div>

      <div className="h-px bg-white/5 shrink-0" />

      {/* Add to your post — single dropdown trigger + Aa picker */}
      <div className="shrink-0 px-5 pt-3 pb-2 flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex-1 justify-between rounded-2xl h-12 px-4 bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:shadow-[0_0_24px_-8px_rgba(217,70,239,0.4)] transition-all"
            >
              <span className="text-sm font-medium text-foreground/85">Add to your post</span>
              <ChevronDown className="h-4 w-4 text-foreground/60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            sideOffset={6}
            className="w-[min(92vw,360px)] bg-background/95 backdrop-blur-md border-white/10 p-1.5"
          >
            {/* Media */}
            <DropdownMenuLabel className="text-[11px] text-foreground/40 uppercase tracking-wide px-3 py-1.5 font-normal">
              Media
            </DropdownMenuLabel>
            <DropdownMenuItem
              onSelect={(e) => { e.preventDefault(); photoInputRef.current?.click(); }}
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-foreground/85 hover:bg-white/5 rounded-lg cursor-pointer"
            >
              <ImageIcon className="h-[18px] w-[18px] text-emerald-400" /> Photo
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e) => { e.preventDefault(); videoInputRef.current?.click(); }}
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-foreground/85 hover:bg-white/5 rounded-lg cursor-pointer"
            >
              <VideoIcon className="h-[18px] w-[18px] text-rose-400" /> Video
            </DropdownMenuItem>
            <MenuRowSlot icon={<Film className="h-[18px] w-[18px] text-violet-400" />} label="GIF">
              <GifPicker onSelect={handleGifSelect} />
            </MenuRowSlot>

            <DropdownMenuSeparator className="my-1 bg-white/5" />

            {/* Social */}
            <DropdownMenuLabel className="text-[11px] text-foreground/40 uppercase tracking-wide px-3 py-1.5 font-normal">
              Social
            </DropdownMenuLabel>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                update({
                  poll: hasPoll
                    ? null
                    : { options: [{ text: '' }, { text: '' }], multiSelect: false, durationHours: 24 },
                });
              }}
              className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm text-foreground/85 hover:bg-white/5 rounded-lg cursor-pointer"
            >
              <span className="flex items-center gap-3">
                <BarChart3 className="h-[18px] w-[18px] text-amber-400" /> Poll
              </span>
              {hasPoll && <Check className="h-4 w-4 text-fuchsia-400" />}
            </DropdownMenuItem>
            <MenuRowSlot
              icon={<MapPin className="h-[18px] w-[18px] text-sky-400" />}
              label="Check in"
              activeIndicator={!!state.checkIn}
            >
              <CheckInPicker value={state.checkIn} onChange={(v) => update({ checkIn: v })} />
            </MenuRowSlot>
            <MenuRowSlot
              icon={<UserPlus className="h-[18px] w-[18px] text-blue-400" />}
              label="Tag people"
              activeIndicator={state.taggedPeople.length > 0}
            >
              <WithPeoplePicker value={state.taggedPeople} onChange={(v) => update({ taggedPeople: v })} />
            </MenuRowSlot>
            <DropdownMenuItem
              onSelect={(e) => { e.preventDefault(); toggleThreadMode(); }}
              className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm text-foreground/85 hover:bg-white/5 rounded-lg cursor-pointer"
            >
              <span className="flex items-center gap-3">
                <MessageSquare className="h-[18px] w-[18px] text-teal-400" /> Thread
              </span>
              {hasThread && <Check className="h-4 w-4 text-fuchsia-400" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e) => { e.preventDefault(); setMediaSheetOpen(true); }}
              className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm text-foreground/85 hover:bg-white/5 rounded-lg cursor-pointer"
            >
              <span className="flex items-center gap-3">
                <Smile className="h-[18px] w-[18px] text-yellow-400" /> Feeling
              </span>
              {state.feeling && <Check className="h-4 w-4 text-fuchsia-400" />}
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1 bg-white/5" />

            {/* Content */}
            <DropdownMenuLabel className="text-[11px] text-foreground/40 uppercase tracking-wide px-3 py-1.5 font-normal">
              Content
            </DropdownMenuLabel>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setShowTopicsError(false);
                setTopicsOpen(true);
              }}
              className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm text-foreground/85 hover:bg-white/5 rounded-lg cursor-pointer"
            >
              <span className="flex items-center gap-3">
                <Hash className="h-[18px] w-[18px] text-fuchsia-400" /> Topics
              </span>
              {state.selectedTags.length > 0 && (
                <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400" />
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                update({ contentWarning: !state.contentWarning });
              }}
              className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm text-foreground/85 hover:bg-white/5 rounded-lg cursor-pointer"
            >
              <span className="flex items-center gap-3">
                <Shield className="h-[18px] w-[18px] text-amber-400" /> Content warning
              </span>
              {state.contentWarning && <Check className="h-4 w-4 text-fuchsia-400" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                update({
                  crossPost: {
                    ...state.crossPost,
                    alsoShareAsExpression: !state.crossPost.alsoShareAsExpression,
                  },
                });
              }}
              className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm text-foreground/85 hover:bg-white/5 rounded-lg cursor-pointer"
            >
              <span className="flex items-center gap-3">
                <Sparkles className="h-[18px] w-[18px] text-violet-400" /> Share as Expression
              </span>
              {state.crossPost.alsoShareAsExpression && <Check className="h-4 w-4 text-fuchsia-400" />}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e) => { e.preventDefault(); setAdvancedOpen(true); }}
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-foreground/85 hover:bg-white/5 rounded-lg cursor-pointer"
            >
              <Settings2 className="h-[18px] w-[18px] text-foreground/60" /> More
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Aa background picker — separate small button */}
        {canShowBackground && state.composerMode === 'simple' && (
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  'shrink-0 h-12 w-12 rounded-2xl flex items-center justify-center text-sm font-bold transition',
                  state.background
                    ? 'ring-2 ring-fuchsia-500/60'
                    : 'bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] text-foreground/70'
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


      {/* Meta row */}
      <div className="shrink-0 border-t border-white/5 px-5 py-3 flex items-center justify-between">
        <CharacterCounter current={state.content.length} max={MAX_CHARACTERS} />
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              update({
                feeling: null,
              });
              setMediaSheetOpen(true);
            }}
            className="text-xs text-foreground/50 hover:text-foreground transition-colors inline-flex items-center gap-1"
          >
            <Smile className="h-3.5 w-3.5" /> Feeling
          </button>
          <button
            onClick={() => setAdvancedOpen(true)}
            className="text-xs text-foreground/50 hover:text-foreground transition-colors inline-flex items-center gap-1"
          >
            <Settings2 className="h-3.5 w-3.5" /> More
          </button>
        </div>
      </div>

      {showTopicsError && state.selectedTags.length === 0 && (
        <p className="text-xs text-destructive px-5 pb-2">Please select at least one topic.</p>
      )}

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

function ToolbarIcon({
  icon,
  label,
  active,
  onClick,
  dot,
  ringError,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
  dot?: boolean;
  ringError?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        'relative w-9 h-9 rounded-full flex items-center justify-center transition-colors',
        active
          ? 'text-fuchsia-300 bg-fuchsia-500/10'
          : 'text-foreground/60 hover:text-foreground hover:bg-white/5',
        ringError && 'ring-1 ring-destructive/60'
      )}
    >
      {icon}
      {dot && (
        <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-fuchsia-400" />
      )}
    </button>
  );
}

/**
 * Wraps a picker component (which renders its own trigger button) so it
 * visually matches the toolbar: 36px circular ghost button, icon-only.
 */
function ToolbarSlot({
  children,
  label,
  active,
}: {
  children: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      title={label}
      aria-label={label}
      className={cn(
        'inline-flex items-center justify-center',
        '[&>button]:!w-9 [&>button]:!h-9 [&>button]:!p-0 [&>button]:!rounded-full',
        '[&>button]:!bg-transparent [&>button:hover]:!bg-white/5',
        '[&>button]:!border-0 [&>button]:!shadow-none [&>button]:!gap-0',
        '[&>button>span]:hidden',
        '[&_svg]:h-5 [&_svg]:w-5',
        active
          ? '[&>button]:!text-fuchsia-300 [&>button]:!bg-fuchsia-500/10'
          : '[&>button]:!text-foreground/60 [&>button:hover]:!text-foreground'
      )}
    >
      {children}
    </div>
  );
}

/**
 * Renders a picker (which has its own trigger button) as a full-width menu row
 * styled like a DropdownMenuItem. Restyles the picker's internal trigger via
 * descendant selectors and overlays our own icon + label.
 */
function MenuRowSlot({
  icon,
  label,
  children,
  activeIndicator,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  activeIndicator?: boolean;
}) {
  return (
    <div
      className={cn(
        'relative w-full',
        '[&>button]:!w-full [&>button]:!h-auto [&>button]:!justify-start',
        '[&>button]:!px-3 [&>button]:!py-2.5 [&>button]:!rounded-lg',
        '[&>button]:!bg-transparent [&>button:hover]:!bg-white/5',
        '[&>button]:!border-0 [&>button]:!shadow-none',
        '[&>button]:!text-sm [&>button]:!font-normal [&>button]:!text-transparent',
        '[&>button>span]:hidden',
        '[&>button>svg]:hidden',
      )}
    >
      <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center gap-3 z-10 text-sm text-foreground/85">
        {icon}
        <span>{label}</span>
      </div>
      {activeIndicator && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 z-10">
          <Check className="h-4 w-4 text-fuchsia-400" />
        </span>
      )}
      {children}
    </div>
  );
}
