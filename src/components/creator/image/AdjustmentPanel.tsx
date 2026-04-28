import { motion } from 'framer-motion';
import { 
  Sun, 
  Contrast, 
  Droplets, 
  Thermometer, 
  Sparkles, 
  Moon,
  Circle,
  Zap,
  Layers,
  CloudFog,
  RotateCcw
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getAdjustmentFilterValue } from './filterUtils';

export interface ImageAdjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  warmth: number;
  highlights: number;
  shadows: number;
  vignette: number;
  sharpen: number;
  structure: number;
  fade: number;
}

interface AdjustmentSliderProps {
  icon: React.ElementType;
  label: string;
  value: number;
  min: number;
  max: number;
  defaultValue: number;
  onChange: (value: number) => void;
}

function AdjustmentSlider({ 
  icon: Icon, 
  label, 
  value, 
  min, 
  max, 
  defaultValue,
  onChange 
}: AdjustmentSliderProps) {
  const isModified = value !== defaultValue;
  
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={cn(
            'h-4 w-4',
            isModified ? 'text-primary' : 'text-muted-foreground'
          )} />
          <span className={cn(
            'text-body',
            isModified ? 'text-foreground font-medium' : 'text-muted-foreground'
          )}>
            {label}
          </span>
        </div>
        <span className={cn(
          'text-label tabular-nums w-10 text-right',
          isModified ? 'text-primary' : 'text-muted-foreground'
        )}>
          {value > 0 && value !== defaultValue && min < 0 ? '+' : ''}{value}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={1}
        className={cn(
          'w-full',
          isModified && '[&_[role=slider]]:bg-primary'
        )}
      />
    </div>
  );
}

interface AdjustmentPanelProps {
  adjustments: ImageAdjustments;
  onAdjustmentsChange: (adjustments: ImageAdjustments) => void;
}

export function AdjustmentPanel({ adjustments, onAdjustmentsChange }: AdjustmentPanelProps) {
  const defaultAdjustments: ImageAdjustments = {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    warmth: 0,
    highlights: 0,
    shadows: 0,
    vignette: 0,
    sharpen: 0,
    structure: 0,
    fade: 0,
  };

  const updateAdjustment = (key: keyof ImageAdjustments, value: number) => {
    onAdjustmentsChange({ ...adjustments, [key]: value });
  };

  const handleReset = () => {
    onAdjustmentsChange(defaultAdjustments);
  };

  const hasModifications = Object.entries(adjustments).some(
    ([key, value]) => value !== defaultAdjustments[key as keyof ImageAdjustments]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <label className="text-body font-medium text-foreground">Adjustments</label>
        {hasModifications && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-8 text-label text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset All
          </Button>
        )}
      </div>

      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
        <AdjustmentSlider
          icon={Sun}
          label="Brightness"
          value={adjustments.brightness}
          min={50}
          max={150}
          defaultValue={100}
          onChange={(v) => updateAdjustment('brightness', v)}
        />

        <AdjustmentSlider
          icon={Contrast}
          label="Contrast"
          value={adjustments.contrast}
          min={50}
          max={150}
          defaultValue={100}
          onChange={(v) => updateAdjustment('contrast', v)}
        />

        <AdjustmentSlider
          icon={Droplets}
          label="Saturation"
          value={adjustments.saturation}
          min={0}
          max={200}
          defaultValue={100}
          onChange={(v) => updateAdjustment('saturation', v)}
        />

        <AdjustmentSlider
          icon={Thermometer}
          label="Warmth"
          value={adjustments.warmth}
          min={-100}
          max={100}
          defaultValue={0}
          onChange={(v) => updateAdjustment('warmth', v)}
        />

        <AdjustmentSlider
          icon={Sparkles}
          label="Highlights"
          value={adjustments.highlights}
          min={-100}
          max={100}
          defaultValue={0}
          onChange={(v) => updateAdjustment('highlights', v)}
        />

        <AdjustmentSlider
          icon={Moon}
          label="Shadows"
          value={adjustments.shadows}
          min={-100}
          max={100}
          defaultValue={0}
          onChange={(v) => updateAdjustment('shadows', v)}
        />

        <AdjustmentSlider
          icon={Circle}
          label="Vignette"
          value={adjustments.vignette}
          min={0}
          max={100}
          defaultValue={0}
          onChange={(v) => updateAdjustment('vignette', v)}
        />

        <AdjustmentSlider
          icon={Zap}
          label="Sharpen"
          value={adjustments.sharpen}
          min={0}
          max={100}
          defaultValue={0}
          onChange={(v) => updateAdjustment('sharpen', v)}
        />

        <AdjustmentSlider
          icon={Layers}
          label="Structure"
          value={adjustments.structure}
          min={0}
          max={100}
          defaultValue={0}
          onChange={(v) => updateAdjustment('structure', v)}
        />

        <AdjustmentSlider
          icon={CloudFog}
          label="Fade"
          value={adjustments.fade}
          min={0}
          max={100}
          defaultValue={0}
          onChange={(v) => updateAdjustment('fade', v)}
        />
      </div>
    </motion.div>
  );
}

export function getAdjustmentStyles(adjustments: ImageAdjustments): React.CSSProperties {
  return {
    filter: getAdjustmentFilterValue(adjustments),
  };
}
