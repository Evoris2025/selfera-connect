import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { AnimatePresence, motion } from 'framer-motion';
import { PostComposer } from './PostComposer';
import { ImageStudio } from './ImageStudio';
import { VideoStudio } from './VideoStudio';
import { ExpressionCreator } from './ExpressionCreator';
import { ContentTypeDashboard, ContentType } from './ContentTypeDashboard';

interface CreatorStudioProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode?: ContentType;
}

export function CreatorStudio({ open, onOpenChange, initialMode }: CreatorStudioProps) {
  const [selectedType, setSelectedType] = useState<ContentType | null>(null);
  const [step, setStep] = useState<'dashboard' | 'canvas'>('dashboard');

  // Reset state when dialog opens - ALWAYS show dashboard first unless initialMode is explicitly set
  useEffect(() => {
    if (open) {
      if (initialMode) {
        // Only skip dashboard if initialMode is explicitly passed (e.g., from ExpressionsRow)
        setSelectedType(initialMode);
        setStep('canvas');
      } else {
        // Always show dashboard when no initialMode
        setSelectedType(null);
        setStep('dashboard');
      }
    }
  }, [open, initialMode]);

  const handleClose = () => {
    setSelectedType(null);
    setStep('dashboard');
    onOpenChange(false);
  };

  const handleBack = () => {
    if (step === 'canvas') {
      setStep('dashboard');
      setSelectedType(null);
    }
  };

  const handleTypeSelect = (type: ContentType) => {
    setSelectedType(type);
    setStep('canvas');
  };

  const handleSuccess = () => {
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed inset-0 sm:inset-auto sm:left-[50%] sm:top-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] w-full h-full sm:w-[90vw] sm:max-w-2xl sm:h-[90vh] sm:max-h-[800px] p-0 gap-0 bg-background border-none sm:border sm:border-border overflow-hidden">
        {/* Accessibility: Hidden title for screen readers */}
        <VisuallyHidden>
          <DialogTitle>ERA Studio - Create Content</DialogTitle>
        </VisuallyHidden>
        
        <AnimatePresence mode="wait">
          {step === 'dashboard' ? (
            <ContentTypeDashboard
              key="dashboard"
              onSelect={handleTypeSelect}
              onClose={handleClose}
            />
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