import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface PendingImage {
  id: string;
  file: File;
  preview: string;
}

interface ImagePreviewBarProps {
  images: PendingImage[];
  isUploading: boolean;
  uploadProgress: number;
  onRemove: (id: string) => void;
  onAddMore?: () => void;
  maxImages?: number;
}

const springPop = { type: 'spring' as const, stiffness: 600, damping: 12 };

export function ImagePreviewBar({ 
  images,
  isUploading, 
  uploadProgress, 
  onRemove,
  onAddMore,
  maxImages = 10,
}: ImagePreviewBarProps) {
  const canAddMore = images.length < maxImages && !isUploading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={springPop}
      className="px-4 pb-2"
    >
      {/* Upload progress bar */}
      {isUploading && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-2"
        >
          <div className="flex items-center gap-2">
            <Progress value={uploadProgress} className="h-1.5 flex-1" />
            <span className="text-xs text-muted-foreground">{uploadProgress}%</span>
          </div>
        </motion.div>
      )}

      {/* Image thumbnails */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <AnimatePresence mode="popLayout">
          {images.map((image) => (
            <motion.div
              key={image.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={springPop}
              className="relative shrink-0"
            >
              <div className={cn(
                "relative rounded-xl overflow-hidden border border-border/50 shadow-sm",
                isUploading && "opacity-70"
              )}>
                <img 
                  src={image.preview} 
                  alt="Upload preview" 
                  className="h-16 w-16 object-cover"
                />
              </div>
              
              {/* Remove button */}
              {!isUploading && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={springPop}
                  className="absolute -top-1.5 -right-1.5"
                >
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => onRemove(image.id)}
                    className="h-5 w-5 rounded-full shadow-md bg-secondary hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add more button */}
        {canAddMore && onAddMore && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileTap={{ scale: 0.95 }}
            transition={springPop}
            onClick={onAddMore}
            className={cn(
              "h-16 w-16 shrink-0 rounded-xl border-2 border-dashed border-border/60",
              "flex items-center justify-center text-muted-foreground",
              "hover:border-primary/50 hover:text-primary transition-colors"
            )}
          >
            <Plus className="h-5 w-5" />
          </motion.button>
        )}
      </div>

      {/* Image count */}
      <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
        <span>{images.length} of {maxImages} images</span>
        {images.length > 1 && (
          <span className="text-muted-foreground/70">Swipe to see all</span>
        )}
      </div>
    </motion.div>
  );
}
