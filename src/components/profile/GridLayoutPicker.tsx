import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Grid3X3, LayoutPanelTop, Columns, LayoutDashboard, Layers, LayoutGrid } from 'lucide-react';
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

// Uniform: 3x3 equal grid
const UniformPreview = () => (
  <div className="grid grid-cols-3 gap-0.5 w-full aspect-square">
    {[...Array(9)].map((_, i) => (
      <div key={i} className="bg-muted-foreground/30 rounded-[2px]" />
    ))}
  </div>
);

// Mosaic 4: Wide banner on top + 4 squares below
const Mosaic4Preview = () => (
  <div className="grid grid-cols-3 gap-0.5 w-full aspect-square" style={{ gridAutoRows: '1fr' }}>
    <div className="bg-muted-foreground/30 rounded-[2px] col-span-3" />
    <div className="bg-muted-foreground/30 rounded-[2px]" />
    <div className="bg-muted-foreground/30 rounded-[2px]" />
    <div className="bg-muted-foreground/30 rounded-[2px]" />
  </div>
);

// Mosaic 5: Tall left + 4 squares on right
const Mosaic5Preview = () => (
  <div className="grid grid-cols-3 gap-0.5 w-full aspect-square" style={{ gridAutoRows: '1fr' }}>
    <div className="bg-muted-foreground/30 rounded-[2px] row-span-2" />
    <div className="bg-muted-foreground/30 rounded-[2px]" />
    <div className="bg-muted-foreground/30 rounded-[2px]" />
    <div className="bg-muted-foreground/30 rounded-[2px]" />
    <div className="bg-muted-foreground/30 rounded-[2px]" />
  </div>
);

// Mosaic 6: Tall left + 2 wide right stacked
const Mosaic6Preview = () => (
  <div className="grid grid-cols-3 gap-0.5 w-full aspect-square" style={{ gridAutoRows: '1fr' }}>
    <div className="bg-muted-foreground/30 rounded-[2px] row-span-2" />
    <div className="bg-muted-foreground/30 rounded-[2px] col-span-2" />
    <div className="bg-muted-foreground/30 rounded-[2px] col-span-2" />
  </div>
);

// Mosaic 7: Wide banner + large left + 2 squares right
const Mosaic7Preview = () => (
  <div className="grid grid-cols-3 gap-0.5 w-full aspect-square" style={{ gridAutoRows: '1fr' }}>
    <div className="bg-muted-foreground/30 rounded-[2px] col-span-3" />
    <div className="bg-muted-foreground/30 rounded-[2px] col-span-2 row-span-2" />
    <div className="bg-muted-foreground/30 rounded-[2px]" />
    <div className="bg-muted-foreground/30 rounded-[2px]" />
  </div>
);

// Mosaic 8: Complex mixed pattern
const Mosaic8Preview = () => (
  <div className="grid grid-cols-3 gap-0.5 w-full aspect-square" style={{ gridAutoRows: '1fr' }}>
    <div className="bg-muted-foreground/30 rounded-[2px] row-span-2" />
    <div className="bg-muted-foreground/30 rounded-[2px]" />
    <div className="bg-muted-foreground/30 rounded-[2px]" />
    <div className="bg-muted-foreground/30 rounded-[2px] col-span-2" />
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
    id: 'mosaic4',
    name: 'Mosaic 4',
    description: 'Banner spotlight',
    icon: <LayoutPanelTop className="h-5 w-5" />,
    preview: <Mosaic4Preview />,
  },
  {
    id: 'mosaic5',
    name: 'Mosaic 5',
    description: 'Tall focus',
    icon: <Columns className="h-5 w-5" />,
    preview: <Mosaic5Preview />,
  },
  {
    id: 'mosaic6',
    name: 'Mosaic 6',
    description: 'Mixed blocks',
    icon: <LayoutDashboard className="h-5 w-5" />,
    preview: <Mosaic6Preview />,
  },
  {
    id: 'mosaic7',
    name: 'Mosaic 7',
    description: 'Hero feature',
    icon: <Layers className="h-5 w-5" />,
    preview: <Mosaic7Preview />,
  },
  {
    id: 'mosaic8',
    name: 'Mosaic 8',
    description: 'Dynamic grid',
    icon: <LayoutGrid className="h-5 w-5" />,
    preview: <Mosaic8Preview />,
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
            className="fixed bottom-0 left-0 right-0 z-50 glass-heavy rounded-t-3xl overflow-hidden max-h-[70vh] flex flex-col"
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
            
            {/* Layout Options - Scrollable */}
            <div className="px-5 pb-8 space-y-3 overflow-y-auto flex-1">
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
