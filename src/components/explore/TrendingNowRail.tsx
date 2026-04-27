import { motion } from 'framer-motion';
import { Flame, Eye, Heart, Play } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BrandIcon } from '@/components/brand';
import type { ExploreTab } from './ExploreFilters';
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
      className="relative w-[112px] aspect-[9/16] flex-shrink-0 overflow-hidden rounded-md bg-secondary group"
    >
      <span className="absolute top-2 left-2 z-10 flex items-center justify-center w-5 h-5 rounded-full bg-black/40 backdrop-blur-sm">
        <BrandIcon icon={Flame} className="w-3 h-3" />
      </span>
      <img src={item.thumbnail} alt="" loading="lazy" className="w-full h-full object-cover" />
      <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />
      <div className="absolute bottom-1.5 left-1.5 right-12 flex items-center gap-1 min-w-0">
        <Avatar className="h-4 w-4 ring-1 ring-white/30 flex-shrink-0">
          <AvatarImage src={item.user.avatar} alt={item.user.handle} />
          <AvatarFallback className="text-[7px] bg-white/[0.08] text-white/70">
            {item.user.handle.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <span className="text-white text-[10px] font-medium truncate">@{item.user.handle}</span>
      </div>
      <span className="absolute bottom-2 right-2 z-10 flex items-center gap-1 text-white/90 text-[10px] font-medium">
        <Eye className="w-2.5 h-2.5" strokeWidth={1.5} />
        {formatCount(item.views)}
      </span>
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
      <div className="relative aspect-video rounded-md overflow-hidden bg-black">
        <span className="absolute top-2 left-2 z-10 flex items-center justify-center w-5 h-5 rounded-full bg-black/40 backdrop-blur-sm">
          <BrandIcon icon={Flame} className="w-3 h-3" />
        </span>
        <img src={item.thumbnail} alt={item.title} loading="lazy" className="w-full h-full object-cover" />
        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 text-[10px] text-white font-medium rounded">
          {item.duration}
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-9 h-9 rounded-full bg-black/60 flex items-center justify-center">
            <Play className="h-4 w-4 text-white" />
          </div>
        </div>
      </div>
      <h3 className="text-white text-[12px] font-medium leading-snug line-clamp-2 mt-1.5">
        {item.title}
      </h3>
      <p className="text-white/45 text-[10px] uppercase tracking-[0.08em] mt-0.5">
        {formatCount(item.views)}
      </p>
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
      className="relative w-[120px] aspect-square flex-shrink-0 overflow-hidden rounded-md bg-secondary group"
    >
      <span className="absolute top-2 left-2 z-10 flex items-center justify-center w-5 h-5 rounded-full bg-black/40 backdrop-blur-sm">
        <BrandIcon icon={Flame} className="w-3 h-3" />
      </span>
      <img src={item.url} alt="" loading="lazy" className="w-full h-full object-cover" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
      <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1">
        <Heart className="h-2.5 w-2.5 text-white" />
        <span className="text-white text-[10px] font-medium tabular-nums">{formatCount(item.likes)}</span>
      </div>
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
      className="relative w-[240px] flex-shrink-0 text-left rounded-md border border-white/[0.08] p-3 hover:border-white/20 transition-colors"
    >
      <span className="absolute top-2 right-2 z-10"><BrandIcon icon={Flame} className="w-3 h-3" /></span>
      <p className="text-white/85 text-[12px] leading-snug line-clamp-3 mb-2">
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
          <span className="text-white/55 text-[10px] truncate">@{item.user.handle}</span>
        </div>
        <div className="flex items-center gap-1 text-white/55 flex-shrink-0">
          <Heart className="h-2.5 w-2.5" />
          <span className="text-[10px] tabular-nums">{formatCount(item.likes)}</span>
        </div>
      </div>
    </motion.button>
  );
}

export function TrendingNowRail({ activeTab }: TrendingNowRailProps) {
  const renderCards = () => {
    switch (activeTab) {
      case 'expressions':
        return trendingExpressions.map((item, i) => (
          <ExpressionCard key={item.id} item={item} index={i} />
        ));
      case 'videos':
        return trendingVideos.map((item, i) => (
          <VideoCard key={item.id} item={item} index={i} />
        ));
      case 'images':
        return trendingImages.map((item, i) => (
          <ImageCard key={item.id} item={item} index={i} />
        ));
      case 'posts':
        return trendingPosts.map((item, i) => (
          <PostCard key={item.id} item={item} index={i} />
        ));
      default:
        return null;
    }
  };

  return (
    <div className="bg-background pt-3 pb-3">
      <div className="px-4 mb-2 flex items-center gap-1.5">
        <BrandIcon icon={Flame} size={12} />
        <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/55">
          TRENDING NOW
        </p>
      </div>
      <div
        role="list"
        aria-label="Trending now"
        className="flex gap-2 overflow-x-auto px-4 scrollbar-hide"
      >
        {renderCards()}
      </div>
    </div>
  );
}
