import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Anchor, Sparkles, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export type EmotionalState = 'support' | 'steady' | 'inspiration' | 'progress' | null;

interface EmotionalContextBarProps {
  selectedState: EmotionalState;
  onStateChange: (state: EmotionalState) => void;
}

const emotionalStates = [
  {
    id: 'support' as const,
    icon: Heart,
    label: 'Need support',
    color: 'text-rose-400',
    bgActive: 'bg-rose-500/20 border-rose-500/40',
    gradient: 'from-rose-500/10 to-rose-500/5',
  },
  {
    id: 'steady' as const,
    icon: Anchor,
    label: 'Feeling steady',
    color: 'text-sky-400',
    bgActive: 'bg-sky-500/20 border-sky-500/40',
    gradient: 'from-sky-500/10 to-sky-500/5',
  },
  {
    id: 'inspiration' as const,
    icon: Sparkles,
    label: 'Want inspiration',
    color: 'text-amber-400',
    bgActive: 'bg-amber-500/20 border-amber-500/40',
    gradient: 'from-amber-500/10 to-amber-500/5',
  },
  {
    id: 'progress' as const,
    icon: TrendingUp,
    label: 'Sharing progress',
    color: 'text-emerald-400',
    bgActive: 'bg-emerald-500/20 border-emerald-500/40',
    gradient: 'from-emerald-500/10 to-emerald-500/5',
  },
];

export function EmotionalContextBar({ selectedState, onStateChange }: EmotionalContextBarProps) {
  const { t } = useTranslation();

  const handleStateClick = (stateId: EmotionalState) => {
    if (selectedState === stateId) {
      onStateChange(null); // Deselect if already selected
    } else {
      onStateChange(stateId);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-muted-foreground">How are you feeling?</p>
        {selectedState && (
          <button 
            onClick={() => onStateChange(null)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Show all
          </button>
        )}
      </div>

      {/* Emotional State Selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {emotionalStates.map((state) => {
          const Icon = state.icon;
          const isSelected = selectedState === state.id;

          return (
            <motion.button
              key={state.id}
              onClick={() => handleStateClick(state.id)}
              whileTap={{ scale: 0.97 }}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all duration-200 whitespace-nowrap flex-shrink-0',
                isSelected
                  ? cn(state.bgActive, 'border-current')
                  : 'bg-card/50 border-border/50 hover:border-border hover:bg-card'
              )}
            >
              <Icon className={cn('h-4 w-4', isSelected ? state.color : 'text-muted-foreground')} />
              <span className={cn(
                'text-sm font-medium',
                isSelected ? 'text-foreground' : 'text-muted-foreground'
              )}>
                {state.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Active State Indicator */}
      <AnimatePresence>
        {selectedState && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className={cn(
              'px-4 py-3 rounded-xl bg-gradient-to-r border border-border/30',
              emotionalStates.find(s => s.id === selectedState)?.gradient
            )}>
              <p className="text-sm text-foreground/80">
                {selectedState === 'support' && 'Showing posts from people who understand and want to help.'}
                {selectedState === 'steady' && 'Showing grounding content for when you need stability.'}
                {selectedState === 'inspiration' && 'Showing uplifting stories and motivational content.'}
                {selectedState === 'progress' && 'Showing recovery journeys and milestone celebrations.'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}