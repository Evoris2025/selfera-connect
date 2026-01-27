import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ContentTypeDashboard, ContentType } from '@/components/creator/ContentTypeDashboard';
import { ExpressionCreator } from '@/components/creator/ExpressionCreator';
import { VideoStudio } from '@/components/creator/VideoStudio';
import { ImageStudio } from '@/components/creator/ImageStudio';
import { PostComposer } from '@/components/creator/PostComposer';

type StudioStep = 'dashboard' | ContentType;

export default function Studio() {
  const navigate = useNavigate();
  const [step, setStep] = useState<StudioStep>('dashboard');

  const handleClose = () => {
    navigate(-1);
  };

  const handleSelect = (type: ContentType) => {
    setStep(type);
  };

  const handleBack = () => {
    setStep('dashboard');
  };

  const handleSuccess = () => {
    navigate('/feed');
  };

  return (
    <div className="fixed inset-0 z-50 bg-background">
      <AnimatePresence mode="wait">
        {step === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full"
          >
            <ContentTypeDashboard onSelect={handleSelect} onClose={handleClose} />
          </motion.div>
        )}

        {step === 'expression' && (
          <motion.div
            key="expression"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full"
          >
            <ExpressionCreator onBack={handleBack} onSuccess={handleSuccess} />
          </motion.div>
        )}

        {step === 'video' && (
          <motion.div
            key="video"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full"
          >
            <VideoStudio onBack={handleBack} onSuccess={handleSuccess} />
          </motion.div>
        )}

        {step === 'image' && (
          <motion.div
            key="image"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full"
          >
            <ImageStudio onBack={handleBack} onSuccess={handleSuccess} />
          </motion.div>
        )}

        {step === 'post' && (
          <motion.div
            key="post"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full"
          >
            <PostComposer onBack={handleBack} onSuccess={handleSuccess} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
