import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
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
  const [selectedType, setSelectedType] = useState<ContentType | null>(initialMode || null);
  const [step, setStep] = useState<'dashboard' | 'canvas'>('dashboard');

  useEffect(() => {
    if (initialMode) {
      setSelectedType(initialMode);
      setStep('canvas');
    }
  }, [initialMode]);

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
      <DialogContent className="max-w-full sm:max-w-2xl h-[100dvh] sm:h-[90vh] p-0 gap-0 bg-background border-none sm:border sm:border-border overflow-hidden sm:rounded-2xl">
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