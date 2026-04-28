import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StepConfig {
  id: string;
  label: string;
}

interface StepPillsProps {
  steps: StepConfig[];
  currentStep: string;
  onStepClick?: (stepId: string) => void;
  completedSteps?: string[];
  className?: string;
}

export function StepPills({
  steps,
  currentStep,
  onStepClick,
  completedSteps = [],
  className,
}: StepPillsProps) {
  const currentIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className={cn("flex items-center gap-2 p-3", className)}>
      {steps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = completedSteps.includes(step.id) || index < currentIndex;
        const isClickable = onStepClick && (isCompleted || index === currentIndex);

        return (
          <div key={step.id} className="flex items-center flex-1">
            <motion.button
              onClick={() => isClickable && onStepClick?.(step.id)}
              disabled={!isClickable}
              className={cn(
                "relative flex items-center gap-2 px-4 py-2 rounded-full text-body font-medium transition-all",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : isCompleted 
                    ? "bg-primary/20 text-primary cursor-pointer hover:bg-primary/30" 
                    : "bg-secondary/50 text-muted-foreground",
                !isClickable && "cursor-not-allowed opacity-60"
              )}
              whileHover={isClickable ? { scale: 1.02 } : undefined}
              whileTap={isClickable ? { scale: 0.98 } : undefined}
            >
              {/* Step number or check */}
              <span className={cn(
                "flex items-center justify-center w-5 h-5 rounded-full text-label font-bold",
                isActive 
                  ? "bg-primary-foreground/20" 
                  : isCompleted 
                    ? "bg-primary/30" 
                    : "bg-muted-foreground/20"
              )}>
                {isCompleted && !isActive ? (
                  <Check className="w-3 h-3" />
                ) : (
                  index + 1
                )}
              </span>
              
              {/* Label */}
              <span className="hidden sm:inline">{step.label}</span>
              
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeStep"
                  className="absolute inset-0 rounded-full border-2 border-primary"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className={cn(
                "flex-1 h-0.5 mx-2 transition-colors",
                index < currentIndex ? "bg-primary/40" : "bg-border"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Simplified version for compact spaces
export function StepDots({
  steps,
  currentStep,
  className,
}: Pick<StepPillsProps, 'steps' | 'currentStep' | 'className'>) {
  const currentIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {steps.map((step, index) => {
        const isActive = index === currentIndex;
        const isPast = index < currentIndex;

        return (
          <motion.div
            key={step.id}
            className={cn(
              "rounded-full transition-all",
              isActive 
                ? "w-8 h-2 bg-primary" 
                : isPast 
                  ? "w-2 h-2 bg-primary/50" 
                  : "w-2 h-2 bg-muted-foreground/30"
            )}
            initial={false}
            animate={{ 
              scale: isActive ? 1 : 0.9,
              opacity: isActive ? 1 : isPast ? 0.7 : 0.4 
            }}
          />
        );
      })}
    </div>
  );
}
