import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Images, Plus, X, Check, Upload, Monitor, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CarouselImage } from './types';
import { createCarouselImage } from './types';

interface GalleryFirstSelectorProps {
  images: CarouselImage[];
  onImagesChange: (images: CarouselImage[]) => void;
  onProceed: () => void;
  maxImages?: number;
}

// Detect if user is on desktop (for instruction text)
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  
  useEffect(() => {
    // Check for mouse/pointer capability
    const hasPointer = window.matchMedia('(pointer: fine)').matches;
    const isLargeScreen = window.innerWidth >= 768;
    setIsDesktop(hasPointer && isLargeScreen);
  }, []);
  
  return isDesktop;
}

export function GalleryFirstSelector({
  images,
  onImagesChange,
  onProceed,
  maxImages = 20,
}: GalleryFirstSelectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isDesktop = useIsDesktop();

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsLoading(true);

    // Calculate available slots
    const availableSlots = maxImages - images.length;
    const filesToAdd = files.slice(0, availableSlots);

    // Create carousel images immediately with preview URLs
    const newImages = filesToAdd.map(file => createCarouselImage(file));
    
    onImagesChange([...images, ...newImages]);
    setIsLoading(false);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [images, maxImages, onImagesChange]);

  const handleRemove = useCallback((index: number) => {
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(images[index].previewUrl);
    onImagesChange(images.filter((_, i) => i !== index));
  }, [images, onImagesChange]);

  const availableSlots = maxImages - images.length;
  const canProceed = images.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Main Preview Area */}
      <div className="flex-1 flex flex-col">
        {images.length === 0 ? (
          /* Empty State - Enhanced Multi-Select UX */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-square max-w-[320px] rounded-2xl border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-4 text-muted-foreground hover:text-foreground group"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Images className="h-10 w-10 text-primary" />
              </div>
              
              <div className="text-center space-y-1">
                <span className="text-base font-semibold text-foreground block">Select from Gallery</span>
                <span className="text-sm text-muted-foreground block">Select up to {maxImages} photos</span>
              </div>


              {/* Selection counter badge (shows 0 initially for affordance) */}
              <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-secondary text-xs font-medium">
                0 selected
              </div>
            </button>
          </motion.div>
        ) : (
          /* Selected Images Grid */
          <div className="flex-1 overflow-y-auto p-4">
            {/* Large Preview of First Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-black/50"
            >
              <img
                src={images[0].previewUrl}
                alt="Cover preview"
                className="w-full h-full object-contain"
              />
              <div className="absolute bottom-3 left-3 px-2 py-1 rounded-full bg-background/80 backdrop-blur-sm text-xs font-medium">
                Cover Photo
              </div>
            </motion.div>

            {/* Thumbnail Grid */}
            <div className="grid grid-cols-4 gap-2">
              {images.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative aspect-square"
                >
                  <div className={cn(
                    'w-full h-full rounded-lg overflow-hidden border-2',
                    index === 0 ? 'border-primary' : 'border-transparent'
                  )}>
                    <img
                      src={image.previewUrl}
                      alt={`Selected ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Index Badge */}
                  <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-background/80 flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                  
                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(index)}
                    className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-md hover:bg-destructive/90 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              ))}

              {/* Add More Button */}
              {availableSlots > 0 && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  <span className="text-[10px]">Add</span>
                </motion.button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <AnimatePresence>
        {images.length > 0 && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="p-4 border-t border-border bg-background"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Images className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {images.length} photo{images.length !== 1 ? 's' : ''} selected
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {availableSlots} more available
              </span>
            </div>
            
            <Button
              onClick={onProceed}
              disabled={!canProceed || isLoading}
              className="w-full"
            >
              <Check className="h-4 w-4 mr-2" />
              Continue to Edit
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State Footer */}
      {images.length === 0 && (
        <div className="p-4 border-t border-border">
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="w-full"
          >
            <Images className="h-4 w-4 mr-2" />
            Select from Gallery
          </Button>
        </div>
      )}
    </div>
  );
}
