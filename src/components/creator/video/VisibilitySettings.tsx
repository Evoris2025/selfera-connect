import { motion } from 'framer-motion';
import { Globe, Lock, Users, Clock, Calendar } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export type VisibilityOption = 'public' | 'unlisted' | 'private' | 'scheduled';

interface VisibilitySettingsProps {
  visibility: VisibilityOption;
  onChange: (visibility: VisibilityOption) => void;
  scheduledDate?: string;
  onScheduledDateChange?: (date: string) => void;
  commentsEnabled: boolean;
  onCommentsEnabledChange: (enabled: boolean) => void;
}

const visibilityOptions: { value: VisibilityOption; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'public',
    label: 'Public',
    description: 'Everyone can see this video',
    icon: <Globe className="w-5 h-5" />,
  },
  {
    value: 'unlisted',
    label: 'Unlisted',
    description: 'Only people with the link can see',
    icon: <Users className="w-5 h-5" />,
  },
  {
    value: 'private',
    label: 'Private',
    description: 'Only you can see this video',
    icon: <Lock className="w-5 h-5" />,
  },
  {
    value: 'scheduled',
    label: 'Schedule',
    description: 'Set a date and time to publish',
    icon: <Calendar className="w-5 h-5" />,
  },
];

export function VisibilitySettings({
  visibility,
  onChange,
  scheduledDate,
  onScheduledDateChange,
  commentsEnabled,
  onCommentsEnabledChange,
}: VisibilitySettingsProps) {
  return (
    <div className="space-y-4">
      <label className="text-body font-medium">Visibility</label>

      <div className="grid grid-cols-2 gap-2">
        {visibilityOptions.map((option) => (
          <motion.button
            key={option.value}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex items-start gap-3 p-3 rounded-xl text-left transition-colors',
              visibility === option.value
                ? 'bg-primary/10 border border-primary'
                : 'bg-secondary/50 border border-transparent hover:bg-secondary'
            )}
          >
            <div className={cn(
              'p-2 rounded-lg transition-colors',
              visibility === option.value ? 'bg-primary text-primary-foreground' : 'bg-muted'
            )}>
              {option.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn(
                'font-medium text-body',
                visibility === option.value && 'text-primary'
              )}>
                {option.label}
              </p>
              <p className="text-label text-muted-foreground line-clamp-1">
                {option.description}
              </p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Scheduled date picker */}
      {visibility === 'scheduled' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-2"
        >
          <label className="text-body font-medium flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Publish Date & Time
          </label>
          <Input
            type="datetime-local"
            value={scheduledDate}
            onChange={(e) => onScheduledDateChange?.(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
          />
        </motion.div>
      )}

      {/* Comments toggle */}
      <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
        <div>
          <p className="font-medium text-body">Comments</p>
          <p className="text-label text-muted-foreground">Allow viewers to comment on this video</p>
        </div>
        <Switch
          checked={commentsEnabled}
          onCheckedChange={onCommentsEnabledChange}
        />
      </div>
    </div>
  );
}
