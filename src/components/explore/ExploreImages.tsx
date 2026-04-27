import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Bookmark } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useInfiniteList } from '@/hooks/useInfiniteList';

interface ImageItem {
  id: string;
  url: string;
  likes: number;
  user: string;
}

const trendingImages: ImageItem[] = [
  { id: 'i1', url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=600&fit=crop', likes: 12400, user: 'drsarah' },
  { id: 'i2', url: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=600&h=600&fit=crop', likes: 8900, user: 'mindful' },
  { id: 'i3', url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&h=600&fit=crop', likes: 15600, user: 'wellness' },
  { id: 'i4', url: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&h=600&fit=crop', likes: 23400, user: 'academy' },
  { id: 'i5', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop', likes: 18700, user: 'jamie' },
  { id: 'i6', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=600&fit=crop', likes: 5600, user: 'support' },
  { id: 'i7', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=600&fit=crop', likes: 4300, user: 'recovery' },
  { id: 'i8', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&h=600&fit=crop', likes: 890, user: 'alex' },
  { id: 'i9', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=600&fit=crop', likes: 1200, user: 'mind' },
];

const popularWeekImages = trendingImages.slice().sort((a, b) => b.likes - a.likes).map((i) => ({ ...i, id: `pw-${i.id}` }));
const communityImages = trendingImages.slice(2, 8).map((i) => ({ ...i, id: `c-${i.id}` }));
const recentImages = trendingImages.slice(0, 6).map((i) => ({ ...i, id: `r-${i.id}` }));

import type { ImagesFilters, SortBy, Format } from './ExploreFilters';

const SORT_TO_DATA: Record<SortBy, ImageItem[]> = {
  'for-you': trendingImages,
  'following': communityImages,
  'trending': trendingImages,
  'most-recent': recentImages,
  'most-liked': popularWeekImages,
};

function applyFormat(items: ImageItem[], fmt: Format): ImageItem[] {
  if (fmt === 'all') return items;
  // Mock partition: even index -> photos, odd index -> illustrations.
  return items.filter((_, i) => (fmt === 'photos' ? i % 2 === 0 : i % 2 === 1));
}

function ImageTile({ image, index, onClick }: { image: ImageItem; index: number; onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: Math.min(index * 0.015, 0.2) }}
      className="relative aspect-square overflow-hidden cursor-pointer group"
      onClick={onClick}
    >
      <img
        src={image.url}
        alt=""
        loading="lazy"
        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
      />
    </motion.div>
  );
}

function ImageViewer({ image, onClose }: { image: ImageItem | null; onClose: () => void }) {
  if (!image) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
        onClick={onClose}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-white hover:bg-white/10 z-10"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>
        <motion.img
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          src={image.url}
          alt=""
          className="max-w-[90vw] max-h-[80vh] object-contain"
          onClick={(e) => e.stopPropagation()}
        />
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
          <Button variant="secondary" size="sm" className="gap-2 rounded-full">
            <Bookmark className="h-4 w-4" />
            Save
          </Button>
          <Button variant="secondary" size="sm" className="gap-2 rounded-full">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export function ExploreImages({
  isLoading = false,
  filters,
  topic = null,
}: {
  isLoading?: boolean;
  filters?: ImagesFilters;
  /** Selected trending topic from ExploreTopicChips. TODO(round-2): wire to data filter. */
  topic?: string | null;
}) {
  const { primary: themePrimary } = useThemeColor();
  const [selected, setSelected] = useState<ImageItem | null>(null);
  const sortBy = filters?.sortBy ?? 'for-you';
  const format = filters?.format ?? 'all';
  const source = applyFormat(SORT_TO_DATA[sortBy] ?? SORT_TO_DATA['for-you'], format);
  const resetKey = `${sortBy}|${filters?.timePeriod ?? 'all-time'}|${format}|${filters?.origin ?? 'all'}|${topic ?? 'none'}`;
  const { items, sentinelRef, isLoadingMore, hasMore } = useInfiniteList({
    source,
    pageSize: 12,
    resetKey,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-1 py-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} shimmer className="aspect-square" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="py-3">
        <div className="grid grid-cols-3 gap-1">
          {items.map((image, index) => (
            <ImageTile
              key={image.__key}
              image={image}
              index={index}
              onClick={() => setSelected(image)}
            />
          ))}
        </div>

        {hasMore && (
          <div ref={sentinelRef} className="flex items-center justify-center py-6">
            {isLoadingMore && (
              <div
                className="h-6 w-6 rounded-full border-2 border-white/30 animate-spin"
                style={{ borderTopColor: themePrimary }}
              />
            )}
          </div>
        )}
      </div>
      <ImageViewer image={selected} onClose={() => setSelected(null)} />
    </>
  );
}
