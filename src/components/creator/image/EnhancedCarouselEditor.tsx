import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { X, Plus, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Loader2, Check, SplitSquareVertical, Trash2, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { CarouselImage, CropData, AspectRatio } from './types';
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
  // Fill available height
  className?: string;
}

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
  className,
}: EnhancedCarouselEditorProps) {
  const [holdingIndex, setHoldingIndex] = useState<number | null>(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [isReorderMode, setIsReorderMode] = useState(false);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const holdStartRef = useRef<number>(0);
  const holdPointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
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

  const handleHoldStart = (index: number, e: React.PointerEvent) => {
    if (images.length <= 1 || isReorderMode) return; // Can't delete if only one image or in reorder mode
    
    holdPointerStartRef.current = { x: e.clientX, y: e.clientY };
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
    holdPointerStartRef.current = null;
    setHoldingIndex(null);
    setHoldProgress(0);
  };

  const handleThumbnailClick = (index: number) => {
    if (showDeleteConfirm === index) return;
    if (isReorderMode) return; // Don't select during reorder
    onSelectImage(index);
  };

  // Reorder handler for Framer Motion Reorder
  const handleReorder = (newOrder: CarouselImage[]) => {
    const currentImageId = images[selectedIndex]?.id;
    onImagesChange(newOrder);
    
    // Keep selection on the same image
    if (currentImageId) {
      const newIndex = newOrder.findIndex(img => img.id === currentImageId);
      if (newIndex !== -1 && newIndex !== selectedIndex) {
        onSelectImage(newIndex);
      }
    }
  };

  // Main preview swipe navigation
  const handlePanEnd = (e: any, info: any) => {
    if (showBeforeAfter) return; // Disable swipe in compare mode
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

  // Desktop wheel-zoom in crop mode
  const cropPreviewRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isCropMode) return;
    const el = cropPreviewRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      const img = images[selectedIndex];
      if (!img || !onCropChange) return;
      e.preventDefault();
      // Negative deltaY = scroll up = zoom in
      const zoomDelta = -e.deltaY * 0.002;
      const newScale = Math.max(1, Math.min(3, img.cropData.scale + zoomDelta));
      // Clamp translate when zooming out
      const maxTranslate = (newScale - 1) * 50;
      onCropChange({
        ...img.cropData,
        scale: newScale,
        translateX: Math.max(-maxTranslate, Math.min(maxTranslate, img.cropData.translateX)),
        translateY: Math.max(-maxTranslate, Math.min(maxTranslate, img.cropData.translateY)),
      });
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [isCropMode, images, selectedIndex, onCropChange]);

  // Thumbnail slider navigation (horizontal) — hooks must run before any early return
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollUp, setCanScrollUp] = useState(false); // left
  const [canScrollDown, setCanScrollDown] = useState(false); // right

  const updateScrollState = useCallback(() => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollUp(container.scrollLeft > 0);
      setCanScrollDown(container.scrollLeft < container.scrollWidth - container.clientWidth - 1);
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

  // Scroll selected thumbnail into view (horizontal)
  useEffect(() => {
    if (isReorderMode) return; // Don't auto-scroll during reorder
    const container = scrollContainerRef.current;
    if (container && images.length > 0) {
      const thumbnailWidth = 64;
      const targetScroll = selectedIndex * thumbnailWidth;
      const containerWidth = container.clientWidth;
      
      if (targetScroll < container.scrollLeft || targetScroll > container.scrollLeft + containerWidth - thumbnailWidth) {
        container.scrollTo({
          left: Math.max(0, targetScroll - containerWidth / 2 + thumbnailWidth / 2),
          behavior: 'smooth'
        });
      }
    }
  }, [selectedIndex, images.length, isReorderMode]);

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
  
  // Image transform for crop
  const imageTransform = `scale(${currentImage.cropData.scale}) translate(${currentImage.cropData.translateX / currentImage.cropData.scale}%, ${currentImage.cropData.translateY / currentImage.cropData.scale}%) rotate(${currentImage.cropData.rotation || 0}deg)`;

  const scrollThumbnails = (direction: 'up' | 'down') => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 64; // One thumbnail width + gap
      container.scrollBy({
        left: direction === 'up' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className={cn("flex flex-col gap-3 h-full", className)}>
      {/* Top: Horizontal Thumbnails Slider */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Scroll Left Button */}
        {images.length > 5 && !isReorderMode && (
          <button
            onClick={() => scrollThumbnails('up')}
            disabled={!canScrollUp}
            className={cn(
              'p-1 flex items-center justify-center rounded-md transition-all shrink-0',
              canScrollUp 
                ? 'bg-muted hover:bg-muted/80 text-foreground' 
                : 'opacity-30 cursor-not-allowed text-muted-foreground'
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}

        {/* Thumbnails Container - horizontal scroll */}
        <div
          ref={scrollContainerRef}
          className={cn(
            "flex flex-row gap-2 overflow-x-auto scrollbar-hide scroll-smooth flex-1 min-w-0",
            isReorderMode ? 'overflow-visible' : 'touch-pan-x'
          )}
          style={{ 
            WebkitOverflowScrolling: 'touch' 
          }}
        >
          {isReorderMode ? (
            // Reorder Mode: Use Framer Motion Reorder (horizontal)
            <Reorder.Group 
              axis="x" 
              values={images} 
              onReorder={handleReorder}
              className="flex flex-row gap-2"
            >
              {images.map((image, index) => (
                <Reorder.Item
                  key={image.id}
                  value={image}
                  className={cn(
                    'relative w-14 h-14 rounded-lg overflow-hidden border-2 cursor-grab active:cursor-grabbing select-none shrink-0',
                    index === selectedIndex ? 'border-primary ring-2 ring-primary/30' : 'border-border',
                    'animate-[jiggle_0.15s_ease-in-out_infinite]'
                  )}
                  whileDrag={{ scale: 1.1, boxShadow: '0 4px 20px rgba(0,0,0,0.3)', zIndex: 20 }}
                >
                  <img
                    src={image.previewUrl}
                    alt={`Thumbnail ${index + 1}`}
                    className={cn('w-full h-full object-cover', image.filter > 0 && filters[image.filter]?.class)}
                    draggable={false}
                  />
                  {/* Reorder indicator */}
                  <div className="absolute inset-0 bg-primary/10 pointer-events-none" />
                </Reorder.Item>
              ))}
            </Reorder.Group>
          ) : (
            // Normal Mode: Regular thumbnails with hold-to-delete
            <>
              {images.map((image, index) => (
                <div key={image.id} className="relative shrink-0">
                  <button
                    onClick={() => handleThumbnailClick(index)}
                    onPointerDown={(e) => handleHoldStart(index, e)}
                    onPointerMove={(e) => {
                      if (holdingIndex !== index || !holdPointerStartRef.current) return;
                      const dx = Math.abs(e.clientX - holdPointerStartRef.current.x);
                      const dy = Math.abs(e.clientY - holdPointerStartRef.current.y);
                      if (dx + dy > 10) handleHoldEnd();
                    }}
                    onPointerUp={handleHoldEnd}
                    onPointerLeave={handleHoldEnd}
                    onPointerCancel={handleHoldEnd}
                    onContextMenu={(e) => e.preventDefault()}
                    className={cn(
                      'w-14 h-14 rounded-lg overflow-hidden border-2 transition-all relative select-none touch-pan-x',
                      index === selectedIndex ? 'border-primary ring-2 ring-primary/30' : 'border-transparent hover:border-border',
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
                            clipPath: `inset(${(1 - holdProgress) * 100}% 0 0 0)`,
                          }}
                        />
                        <Trash2 className="h-4 w-4 text-white relative z-10" />
                      </motion.div>
                    )}
                  </button>

                  {/* Delete confirmation overlay - FIXED CENTERING */}
                  <AnimatePresence>
                    {showDeleteConfirm === index && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-20"
                      >
                        {/* Dismiss backdrop */}
                        <button
                          type="button"
                          className="absolute inset-0 bg-black/60 rounded-lg"
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            setShowDeleteConfirm(null);
                          }}
                        />
                        {/* Centered delete button using flex - NOT translate */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <motion.button
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                            onPointerDown={(e) => {
                              e.stopPropagation();
                              handleRemove(index);
                            }}
                            className="p-2 rounded-full bg-destructive text-destructive-foreground shadow-lg pointer-events-auto"
                          >
                            <Trash2 className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

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
                </div>
              ))}
            </>
          )}

          {/* Add More Button - only show when not reordering */}
          {images.length < maxImages && !isReorderMode && (
            <button
              onClick={onAddImages}
              className="shrink-0 w-14 h-14 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <Plus className="h-5 w-5" />
            </button>
          )}
        </div>
        
        {/* Scroll Right Button */}
        {images.length > 5 && !isReorderMode && (
          <button
            onClick={() => scrollThumbnails('down')}
            disabled={!canScrollDown}
            className={cn(
              'p-1 flex items-center justify-center rounded-md transition-all shrink-0',
              canScrollDown 
                ? 'bg-muted hover:bg-muted/80 text-foreground' 
                : 'opacity-30 cursor-not-allowed text-muted-foreground'
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}

        {/* Image Counter + Reorder Toggle */}
        <div className="flex items-center gap-1 shrink-0">
          <div className="px-2 py-1 rounded-full bg-muted text-xs font-medium text-center">
            {selectedIndex + 1}/{images.length}
          </div>
          {images.length > 1 && (
            <button
              onClick={() => {
                setIsReorderMode(!isReorderMode);
                setShowDeleteConfirm(null);
              }}
              className={cn(
                'p-1.5 rounded-full transition-colors',
                isReorderMode 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground'
              )}
              title={isReorderMode ? 'Done reordering' : 'Reorder photos'}
            >
              {isReorderMode ? <Check className="h-3.5 w-3.5" /> : <ArrowUpDown className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Right Side: Main Preview - FIXED SIZE Container matching thumbnail height */}
      <div className="flex-1 relative flex flex-col h-full">
        {/* Fixed size container that never changes */}
        <div className="flex-1 min-h-0 bg-black/50 rounded-xl overflow-hidden flex items-center justify-center">
          {showBeforeAfter ? (
            /* Before/After Comparison Mode - same viewport as normal */
            <div className="w-full h-full">
              <BeforeAfterSlider
                beforeSrc={currentImage.previewUrl}
                afterSrc={currentImage.previewUrl}
                beforeStyle={{
                  transform: imageTransform,
                  transformOrigin: 'center',
                }}
                afterClassName={filterClass}
                afterStyle={{
                  ...adjustmentStyles,
                  ...(currentImage.filter > 0 ? { opacity: filterOpacity } : {}),
                  transform: imageTransform,
                  transformOrigin: 'center',
                }}
                objectFit="cover"
              />
            </div>
          ) : isCropMode ? (
            /* Crop Mode - full viewport with grid overlay */
            <div
              className={cn(
                'w-full h-full relative overflow-hidden bg-black flex items-center justify-center',
                isCropDragging ? 'cursor-grabbing' : currentImage.cropData.scale > 1 ? 'cursor-grab' : 'cursor-default'
              )}
              onMouseDown={handleCropMouseDown}
              onMouseMove={handleCropMouseMove}
              onMouseUp={handleCropMouseUp}
              onMouseLeave={handleCropMouseUp}
              onTouchStart={handleCropTouchStart}
              onTouchMove={handleCropTouchMove}
              onTouchEnd={handleCropTouchEnd}
            >
              <img
                src={currentImage.previewUrl}
                alt="Crop preview"
                className="w-full h-full object-cover select-none"
                style={{
                  transform: imageTransform,
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
              
              {/* Pinch hint on mobile */}
              {currentImage.cropData.scale === 1 && (currentImage.cropData.rotation || 0) === 0 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/60 text-white text-xs md:hidden">
                  Pinch to zoom
                </div>
              )}
            </div>
          ) : (
            /* Normal Preview Mode - full viewport */
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
                  className="w-full h-full relative overflow-hidden"
                >
                  {/* Base image with crop transforms applied */}
                  <img
                    src={currentImage.previewUrl}
                    alt={currentImage.altText || `Image ${selectedIndex + 1}`}
                    className="w-full h-full object-cover select-none"
                    style={{
                      ...adjustmentStyles,
                      transform: imageTransform,
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
                        transform: imageTransform,
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
        {images.length > 1 && !showBeforeAfter && (
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
