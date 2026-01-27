import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type UploadStatus = 'idle' | 'preparing' | 'uploading' | 'finalizing' | 'complete' | 'error';

interface ImageUploadStatus {
  id: string;
  previewUrl: string;
  status: 'pending' | 'preparing' | 'uploading' | 'complete' | 'error';
  progress?: number;
  error?: string;
}

interface UploadProgressOverlayProps {
  isOpen: boolean;
  status: UploadStatus;
  images: ImageUploadStatus[];
  currentIndex: number;
  totalImages: number;
  onRetry?: (imageId: string) => void;
  onClose?: () => void;
}

export function UploadProgressOverlay({
  isOpen,
  status,
  images,
  currentIndex,
  totalImages,
  onRetry,
  onClose,
}: UploadProgressOverlayProps) {
  const statusMessages: Record<UploadStatus, string> = {
    idle: '',
    preparing: 'Preparing images...',
    uploading: `Uploading ${currentIndex}/${totalImages}...`,
    finalizing: 'Finalizing post...',
    complete: 'Done!',
    error: 'Upload failed',
  };

  const hasErrors = images.some(img => img.status === 'error');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6"
        >
          <div className="w-full max-w-sm space-y-6">
            {/* Main Status */}
            <div className="text-center space-y-2">
              {status === 'complete' ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center"
                >
                  <Check className="h-8 w-8 text-primary" />
                </motion.div>
              ) : status === 'error' || hasErrors ? (
                <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
              ) : (
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
              )}
              
              <h3 className="font-semibold text-lg">{statusMessages[status]}</h3>
            </div>

            {/* Image Progress Grid */}
            <div className="grid grid-cols-5 gap-2">
              {images.map((img, index) => (
                <div key={img.id} className="relative">
                  <div
                    className={cn(
                      'aspect-square rounded-lg overflow-hidden border-2 transition-all',
                      img.status === 'complete' && 'border-primary',
                      img.status === 'error' && 'border-destructive',
                      img.status === 'uploading' && 'border-primary animate-pulse',
                      (img.status === 'pending' || img.status === 'preparing') && 'border-transparent opacity-50'
                    )}
                  >
                    <img
                      src={img.previewUrl}
                      alt={`Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Status Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      {img.status === 'complete' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                        >
                          <Check className="h-4 w-4 text-primary-foreground" />
                        </motion.div>
                      )}
                      {img.status === 'uploading' && (
                        <Loader2 className="h-5 w-5 text-primary animate-spin" />
                      )}
                      {img.status === 'error' && (
                        <button
                          onClick={() => onRetry?.(img.id)}
                          className="w-6 h-6 rounded-full bg-destructive flex items-center justify-center"
                        >
                          <RefreshCw className="h-3.5 w-3.5 text-destructive-foreground" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Error Actions */}
            {hasErrors && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => images.filter(i => i.status === 'error').forEach(i => onRetry?.(i.id))}
                  className="flex-1"
                >
                  Retry Failed
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
