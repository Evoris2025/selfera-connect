import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Check } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import type { ImageAdjustments } from './types';
import { EffectPreviewImage } from './EffectPreviewImage';
import { categoryLabels, filters, type ImageFilter, type FilterCategory } from './filterUtils';

export type { ImageFilter, FilterCategory } from './filterUtils';
export { filters } from './filterUtils';

interface EnhancedFilterLibraryProps {
  selectedFilter: number;
  filterIntensity: number;
  previewUrl: string;
  adjustments?: ImageAdjustments;
  onFilterSelect: (index: number) => void;
  onIntensityChange: (intensity: number) => void;
  // Magik AI enhancement props
  onMagikClick?: () => void;
  isMagikLoading?: boolean;
  isMagikSuccess?: boolean;
}

export function EnhancedFilterLibrary({
  selectedFilter,
  filterIntensity,
  previewUrl,
  adjustments,
  onFilterSelect,
  onIntensityChange,
  onMagikClick,
  isMagikLoading = false,
  isMagikSuccess = false,
}: EnhancedFilterLibraryProps) {
  const [category, setCategory] = useState<FilterCategory>('all');

  // Larger thumbnails so the filter effect is clearly visible on the user's image
  const tileClass = 'w-16 h-16';

  const filteredFilters = category === 'all' 
    ? filters 
    : filters.filter(f => f.category === category || f.name === 'Original');

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
        {(Object.keys(categoryLabels) as FilterCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={cn(
              'px-3 py-1.5 rounded-full text-label font-medium transition-colors whitespace-nowrap',
              category === cat
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
            )}
          >
            {categoryLabels[cat]}
          </button>
        ))}
      </div>

      {/* Filter Grid with Accurate Previews */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {/* Magik AI Enhancement Button */}
        {onMagikClick && (
          <motion.button
            onClick={onMagikClick}
            disabled={isMagikLoading}
            whileTap={{ scale: 0.95 }}
            className="flex-shrink-0 flex flex-col items-center gap-1.5"
          >
            <div
              className={cn(
                'relative rounded-xl overflow-hidden border-2 transition-all',
                tileClass,
                'bg-gradient-to-br from-violet-500/20 via-fuchsia-500/20 to-amber-500/20',
                isMagikSuccess
                  ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                  : 'border-violet-500/50 hover:border-violet-500'
              )}
            >
              {/* Shimmer effect during loading */}
              {isMagikLoading && (
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: '200%' }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1.2, 
                    ease: 'linear' 
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                />
              )}
              
              {/* Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {isMagikLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, rotate: -90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: 90 }}
                    >
                      <Loader2 className="h-5 w-5 animate-spin text-violet-400" />
                    </motion.div>
                  ) : isMagikSuccess ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                    >
                      <Check className="h-5 w-5 text-emerald-400" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="sparkles"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.3 }}
                    >
                      <Sparkles className="h-5 w-5 text-violet-400" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            <span className={cn(
              'text-label transition-colors',
              isMagikSuccess ? 'text-emerald-400 font-medium' : 'text-violet-400 font-medium'
            )}>
              {isMagikLoading ? 'Analyzing' : isMagikSuccess ? 'Applied!' : 'Magik'}
            </span>
          </motion.button>
        )}

        {filteredFilters.map((filter) => {
          const actualIndex = filters.indexOf(filter);
          const isSelected = selectedFilter === actualIndex;
          
          return (
            <motion.button
              key={filter.name}
              onClick={() => onFilterSelect(actualIndex)}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0 flex flex-col items-center gap-1.5"
            >
              <div
                className={cn(
                  'relative rounded-xl overflow-hidden border-2 transition-all',
                  tileClass,
                  isSelected 
                    ? 'border-primary ring-2 ring-primary/30' 
                    : 'border-transparent hover:border-border'
                )}
              >
                <EffectPreviewImage
                  src={previewUrl}
                  alt={filter.name}
                  adjustments={adjustments}
                  presetFilterClass={filter.class}
                  presetIntensity={isSelected ? filterIntensity : 100}
                  className="w-full h-full object-cover absolute inset-0"
                  draggable={false}
                />
                
                {/* Selected indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center"
                  >
                    <svg className="w-2.5 h-2.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}
              </div>
              
              <span className={cn(
                'text-label transition-colors',
                isSelected ? 'text-primary font-medium' : 'text-muted-foreground'
              )}>
                {filter.name}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Intensity Slider - Only show for non-original filters */}
      <AnimatePresence>
        {selectedFilter > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-body text-muted-foreground">Filter Intensity</span>
              <span className="text-body font-medium tabular-nums">{filterIntensity}%</span>
            </div>
            <Slider
              value={[filterIntensity]}
              onValueChange={([v]) => onIntensityChange(v)}
              min={0}
              max={100}
              step={1}
              className="[&_[role=slider]]:bg-primary"
            />
            
            {/* Quick presets */}
            <div className="flex gap-2 justify-center">
              {[25, 50, 75, 100].map((preset) => (
                <button
                  key={preset}
                  onClick={() => onIntensityChange(preset)}
                  className={cn(
                    'px-3 py-1 rounded-full text-label transition-colors',
                    filterIntensity === preset
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  )}
                >
                  {preset}%
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function getFilterClass(filterIndex: number, intensity: number = 100): string {
  if (filterIndex === 0 || intensity === 0) return '';
  const filter = filters[filterIndex];
  if (!filter) return '';
  return filter.class;
}
