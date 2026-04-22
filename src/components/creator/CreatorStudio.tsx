import { useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { AnimatePresence, motion } from 'framer-motion';
import { PostComposer } from './PostComposer';
import { ImageStudio } from './ImageStudio';
import { VideoStudio } from './VideoStudio';
import { ExpressionCreator } from './ExpressionCreator';
import { ContentTypeDashboard, ContentType } from './ContentTypeDashboard';
import { useStudioStep } from '@/hooks/useStudioStep';

interface CreatorStudioProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode?: ContentType;
}

export function CreatorStudio({ open, onOpenChange, initialMode }: CreatorStudioProps) {
  const studio = useStudioStep({
    initialStep: initialMode ?? 'dashboard',
    onClose: () => onOpenChange(false),
    onSuccess: () => onOpenChange(false),
  });

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      studio.setStep(initialMode ?? 'dashboard');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialMode]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed inset-0 sm:inset-auto sm:left-[50%] sm:top-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] w-full h-full sm:w-[90vw] sm:max-w-2xl sm:h-[90vh] sm:max-h-[800px] p-0 gap-0 bg-background border-none sm:border sm:border-border overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>ERA Studio - Create Content</DialogTitle>
        </VisuallyHidden>

        <AnimatePresence mode="wait">
          {studio.isDashboard ? (
            <ContentTypeDashboard
              key="dashboard"
              onSelect={studio.select}
              onClose={studio.close}
            />
          ) : (
            <motion.div
              key="canvas"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              {studio.step === 'post' ? (
                <PostComposer onBack={studio.back} onSuccess={studio.success} />
              ) : studio.step === 'image' ? (
                <ImageStudio onBack={studio.back} onSuccess={studio.success} />
              ) : studio.step === 'video' ? (
                <VideoStudio onBack={studio.back} onSuccess={studio.success} />
              ) : studio.step === 'expression' ? (
                <ExpressionCreator onBack={studio.back} onSuccess={studio.success} />
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
