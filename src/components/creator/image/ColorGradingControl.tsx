import { motion } from 'framer-motion';
import { Palette, RotateCcw } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import type { ColorGrading } from './types';
import { DEFAULT_COLOR_GRADING } from './types';

interface ColorGradingControlProps {
  colorGrading: ColorGrading;
  onColorGradingChange: (colorGrading: ColorGrading) => void;
}

// Preset color tints
const shadowTintPresets = [
  { color: 'hsl(220, 50%, 30%)', label: 'Blue' },
  { color: 'hsl(280, 50%, 30%)', label: 'Purple' },
  { color: 'hsl(160, 50%, 25%)', label: 'Teal' },
  { color: 'hsl(340, 50%, 30%)', label: 'Rose' },
  { color: 'hsl(30, 50%, 30%)', label: 'Sepia' },
  { color: 'hsl(0, 0%, 20%)', label: 'Neutral' },
];

const highlightTintPresets = [
  { color: 'hsl(40, 60%, 70%)', label: 'Warm' },
  { color: 'hsl(200, 50%, 75%)', label: 'Cool' },
  { color: 'hsl(60, 50%, 75%)', label: 'Yellow' },
  { color: 'hsl(320, 40%, 75%)', label: 'Pink' },
  { color: 'hsl(120, 40%, 70%)', label: 'Green' },
  { color: 'hsl(0, 0%, 85%)', label: 'Neutral' },
];

export function ColorGradingControl({ colorGrading, onColorGradingChange }: ColorGradingControlProps) {
  const updateColorGrading = (key: keyof ColorGrading, value: string | number) => {
    onColorGradingChange({ ...colorGrading, [key]: value });
  };

  const handleReset = () => {
    onColorGradingChange(DEFAULT_COLOR_GRADING);
  };

  const hasModifications = 
    colorGrading.shadowIntensity > 0 || 
    colorGrading.highlightIntensity > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-primary" />
          <label className="text-body font-medium text-foreground">Color Grading</label>
        </div>
        {hasModifications && (
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

      {/* Shadow Tint */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-body text-foreground">Shadow Tint</span>
          <span className="text-label font-medium tabular-nums text-muted-foreground">
            {colorGrading.shadowIntensity}%
          </span>
        </div>
        
        {/* Color Presets */}
        <div className="flex gap-2 flex-wrap">
          {shadowTintPresets.map((preset) => (
            <button
              key={preset.color}
              onClick={() => updateColorGrading('shadowTint', preset.color)}
              className="w-8 h-8 rounded-full border-2 transition-all hover:scale-110"
              style={{
                backgroundColor: preset.color,
                borderColor: colorGrading.shadowTint === preset.color ? 'hsl(var(--primary))' : 'transparent',
              }}
              title={preset.label}
            />
          ))}
        </div>
        
        {/* Intensity Slider */}
        <Slider
          value={[colorGrading.shadowIntensity]}
          onValueChange={([v]) => updateColorGrading('shadowIntensity', v)}
          min={0}
          max={100}
          step={1}
          className="w-full"
        />
      </div>

      {/* Highlight Tint */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-body text-foreground">Highlight Tint</span>
          <span className="text-label font-medium tabular-nums text-muted-foreground">
            {colorGrading.highlightIntensity}%
          </span>
        </div>
        
        {/* Color Presets */}
        <div className="flex gap-2 flex-wrap">
          {highlightTintPresets.map((preset) => (
            <button
              key={preset.color}
              onClick={() => updateColorGrading('highlightTint', preset.color)}
              className="w-8 h-8 rounded-full border-2 transition-all hover:scale-110"
              style={{
                backgroundColor: preset.color,
                borderColor: colorGrading.highlightTint === preset.color ? 'hsl(var(--primary))' : 'transparent',
              }}
              title={preset.label}
            />
          ))}
        </div>
        
        {/* Intensity Slider */}
        <Slider
          value={[colorGrading.highlightIntensity]}
          onValueChange={([v]) => updateColorGrading('highlightIntensity', v)}
          min={0}
          max={100}
          step={1}
          className="w-full"
        />
      </div>

      <p className="text-label text-muted-foreground text-center">
        Add color tints to shadows and highlights for cinematic looks
      </p>
    </motion.div>
  );
}
