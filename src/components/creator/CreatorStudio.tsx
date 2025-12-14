import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, ArrowLeft, Sparkles, Share2, BookOpen, PenLine, Heart, Anchor, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PostComposer } from './PostComposer';
import { ImageStudio } from './ImageStudio';
import { VideoStudio } from './VideoStudio';
import { ExpressionCreator } from './ExpressionCreator';

type ContentType = 'expression' | 'post' | 'image' | 'video' | null;
type IntentType = 'express' | 'share' | 'teach' | 'reflect' | null;
type ToneType = 'gentle' | 'neutral' | 'uplifting';

interface CreatorStudioProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode?: ContentType;
}

const intents = [
  {
    id: 'express' as const,
    icon: Sparkles,
    title: 'Express',
    subtitle: 'Share a moment or feeling',
    description: 'Create short-form content to capture how you feel right now.',
    gradient: 'from-pink-500/20 to-rose-500/20',
    borderColor: 'border-rose-500/30',
    iconColor: 'text-rose-400',
  },
  {
    id: 'share' as const,
    icon: Share2,
    title: 'Share',
    subtitle: 'Post an update or story',
    description: 'Share thoughts, images, or videos with your community.',
    gradient: 'from-blue-500/20 to-primary/20',
    borderColor: 'border-primary/30',
    iconColor: 'text-primary',
  },
  {
    id: 'teach' as const,
    icon: BookOpen,
    title: 'Teach',
    subtitle: 'Share knowledge or tips',
    description: "Help others by sharing what you've learned on your journey.",
    gradient: 'from-emerald-500/20 to-teal-500/20',
    borderColor: 'border-emerald-500/30',
    iconColor: 'text-emerald-400',
  },
  {
    id: 'reflect' as const,
    icon: PenLine,
    title: 'Reflect',
    subtitle: 'Write about your journey',
    description: 'Take time to process and share your thoughts reflectively.',
    gradient: 'from-purple-500/20 to-accent/20',
    borderColor: 'border-accent/30',
    iconColor: 'text-accent',
  },
];

const tones = [
  { id: 'gentle' as const, label: 'Gentle', icon: Heart, color: 'text-rose-400 bg-rose-500/20' },
  { id: 'neutral' as const, label: 'Neutral', icon: Anchor, color: 'text-sky-400 bg-sky-500/20' },
  { id: 'uplifting' as const, label: 'Uplifting', icon: TrendingUp, color: 'text-emerald-400 bg-emerald-500/20' },
];

export function CreatorStudio({ open, onOpenChange, initialMode }: CreatorStudioProps) {
  const { t } = useTranslation();
  const [selectedIntent, setSelectedIntent] = useState<IntentType>(null);
  const [selectedTone, setSelectedTone] = useState<ToneType>('neutral');
  const [selectedType, setSelectedType] = useState<ContentType>(initialMode || null);
  const [step, setStep] = useState<'intent' | 'canvas'>('intent');

  useEffect(() => {
    if (initialMode) {
      setSelectedType(initialMode);
      setStep('canvas');
      // Map initial mode to intent
      if (initialMode === 'expression') setSelectedIntent('express');
      else if (initialMode === 'post') setSelectedIntent('share');
      else if (initialMode === 'image') setSelectedIntent('share');
      else if (initialMode === 'video') setSelectedIntent('teach');
    }
  }, [initialMode]);

  const handleClose = () => {
    setSelectedIntent(null);
    setSelectedType(null);
    setStep('intent');
    onOpenChange(false);
  };

  const handleBack = () => {
    if (step === 'canvas') {
      setStep('intent');
      setSelectedType(null);
    }
  };

  const handleIntentSelect = (intent: IntentType) => {
    setSelectedIntent(intent);
    // Map intent to content type
    if (intent === 'express') setSelectedType('expression');
    else if (intent === 'share') setSelectedType('post');
    else if (intent === 'teach') setSelectedType('video');
    else if (intent === 'reflect') setSelectedType('post');
    setStep('canvas');
  };

  const handleSuccess = () => {
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full sm:max-w-2xl h-[100dvh] sm:h-[90vh] p-0 gap-0 bg-background border-none sm:border sm:border-border overflow-hidden sm:rounded-2xl">
        <AnimatePresence mode="wait">
          {step === 'intent' ? (
            <motion.div
              key="intent-selector"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col h-full"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Studio</h2>
                  <p className="text-sm text-muted-foreground">What would you like to create?</p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-full hover:bg-secondary transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Intent Selector */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                    Choose your intent
                  </p>
                  <div className="grid gap-3">
                    {intents.map((intent) => (
                      <button
                        key={intent.id}
                        onClick={() => handleIntentSelect(intent.id)}
                        className={cn(
                          'group relative flex items-start gap-4 p-5 rounded-2xl border transition-all duration-200',
                          'bg-gradient-to-r hover:scale-[1.01] active:scale-[0.99]',
                          intent.gradient,
                          intent.borderColor,
                          'hover:border-opacity-60'
                        )}
                      >
                        <div className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                          'bg-background/50'
                        )}>
                          <intent.icon className={cn('h-6 w-6', intent.iconColor)} />
                        </div>
                        <div className="text-left flex-1">
                          <span className="font-semibold text-foreground block">{intent.title}</span>
                          <span className="text-sm text-muted-foreground">{intent.subtitle}</span>
                          <p className="text-xs text-muted-foreground/70 mt-1 leading-relaxed">
                            {intent.description}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tone Selection */}
                <div className="space-y-3 pt-2">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                    Set the tone
                  </p>
                  <div className="flex gap-2">
                    {tones.map((tone) => (
                      <button
                        key={tone.id}
                        onClick={() => setSelectedTone(tone.id)}
                        className={cn(
                          'flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all',
                          selectedTone === tone.id
                            ? cn(tone.color, 'border-current')
                            : 'bg-card/50 border-border/50 hover:border-border'
                        )}
                      >
                        <tone.icon className={cn('h-4 w-4', selectedTone === tone.id ? '' : 'text-muted-foreground')} />
                        <span className={cn(
                          'text-sm font-medium',
                          selectedTone === tone.id ? 'text-foreground' : 'text-muted-foreground'
                        )}>
                          {tone.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reflective Quote */}
              <div className="p-4 border-t border-border bg-card/30">
                <p className="text-center text-sm text-muted-foreground italic">
                  "Take your time. There's no rush to share."
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="canvas"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              {selectedType === 'post' ? (
                <PostComposer
                  onBack={handleBack}
                  onSuccess={handleSuccess}
                  intent={selectedIntent}
                  tone={selectedTone}
                />
              ) : selectedType === 'image' ? (
                <ImageStudio
                  onBack={handleBack}
                  onSuccess={handleSuccess}
                />
              ) : selectedType === 'video' ? (
                <VideoStudio
                  onBack={handleBack}
                  onSuccess={handleSuccess}
                />
              ) : (
                <ExpressionCreator
                  onBack={handleBack}
                  onSuccess={handleSuccess}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}