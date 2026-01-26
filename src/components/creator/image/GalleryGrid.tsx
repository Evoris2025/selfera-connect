import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Images, Check, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GalleryGridProps {
  onImagesSelect: (files: File[]) => void;
  maxImages?: number;
  selectedCount?: number;
  className?: string;
}

// Mock gallery images for demo
const mockGalleryImages = Array.from({ length: 12 }, (_, i) => ({
  id: `gallery-${i}`,
  thumbnail: `https://images.unsplash.com/photo-${1500000000000 + i * 1000000}?w=200&h=200&fit=crop`,
}));

export function GalleryGrid({
  onImagesSelect,
  maxImages = 20,
  selectedCount = 0,
  className,
}: GalleryGridProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onImagesSelect(files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const availableSlots = maxImages - selectedCount;

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header with multi-select indicator */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Images className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">Gallery</span>
        </div>
        <span className="text-sm text-muted-foreground">
          Select up to {availableSlots} more
        </span>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="grid grid-cols-4 gap-1">
          {/* Camera/File picker tile */}
          <motion.button
            onClick={() => fileInputRef.current?.click()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="aspect-square rounded-lg bg-secondary/80 hover:bg-secondary flex flex-col items-center justify-center gap-1 transition-colors"
          >
            <Camera className="h-6 w-6 text-primary" />
            <span className="text-xs text-muted-foreground">Add</span>
          </motion.button>

          {/* Mock gallery tiles - in production, these would come from device */}
          {mockGalleryImages.map((image, index) => {
            const isSelected = selectedIndices.has(index);
            const selectionOrder = Array.from(selectedIndices).indexOf(index) + 1;

            return (
              <motion.button
                key={image.id}
                onClick={() => {
                  if (isSelected) {
                    setSelectedIndices(prev => {
                      const next = new Set(prev);
                      next.delete(index);
                      return next;
                    });
                  } else if (selectedIndices.size < availableSlots) {
                    setSelectedIndices(prev => new Set([...prev, index]));
                  }
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "relative aspect-square rounded-lg overflow-hidden transition-all",
                  isSelected && "ring-2 ring-primary ring-offset-1 ring-offset-background"
                )}
              >
                <img
                  src={`https://picsum.photos/200?random=${index}`}
                  alt=""
                  className="w-full h-full object-cover"
                />

                {/* Selection indicator */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shadow-md"
                    >
                      {selectionOrder}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Hover overlay */}
                <div className={cn(
                  "absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors",
                  isSelected && "bg-primary/10"
                )} />
              </motion.button>
            );
          })}

          {/* Load more indicator */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="aspect-square rounded-lg bg-muted/50 flex flex-col items-center justify-center gap-1 transition-colors hover:bg-muted"
          >
            <Plus className="h-5 w-5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">More</span>
          </motion.button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Selection footer */}
      <AnimatePresence>
        {selectedIndices.size > 0 && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="p-4 border-t border-border bg-background"
          >
            <button
              onClick={() => {
                // In production, this would convert selected gallery items to files
                fileInputRef.current?.click();
              }}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2"
            >
              <Check className="h-5 w-5" />
              Continue with {selectedIndices.size} photo{selectedIndices.size !== 1 ? 's' : ''}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
