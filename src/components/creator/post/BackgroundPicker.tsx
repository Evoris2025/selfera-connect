import { Type } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { PostBackground } from '@/contexts/FeedDataContext';

/**
 * Facebook-style text-post background picker.
 * Visible only when the composer has no media.
 */
export const POST_BACKGROUND_PRESETS: PostBackground[] = [
  { type: 'gradient', value: 'linear-gradient(135deg, hsl(220 85% 55%), hsl(265 80% 55%))', textColor: '#ffffff' },
  { type: 'gradient', value: 'linear-gradient(135deg, hsl(345 90% 60%), hsl(20 95% 60%))', textColor: '#ffffff' },
  { type: 'gradient', value: 'linear-gradient(135deg, hsl(160 70% 45%), hsl(195 75% 50%))', textColor: '#ffffff' },
  { type: 'gradient', value: 'linear-gradient(135deg, hsl(35 90% 55%), hsl(15 85% 55%))', textColor: '#ffffff' },
  { type: 'color',    value: 'hsl(220 25% 12%)', textColor: '#ffffff' },
  { type: 'color',    value: 'hsl(0 0% 96%)',    textColor: '#0a0a0a' },
  { type: 'gradient', value: 'linear-gradient(135deg, hsl(280 70% 55%), hsl(330 75% 55%))', textColor: '#ffffff' },
  { type: 'gradient', value: 'linear-gradient(135deg, hsl(200 30% 30%), hsl(220 30% 18%))', textColor: '#ffffff' },
];

interface BackgroundPickerProps {
  value: PostBackground | null;
  onChange: (value: PostBackground | null) => void;
  disabled?: boolean;
}

export function BackgroundPicker({ value, onChange, disabled }: BackgroundPickerProps) {
  return (
    <div className={cn('flex items-center gap-2 overflow-x-auto py-1', disabled && 'opacity-40 pointer-events-none')}>
      <button
        type="button"
        onClick={() => onChange(null)}
        className={cn(
          'shrink-0 h-9 w-9 rounded-lg border-2 flex items-center justify-center transition',
          !value ? 'border-primary' : 'border-border hover:border-foreground/30'
        )}
        aria-label="No background"
        title="No background"
      >
        <Type className="h-4 w-4" />
      </button>
      {POST_BACKGROUND_PRESETS.map((preset, i) => {
        const active = value?.value === preset.value;
        return (
          <motion.button
            key={i}
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={() => onChange(preset)}
            className={cn(
              'shrink-0 h-9 w-9 rounded-lg border-2 transition',
              active ? 'border-primary' : 'border-transparent hover:border-foreground/30'
            )}
            style={{ background: preset.value }}
            aria-label={`Background ${i + 1}`}
          />
        );
      })}
    </div>
  );
}
