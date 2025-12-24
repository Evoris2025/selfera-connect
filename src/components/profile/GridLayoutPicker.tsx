import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Grid3X3, LayoutGrid, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GridLayoutStyle } from '@/hooks/useGridLayout';

interface GridLayoutPickerProps {
  isOpen: boolean;
  currentLayout: GridLayoutStyle;
  saving: boolean;
  onSelect: (layout: GridLayoutStyle) => void;
  onClose: () => void;
}

interface LayoutOption {
  id: GridLayoutStyle;
  name: string;
  description: string;
  icon: React.ReactNode;
  preview: React.ReactNode;
}

const UniformPreview = () => (
  <div className="grid grid-cols-3 gap-0.5 w-full aspect-square">
    {[...Array(9)].map((_, i) => (
      <div key={i} className="bg-muted-foreground/30 rounded-[2px]" />
    ))}
  </div>
);

const MasonryPreview = () => (
  <div className="grid grid-cols-3 gap-0.5 w-full aspect-square">
    <div className="bg-muted-foreground/30 rounded-[2px] row-span-2" />
    <div className="bg-muted-foreground/30 rounded-[2px]" />
    <div className="bg-muted-foreground/30 rounded-[2px] row-span-2" />
    <div className="bg-muted-foreground/30 rounded-[2px]" />
    <div className="bg-muted-foreground/30 rounded-[2px]" />
    <div className="bg-muted-foreground/30 rounded-[2px]" />
    <div className="bg-muted-foreground/30 rounded-[2px]" />
  </div>
);

const FeaturedPreview = () => (
  <div className="grid grid-cols-3 gap-0.5 w-full aspect-square">
    <div className="bg-muted-foreground/30 rounded-[2px] col-span-2 row-span-2" />
    <div className="bg-muted-foreground/30 rounded-[2px]" />
    <div className="bg-muted-foreground/30 rounded-[2px]" />
    <div className="bg-muted-foreground/30 rounded-[2px]" />
    <div className="bg-muted-foreground/30 rounded-[2px]" />
    <div className="bg-muted-foreground/30 rounded-[2px]" />
  </div>
);

const LAYOUT_OPTIONS: LayoutOption[] = [
  {
    id: 'uniform',
    name: 'Uniform',
    description: 'Classic equal grid',
    icon: <Grid3X3 className="h-5 w-5" />,
    preview: <UniformPreview />,
  },
  {
    id: 'masonry',
    name: 'Masonry',
    description: 'Pinterest-style flow',
    icon: <LayoutGrid className="h-5 w-5" />,
    preview: <MasonryPreview />,
  },
  {
    id: 'featured',
    name: 'Featured',
    description: 'Highlight best posts',
    icon: <Sparkles className="h-5 w-5" />,
    preview: <FeaturedPreview />,
  },
];

export const GridLayoutPicker = memo(function GridLayoutPicker({
  isOpen,
  currentLayout,
  saving,
  onSelect,
  onClose,
}: GridLayoutPickerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 glass-heavy rounded-t-3xl overflow-hidden"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
            </div>
            
            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-4">
              <h3 className="text-lg font-semibold text-foreground">Grid Layout</h3>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-muted/50 transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            
            {/* Layout Options */}
            <div className="px-5 pb-8 space-y-3">
              {LAYOUT_OPTIONS.map((option) => {
                const isSelected = currentLayout === option.id;
                
                return (
                  <motion.button
                    key={option.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelect(option.id)}
                    disabled={saving}
                    className={cn(
                      'w-full flex items-center gap-4 p-4 rounded-2xl border transition-all',
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-border/50 bg-muted/20 hover:bg-muted/40'
                    )}
                  >
                    {/* Preview */}
                    <div className="w-14 h-14 flex-shrink-0">
                      {option.preview}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        {option.icon}
                        <span className="font-medium text-foreground">{option.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {option.description}
                      </p>
                    </div>
                    
                    {/* Selection indicator */}
                    <div className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center transition-colors',
                      isSelected ? 'bg-primary' : 'border border-border/50'
                    )}>
                      {isSelected && <Check className="h-4 w-4 text-primary-foreground" />}
                    </div>
                  </motion.button>
                );
              })}
            </div>
            
            {/* Safe area padding */}
            <div className="h-safe-area-inset-bottom" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});
