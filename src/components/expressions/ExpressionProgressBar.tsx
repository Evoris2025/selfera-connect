import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ExpressionProgressBarProps {
  totalSegments: number;
  currentSegment: number;
  duration: number; // Duration in seconds for current segment
  isPaused: boolean;
  onSegmentComplete: () => void;
}

export function ExpressionProgressBar({
  totalSegments,
  currentSegment,
  duration,
  isPaused,
  onSegmentComplete,
}: ExpressionProgressBarProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Reset progress when segment changes
    setProgress(0);
  }, [currentSegment]);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + (100 / (duration * 10));
        if (newProgress >= 100) {
          clearInterval(interval);
          onSegmentComplete();
          return 100;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPaused, duration, onSegmentComplete, currentSegment]);

  return (
    <div className="absolute top-4 left-4 right-4 z-20 flex gap-1.5">
      {Array.from({ length: totalSegments }).map((_, index) => (
        <div
          key={index}
          className="flex-1 h-0.5 rounded-full bg-white/30 overflow-hidden backdrop-blur-sm"
        >
          <motion.div
            className={cn(
              "h-full bg-white rounded-full",
              index < currentSegment && "w-full",
              index > currentSegment && "w-0"
            )}
            initial={{ width: index < currentSegment ? '100%' : '0%' }}
            animate={{
              width:
                index < currentSegment
                  ? '100%'
                  : index === currentSegment
                  ? `${progress}%`
                  : '0%',
            }}
            transition={{ duration: 0.1, ease: 'linear' }}
          />
        </div>
      ))}
    </div>
  );
}
