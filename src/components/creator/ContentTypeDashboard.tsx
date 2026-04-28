import { useMemo, useState } from 'react';
import { ICON_SIZE } from "@/lib/scale";
import { motion } from 'framer-motion';
import {
  Sparkles,
  Video,
  Image as ImageIcon,
  FileText,
  
  ArrowLeft,
  X,
  ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useFeedData } from '@/contexts/FeedDataContext';
import { ContinueWorkingSheet } from './shared/ContinueWorkingSheet';
import { BrandMark } from '@/components/BrandMark';
import { getTodayPrompt } from '@/lib/dailyPrompts';
import { useCreatorRowBackgrounds, type CreatorRowType } from '@/hooks/useCreatorRowBackgrounds';
import { ACCENT, type ContentType } from './shared/contentTypeAccents';

export type { ContentType };

interface ContentTypeCard {
  id: ContentType;
  icon: typeof Sparkles;
  title: string;
  description: string;
}

const contentTypes: ContentTypeCard[] = [
  { id: 'expression', icon: Sparkles, title: 'Expression', description: 'A moment, not a record' },
  { id: 'video', icon: Video, title: 'Video', description: 'Stories worth the time' },
  { id: 'image', icon: ImageIcon, title: 'Photo', description: 'A frame of your world' },
  { id: 'post', icon: FileText, title: 'Post', description: "What's on your mind" },
];

interface ContentTypeDashboardProps {
  onSelect: (type: ContentType) => void;
  onClose: () => void;
}

// Fixed SelfERA brand gradient — used only for the page hero typography.
// Brand gradient is sourced from the canonical .text-gradient-brand utility in src/index.css

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.round(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

// Compact variant for stat-strip cells (e.g. "27m", "3h", "2d")
function relativeTimeShort(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.round(diff / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.round(h / 24);
  return `${d}d`;
}

function CreatorRow({
  icon: Icon,
  title,
  description,
  accentColor,
  activity,
  backgroundUrl,
  onClick,
}: {
  icon: typeof Sparkles;
  title: string;
  description: string;
  accentColor: string;
  activity?: string;
  backgroundUrl: string | null;
  onClick: () => void;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const showPhoto = !!backgroundUrl && !imgFailed;

  // Empty-state gradient — accent at top-left fading to dark base.
  const fallbackGradient = `linear-gradient(135deg, ${accentColor}40 0%, ${accentColor}10 60%, #0a0a0a 100%)`;

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={cn(
        'group relative w-full text-left',
        'h-full min-h-0 rounded-2xl overflow-hidden',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]/40'
      )}
      aria-label={`Create ${title}`}
    >
      {/* Background layer */}
      {showPhoto ? (
        <>
          <img
            src={backgroundUrl!}
            alt=""
            aria-hidden
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="absolute inset-0 w-full h-full object-cover transition-[filter] duration-200"
            style={{ filter: 'brightness(0.5) saturate(0.9)' }}
          />
          {/* Strong horizontal scrim — heaviest at left where text sits */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.75) 40%, rgba(0,0,0,0.35) 100%)',
            }}
          />
        </>
      ) : (
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: fallbackGradient }}
        />
      )}

      {/* Left-edge accent bar */}
      <span
        aria-hidden
        className="absolute left-0 top-0 bottom-0 w-[3px] transition-opacity duration-200 opacity-80 group-hover:opacity-100"
        style={{ background: accentColor }}
      />

      {/* Content layer — horizontal, vertically centered */}
      <div className="relative z-10 flex items-center gap-4 h-full px-5 py-4">
        {/* Free-floating gradient-stroked icon mark */}
        <Icon
          size={36}
          strokeWidth={1.6}
          stroke="url(#selfera-brand-gradient)"
          fill="none"
          aria-hidden
          className="shrink-0"
          style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))' }}
        />

        {/* Content column */}
        <div className="flex-1 min-w-0">
          <h3 className="text-headline font-extrabold tracking-tight text-white leading-none truncate">
            {title.toUpperCase()}
            <span className="text-gradient-brand">.</span>
          </h3>
          <p className="text-caption font-medium tracking-[0.15em] uppercase text-white/55 mt-1.5 truncate">
            {description}
          </p>
        </div>

        {/* Chevron chip */}
        <div className="w-7 h-7 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/10 flex items-center justify-center shrink-0">
          <ChevronRight size={ICON_SIZE.sm} className="text-white/85" />
        </div>
      </div>
    </motion.button>
  );
}

