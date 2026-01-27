import { motion } from 'framer-motion';
import { Circle, Minus, RotateCcw } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { BlurSettings, BlurMode } from './types';
import { DEFAULT_BLUR } from './types';

interface BlurControlProps {
  blur: BlurSettings;
  onBlurChange: (blur: BlurSettings) => void;
}

const blurModes: { value: BlurMode; label: string; icon: React.ElementType }[] = [
  { value: 'off', label: 'Off', icon: Circle },
  { value: 'radial', label: 'Radial', icon: Circle },
  { value: 'linear', label: 'Linear', icon: Minus },
];

export function BlurControl({ blur, onBlurChange }: BlurControlProps) {
  const updateBlur = (key: keyof BlurSettings, value: BlurSettings[keyof BlurSettings]) => {
    onBlurChange({ ...blur, [key]: value });
  };

  const handleReset = () => {
    onBlurChange(DEFAULT_BLUR);
  };

  const hasModifications = blur.mode !== 'off';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">Tilt-Shift Blur</label>
        {hasModifications && (
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

      {/* Mode Selection */}
      <div className="grid grid-cols-3 gap-2">
        {blurModes.map(({ value, label, icon: Icon }) => (
          <motion.button
            key={value}
            onClick={() => updateBlur('mode', value)}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all',
              blur.mode === value
                ? 'bg-primary/10 border-primary text-primary'
                : 'bg-secondary/50 border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground'
            )}
          >
            <Icon className={cn('h-5 w-5', value === 'radial' && 'opacity-50')} />
            <span className="text-xs font-medium">{label}</span>
          </motion.button>
        ))}
      </div>

      {/* Blur Settings (only show when blur is enabled) */}
      {blur.mode !== 'off' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-3"
        >
          {/* Intensity */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Intensity</span>
              <span className="text-xs font-medium tabular-nums">{blur.intensity}</span>
            </div>
            <Slider
              value={[blur.intensity]}
              onValueChange={([v]) => updateBlur('intensity', v)}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          {/* Radius/Spread */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {blur.mode === 'radial' ? 'Radius' : 'Spread'}
              </span>
              <span className="text-xs font-medium tabular-nums">{blur.radius}</span>
            </div>
            <Slider
              value={[blur.radius]}
              onValueChange={([v]) => updateBlur('radius', v)}
              min={10}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          {/* Position X */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Position X</span>
              <span className="text-xs font-medium tabular-nums">{blur.positionX}%</span>
            </div>
            <Slider
              value={[blur.positionX]}
              onValueChange={([v]) => updateBlur('positionX', v)}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          {/* Position Y */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Position Y</span>
              <span className="text-xs font-medium tabular-nums">{blur.positionY}%</span>
            </div>
            <Slider
              value={[blur.positionY]}
              onValueChange={([v]) => updateBlur('positionY', v)}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
        </motion.div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        {blur.mode === 'off' 
          ? 'Select a blur mode to create depth-of-field effects'
          : blur.mode === 'radial'
          ? 'Creates a circular focus area with blurred edges'
          : 'Creates a horizontal band of focus with blurred top and bottom'}
      </p>
    </motion.div>
  );
}
