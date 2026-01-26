import { motion } from 'framer-motion';
import { Square, RectangleVertical, RectangleHorizontal, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AspectRatio } from './ImageCarouselEditor';

interface CropToolProps {
  aspectRatio: AspectRatio;
  onAspectRatioChange: (ratio: AspectRatio) => void;
}

const aspectRatios: { value: AspectRatio; label: string; icon: React.ElementType; ratio: string }[] = [
  { value: 'original', label: 'Original', icon: Maximize2, ratio: 'auto' },
  { value: 'square', label: 'Square', icon: Square, ratio: '1:1' },
  { value: 'portrait', label: 'Portrait', icon: RectangleVertical, ratio: '4:5' },
  { value: 'landscape', label: 'Landscape', icon: RectangleHorizontal, ratio: '16:9' },
];

export function CropTool({ aspectRatio, onAspectRatioChange }: CropToolProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">Aspect Ratio</label>
      <div className="grid grid-cols-4 gap-2">
        {aspectRatios.map(({ value, label, icon: Icon, ratio }) => (
          <motion.button
            key={value}
            onClick={() => onAspectRatioChange(value)}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all',
              aspectRatio === value
                ? 'bg-primary/10 border-primary text-primary'
                : 'bg-secondary/50 border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground'
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs font-medium">{label}</span>
            <span className="text-[10px] opacity-60">{ratio}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export function getAspectRatioClass(ratio: AspectRatio): string {
  switch (ratio) {
    case 'square':
      return 'aspect-square';
    case 'portrait':
      return 'aspect-[4/5]';
    case 'landscape':
      return 'aspect-video';
    default:
      return '';
  }
}
