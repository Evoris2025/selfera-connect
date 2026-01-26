import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

export interface ImageFilter {
  name: string;
  class: string;
  category: FilterCategory;
}

export type FilterCategory = 'all' | 'vintage' | 'modern' | 'mood' | 'bw';

export const filters: ImageFilter[] = [
  // Original
  { name: 'Original', class: '', category: 'all' },
  
  // Modern
  { name: 'Vivid', class: 'saturate-[1.4] contrast-[1.1]', category: 'modern' },
  { name: 'Crisp', class: 'contrast-[1.15] brightness-[1.02] saturate-[1.1]', category: 'modern' },
  { name: 'Pop', class: 'saturate-[1.5] contrast-[1.2] brightness-[1.05]', category: 'modern' },
  { name: 'Punch', class: 'contrast-[1.25] saturate-[1.3]', category: 'modern' },
  { name: 'Boost', class: 'saturate-[1.2] brightness-[1.08]', category: 'modern' },
  
  // Vintage
  { name: 'Warm', class: 'sepia-[0.3] saturate-[1.2]', category: 'vintage' },
  { name: 'Retro', class: 'sepia-[0.4] contrast-[1.1] brightness-[0.95]', category: 'vintage' },
  { name: 'Faded', class: 'brightness-[1.1] contrast-[0.85] saturate-[0.8]', category: 'vintage' },
  { name: 'Vintage', class: 'sepia-[0.25] contrast-[1.05] saturate-[0.9]', category: 'vintage' },
  { name: 'Film', class: 'sepia-[0.15] contrast-[1.1] saturate-[1.1] brightness-[0.98]', category: 'vintage' },
  { name: 'Analog', class: 'sepia-[0.2] saturate-[0.85] contrast-[1.05]', category: 'vintage' },
  
  // Mood
  { name: 'Cool', class: 'hue-rotate-[15deg] saturate-[0.9]', category: 'mood' },
  { name: 'Midnight', class: 'hue-rotate-[220deg] saturate-[0.7] brightness-[0.9]', category: 'mood' },
  { name: 'Golden', class: 'sepia-[0.35] saturate-[1.3] brightness-[1.05]', category: 'mood' },
  { name: 'Sunset', class: 'sepia-[0.25] saturate-[1.4] hue-rotate-[-10deg]', category: 'mood' },
  { name: 'Dreamy', class: 'brightness-[1.1] contrast-[0.9] saturate-[1.15] blur-[0.3px]', category: 'mood' },
  { name: 'Moody', class: 'contrast-[1.1] brightness-[0.92] saturate-[0.85]', category: 'mood' },
  
  // Black & White
  { name: 'Mono', class: 'grayscale', category: 'bw' },
  { name: 'Noir', class: 'grayscale contrast-[1.3] brightness-[0.95]', category: 'bw' },
  { name: 'Silver', class: 'grayscale contrast-[1.1] brightness-[1.05]', category: 'bw' },
  { name: 'Stark', class: 'grayscale contrast-[1.5]', category: 'bw' },
  { name: 'Soft BW', class: 'grayscale contrast-[0.9] brightness-[1.1]', category: 'bw' },
];

const categoryLabels: Record<FilterCategory, string> = {
  all: 'All',
  vintage: 'Vintage',
  modern: 'Modern',
  mood: 'Mood',
  bw: 'B&W',
};

interface FilterLibraryProps {
  selectedFilter: number;
  filterIntensity: number;
  previewUrl: string;
  onFilterSelect: (index: number) => void;
  onIntensityChange: (intensity: number) => void;
}

export function FilterLibrary({
  selectedFilter,
  filterIntensity,
  previewUrl,
  onFilterSelect,
  onIntensityChange,
}: FilterLibraryProps) {
  const [category, setCategory] = React.useState<FilterCategory>('all');

  const filteredFilters = category === 'all' 
    ? filters 
    : filters.filter(f => f.category === category || f.category === 'all');

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
        {(Object.keys(categoryLabels) as FilterCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap',
              category === cat
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
            )}
          >
            {categoryLabels[cat]}
          </button>
        ))}
      </div>

      {/* Filter Grid */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {filteredFilters.map((filter, index) => {
          const actualIndex = filters.indexOf(filter);
          return (
            <motion.button
              key={filter.name}
              onClick={() => onFilterSelect(actualIndex)}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'flex-shrink-0 flex flex-col items-center gap-1.5'
              )}
            >
              <div
                className={cn(
                  'w-16 h-16 rounded-lg overflow-hidden border-2 transition-all',
                  selectedFilter === actualIndex 
                    ? 'border-primary ring-2 ring-primary/30' 
                    : 'border-transparent hover:border-border'
                )}
              >
                <img
                  src={previewUrl}
                  alt={filter.name}
                  className={cn('w-full h-full object-cover', filter.class)}
                  style={selectedFilter === actualIndex ? { opacity: filterIntensity / 100 } : undefined}
                />
              </div>
              <span className={cn(
                'text-xs',
                selectedFilter === actualIndex ? 'text-primary font-medium' : 'text-muted-foreground'
              )}>
                {filter.name}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Intensity Slider */}
      {selectedFilter > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Filter Intensity</span>
            <span className="text-sm font-medium">{filterIntensity}%</span>
          </div>
          <Slider
            value={[filterIntensity]}
            onValueChange={([v]) => onIntensityChange(v)}
            min={0}
            max={100}
            step={1}
          />
        </motion.div>
      )}
    </div>
  );
}

export function getFilterClass(filterIndex: number, intensity: number = 100): string {
  if (filterIndex === 0 || intensity === 0) return '';
  const filter = filters[filterIndex];
  if (!filter) return '';
  return filter.class;
}

import React from 'react';
