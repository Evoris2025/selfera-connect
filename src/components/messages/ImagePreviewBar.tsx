import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ImagePreviewBarProps {
  preview: string;
  isUploading: boolean;
  uploadProgress: number;
  onRemove: () => void;
}

const springPop = { type: 'spring' as const, stiffness: 600, damping: 12 };

export function ImagePreviewBar({ 
  preview, 
  isUploading, 
  uploadProgress, 
  onRemove 
}: ImagePreviewBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={springPop}
      className="px-4 pb-2"
    >
      <div className="relative inline-block">
        {/* Image preview */}
        <div className={cn(
          "relative rounded-xl overflow-hidden border border-border/50 shadow-sm",
          isUploading && "opacity-80"
        )}>
          <img 
            src={preview} 
            alt="Upload preview" 
            className="h-20 w-auto max-w-[200px] object-cover"
          />
          
          {/* Upload progress overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <div className="w-3/4">
                <Progress value={uploadProgress} className="h-1.5" />
              </div>
            </div>
          )}
        </div>
        
        {/* Remove button */}
        {!isUploading && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={springPop}
            className="absolute -top-2 -right-2"
          >
            <Button
              variant="secondary"
              size="icon"
              onClick={onRemove}
              className="h-6 w-6 rounded-full shadow-md bg-secondary hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
