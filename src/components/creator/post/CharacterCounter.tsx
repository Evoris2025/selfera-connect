import { cn } from '@/lib/utils';

interface CharacterCounterProps {
  current: number;
  max: number;
  warningThreshold?: number;
}

export function CharacterCounter({
  current,
  max,
  warningThreshold = 0.8,
}: CharacterCounterProps) {
  const percentage = (current / max) * 100;
  const remaining = max - current;
  const isWarning = percentage >= warningThreshold * 100;
  const isOver = current > max;

  // Calculate stroke dasharray for circular progress
  const radius = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  return (
    <div className="flex items-center gap-2">
      {/* Show remaining count when close to limit */}
      {percentage >= 80 && (
        <span
          className={cn(
            'text-label font-medium tabular-nums transition-colors',
            isOver ? 'text-destructive' : isWarning ? 'text-warning' : 'text-muted-foreground'
          )}
        >
          {remaining}
        </span>
      )}

      {/* Circular progress indicator */}
      <div className="relative h-6 w-6">
        <svg
          className="h-6 w-6 -rotate-90 transform"
          viewBox="0 0 24 24"
        >
          {/* Background circle */}
          <circle
            cx="12"
            cy="12"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-secondary"
          />
          {/* Progress circle */}
          <circle
            cx="12"
            cy="12"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={cn(
              'transition-all duration-200',
              isOver ? 'text-destructive' : isWarning ? 'text-warning' : 'text-primary'
            )}
          />
        </svg>
      </div>
    </div>
  );
}
