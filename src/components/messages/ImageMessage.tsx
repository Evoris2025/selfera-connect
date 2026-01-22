import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Expand, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageMessageProps {
  imageUrl: string;
  isOwnMessage: boolean;
  caption?: string;
}

const springPop = { type: 'spring' as const, stiffness: 600, damping: 12 };

export function ImageMessage({ imageUrl, isOwnMessage, caption }: ImageMessageProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `message-image-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <>
      {/* Inline image in chat */}
      <motion.div
        onClick={() => setIsExpanded(true)}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "relative rounded-xl overflow-hidden cursor-pointer group max-w-[260px]",
          "shadow-sm",
          isOwnMessage ? "rounded-br-md" : "rounded-bl-md"
        )}
      >
        {/* Loading skeleton */}
        {!isLoaded && (
          <div className="w-[200px] h-[150px] bg-secondary animate-pulse rounded-xl" />
        )}
        
        <img
          src={imageUrl}
          alt="Shared image"
          onLoad={() => setIsLoaded(true)}
          className={cn(
            "max-w-full h-auto transition-opacity duration-200",
            isLoaded ? "opacity-100" : "opacity-0 absolute"
          )}
        />
        
        {/* Hover overlay */}
        <div className={cn(
          "absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors",
          "flex items-center justify-center opacity-0 group-hover:opacity-100"
        )}>
          <Expand className="h-6 w-6 text-white drop-shadow-md" />
        </div>

        {/* Caption */}
        {caption && (
          <div className={cn(
            "px-3 py-2 text-[15px]",
            isOwnMessage ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
          )}>
            {caption}
          </div>
        )}
      </motion.div>

      {/* Fullscreen viewer */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            onClick={() => setIsExpanded(false)}
          >
            {/* Close button */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={springPop}
              className="absolute top-4 right-4 flex gap-2"
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDownload}
                className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <Download className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(false)}
                className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </motion.div>

            {/* Full image */}
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={springPop}
              src={imageUrl}
              alt="Full size image"
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
