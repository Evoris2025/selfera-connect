import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HoldToRecordButtonProps {
  onCapture: () => void;
  onRecordStart?: () => void;
  onRecordEnd?: () => void;
  isRecording?: boolean;
  maxRecordDuration?: number; // in seconds
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function HoldToRecordButton({
  onCapture,
  onRecordStart,
  onRecordEnd,
  isRecording = false,
  maxRecordDuration = 15,
  size = 'lg',
  className,
}: HoldToRecordButtonProps) {
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const holdStartTimeRef = useRef<number>(0);

  const sizeClasses = {
    sm: 'w-14 h-14',
    md: 'w-18 h-18',
    lg: 'w-20 h-20',
  };

  const innerSizeClasses = {
    sm: 'w-11 h-11',
    md: 'w-14 h-14',
    lg: 'w-16 h-16',
  };

  const cleanupTimers = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => cleanupTimers();
  }, [cleanupTimers]);

  const handlePointerDown = useCallback(() => {
    holdStartTimeRef.current = Date.now();
    setIsHolding(true);

    // Short tap threshold (200ms) - if released before this, it's a capture
    holdTimerRef.current = setTimeout(() => {
      // Start recording
      onRecordStart?.();
      
      // Start progress tracking
      const startTime = Date.now();
      progressIntervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const progress = Math.min((elapsed / maxRecordDuration) * 100, 100);
        setHoldProgress(progress);

        if (progress >= 100) {
          handlePointerUp();
        }
      }, 50);
    }, 200);
  }, [onRecordStart, maxRecordDuration]);

  const handlePointerUp = useCallback(() => {
    const holdDuration = Date.now() - holdStartTimeRef.current;
    cleanupTimers();
    setIsHolding(false);
    setHoldProgress(0);

    if (holdDuration < 200) {
      // Short tap - capture photo
      onCapture();
    } else {
      // Long press - end recording
      onRecordEnd?.();
    }
  }, [onCapture, onRecordEnd, cleanupTimers]);

  const circumference = 2 * Math.PI * 42;
  const strokeDashoffset = circumference - (holdProgress / 100) * circumference;

  return (
    <div className={cn("relative", className)}>
      {/* Progress ring */}
      <AnimatePresence>
        {(isHolding || isRecording) && (
          <motion.svg
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="4"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="#ef4444"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-75"
            />
          </motion.svg>
        )}
      </AnimatePresence>

      {/* Button */}
      <motion.button
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "relative flex items-center justify-center rounded-full border-4 border-white backdrop-blur transition-all",
          isHolding || isRecording ? "bg-red-500/30" : "bg-white/30",
          sizeClasses[size]
        )}
      >
        <motion.div
          animate={{
            scale: isHolding || isRecording ? 0.6 : 1,
            borderRadius: isHolding || isRecording ? '8px' : '100%',
          }}
          transition={{ duration: 0.15 }}
          className={cn(
            "bg-white",
            isHolding || isRecording ? "bg-red-500" : "",
            innerSizeClasses[size]
          )}
        />
      </motion.button>

      {/* Hint text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-white/60 text-label whitespace-nowrap"
      >
        {isHolding || isRecording ? 'Recording...' : 'Tap for photo, hold for video'}
      </motion.p>
    </div>
  );
}