export function ContentTypeDashboard({ onSelect, onClose }: ContentTypeDashboardProps) {
  const navigate = useNavigate();
  const { drafts, scheduled } = useFeedData();
  const backgrounds = useCreatorRowBackgrounds();
  const [sheetOpen, setSheetOpen] = useState(false);

  const draftCount = drafts.length;
  const scheduledCount = scheduled.length;
  const hasWork = draftCount > 0 || scheduledCount > 0;

  // Most-recent draft of any kind for the "continue where you left off" banner
  const latestDraft = useMemo(
    () => (drafts.length ? [...drafts].sort((a, b) => b.updatedAt - a.updatedAt)[0] : null),
    [drafts]
  );

  // Per-tile context lines — only render when we have real data; never fabricate.
  const draftsByKind = useMemo(() => {
    const map: Partial<Record<ContentType, number>> = {};
    for (const d of drafts) {
      // StudioDraft.kind uses 'photo' for the image studio.
      const k: ContentType = d.kind === 'photo' ? 'image' : (d.kind as ContentType);
      map[k] = (map[k] ?? 0) + 1;
    }
    return map;
  }, [drafts]);

  const tileContext = (id: ContentType): string | undefined => {
    const c = draftsByKind[id];
    if (c && c > 0) return `${c} draft${c === 1 ? '' : 's'} waiting`;
    return undefined;
  };

  const todayPrompt = useMemo(() => getTodayPrompt(), []);

  // Map ContentType ('image') -> hook's CreatorRowType ('photo')
  const bgFor = (id: ContentType): string | null => {
    const key: CreatorRowType = id === 'image' ? 'photo' : (id as CreatorRowType);
    return backgrounds[key] ?? null;
  };

  // Slim resume strip content — hidden entirely when no drafts and no scheduled.
  const resumeStrip = useMemo(() => {
    if (!hasWork) return null;
    const metaParts: string[] = [];
    if (draftCount > 0) metaParts.push(`${draftCount} draft${draftCount === 1 ? '' : 's'}`);
    if (scheduledCount > 0) metaParts.push(`${scheduledCount} scheduled`);
    if (latestDraft) metaParts.push(`${relativeTimeShort(latestDraft.updatedAt)} ago`);
    return {
      meta: metaParts.join(' · '),
      ariaLabel: `Continue working: ${metaParts.join(', ')}`,
    };
  }, [hasWork, draftCount, scheduledCount, latestDraft]);

  return (
    <div
      className="flex flex-col bg-background w-full min-h-dvh"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 72px)' }}
    >
      {/* Brand gradient <defs> for icon strokes lives globally in App.tsx (BrandGradientDefs). */}


      <div className="w-full max-w-[640px] mx-auto flex flex-col flex-1">
        {/* Header — back · logo · close */}
        <div className="flex items-center justify-between h-14 px-3 shrink-0">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/5 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <BrandMark className="h-7 w-[120px]" />
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/5 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Page hero */}
        <div className="px-4 pt-4 pb-6 text-center shrink-0">
          <h1 className="text-4xl font-bold tracking-tight leading-tight">
            <span className="font-medium text-white">what will you </span>
            <span className="font-extrabold text-gradient-brand">
              CREATE.
            </span>
          </h1>
          <p className="text-body text-white/55 mt-1.5">choose how you show up today</p>
        </div>

        {/* Slim resume strip — opens the continue WORKING. sheet. Hidden when no work. */}
        {resumeStrip && (
          <div className="px-4 mt-4 mb-3 shrink-0">
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              aria-label={resumeStrip.ariaLabel}
              className={cn(
                'w-full flex items-center gap-3 px-1 h-9',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]/40 rounded-sm',
              )}
            >
              <FileText
                size={16}
                strokeWidth={1.6}
                stroke="url(#selfera-brand-gradient)"
                fill="none"
                aria-hidden
                className="shrink-0"
              />
              <span className="text-label tracking-[0.02em] text-white shrink-0">
                continue WORKING<span className="text-gradient-brand">.</span>
              </span>
              <span aria-hidden className="shrink-0 w-[3px] h-[3px] rounded-full bg-white/30" />
              <span className="flex-1 min-w-0 truncate text-caption uppercase tracking-[0.08em] text-white/50 text-left">
                {resumeStrip.meta}
              </span>
              <ChevronRight size={ICON_SIZE.sm} className="shrink-0 text-white/40" />
            </button>
          </div>
        )}

        {/* Creator rows — fixed tall rows (doubled height) */}
        <div className="grid grid-cols-1 gap-3 px-4 pb-2">
          {contentTypes.map((type) => (
            <div key={type.id} className="h-[170px]">
              <CreatorRow
                icon={type.icon}
                title={type.title}
                description={type.description}
                accentColor={ACCENT[type.id]}
                activity={tileContext(type.id)}
                backgroundUrl={bgFor(type.id)}
                onClick={() => onSelect(type.id)}
              />
            </div>
          ))}
        </div>
      </div>

      <ContinueWorkingSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        todayPrompt={todayPrompt}
      />
    </div>
  );
}
