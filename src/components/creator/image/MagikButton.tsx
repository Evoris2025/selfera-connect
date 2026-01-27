import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MagikButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  isSuccess?: boolean;
  disabled?: boolean;
  className?: string;
}

export function MagikButton({ 
  onClick, 
  isLoading = false, 
  isSuccess = false,
  disabled = false,
  className 
}: MagikButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={disabled || isLoading}
      onClick={onClick}
      onPointerDown={() => setIsPressed(true)}
      onPointerUp={() => setIsPressed(false)}
      onPointerLeave={() => setIsPressed(false)}
      className={cn(
        'relative overflow-hidden gap-1.5 font-medium transition-all duration-300',
        'bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-amber-500/10',
        'hover:from-violet-500/20 hover:via-fuchsia-500/20 hover:to-amber-500/20',
        'border-violet-500/30 hover:border-violet-500/50',
        'text-foreground',
        isLoading && 'cursor-wait',
        isSuccess && 'border-emerald-500/50 from-emerald-500/10 via-emerald-500/10 to-emerald-500/10',
        isPressed && !isLoading && 'scale-95',
        className
      )}
    >
      {/* Shimmer effect during loading */}
      {isLoading && (
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{ 
            repeat: Infinity, 
            duration: 1.2, 
            ease: 'linear' 
          }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        />
      )}
      
      {/* Sparkle particles on success */}
      <AnimatePresence>
        {isSuccess && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  opacity: 1, 
                  scale: 0,
                  x: 0,
                  y: 0 
                }}
                animate={{ 
                  opacity: 0, 
                  scale: 1,
                  x: (Math.random() - 0.5) * 40,
                  y: (Math.random() - 0.5) * 40 
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
                className="absolute left-1/2 top-1/2 w-1 h-1 rounded-full bg-violet-400"
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Icon */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
          >
            <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-400" />
          </motion.div>
        ) : isSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
          >
            <Check className="h-3.5 w-3.5 text-emerald-400" />
          </motion.div>
        ) : (
          <motion.div
            key="sparkles"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            whileHover={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.3 }}
          >
            <Sparkles className="h-3.5 w-3.5 text-violet-400" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Label */}
      <span className={cn(
        'relative z-10 transition-colors duration-200',
        isSuccess && 'text-emerald-400'
      )}>
        {isLoading ? 'Analyzing...' : isSuccess ? 'Applied!' : 'Magik'}
      </span>

      {/* Gradient border glow on hover */}
      <div className={cn(
        'absolute inset-0 rounded-md opacity-0 transition-opacity duration-300',
        'bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-amber-500/20',
        'group-hover:opacity-100'
      )} />
    </Button>
  );
}
