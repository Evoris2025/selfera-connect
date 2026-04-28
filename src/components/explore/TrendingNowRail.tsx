import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Eye, Heart, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BrandIcon, BrandIconBadge, BrandStatPill } from '@/components/brand';
import { ExploreVerifiedTick } from './ExploreVerifiedTick';
import { cn } from '@/lib/utils';
import type { ExploreTab } from './ExploreFilters';
import type { ExploreFiltersState } from './ExploreFilters';
import {
  applyExpressionsFilters,
  applyVideosFilters,
  applyImagesFilters,
  applyPostsFilters,
} from './exploreFilterUtils';
import {
  trendingExpressions,
  trendingVideos,
  trendingImages,
  trendingPosts,
  type TrendingExpression,
  type TrendingVideo,
  type TrendingImage,
  type TrendingPost,
} from './trendingNowData';

/**
 * TrendingNowRail — horizontal-scrolling, per-tab native-shape rail.
 *
 * Sits between the BrandUnderlineTabs strip and the grid in Explore.tsx.
 * Each tab gets its own card shape:
 *   expressions → 9:16 vertical thumbnails
 *   videos      → 16:9 landscape thumbnails
 *   images      → 1:1 square thumbnails
 *   posts       → text-first cards with snippet + author
 *
 * Tap = stub (console.log) for now.
 */

interface TrendingNowRailProps {
  activeTab: ExploreTab;
  filters?: ExploreFiltersState;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function handleTap(tab: ExploreTab, id: string) {
  // Stub for round-1.5. Wire to viewer/route later.
  // eslint-disable-next-line no-console
  console.log('[TrendingNowRail] tap', { tab, id });
}

function ExpressionCard({ item, index }: { item: TrendingExpression; index: number }) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.18) }}
      onClick={() => handleTap('expressions', item.id)}
      className="relative w-[112px] h-[199px] flex-shrink-0 overflow-hidden rounded-md bg-white/[0.04] group"
    >
      <BrandIconBadge icon={Flame} className="absolute top-2 left-2 z-10" aria-label="Trending" />
      <img src={item.thumbnail} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />
      <span className="absolute bottom-2 left-2 z-10 flex items-center gap-1">
        <img
          src={item.user.avatar}
          alt=""
          loading="lazy"
          className="w-5 h-5 rounded-full object-cover"
        />
        <ExploreVerifiedTick tier={item.user.tier} className="shrink-0" />
      </span>
      <BrandStatPill
        icon={Eye}
        value={formatCount(item.views)}
        className="absolute bottom-2 right-2 z-10"
        aria-label={`${formatCount(item.views)} views`}
      />
    </motion.button>
  );
}

function VideoCard({ item, index }: { item: TrendingVideo; index: number }) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.18) }}
      onClick={() => handleTap('videos', item.id)}
      className="w-[200px] flex-shrink-0 text-left group"
    >
      <div className="relative w-[200px] h-[112px] rounded-md overflow-hidden bg-white/[0.04]">
        <BrandIconBadge icon={Flame} className="absolute top-2 left-2 z-10" aria-label="Trending" />
        <img src={item.thumbnail} alt={item.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute bottom-1 right-1 px-1.5 h-5 inline-flex items-center bg-black/55 border border-white/10 text-[10px] text-white font-medium rounded-md tabular-nums">
          {item.duration}
        </div>
        <BrandIconBadge
          icon={Play}
          size={14}
          className="absolute inset-0 m-auto w-10 h-10 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Play"
        />
      </div>
      <div className="flex flex-col gap-1 mt-2 w-[200px]">
        {/* Row 1+2 — Title (locked to exactly 2 lines reserved) */}
        <p className="text-[12px] font-medium leading-snug line-clamp-2 min-h-[2.1rem] text-white">
          {item.title}
        </p>
        {/* Row 3 — Creator row (avatar + name + tier badge) */}
        <div className="flex items-center gap-1.5 min-w-0">
          <Avatar className="h-4 w-4 shrink-0">
            <AvatarImage src={item.creator.avatar} alt={item.creator.name} />
            <AvatarFallback className="text-[8px]">{item.creator.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-[11px] text-white/70 truncate">{item.creator.name}</span>
          <ExploreVerifiedTick tier={item.creator.tier} className="shrink-0" />
        </div>
        {/* Row 4 — Views row */}
        <p className="text-[10px] uppercase tracking-[0.08em] text-white/45">
          {formatCount(item.views)} VIEWS
        </p>
      </div>
    </motion.button>
  );
}

function ImageCard({ item, index }: { item: TrendingImage; index: number }) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: Math.min(index * 0.03, 0.18) }}
      onClick={() => handleTap('images', item.id)}
      className="relative w-[120px] h-[120px] flex-shrink-0 overflow-hidden rounded-md bg-white/[0.04] group"
    >
      <BrandIconBadge icon={Flame} className="absolute top-2 left-2 z-10" aria-label="Trending" />
      <img src={item.url} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
      <BrandStatPill
        icon={Heart}
        value={formatCount(item.likes)}
        className="absolute bottom-2 left-2 z-10"
        aria-label={`${formatCount(item.likes)} reactions`}
      />
    </motion.button>
  );
}

