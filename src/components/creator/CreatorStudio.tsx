import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Sparkles, MessageSquare, Image, Video } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { PostComposer } from './PostComposer';
import { ImageStudio } from './ImageStudio';
import { VideoStudio } from './VideoStudio';
import { ExpressionCreator } from './ExpressionCreator';

type ContentType = 'expression' | 'post' | 'image' | 'video' | null;

interface CreatorStudioProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode?: ContentType;
}

const contentTypes = [
  {
    type: 'expression' as const,
    icon: Sparkles,
    title: 'Expression',
    subtitle: 'Share a moment',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    type: 'post' as const,
    icon: MessageSquare,
    title: 'Post',
    subtitle: "What's on your mind?",
    gradient: 'from-blue-500 to-primary',
  },
  {
    type: 'image' as const,
    icon: Image,
    title: 'Image',
    subtitle: 'Share photos',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    type: 'video' as const,
    icon: Video,
    title: 'Video',
    subtitle: 'Upload a video',
    gradient: 'from-purple-500 to-accent',
  },
];

export function CreatorStudio({ open, onOpenChange, initialMode }: CreatorStudioProps) {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState<ContentType>(initialMode || null);

  const handleClose = () => {
    setSelectedType(null);
    onOpenChange(false);
  };

  const handleBack = () => {
    setSelectedType(null);
  };

  const handleSuccess = () => {
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 bg-background border-border overflow-hidden max-h-[90vh]">
        <AnimatePresence mode="wait">
          {!selectedType ? (
            <motion.div
              key="selector"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Create</h2>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-full hover:bg-secondary transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content Type Grid */}
              <div className="grid grid-cols-2 gap-3">
                {contentTypes.map((item) => (
                  <button
                    key={item.type}
                    onClick={() => setSelectedType(item.type)}
                    className="group relative flex flex-col items-center justify-center p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                    >
                      <item.icon className="h-7 w-7 text-white" />
                    </div>
                    <span className="font-medium text-foreground">{item.title}</span>
                    <span className="text-xs text-muted-foreground mt-1">{item.subtitle}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : selectedType === 'post' ? (
            <PostComposer
              key="post"
              onBack={handleBack}
              onSuccess={handleSuccess}
            />
          ) : selectedType === 'image' ? (
            <ImageStudio
              key="image"
              onBack={handleBack}
              onSuccess={handleSuccess}
            />
          ) : selectedType === 'video' ? (
            <VideoStudio
              key="video"
              onBack={handleBack}
              onSuccess={handleSuccess}
            />
          ) : (
            <ExpressionCreator
              key="expression"
              onBack={handleBack}
              onSuccess={handleSuccess}
            />
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
