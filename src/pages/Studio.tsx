import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ContentTypeDashboard, ContentType } from '@/components/creator/ContentTypeDashboard';
import { ExpressionCreator } from '@/components/creator/ExpressionCreator';
import { VideoStudio } from '@/components/creator/VideoStudio';
import { ImageStudio } from '@/components/creator/ImageStudio';
import { PostComposer } from '@/components/creator/PostComposer';
import { useStudioStep } from '@/hooks/useStudioStep';
import { useScheduler } from '@/hooks/useScheduler';

// Map deep-link slug -> internal ContentType
const SLUG_TO_TYPE: Record<string, ContentType> = {
  expression: 'expression',
  video: 'video',
  photo: 'image',
  image: 'image',
  post: 'post',
};

export default function Studio() {
  const navigate = useNavigate();
  const { type: typeParam } = useParams<{ type?: string }>();

  // Drives any due scheduled posts while the studio is mounted
  useScheduler();

  const studio = useStudioStep({
    initialStep: typeParam && SLUG_TO_TYPE[typeParam] ? SLUG_TO_TYPE[typeParam] : 'dashboard',
    onClose: () => navigate(-1),
    onSuccess: () => navigate('/feed'),
  });

  // Sync URL <-> step when navigating between dashboard and a creator
  useEffect(() => {
    if (typeParam && SLUG_TO_TYPE[typeParam]) {
      studio.setStep(SLUG_TO_TYPE[typeParam]);
    } else if (!typeParam) {
      studio.setStep('dashboard');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeParam]);

  const handleSelect = (type: ContentType) => {
    const slug = type === 'image' ? 'photo' : type;
    navigate(`/studio/${slug}`);
  };

  const handleBack = () => navigate('/studio');

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <div
        className={`w-full min-h-dvh ${
          studio.step === 'post' ? 'flex flex-col' : 'max-w-lg md:max-w-full lg:max-w-2xl mx-auto'
        }`}
      >
        <AnimatePresence mode="wait">
          {studio.isDashboard && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full min-h-dvh"
            >
              <ContentTypeDashboard onSelect={handleSelect} onClose={studio.close} />
            </motion.div>
          )}

          {studio.step === 'expression' && (
            <motion.div
              key="expression"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full min-h-dvh"
            >
              <ExpressionCreator onBack={handleBack} onSuccess={studio.success} />
            </motion.div>
          )}

          {studio.step === 'video' && (
            <motion.div
              key="video"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full min-h-dvh"
            >
              <VideoStudio onBack={handleBack} onSuccess={studio.success} />
            </motion.div>
          )}

          {studio.step === 'image' && (
            <motion.div
              key="image"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full min-h-dvh"
            >
              <ImageStudio onBack={handleBack} onSuccess={studio.success} />
            </motion.div>
          )}

          {studio.step === 'post' && (
            <motion.div
              key="post"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="min-h-dvh flex flex-col"
            >
              <div className="mx-auto w-full max-w-[720px] flex-1 flex flex-col min-h-0">
                <PostComposer onBack={handleBack} onSuccess={studio.success} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