function PostCard({ item, index }: { item: TrendingPost; index: number }) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.18) }}
      onClick={() => handleTap('posts', item.id)}
      className="relative w-[240px] h-[120px] flex-shrink-0 flex flex-col text-left rounded-md border border-white/[0.08] p-3 hover:border-white/20 transition-colors"
    >
      <BrandIconBadge icon={Flame} className="absolute top-2 right-2 z-10" aria-label="Trending" />
      <p className="text-white/85 text-[12px] leading-snug line-clamp-3 flex-1 pr-7">
        {item.snippet}
      </p>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Avatar className="h-5 w-5 flex-shrink-0">
            <AvatarImage src={item.user.avatar} alt={item.user.handle} />
            <AvatarFallback className="text-[8px] bg-white/[0.08] text-white/70">
              {item.user.handle.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="text-white/55 text-[10px] truncate">{item.user.handle}</span>
          <ExploreVerifiedTick tier={item.user.tier} className="shrink-0" />
        </div>
        <BrandStatPill
          icon={Heart}
          value={formatCount(item.likes)}
          aria-label={`${formatCount(item.likes)} reactions`}
        />
      </div>
    </motion.button>
  );
}
type AnyItem = TrendingExpression | TrendingVideo | TrendingImage | TrendingPost;

const MAX_LOOPS = 5;
const NEAR_EDGE_PX = 200;

function getSeedForTab(tab: ExploreTab): AnyItem[] {
  switch (tab) {
    case 'expressions': return trendingExpressions;
    case 'videos': return trendingVideos;
    case 'images': return trendingImages;
    case 'posts': return trendingPosts;
    default: return [];
  }
}

function remapIds(seed: AnyItem[], loop: number): AnyItem[] {
  return seed.map((it) => ({ ...it, id: `${it.id}-loop${loop}` }) as AnyItem);
}

export function TrendingNowRail({ activeTab }: TrendingNowRailProps) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const loopCountRef = useRef<number>(1);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [state, setState] = useState<{ tab: ExploreTab; items: AnyItem[] }>(() => ({
    tab: activeTab,
    items: getSeedForTab(activeTab),
  }));

  // If activeTab changed since last render, reset synchronously so items
  // never mismatch the card type being rendered.
  if (state.tab !== activeTab) {
    loopCountRef.current = 1;
    setState({ tab: activeTab, items: getSeedForTab(activeTab) });
  }
  const items = state.tab === activeTab ? state.items : getSeedForTab(activeTab);

  // Reset scroll position whenever tab changes.
  useEffect(() => {
    const el = railRef.current;
    if (el) el.scrollLeft = 0;
  }, [activeTab]);

  // Scroll-state listener + near-edge append. Recomputes when items grow.
  useEffect(() => {
    const el = railRef.current;
    if (!el) return;

    const update = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setCanScrollLeft(scrollLeft > 1);
      setCanScrollRight(scrollWidth - clientWidth - scrollLeft > 1);

      // Near right edge → silently append another copy of the seed (capped).
      if (
        scrollWidth - clientWidth - scrollLeft < NEAR_EDGE_PX &&
        loopCountRef.current < MAX_LOOPS
      ) {
        loopCountRef.current += 1;
        const seed = getSeedForTab(activeTab);
        setState((prev) =>
          prev.tab === activeTab
            ? { tab: prev.tab, items: [...prev.items, ...remapIds(seed, loopCountRef.current)] }
            : prev
        );
      }
    };

    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [activeTab, items.length]);

  const scrollByDirection = (dir: 'left' | 'right') => {
    const el = railRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  const renderCards = () => {
    switch (activeTab) {
      case 'expressions':
        return (items as TrendingExpression[]).map((item, i) => (
          <ExpressionCard key={item.id} item={item} index={i} />
        ));
      case 'videos':
        return (items as TrendingVideo[]).map((item, i) => (
          <VideoCard key={item.id} item={item} index={i} />
        ));
      case 'images':
        return (items as TrendingImage[]).map((item, i) => (
          <ImageCard key={item.id} item={item} index={i} />
        ));
      case 'posts':
        return (items as TrendingPost[]).map((item, i) => (
          <PostCard key={item.id} item={item} index={i} />
        ));
      default:
        return null;
    }
  };

  return (
    <div className="bg-background pt-4 pb-6">
      <div className="px-4 mb-2 flex items-center gap-1.5">
        <BrandIcon icon={Flame} size={12} />
        <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/55">
          {`TRENDING ${activeTab.toUpperCase()}`}
        </span>
      </div>
      <div className="group relative">
        <div
          ref={railRef}
          role="list"
          aria-label="Trending now"
          className="flex items-start gap-2 overflow-x-auto px-4 scrollbar-hide"
        >
          {renderCards()}
        </div>

        {/* Left edge fade */}
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent transition-opacity',
            canScrollLeft ? 'opacity-100' : 'opacity-0'
          )}
        />
        {/* Right edge fade */}
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent transition-opacity',
            canScrollRight ? 'opacity-100' : 'opacity-0'
          )}
        />

        {/* Left arrow — visible whenever there is content to scroll back to */}
        <button
          type="button"
          aria-label="Scroll left"
          onClick={() => scrollByDirection('left')}
          className={cn(
            'absolute top-1/2 -translate-y-1/2 z-20 left-2',
            'flex items-center justify-center',
            'w-8 h-8 rounded-full',
            'bg-black/60 backdrop-blur-sm',
            'border border-white/[0.08]',
            'transition-opacity',
            'hover:bg-black/80',
            canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
        >
          <ChevronLeft className="w-4 h-4 text-white" strokeWidth={1.5} />
        </button>

        {/* Right arrow — visible whenever there is more content to the right */}
        <button
          type="button"
          aria-label="Scroll right"
          onClick={() => scrollByDirection('right')}
          className={cn(
            'absolute top-1/2 -translate-y-1/2 z-20 right-2',
            'flex items-center justify-center',
            'w-8 h-8 rounded-full',
            'bg-black/60 backdrop-blur-sm',
            'border border-white/[0.08]',
            'transition-opacity',
            'hover:bg-black/80',
            canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
        >
          <ChevronRight className="w-4 h-4 text-white" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
