import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { X, Plus, GripVertical, ChevronLeft, ChevronRight, Loader2, Check, SplitSquareVertical, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { CarouselImage } from './types';
import { filters } from './FilterLibrary';
import { getAdjustmentStyles } from './AdjustmentPanel';
import { BeforeAfterSlider } from './BeforeAfterSlider';

interface EnhancedCarouselEditorProps {
  images: CarouselImage[];
  selectedIndex: number;
  onImagesChange: (images: CarouselImage[]) => void;
  onSelectImage: (index: number) => void;
  onAddImages: () => void;
  maxImages?: number;
}

export function EnhancedCarouselEditor({
  images,
  selectedIndex,
  onImagesChange,
  onSelectImage,
  onAddImages,
  maxImages = 20,
}: EnhancedCarouselEditorProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);
  const [holdingIndex, setHoldingIndex] = useState<number | null>(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const holdStartRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Swipe gesture handling
  const x = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);

  const HOLD_DURATION = 600; // ms to trigger delete mode

  // Clean up hold timer
  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    };
  }, []);

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    if (selectedIndex >= newImages.length) {
      onSelectImage(Math.max(0, newImages.length - 1));
    }
    setShowDeleteConfirm(null);
  };

  const handleHoldStart = (index: number) => {
    if (images.length <= 1) return; // Can't delete if only one image
    
    holdStartRef.current = Date.now();
    setHoldingIndex(index);
    setHoldProgress(0);
    
    // Animate progress
    const animateProgress = () => {
      const elapsed = Date.now() - holdStartRef.current;
      const progress = Math.min(elapsed / HOLD_DURATION, 1);
      setHoldProgress(progress);
      
      if (progress < 1) {
        holdTimerRef.current = setTimeout(animateProgress, 16);
      } else {
        // Hold complete - show delete confirmation
        setShowDeleteConfirm(index);
        setHoldingIndex(null);
        setHoldProgress(0);
      }
    };
    
    holdTimerRef.current = setTimeout(animateProgress, 16);
  };

  const handleHoldEnd = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setHoldingIndex(null);
    setHoldProgress(0);
  };

  const handleThumbnailClick = (index: number) => {
    if (showDeleteConfirm === index) {
      // If delete confirm is showing, clicking outside dismisses it
      return;
    }
    onSelectImage(index);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnd = (e: any, info: PanInfo, index: number) => {
    if (!containerRef.current) return;
    
    const thumbnailHeight = 72; // h-16 + gap (vertical now)
    const dragDistance = info.offset.y;
    const draggedPositions = Math.round(dragDistance / thumbnailHeight);
    
    if (draggedPositions !== 0) {
      const newIndex = Math.max(0, Math.min(images.length - 1, index + draggedPositions));
      if (newIndex !== index) {
        const newImages = [...images];
        const [removed] = newImages.splice(index, 1);
        newImages.splice(newIndex, 0, removed);
        onImagesChange(newImages);
        
        // Update selected index if needed
        if (selectedIndex === index) {
          onSelectImage(newIndex);
        } else if (selectedIndex > index && selectedIndex <= newIndex) {
          onSelectImage(selectedIndex - 1);
        } else if (selectedIndex < index && selectedIndex >= newIndex) {
          onSelectImage(selectedIndex + 1);
        }
      }
    }
    
    setDraggedIndex(null);
  };

  // Main preview swipe navigation
  const handlePanEnd = (e: any, info: PanInfo) => {
    const threshold = 50;
    
    if (info.offset.x > threshold && selectedIndex > 0) {
      onSelectImage(selectedIndex - 1);
    } else if (info.offset.x < -threshold && selectedIndex < images.length - 1) {
      onSelectImage(selectedIndex + 1);
    }
  };

  const currentImage = images[selectedIndex];
  if (!currentImage) return null;

  // Get filter class
  const filterClass = currentImage.filter > 0 ? filters[currentImage.filter]?.class || '' : '';
  
  // Get adjustment styles
  const adjustmentStyles = getAdjustmentStyles({
    brightness: currentImage.brightness,
    contrast: currentImage.contrast,
    saturation: currentImage.saturation,
    warmth: currentImage.warmth,
    highlights: currentImage.highlights,
    shadows: currentImage.shadows,
    vignette: currentImage.vignette,
    sharpen: currentImage.sharpen,
    structure: currentImage.structure,
    fade: currentImage.fade,
  });

  // Combine filter intensity
  const filterOpacity = currentImage.filterIntensity / 100;

  return (
    <div className="flex gap-4">
      {/* Left Side: Thumbnails and Counter */}
      <div className="flex flex-col gap-2 w-20 flex-shrink-0">
        {/* Image Counter */}
        <div className="px-2.5 py-1 rounded-full bg-muted text-xs font-medium text-center">
          {selectedIndex + 1} / {images.length}
        </div>
        
        {/* Thumbnail Strip */}
        <div ref={containerRef} className="flex flex-col gap-2 overflow-y-auto max-h-[400px] scrollbar-hide">
          {images.map((image, index) => (
            <motion.div
              key={image.id}
              layout
              drag={showDeleteConfirm === null ? "y" : false}
              dragConstraints={containerRef}
              dragElastic={0.1}
              onDragStart={() => handleDragStart(index)}
              onDragEnd={(e, info) => handleDragEnd(e, info, index)}
              whileDrag={{ scale: 1.08, zIndex: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
              className="relative flex-shrink-0"
            >
              <button
                onClick={() => handleThumbnailClick(index)}
                onPointerDown={() => handleHoldStart(index)}
                onPointerUp={handleHoldEnd}
                onPointerLeave={handleHoldEnd}
                onPointerCancel={handleHoldEnd}
                className={cn(
                  'w-16 h-16 rounded-lg overflow-hidden border-2 transition-all relative',
                  index === selectedIndex 
                    ? 'border-primary ring-2 ring-primary/30' 
                    : 'border-transparent hover:border-border',
                  draggedIndex === index && 'opacity-50',
                  holdingIndex === index && 'scale-95'
                )}
              >
                <img
                  src={image.previewUrl}
                  alt={`Thumbnail ${index + 1}`}
                  className={cn('w-full h-full object-cover', image.filter > 0 && filters[image.filter]?.class)}
                  draggable={false}
                />
                
                {/* Hold progress overlay */}
                {holdingIndex === index && images.length > 1 && (
                  <motion.div 
                    className="absolute inset-0 bg-destructive/40 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: holdProgress }}
                  >
                    <div 
                      className="absolute inset-0 bg-destructive/60"
                      style={{ 
                        clipPath: `inset(${(1 - holdProgress) * 100}% 0 0 0)` 
                      }}
                    />
                    <Trash2 className="h-4 w-4 text-white relative z-10" />
                  </motion.div>
                )}
              </button>
              
              {/* Delete confirmation overlay */}
              <AnimatePresence>
                {showDeleteConfirm === index && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute inset-0 z-20 flex items-center justify-center"
                  >
                    <div className="absolute inset-0 bg-black/60 rounded-lg" onClick={() => setShowDeleteConfirm(null)} />
                    <motion.button
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(index);
                      }}
                      className="relative z-10 p-2 rounded-full bg-destructive text-destructive-foreground shadow-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Drag Handle Indicator */}
              <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 opacity-40">
                <GripVertical className="h-3 w-3 rotate-90" />
              </div>
              
              {/* Selected checkmark */}
              {index === selectedIndex && showDeleteConfirm !== index && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center"
                >
                  <Check className="h-2.5 w-2.5 text-primary-foreground" />
                </motion.div>
              )}
            </motion.div>
          ))}

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

      {/* Right Side: Main Preview */}
      <div className="flex-1 relative">
        <motion.div
          className="aspect-square bg-black/50 rounded-xl overflow-hidden touch-pan-y"
          onPanEnd={!showBeforeAfter ? handlePanEnd : undefined}
        >
          {showBeforeAfter ? (
            /* Before/After Comparison Mode */
            <BeforeAfterSlider
              beforeSrc={currentImage.previewUrl}
              afterSrc={currentImage.previewUrl}
              afterClassName={filterClass}
              afterStyle={{
                ...adjustmentStyles,
                ...(currentImage.filter > 0 ? { opacity: filterOpacity } : {}),
              }}
            />
          ) : (
            /* Normal Preview Mode */
            <AnimatePresence mode="wait">
              <motion.div
                key={currentImage.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.15 }}
                className="w-full h-full relative"
              >
                {/* Base image */}
                <img
                  src={currentImage.previewUrl}
                  alt={currentImage.altText || `Image ${selectedIndex + 1}`}
                  className="w-full h-full object-contain absolute inset-0"
                  style={adjustmentStyles}
                  draggable={false}
                />
                
                {/* Filtered layer with opacity for intensity */}
                {currentImage.filter > 0 && (
                  <img
                    src={currentImage.previewUrl}
                    alt=""
                    className={cn('w-full h-full object-contain absolute inset-0 pointer-events-none', filterClass)}
                    style={{
                      ...adjustmentStyles,
                      opacity: filterOpacity,
                      mixBlendMode: 'normal',
                    }}
                    draggable={false}
                  />
                )}
                
                {/* Compression indicator */}
                {currentImage.isCompressing && (
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/60 text-white text-xs">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Optimizing...</span>
                  </div>
                )}
                
                {currentImage.compressedFile && !currentImage.isCompressing && (
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-primary/80 text-primary-foreground text-xs">
                    <Check className="h-3 w-3" />
                    <span>Ready</span>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>

        {/* Before/After Toggle */}
        <Button
          variant={showBeforeAfter ? "default" : "outline"}
          size="sm"
          onClick={() => setShowBeforeAfter(!showBeforeAfter)}
          className={cn(
            'absolute top-3 left-3 gap-1.5 text-xs',
            showBeforeAfter && 'bg-primary text-primary-foreground'
          )}
        >
          <SplitSquareVertical className="h-3.5 w-3.5" />
          {showBeforeAfter ? 'Editing' : 'Compare'}
        </Button>

        {/* Navigation Arrows (Desktop) */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => onSelectImage(Math.max(0, selectedIndex - 1))}
              disabled={selectedIndex === 0}
              className={cn(
                'hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 backdrop-blur-sm transition-opacity items-center justify-center',
                selectedIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'opacity-100 hover:bg-background'
              )}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => onSelectImage(Math.min(images.length - 1, selectedIndex + 1))}
              disabled={selectedIndex === images.length - 1}
              className={cn(
                'hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 backdrop-blur-sm transition-opacity items-center justify-center',
                selectedIndex === images.length - 1 ? 'opacity-30 cursor-not-allowed' : 'opacity-100 hover:bg-background'
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
                  'h-2 rounded-full transition-all',
                  i === selectedIndex 
                    ? 'bg-primary w-4' 
                    : 'bg-foreground/40 hover:bg-foreground/60 w-2'
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
