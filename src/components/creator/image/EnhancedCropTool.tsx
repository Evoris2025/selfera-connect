import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Square, RectangleVertical, RectangleHorizontal, Maximize2, RotateCcw, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { AspectRatio, CropData } from './types';

interface EnhancedCropToolProps {
  imageUrl: string;
  cropData: CropData;
  onCropChange: (cropData: CropData) => void;
}

const aspectRatios: { value: AspectRatio; label: string; icon: React.ElementType; ratio: string }[] = [
  { value: 'original', label: 'Original', icon: Maximize2, ratio: 'auto' },
  { value: 'square', label: 'Square', icon: Square, ratio: '1:1' },
  { value: 'portrait', label: 'Portrait', icon: RectangleVertical, ratio: '4:5' },
  { value: 'landscape', label: 'Landscape', icon: RectangleHorizontal, ratio: '16:9' },
];

export function EnhancedCropTool({ imageUrl, cropData, onCropChange }: EnhancedCropToolProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialTranslate, setInitialTranslate] = useState({ x: 0, y: 0 });
  
  // Touch gesture state
  const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null);
  const [initialPinchScale, setInitialPinchScale] = useState(1);

  const handleAspectRatioChange = (ratio: AspectRatio) => {
    onCropChange({
      ...cropData,
      aspectRatio: ratio,
      // Reset position when changing aspect ratio
      translateX: 0,
      translateY: 0,
    });
  };

  const handleScaleChange = (scale: number) => {
    onCropChange({
      ...cropData,
      scale: Math.max(1, Math.min(3, scale)),
    });
  };

  const handleRotationChange = (rotation: number) => {
    onCropChange({
      ...cropData,
      rotation: Math.max(-45, Math.min(45, rotation)),
    });
  };

  const handleReset = () => {
    onCropChange({
      scale: 1,
      translateX: 0,
      translateY: 0,
      aspectRatio: cropData.aspectRatio,
      rotation: 0,
    });
  };

  // Mouse drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (cropData.scale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialTranslate({ x: cropData.translateX, y: cropData.translateY });
  }, [cropData]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = (e.clientX - dragStart.x) / 2;
    const deltaY = (e.clientY - dragStart.y) / 2;
    
    const maxTranslate = (cropData.scale - 1) * 50;
    
    onCropChange({
      ...cropData,
      translateX: Math.max(-maxTranslate, Math.min(maxTranslate, initialTranslate.x + deltaX)),
      translateY: Math.max(-maxTranslate, Math.min(maxTranslate, initialTranslate.y + deltaY)),
    });
  }, [isDragging, dragStart, initialTranslate, cropData, onCropChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch handlers for pinch-to-zoom
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setInitialPinchDistance(distance);
      setInitialPinchScale(cropData.scale);
    } else if (e.touches.length === 1 && cropData.scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      setInitialTranslate({ x: cropData.translateX, y: cropData.translateY });
    }
  }, [cropData]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialPinchDistance !== null) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scaleChange = distance / initialPinchDistance;
      const newScale = Math.max(1, Math.min(3, initialPinchScale * scaleChange));
      
      onCropChange({
        ...cropData,
        scale: newScale,
      });
    } else if (isDragging && e.touches.length === 1) {
      const deltaX = (e.touches[0].clientX - dragStart.x) / 2;
      const deltaY = (e.touches[0].clientY - dragStart.y) / 2;
      
      const maxTranslate = (cropData.scale - 1) * 50;
      
      onCropChange({
        ...cropData,
        translateX: Math.max(-maxTranslate, Math.min(maxTranslate, initialTranslate.x + deltaX)),
        translateY: Math.max(-maxTranslate, Math.min(maxTranslate, initialTranslate.y + deltaY)),
      });
    }
  }, [isDragging, dragStart, initialTranslate, initialPinchDistance, initialPinchScale, cropData, onCropChange]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setInitialPinchDistance(null);
  }, []);

  const getAspectClass = () => {
    switch (cropData.aspectRatio) {
      case 'square': return 'aspect-square';
      case 'portrait': return 'aspect-[4/5]';
      case 'landscape': return 'aspect-video';
      default: return 'aspect-square';
    }
  };

  const isModified = cropData.scale !== 1 || cropData.translateX !== 0 || cropData.translateY !== 0 || (cropData.rotation || 0) !== 0;

  const rotation = cropData.rotation || 0;
  return (
    <div className="space-y-4">
      {/* Crop Preview */}
      <div
        ref={containerRef}
        className={cn(
          'relative overflow-hidden rounded-xl bg-black/50 mx-auto max-w-full',
          getAspectClass(),
          isDragging ? 'cursor-grabbing' : cropData.scale > 1 ? 'cursor-grab' : 'cursor-default'
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={imageUrl}
          alt="Crop preview"
          className="w-full h-full object-cover select-none"
          style={{
            transform: `scale(${cropData.scale}) translate(${cropData.translateX / cropData.scale}%, ${cropData.translateY / cropData.scale}%) rotate(${cropData.rotation || 0}deg)`,
            transformOrigin: 'center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
          draggable={false}
        />
        
        {/* Grid Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full grid grid-cols-3 grid-rows-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="border border-white/20" />
            ))}
          </div>
        </div>
        
        {/* Pinch hint on mobile */}
        {cropData.scale === 1 && (cropData.rotation || 0) === 0 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 text-white text-xs md:hidden">
            Pinch to zoom
          </div>
        )}
      </div>

      {/* Rotation Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RotateCw className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Straighten</span>
          </div>
          <span className="text-sm font-medium">{cropData.rotation || 0}°</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">-45°</span>
          <Slider
            value={[cropData.rotation || 0]}
            onValueChange={([v]) => handleRotationChange(v)}
            min={-45}
            max={45}
            step={0.5}
            className="flex-1"
          />
          <span className="text-xs text-muted-foreground">+45°</span>
        </div>
      </div>

      {/* Zoom Slider (Desktop) */}
      <div className="hidden md:block space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ZoomOut className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Zoom</span>
          </div>
          <span className="text-sm font-medium">{Math.round(cropData.scale * 100)}%</span>
        </div>
        <div className="flex items-center gap-3">
          <Slider
            value={[cropData.scale]}
            onValueChange={([v]) => handleScaleChange(v)}
            min={1}
            max={3}
            step={0.1}
            className="flex-1"
          />
          <ZoomIn className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Aspect Ratio Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Aspect Ratio</label>
          {isModified && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          )}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {aspectRatios.map(({ value, label, icon: Icon, ratio }) => (
            <motion.button
              key={value}
              onClick={() => handleAspectRatioChange(value)}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all',
                cropData.aspectRatio === value
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-secondary/50 border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{label}</span>
              <span className="text-[10px] opacity-60">{ratio}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <p className="text-xs text-muted-foreground text-center">
        {cropData.scale > 1 
          ? 'Drag to reposition • Pinch or use slider to zoom'
          : 'Select aspect ratio • Zoom to crop'}
      </p>
    </div>
  );
}

export function getAspectRatioClass(ratio: AspectRatio): string {
  switch (ratio) {
    case 'square':
      return 'aspect-square';
    case 'portrait':
      return 'aspect-[4/5]';
    case 'landscape':
      return 'aspect-video';
    default:
      return '';
  }
}
