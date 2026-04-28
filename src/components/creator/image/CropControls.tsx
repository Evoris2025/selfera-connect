import { Square, RectangleVertical, RectangleHorizontal, Maximize2, RotateCcw, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { AspectRatio, CropData } from './types';

interface CropControlsProps {
  cropData: CropData;
  onCropChange: (cropData: CropData) => void;
}

const aspectRatios: { value: AspectRatio; label: string; icon: React.ElementType; ratio: string }[] = [
  { value: 'original', label: 'Original', icon: Maximize2, ratio: 'auto' },
  { value: 'square', label: 'Square', icon: Square, ratio: '1:1' },
  { value: 'portrait', label: 'Portrait', icon: RectangleVertical, ratio: '4:5' },
  { value: 'landscape', label: 'Landscape', icon: RectangleHorizontal, ratio: '16:9' },
];

export function CropControls({ cropData, onCropChange }: CropControlsProps) {
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

  const isModified = cropData.scale !== 1 || cropData.translateX !== 0 || cropData.translateY !== 0 || (cropData.rotation || 0) !== 0;

  return (
    <div className="space-y-4">
      {/* Aspect Ratio Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-body font-medium text-foreground">Aspect Ratio</label>
          {isModified && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-7 text-label text-muted-foreground hover:text-foreground"
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
              <span className="text-label font-medium">{label}</span>
              <span className="text-caption opacity-60">{ratio}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Rotation Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RotateCw className="h-4 w-4 text-muted-foreground" />
            <span className="text-body text-muted-foreground">Straighten</span>
          </div>
          <span className="text-body font-medium">{cropData.rotation || 0}°</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-label text-muted-foreground">-45°</span>
          <Slider
            value={[cropData.rotation || 0]}
            onValueChange={([v]) => handleRotationChange(v)}
            min={-45}
            max={45}
            step={0.5}
            className="flex-1"
          />
          <span className="text-label text-muted-foreground">+45°</span>
        </div>
      </div>

      {/* Zoom Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ZoomOut className="h-4 w-4 text-muted-foreground" />
            <span className="text-body text-muted-foreground">Zoom</span>
          </div>
          <span className="text-body font-medium">{Math.round(cropData.scale * 100)}%</span>
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

      {/* Instructions */}
      <p className="text-label text-muted-foreground text-center">
        {cropData.scale > 1 
          ? 'Drag the image above to reposition • Scroll, pinch, or use the slider to zoom'
          : 'Select aspect ratio • Scroll on the image, pinch, or use the slider to zoom'}
      </p>
    </div>
  );
}
