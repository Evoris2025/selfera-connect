import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Flame, Users, Clock, Heart, X, Share2, Bookmark } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { PullToRefresh } from '@/components/ui/PullToRefresh';
import { ExploreFilters, FilterType, DateRange } from './ExploreFilters';
import { BrandSectionLabel, BrandIcon } from '@/components/brand';
import { useThemeColor } from '@/hooks/useThemeColor';
import { cn } from '@/lib/utils';

// Mock image data
const trendingImages = [
  { id: 'i1', url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=600&fit=crop', likes: 12400, user: 'drsarah' },
  { id: 'i2', url: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=600&h=800&fit=crop', likes: 8900, user: 'mindful' },
  { id: 'i3', url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&h=400&fit=crop', likes: 15600, user: 'wellness' },
];

const popularWeekImages = [
  { id: 'i4', url: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&h=600&fit=crop', likes: 23400, user: 'academy' },
  { id: 'i5', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop', likes: 18700, user: 'jamie' },
];

const communityImages = [
  { id: 'i6', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=600&fit=crop', likes: 5600, user: 'support' },
  { id: 'i7', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=500&fit=crop', likes: 4300, user: 'recovery' },
];

const recentImages = [
  { id: 'i8', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&h=600&fit=crop', likes: 890, user: 'alex' },
  { id: 'i9', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=700&fit=crop', likes: 1200, user: 'mind' },
];

const allImages = [...trendingImages, ...popularWeekImages, ...communityImages, ...recentImages];

function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

interface ImageCardProps {
  image: typeof trendingImages[0];
  index: number;
  onClick: () => void;
}

function ImageCard({ image, index, onClick }: ImageCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03 }}
      className="relative group cursor-pointer overflow-hidden aspect-square border border-white/[0.08] rounded-md"
      onClick={onClick}
    >
      <img
        src={image.url}
        alt=""
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
      <div className="absolute bottom-2 left-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Heart className="h-4 w-4 text-white fill-white" />
        <span className="text-white text-sm font-medium">{formatCount(image.likes)}</span>
      </div>
    </motion.div>
  );
}

function ImageCardSkeleton() {
  return <Skeleton shimmer className="aspect-square" />;
}

interface ImageViewerProps {
  image: typeof trendingImages[0] | null;
  onClose: () => void;
}

function ImageViewer({ image, onClose }: ImageViewerProps) {
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
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-white hover:bg-white/10 z-10"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Image */}
        <motion.img
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          src={image.url}
          alt=""
          className="max-w-[90vw] max-h-[80vh] object-contain"
          onClick={(e) => e.stopPropagation()}
        />

        {/* Actions */}
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

interface ImageSectionProps {
  title: string;
  icon: React.ComponentType<{ className?: string; size?: number | string }>;
  images: typeof trendingImages;
  isLoading?: boolean;
  onImageClick: (image: typeof trendingImages[0]) => void;
}

function ImageSection({ title, icon, images, isLoading, onImageClick }: ImageSectionProps) {
  if (!isLoading && images.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 px-4">
        <BrandIcon icon={icon} size={16} />
        <BrandSectionLabel>{title}</BrandSectionLabel>
      </div>
      <div className="grid grid-cols-3 gap-1 px-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <ImageCardSkeleton key={i} />
          ))
        ) : (
          images.map((image, index) => (
            <ImageCard
              key={image.id}
              image={image}
              index={index}
              onClick={() => onImageClick(image)}
            />
          ))
        )}
      </div>
    </section>
  );
}

interface ExploreImagesProps {
  isLoading?: boolean;
}

export function ExploreImages({ isLoading = false }: ExploreImagesProps) {
  const [selectedImage, setSelectedImage] = useState<typeof trendingImages[0] | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('trending');
  const [dateRange, setDateRange] = useState<DateRange>('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  }, []);

  const loading = isLoading || isRefreshing;

  return (
    <>
      <PullToRefresh onRefresh={handleRefresh} className="h-full">
        <div className="py-4 space-y-6">
          {/* Filter bar */}
          <div className="px-4">
            <ExploreFilters
              activeFilter={activeFilter}
              dateRange={dateRange}
              onFilterChange={setActiveFilter}
              onDateRangeChange={setDateRange}
            />
          </div>

          <ImageSection
            title="Trending visuals"
            icon={<TrendingUp className="h-5 w-5 text-rose-500" />}
            images={trendingImages}
            isLoading={loading}
            onImageClick={setSelectedImage}
          />
          
          <ImageSection
            title="Popular this week"
            icon={<Flame className="h-5 w-5 text-orange-500" />}
            images={popularWeekImages}
            isLoading={loading}
            onImageClick={setSelectedImage}
          />
          
          <ImageSection
            title="From communities you follow"
            icon={<Users className="h-5 w-5 text-emerald-400" />}
            images={communityImages}
            isLoading={loading}
            onImageClick={setSelectedImage}
          />
          
          <ImageSection
            title="Recently added"
            icon={<Clock className="h-5 w-5 text-muted-foreground" />}
            images={recentImages}
            isLoading={loading}
            onImageClick={setSelectedImage}
          />
        </div>
      </PullToRefresh>

      <ImageViewer image={selectedImage} onClose={() => setSelectedImage(null)} />
    </>
  );
}
