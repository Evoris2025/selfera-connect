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
    <div className="flex-1 flex flex-col min-h-0">
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
      <div className="flex-1 flex flex-col min-h-0">

        {images.length === 0 ? (
          /* Empty State — mirrors VideoStudio upload UI */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center gap-6 p-8"
          >
            <motion.button
              onClick={() => fileInputRef.current?.click()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-32 h-32 rounded-full gradient-brand flex items-center justify-center shadow-lg"
            >
              <Upload className="h-12 w-12 text-white" />
            </motion.button>
            <span className="text-body text-white/70">Tap to upload photos</span>

            <div className="flex items-center gap-4 w-full max-w-[200px]">
              <div className="h-px flex-1 bg-white/20" />
              <span className="text-label text-white/50">or</span>
              <div className="h-px flex-1 bg-white/20" />
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
            >
              <Upload className="h-5 w-5" />
              <span>Choose from files</span>
            </button>

            <p className="text-label text-white/50 text-center max-w-[240px]">
              Select up to {maxImages} photos.
            </p>
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
              <div className="absolute bottom-3 left-3 px-2 py-1 rounded-full bg-background/80 backdrop-blur-sm text-label font-medium">
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
                  <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-background/80 flex items-center justify-center text-label font-medium">
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
                  <span className="text-caption">Add</span>
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
                <span className="text-body">
                  {images.length} photo{images.length !== 1 ? 's' : ''} selected
                </span>
              </div>
              <span className="text-label text-muted-foreground">
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

    </div>
  );
}
