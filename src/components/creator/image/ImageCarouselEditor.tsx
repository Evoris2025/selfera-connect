import { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import { X, Plus, GripVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CarouselImage {
  id: string;
  file: File;
  previewUrl: string;
  filter: number;
  brightness: number;
  contrast: number;
  saturation: number;
  warmth: number;
  highlights: number;
  shadows: number;
  vignette: number;
  sharpen: number;
  structure: number;
  fade: number;
  aspectRatio: AspectRatio;
  altText: string;
}

export type AspectRatio = 'original' | 'square' | 'portrait' | 'landscape';

interface ImageCarouselEditorProps {
  images: CarouselImage[];
  selectedIndex: number;
  onImagesChange: (images: CarouselImage[]) => void;
  onSelectImage: (index: number) => void;
  onAddImages: () => void;
  maxImages?: number;
}

export function ImageCarouselEditor({
  images,
  selectedIndex,
  onImagesChange,
  onSelectImage,
  onAddImages,
  maxImages = 20,
}: ImageCarouselEditorProps) {
  const [isReordering, setIsReordering] = useState(false);

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    if (selectedIndex >= newImages.length) {
      onSelectImage(Math.max(0, newImages.length - 1));
    }
  };

  const handleReorder = (newOrder: CarouselImage[]) => {
    onImagesChange(newOrder);
  };

  if (images.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Main Preview with Navigation */}
      <div className="relative">
        <motion.div
          key={selectedIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="aspect-square bg-black/50 rounded-xl overflow-hidden"
        >
          <img
            src={images[selectedIndex]?.previewUrl}
            alt={images[selectedIndex]?.altText || `Image ${selectedIndex + 1}`}
            className="w-full h-full object-contain"
          />
        </motion.div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => onSelectImage(Math.max(0, selectedIndex - 1))}
              disabled={selectedIndex === 0}
              className={cn(
                'absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 backdrop-blur-sm transition-opacity',
                selectedIndex === 0 ? 'opacity-30' : 'opacity-100 hover:bg-background'
              )}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => onSelectImage(Math.min(images.length - 1, selectedIndex + 1))}
              disabled={selectedIndex === images.length - 1}
              className={cn(
                'absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 backdrop-blur-sm transition-opacity',
                selectedIndex === images.length - 1 ? 'opacity-30' : 'opacity-100 hover:bg-background'
              )}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => onSelectImage(i)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  i === selectedIndex 
                    ? 'bg-primary w-4' 
                    : 'bg-foreground/40 hover:bg-foreground/60'
                )}
              />
            ))}
          </div>
        )}

        {/* Image Counter */}
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-background/80 backdrop-blur-sm text-xs font-medium">
          {selectedIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail Strip */}
      <div className="relative">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Reorder.Group
            axis="x"
            values={images}
            onReorder={handleReorder}
            className="flex gap-2"
          >
            {images.map((image, index) => (
              <Reorder.Item
                key={image.id}
                value={image}
                className="relative flex-shrink-0 cursor-grab active:cursor-grabbing"
                whileDrag={{ scale: 1.05, zIndex: 10 }}
              >
                <button
                  onClick={() => onSelectImage(index)}
                  className={cn(
                    'w-16 h-16 rounded-lg overflow-hidden border-2 transition-all',
                    index === selectedIndex 
                      ? 'border-primary ring-2 ring-primary/30' 
                      : 'border-transparent hover:border-border'
                  )}
                >
                  <img
                    src={image.previewUrl}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
                
                {/* Remove Button */}
                {images.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(index);
                    }}
                    className="absolute -top-1 -right-1 p-1 rounded-full bg-destructive text-destructive-foreground shadow-md"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}

                {/* Drag Handle Indicator */}
                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2">
                  <GripVertical className="h-3 w-3 text-foreground/40" />
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>

          {/* Add More Button */}
          {images.length < maxImages && (
            <button
              onClick={onAddImages}
              className="flex-shrink-0 w-16 h-16 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <Plus className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Reorder Instructions */}
      {images.length > 1 && (
        <p className="text-xs text-muted-foreground text-center">
          Drag thumbnails to reorder • Tap to edit
        </p>
      )}
    </div>
  );
}

export function createCarouselImage(file: File): CarouselImage {
  return {
    id: `img-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    file,
    previewUrl: URL.createObjectURL(file),
    filter: 0,
    brightness: 100,
    contrast: 100,
    saturation: 100,
    warmth: 0,
    highlights: 0,
    shadows: 0,
    vignette: 0,
    sharpen: 0,
    structure: 0,
    fade: 0,
    aspectRatio: 'original',
    altText: '',
  };
}
