import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageMessageProps {
  imageUrls: string[];
  isOwnMessage: boolean;
  caption?: string;
}

const springPop = { type: 'spring' as const, stiffness: 600, damping: 12 };

export function ImageMessage({ imageUrls, isOwnMessage, caption }: ImageMessageProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  const handleImageLoad = (index: number) => {
    setLoadedImages(prev => new Set([...prev, index]));
  };

  const handleDownload = async (e: React.MouseEvent, url: string, index: number) => {
    e.stopPropagation();
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `message-image-${Date.now()}-${index + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const navigateImage = (e: React.MouseEvent, direction: 'prev' | 'next') => {
    e.stopPropagation();
    if (expandedIndex === null) return;
    
    if (direction === 'prev' && expandedIndex > 0) {
      setExpandedIndex(expandedIndex - 1);
    } else if (direction === 'next' && expandedIndex < imageUrls.length - 1) {
      setExpandedIndex(expandedIndex + 1);
    }
  };

  const isSingleImage = imageUrls.length === 1;
  const isDoubleImage = imageUrls.length === 2;
  const isMultiImage = imageUrls.length > 2;

  return (
    <>
      {/* Inline images in chat */}
      <motion.div
        className={cn(
          "relative rounded-xl overflow-hidden shadow-sm",
          isOwnMessage ? "rounded-br-md" : "rounded-bl-md",
          isSingleImage && "max-w-[260px]",
          isDoubleImage && "max-w-[280px]",
          isMultiImage && "max-w-[300px]"
        )}
      >
        {/* Single image layout */}
        {isSingleImage && (
          <ImageThumbnail
            url={imageUrls[0]}
            index={0}
            isLoaded={loadedImages.has(0)}
            onLoad={() => handleImageLoad(0)}
            onClick={() => setExpandedIndex(0)}
            className="w-full"
          />
        )}

        {/* Two image layout */}
        {isDoubleImage && (
          <div className="grid grid-cols-2 gap-0.5">
            {imageUrls.map((url, index) => (
              <ImageThumbnail
                key={index}
                url={url}
                index={index}
                isLoaded={loadedImages.has(index)}
                onLoad={() => handleImageLoad(index)}
                onClick={() => setExpandedIndex(index)}
                className="aspect-square"
              />
            ))}
          </div>
        )}

        {/* Multi-image grid layout (3+) */}
        {isMultiImage && (
          <div className="grid grid-cols-2 gap-0.5">
            {imageUrls.slice(0, 4).map((url, index) => (
              <div key={index} className="relative">
                <ImageThumbnail
                  url={url}
                  index={index}
                  isLoaded={loadedImages.has(index)}
                  onLoad={() => handleImageLoad(index)}
                  onClick={() => setExpandedIndex(index)}
                  className="aspect-square"
                />
                {/* Overlay for 4th image when there are more */}
                {index === 3 && imageUrls.length > 4 && (
                  <div 
                    className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer"
                    onClick={() => setExpandedIndex(3)}
                  >
                    <span className="text-white text-headline font-semibold">
                      +{imageUrls.length - 4}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Caption */}
        {caption && (
          <div className={cn(
            "px-3 py-2 text-body",
            isOwnMessage ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
          )}>
            {caption}
          </div>
        )}
      </motion.div>

      {/* Fullscreen viewer */}
      <AnimatePresence>
        {expandedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            onClick={() => setExpandedIndex(null)}
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={springPop}
              className="absolute top-4 left-4 right-4 flex items-center justify-between"
            >
              {/* Image counter */}
              {imageUrls.length > 1 && (
                <span className="text-white/80 text-body">
                  {expandedIndex + 1} / {imageUrls.length}
                </span>
              )}
              <div className="flex-1" />
              
              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => handleDownload(e, imageUrls[expandedIndex], expandedIndex)}
                  className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white"
                >
                  <Download className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setExpandedIndex(null)}
                  className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </motion.div>

            {/* Navigation arrows */}
            {imageUrls.length > 1 && (
              <>
                {expandedIndex > 0 && (
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                    onClick={(e) => navigateImage(e, 'prev')}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </motion.button>
                )}
                {expandedIndex < imageUrls.length - 1 && (
                  <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                    onClick={(e) => navigateImage(e, 'next')}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </motion.button>
                )}
              </>
            )}

            {/* Full image */}
            <motion.img
              key={expandedIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={springPop}
              src={imageUrls[expandedIndex]}
              alt={`Image ${expandedIndex + 1}`}
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Thumbnail strip for multi-image */}
            {imageUrls.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={springPop}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/40 p-2 rounded-xl backdrop-blur-sm"
              >
                {imageUrls.map((url, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedIndex(index);
                    }}
                    className={cn(
                      "h-12 w-12 rounded-lg overflow-hidden border-2 transition-all",
                      index === expandedIndex 
                        ? "border-white scale-110" 
                        : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    <img 
                      src={url} 
                      alt={`Thumbnail ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Separate component for individual thumbnails
function ImageThumbnail({
  url,
  index,
  isLoaded,
  onLoad,
  onClick,
  className,
}: {
  url: string;
  index: number;
  isLoaded: boolean;
  onLoad: () => void;
  onClick: () => void;
  className?: string;
}) {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn("relative cursor-pointer group overflow-hidden", className)}
    >
      {/* Loading skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-secondary animate-pulse" />
      )}
      
      <img
        src={url}
        alt={`Image ${index + 1}`}
        onLoad={onLoad}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-200",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
      />
      
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
    </motion.div>
  );
}
