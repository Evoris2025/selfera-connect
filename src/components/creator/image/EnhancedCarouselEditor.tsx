import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { X, Plus, GripVertical, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Loader2, Check, SplitSquareVertical, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
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
  showBeforeAfter?: boolean;
  onToggleBeforeAfter?: () => void;
  // Crop mode
  isCropMode?: boolean;
  onCropChange?: (cropData: CropData) => void;
}

import type { CropData, AspectRatio } from './types';

export function EnhancedCarouselEditor({
  images,
  selectedIndex,
  onImagesChange,
  onSelectImage,
  onAddImages,
  maxImages = 20,
  showBeforeAfter = false,
  onToggleBeforeAfter,
  isCropMode = false,
  onCropChange,
}: EnhancedCarouselEditorProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [holdingIndex, setHoldingIndex] = useState<number | null>(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const holdStartRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Swipe gesture handling
  const x = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);
  
  // Crop mode state
  const [isCropDragging, setIsCropDragging] = useState(false);
  const [cropDragStart, setCropDragStart] = useState({ x: 0, y: 0 });
  const [initialCropTranslate, setInitialCropTranslate] = useState({ x: 0, y: 0 });
  const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null);
  const [initialPinchScale, setInitialPinchScale] = useState(1);

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

  // Crop mode handlers
  const handleCropMouseDown = useCallback((e: React.MouseEvent) => {
    const img = images[selectedIndex];
    if (!isCropMode || !img) return;
    if (img.cropData.scale <= 1) return;
    
    setIsCropDragging(true);
    setCropDragStart({ x: e.clientX, y: e.clientY });
    setInitialCropTranslate({ 
      x: img.cropData.translateX, 
      y: img.cropData.translateY 
    });
  }, [isCropMode, images, selectedIndex]);

  const handleCropMouseMove = useCallback((e: React.MouseEvent) => {
    const img = images[selectedIndex];
    if (!isCropDragging || !img || !onCropChange) return;
    
    const deltaX = (e.clientX - cropDragStart.x) / 2;
    const deltaY = (e.clientY - cropDragStart.y) / 2;
    
    const maxTranslate = (img.cropData.scale - 1) * 50;
    
    onCropChange({
      ...img.cropData,
      translateX: Math.max(-maxTranslate, Math.min(maxTranslate, initialCropTranslate.x + deltaX)),
      translateY: Math.max(-maxTranslate, Math.min(maxTranslate, initialCropTranslate.y + deltaY)),
    });
  }, [isCropDragging, cropDragStart, initialCropTranslate, images, selectedIndex, onCropChange]);

  const handleCropMouseUp = useCallback(() => {
    setIsCropDragging(false);
  }, []);

  // Crop touch handlers for pinch-to-zoom
  const handleCropTouchStart = useCallback((e: React.TouchEvent) => {
    const img = images[selectedIndex];
    if (!isCropMode || !img) return;
    
    if (e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setInitialPinchDistance(distance);
      setInitialPinchScale(img.cropData.scale);
    } else if (e.touches.length === 1 && img.cropData.scale > 1) {
      setIsCropDragging(true);
      setCropDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      setInitialCropTranslate({ 
        x: img.cropData.translateX, 
        y: img.cropData.translateY 
      });
    }
  }, [isCropMode, images, selectedIndex]);

  const handleCropTouchMove = useCallback((e: React.TouchEvent) => {
    const img = images[selectedIndex];
    if (!isCropMode || !img || !onCropChange) return;
    
    if (e.touches.length === 2 && initialPinchDistance !== null) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scaleChange = distance / initialPinchDistance;
      const newScale = Math.max(1, Math.min(3, initialPinchScale * scaleChange));
      
      onCropChange({
        ...img.cropData,
        scale: newScale,
      });
    } else if (isCropDragging && e.touches.length === 1) {
      const deltaX = (e.touches[0].clientX - cropDragStart.x) / 2;
      const deltaY = (e.touches[0].clientY - cropDragStart.y) / 2;
      
      const maxTranslate = (img.cropData.scale - 1) * 50;
      
      onCropChange({
        ...img.cropData,
        translateX: Math.max(-maxTranslate, Math.min(maxTranslate, initialCropTranslate.x + deltaX)),
        translateY: Math.max(-maxTranslate, Math.min(maxTranslate, initialCropTranslate.y + deltaY)),
      });
    }
  }, [isCropMode, isCropDragging, cropDragStart, initialCropTranslate, initialPinchDistance, initialPinchScale, images, selectedIndex, onCropChange]);

  const handleCropTouchEnd = useCallback(() => {
    setIsCropDragging(false);
    setInitialPinchDistance(null);
  }, []);

  const getAspectClass = () => {
    if (!currentImage) return '';
    switch (currentImage.cropData.aspectRatio) {
      case 'square': return 'aspect-square';
      case 'portrait': return 'aspect-[4/5]';
      case 'landscape': return 'aspect-video';
      default: return '';
    }
  };

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

  // Thumbnail slider navigation
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const updateScrollState = useCallback(() => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollUp(container.scrollTop > 0);
      setCanScrollDown(container.scrollTop < container.scrollHeight - container.clientHeight - 1);
    }
  }, []);

  useEffect(() => {
    updateScrollState();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', updateScrollState);
      return () => container.removeEventListener('scroll', updateScrollState);
    }
  }, [updateScrollState, images.length]);

  const scrollThumbnails = (direction: 'up' | 'down') => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 72; // One thumbnail height + gap
      container.scrollBy({
        top: direction === 'up' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Scroll selected thumbnail into view
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container && images.length > 0) {
      const thumbnailHeight = 72;
      const targetScroll = selectedIndex * thumbnailHeight;
      const containerHeight = container.clientHeight;
      
      if (targetScroll < container.scrollTop || targetScroll > container.scrollTop + containerHeight - thumbnailHeight) {
        container.scrollTo({
          top: Math.max(0, targetScroll - containerHeight / 2 + thumbnailHeight / 2),
          behavior: 'smooth'
        });
      }
    }
  }, [selectedIndex, images.length]);

  return (
    <div className="flex gap-4">
      {/* Left Side: Thumbnails and Counter */}
      <div className="flex flex-col gap-2 w-20 flex-shrink-0">
        {/* Image Counter */}
        <div className="px-2.5 py-1 rounded-full bg-muted text-xs font-medium text-center">
          {selectedIndex + 1} / {images.length}
        </div>
        
        {/* Scroll Up Button */}
        {images.length > 5 && (
          <button
            onClick={() => scrollThumbnails('up')}
            disabled={!canScrollUp}
            className={cn(
              'w-full py-1 flex items-center justify-center rounded-md transition-all',
              canScrollUp 
                ? 'bg-muted hover:bg-muted/80 text-foreground' 
                : 'opacity-30 cursor-not-allowed text-muted-foreground'
            )}
          >
            <ChevronUp className="h-4 w-4" />
          </button>
        )}
        
        {/* Thumbnail Strip with Slider */}
        <div 
          ref={(el) => {
            scrollContainerRef.current = el;
            if (containerRef) containerRef.current = el;
          }} 
          className="flex flex-col gap-2 overflow-y-auto max-h-[320px] scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
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
                onContextMenu={(e) => e.preventDefault()}
                className={cn(
                  'w-16 h-16 rounded-lg overflow-hidden border-2 transition-all relative select-none',
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
        
        {/* Scroll Down Button */}
        {images.length > 5 && (
          <button
            onClick={() => scrollThumbnails('down')}
            disabled={!canScrollDown}
            className={cn(
              'w-full py-1 flex items-center justify-center rounded-md transition-all',
              canScrollDown 
                ? 'bg-muted hover:bg-muted/80 text-foreground' 
                : 'opacity-30 cursor-not-allowed text-muted-foreground'
            )}
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Right Side: Main Preview - FIXED SIZE Container */}
      <div className="flex-1 relative">
        {/* Fixed size container that never changes */}
        <div className="w-full aspect-square md:aspect-[4/5] lg:aspect-square bg-black/50 rounded-xl overflow-hidden flex items-center justify-center">
          {showBeforeAfter ? (
            /* Before/After Comparison Mode - contained within fixed size */
            <div className="w-full h-full">
              <BeforeAfterSlider
                beforeSrc={currentImage.previewUrl}
                afterSrc={currentImage.previewUrl}
                afterClassName={filterClass}
                afterStyle={{
                  ...adjustmentStyles,
                  ...(currentImage.filter > 0 ? { opacity: filterOpacity } : {}),
                }}
              />
            </div>
          ) : isCropMode ? (
            /* Crop Mode - image scales within fixed container */
            <div
              className={cn(
                'relative overflow-hidden bg-black flex items-center justify-center',
                isCropDragging ? 'cursor-grabbing' : currentImage.cropData.scale > 1 ? 'cursor-grab' : 'cursor-default'
              )}
              style={{
                width: '100%',
                height: '100%',
              }}
              onMouseDown={handleCropMouseDown}
              onMouseMove={handleCropMouseMove}
              onMouseUp={handleCropMouseUp}
              onMouseLeave={handleCropMouseUp}
              onTouchStart={handleCropTouchStart}
              onTouchMove={handleCropTouchMove}
              onTouchEnd={handleCropTouchEnd}
            >
              {/* Inner crop frame based on aspect ratio */}
              <div 
                className={cn(
                  'relative overflow-hidden',
                  getAspectClass() || 'aspect-square'
                )}
                style={{
                  width: currentImage.cropData.aspectRatio === 'landscape' ? '100%' : 
                         currentImage.cropData.aspectRatio === 'portrait' ? '75%' : '85%',
                  maxHeight: '100%',
                }}
              >
                <img
                  src={currentImage.previewUrl}
                  alt="Crop preview"
                  className="w-full h-full object-cover select-none"
                  style={{
                    transform: `scale(${currentImage.cropData.scale}) translate(${currentImage.cropData.translateX / currentImage.cropData.scale}%, ${currentImage.cropData.translateY / currentImage.cropData.scale}%) rotate(${currentImage.cropData.rotation || 0}deg)`,
                    transformOrigin: 'center',
                    transition: isCropDragging ? 'none' : 'transform 0.1s ease-out',
                    ...adjustmentStyles,
                  }}
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                />
                
                {/* Grid Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="border border-white/30" />
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Pinch hint on mobile */}
              {currentImage.cropData.scale === 1 && (currentImage.cropData.rotation || 0) === 0 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/60 text-white text-xs md:hidden">
                  Pinch to zoom
                </div>
              )}
            </div>
          ) : (
            /* Normal Preview Mode - image displayed within fixed container */
            <motion.div
              className="w-full h-full touch-pan-y flex items-center justify-center bg-black"
              onPanEnd={handlePanEnd}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImage.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.15 }}
                  className={cn(
                    "relative overflow-hidden",
                    // Apply aspect ratio from crop
                    currentImage.cropData.aspectRatio === 'square' && 'aspect-square',
                    currentImage.cropData.aspectRatio === 'portrait' && 'aspect-[4/5]',
                    currentImage.cropData.aspectRatio === 'landscape' && 'aspect-video',
                    currentImage.cropData.aspectRatio === 'original' && 'w-full h-full'
                  )}
                  style={{
                    width: currentImage.cropData.aspectRatio === 'original' ? '100%' : 
                           currentImage.cropData.aspectRatio === 'landscape' ? '100%' : 
                           currentImage.cropData.aspectRatio === 'portrait' ? '75%' : '85%',
                    maxHeight: '100%',
                  }}
                >
                  {/* Base image with crop transforms applied */}
                  <img
                    src={currentImage.previewUrl}
                    alt={currentImage.altText || `Image ${selectedIndex + 1}`}
                    className="w-full h-full object-cover select-none"
                    style={{
                      ...adjustmentStyles,
                      transform: `scale(${currentImage.cropData.scale}) translate(${currentImage.cropData.translateX / currentImage.cropData.scale}%, ${currentImage.cropData.translateY / currentImage.cropData.scale}%) rotate(${currentImage.cropData.rotation || 0}deg)`,
                      transformOrigin: 'center',
                    }}
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                  
                  {/* Filtered layer with opacity for intensity */}
                  {currentImage.filter > 0 && (
                    <img
                      src={currentImage.previewUrl}
                      alt=""
                      className={cn('w-full h-full object-cover absolute inset-0 pointer-events-none select-none', filterClass)}
                      style={{
                        ...adjustmentStyles,
                        opacity: filterOpacity,
                        mixBlendMode: 'normal',
                        transform: `scale(${currentImage.cropData.scale}) translate(${currentImage.cropData.translateX / currentImage.cropData.scale}%, ${currentImage.cropData.translateY / currentImage.cropData.scale}%) rotate(${currentImage.cropData.rotation || 0}deg)`,
                        transformOrigin: 'center',
                      }}
                      draggable={false}
                      onContextMenu={(e) => e.preventDefault()}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </div>

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
      </div>
    </div>
  );
}
