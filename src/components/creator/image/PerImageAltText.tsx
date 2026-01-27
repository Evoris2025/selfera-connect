import { motion } from 'framer-motion';
import { Eye, Info, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { CarouselImage } from './types';

interface PerImageAltTextProps {
  images: CarouselImage[];
  selectedImageIndex: number;
  onImageSelect: (index: number) => void;
  onAltTextChange: (imageId: string, altText: string) => void;
  maxLength?: number;
}

export function PerImageAltText({
  images,
  selectedImageIndex,
  onImageSelect,
  onAltTextChange,
  maxLength = 500,
}: PerImageAltTextProps) {
  const currentImage = images[selectedImageIndex];
  if (!currentImage) return null;

  const remaining = maxLength - (currentImage.altText?.length || 0);
  const isNearLimit = remaining < 50;

  const imagesWithAltText = images.filter(img => img.altText?.trim()).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <label className="text-sm font-medium">Alt Text</label>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Info className="h-3.5 w-3.5" />
          <span>For accessibility</span>
        </div>
      </div>

      {/* Image selector for multi-image posts */}
      {images.length > 1 && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onImageSelect(Math.max(0, selectedImageIndex - 1))}
            disabled={selectedImageIndex === 0}
            className={cn(
              'p-1 rounded-full transition-colors',
              selectedImageIndex === 0 ? 'opacity-30' : 'hover:bg-secondary'
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <div className="flex gap-1 overflow-x-auto flex-1">
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => onImageSelect(i)}
                className={cn(
                  'flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden border-2 transition-all relative',
                  i === selectedImageIndex 
                    ? 'border-primary' 
                    : 'border-transparent hover:border-border'
                )}
              >
                <img src={img.previewUrl} alt="" className="w-full h-full object-cover" />
                {img.altText?.trim() && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                )}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => onImageSelect(Math.min(images.length - 1, selectedImageIndex + 1))}
            disabled={selectedImageIndex === images.length - 1}
            className={cn(
              'p-1 rounded-full transition-colors',
              selectedImageIndex === images.length - 1 ? 'opacity-30' : 'hover:bg-secondary'
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Current image indicator */}
      {images.length > 1 && (
        <p className="text-xs text-muted-foreground">
          Image {selectedImageIndex + 1} of {images.length} • {imagesWithAltText} with alt text
        </p>
      )}

      {/* Alt text input */}
      <Textarea
        placeholder="Describe this image for people who use screen readers..."
        value={currentImage.altText || ''}
        onChange={(e) => onAltTextChange(currentImage.id, e.target.value.slice(0, maxLength))}
        className="min-h-[80px] resize-none text-sm"
      />

      {/* Footer */}
      <div className="flex items-center justify-between text-xs">
        <p className="text-muted-foreground">
          Describe what's in the image so everyone can enjoy it
        </p>
        <span className={cn(
          'tabular-nums',
          isNearLimit ? 'text-destructive' : 'text-muted-foreground'
        )}>
          {remaining}
        </span>
      </div>
    </motion.div>
  );
}
