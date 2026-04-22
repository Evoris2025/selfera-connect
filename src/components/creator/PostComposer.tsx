import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Image as ImageIcon,
  Video as VideoIcon,
  X,
  Loader2,
  MessageSquare,
  MoreHorizontal,
  ChevronDown,
  Heart,
  PartyPopper,
  Sparkles,
  FileText,
  Shield,
  Share2,
  Settings2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useFeedData, type StudioAudience, type PostBackground } from '@/contexts/FeedDataContext';
import { toast } from '@/hooks/use-toast';
import { useStudioDraft } from '@/hooks/useStudioDraft';
import { useLinkPreview } from '@/hooks/useLinkPreview';
import { TopicTagSelector } from './shared/TopicTagSelector';
import { ContentWarningToggle } from './shared/ContentWarningToggle';
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
  BackgroundPicker,
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

/** Render a styled background + caption to a PNG blob URL. Used for
 *  text-only posts that are also fan-out as Expressions. */
async function renderBackgroundToPng(bg: PostBackground, caption: string): Promise<string | undefined> {
  try {
    const W = 720;
    const H = 1280;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    if (bg.type === 'gradient' && bg.value.startsWith('linear-gradient')) {
      // Crude parser: accept "linear-gradient(135deg, hsl(...), hsl(...))"
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

    // Caption
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
  return lines.slice(0, 8); // hard cap
}

// ---- Composer state shape ---------------------------------------------------

interface ComposerState {
  content: string;
  selectedTags: string[];
  audience: StudioAudience;
  customAudience: FeedCustomAudience;
  contentWarning: boolean;
  contentWarningType: ContentWarningType;
  mediaPreviewUrls: string[];
  mediaTypes: Array<'image' | 'video'>;
  selectedGifUrl: string | null;
  background: PostBackground | null;
  composerMode: ComposerMode;
  threadItems: ThreadItem[];
  poll: PollData | null;
  feeling: FeelingActivity | null;
  location: Location | null;
  scheduledDate: number | null; // epoch ms
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
  const { createPost, createExpression, schedulePublish, getDraft } = useFeedData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [state, setState] = useState<ComposerState>(DEFAULT_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [lifeEventOpen, setLifeEventOpen] = useState(false);
  const [fundraiserOpen, setFundraiserOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [dismissedUrls, setDismissedUrls] = useState<Set<string>>(new Set());

  // ---- Resume from draft (?draftId=) ----------------------------------------
  const draftIdParam = searchParams.get('draftId') || undefined;
  useEffect(() => {
    if (!draftIdParam) return;
    const draft = getDraft(draftIdParam);
    if (!draft || draft.kind !== 'post') return;
    const data = draft.data as Partial<ComposerState>;
    setState((prev) => ({ ...prev, ...DEFAULT_STATE, ...data }));
  }, [draftIdParam, getDraft]);

  // ---- Link preview ---------------------------------------------------------
  const { preview, loading: previewLoading, clear: clearPreview } = useLinkPreview(state.content);
  const previewUrl = preview?.url;
  const showLinkPreview = !!preview && !!previewUrl && !dismissedUrls.has(previewUrl);

  // Persist preview onto state.linkPreview so it lands in the payload
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

  // ---- Derived flags --------------------------------------------------------
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

  // ---- Drafts auto-save -----------------------------------------------------
  const draftTitle = useMemo(() => deriveTitle(state), [state]);
  const { discard, persist } = useStudioDraft<Record<string, unknown>>({
    kind: 'post',
    data: state as unknown as Record<string, unknown>,
    title: draftTitle,
    enabled: hasUserInput,
    existingDraftId: draftIdParam,
  });

  // ---- Handlers -------------------------------------------------------------
  const update = <K extends keyof ComposerState>(patch: Pick<ComposerState, K>) =>
    setState((s) => ({ ...s, ...patch }));

  const displayName = user?.email?.split('@')[0] || 'You';
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

  // ---- Build the createPost payload ----------------------------------------
  const buildPostPayload = () => {
    // Primary media (legacy single-media field stays populated for back-compat)
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

    // contentType is constrained by FeedPost (no 'thread' variant). Threads
    // carry their truth on the `thread` array; the legacy field stays 'text'
    // for back-compat with the existing feed renderer.
    const contentType: 'text' | 'image' | 'video' =
      state.composerMode === 'thread'
        ? 'text'
        : mediaType === 'video'
        ? 'video'
        : mediaType === 'image'
        ? 'image'
        : 'text';

    // Poll → FeedPoll (with computed closesAt)
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
      // Phase 4 additive fields
      audience: state.audience,
      customAudience:
        state.audience === 'custom'
          ? state.customAudience
          : undefined,
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
    if (!canPost) return;
    setIsSubmitting(true);
    try {
      const payload = buildPostPayload();

      // Schedule branch
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

      // Immediate publish
      createPost(payload);

      // Cross-post: also share as Expression
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

  // ---- Render ---------------------------------------------------------------
  const backgroundStyle = state.background
    ? { background: state.background.value, color: state.background.textColor || '#ffffff' }
    : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full min-h-dvh bg-background"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="font-semibold">{state.scheduledDate ? 'Schedule Post' : 'Create Post'}</h2>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!canPost || isSubmitting}
            className="gradient-brand text-white"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : state.scheduledDate ? 'Schedule' : 'Post'}
          </Button>
          <button onClick={onBack} className="p-2 hover:bg-secondary transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Author Row */}
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="" alt={displayName} />
            <AvatarFallback className="bg-secondary text-secondary-foreground">{userInitial}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-medium text-sm">{displayName}</p>
            <AudienceSelector value={state.audience} onChange={handleAudienceChange} size="sm" />
          </div>

          {state.composerMode === 'simple' && (
            <CharacterCounter current={state.content.length} max={MAX_CHARACTERS} />
          )}
        </div>

        {/* Active feeling/location chips */}
        {(state.feeling || state.location) && (
          <div className="flex flex-wrap gap-2">
            {state.feeling && <FeelingActivityPicker value={state.feeling} onChange={(v) => update({ feeling: v })} />}
            {state.location && <LocationPicker value={state.location} onChange={(v) => update({ location: v })} />}
          </div>
        )}

        {state.checkIn && (
          <CheckInPicker value={state.checkIn} onChange={(v) => update({ checkIn: v })} />
        )}

        {state.taggedPeople.length > 0 && (
          <WithPeoplePicker value={state.taggedPeople} onChange={(v) => update({ taggedPeople: v })} />
        )}

        {state.scheduledDate && (
          <ScheduleSelector
            value={new Date(state.scheduledDate)}
            onChange={(d) => update({ scheduledDate: d ? d.getTime() : null })}
          />
        )}

        {state.lifeEvent && (
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary border border-border">
            <span className="text-xl">{state.lifeEvent.icon}</span>
            <span className="text-sm font-medium">{state.lifeEvent.label}</span>
            <button onClick={() => update({ lifeEvent: null })} className="ml-1 p-1 rounded hover:bg-background">
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {state.fundraiser && (
          <div className="rounded-xl border border-warning/40 bg-warning/10 p-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold">{state.fundraiser.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Goal: {state.fundraiser.currency} {state.fundraiser.goal.toLocaleString()}
                </p>
              </div>
              <button onClick={() => update({ fundraiser: null })} className="p-1 rounded hover:bg-background">
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}

        {/* Background picker (text-only posts) */}
        {canShowBackground && (
          <BackgroundPicker
            value={state.background}
            onChange={(bg) => update({ background: bg })}
          />
        )}

        {/* Text Input - Simple or Thread mode */}
        <AnimatePresence mode="wait">
          {state.composerMode === 'simple' ? (
            <motion.div key="simple" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {state.background ? (
                <div
                  className="rounded-2xl p-8 min-h-[280px] flex items-center justify-center"
                  style={backgroundStyle}
                >
                  <Textarea
                    placeholder={`What's on your mind, ${displayName}?`}
                    value={state.content}
                    onChange={(e) => update({ content: e.target.value })}
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
                  maxLength={MAX_CHARACTERS}
                  className="min-h-[120px] resize-none border-0 bg-transparent p-0 text-base focus-visible:ring-0 placeholder:text-muted-foreground"
                />
              )}
            </motion.div>
          ) : (
            <motion.div key="thread" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ThreadComposer
                items={state.threadItems}
                onItemsChange={(items) => update({ threadItems: items })}
                maxCharacters={MAX_CHARACTERS}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Link preview */}
        {(showLinkPreview || previewLoading) && (
          <ComposerLinkPreview
            preview={preview}
            loading={previewLoading}
            onDismiss={dismissPreview}
          />
        )}

        {/* GIF Preview */}
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

        {/* Media Previews */}
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

        {/* Poll */}
        <PollCreator poll={state.poll} onPollChange={(p) => update({ poll: p })} />

        {/* Topic Tags */}
        <TopicTagSelector
          selectedTags={state.selectedTags}
          onTagsChange={(tags) => update({ selectedTags: tags })}
        />

        {/* Content Warning */}
        <ContentWarningToggle
          enabled={state.contentWarning}
          onEnabledChange={(v) => update({ contentWarning: v })}
          warningType={state.contentWarningType}
          onWarningTypeChange={(v) => update({ contentWarningType: v })}
        />

        {/* Cross-post toggles */}
        <div className="rounded-xl border border-border bg-secondary/30 p-3">
          <CrossPostToggles
            source="post"
            value={state.crossPost}
            onChange={(v) => update({ crossPost: v })}
          />
        </div>

        {/* Advanced section */}
        <div className="rounded-xl border border-border">
          <button
            onClick={() => setAdvancedOpen((v) => !v)}
            className="w-full flex items-center justify-between p-3 text-sm font-medium"
          >
            <span>Advanced</span>
            {advancedOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {advancedOpen && (
            <div className="px-3 pb-3 space-y-3 border-t border-border pt-3">
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
            </div>
          )}
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-1 px-4 py-2 border-t border-border overflow-x-auto">
        <label className="p-2 rounded-full hover:bg-secondary transition-colors cursor-pointer">
          <ImageIcon className="h-5 w-5 text-primary" />
          <input type="file" accept="image/*" multiple onChange={handleMediaSelect} className="hidden" />
        </label>
        <label className="p-2 rounded-full hover:bg-secondary transition-colors cursor-pointer">
          <VideoIcon className="h-5 w-5 text-primary" />
          <input type="file" accept="video/*" onChange={handleMediaSelect} className="hidden" />
        </label>

        <div className="h-5 w-px bg-border mx-1" />

        <GifPicker onSelect={handleGifSelect} />

        {!state.checkIn && (
          <CheckInPicker value={null} onChange={(v) => update({ checkIn: v })} />
        )}

        {state.taggedPeople.length === 0 && (
          <WithPeoplePicker value={[]} onChange={(v) => update({ taggedPeople: v })} />
        )}

        {!state.location && (
          <LocationPicker value={null} onChange={(v) => update({ location: v })} />
        )}

        {!state.feeling && (
          <FeelingActivityPicker value={null} onChange={(v) => update({ feeling: v })} />
        )}

        {!state.scheduledDate && (
          <ScheduleSelector
            value={null}
            onChange={(d) => update({ scheduledDate: d ? d.getTime() : null })}
          />
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleThreadMode}
          className={cn(
            'gap-2 text-muted-foreground hover:text-foreground',
            state.composerMode === 'thread' && 'text-primary'
          )}
        >
          <MessageSquare className="h-4 w-4" />
          Thread
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
              <MoreHorizontal className="h-4 w-4" />
              More
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setLifeEventOpen(true)}>
              <PartyPopper className="h-4 w-4 mr-2" /> Life event
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFundraiserOpen(true)}>
              <Sparkles className="h-4 w-4 mr-2" /> Fundraiser
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

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
