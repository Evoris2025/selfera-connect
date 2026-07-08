import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Upload, Loader2, ChevronRight, ChevronLeft, Check, Sparkles, Play, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useFeedData } from '@/contexts/FeedDataContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { TopicTagSelector } from './shared/TopicTagSelector';
import { ContentWarningToggle } from './shared/ContentWarningToggle';
import { CreatorScreenHeader } from './CreatorScreenHeader';
import { StepPills, StepDots, StepConfig } from './shared/StepPills';
import { 
  ChapterEditor, 
  Chapter,
  ThumbnailSelector,
  VisibilitySettings,
  VisibilityOption,
  EndScreenEditor,
  EndScreenElement,
} from './video';
import { cn } from '@/lib/utils';

// Simulation mode flag
const SIMULATION_MODE = true;

type Step = 'upload' | 'details' | 'elements' | 'visibility';
type ContentWarningType = 'sensitive' | 'triggering' | 'graphic' | 'other' | null;

interface VideoStudioProps {
  onBack: () => void;
  onSuccess: () => void;
}

const STEPS: StepConfig[] = [
  { id: 'details', label: 'Details' },
  { id: 'elements', label: 'Elements' },
  { id: 'visibility', label: 'Visibility' },
];

export function VideoStudio({ onBack, onSuccess }: VideoStudioProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { createPost, isSimulationMode } = useFeedData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState<Step>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [videoDuration, setVideoDuration] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Details step
  const [autoThumbnails, setAutoThumbnails] = useState<string[]>([]);
  const [selectedThumbnailIndex, setSelectedThumbnailIndex] = useState<number | null>(0);
  const [customThumbnail, setCustomThumbnail] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [contentWarning, setContentWarning] = useState(false);
  const [contentWarningType, setContentWarningType] = useState<ContentWarningType>(null);

  // Elements step
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [endScreenElements, setEndScreenElements] = useState<EndScreenElement[]>([]);

  // Visibility step
  const [visibility, setVisibility] = useState<VisibilityOption>('public');
  const [scheduledDate, setScheduledDate] = useState('');
  const [commentsEnabled, setCommentsEnabled] = useState(true);

  const generateThumbnails = useCallback((videoUrl: string) => {
    const video = document.createElement('video');
    video.src = videoUrl;
    video.crossOrigin = 'anonymous';
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      const duration = video.duration;
      setVideoDuration(duration);
      const times = [duration * 0.1, duration * 0.25, duration * 0.5, duration * 0.75, duration * 0.9];

      const captureFrame = (time: number): Promise<string> => {
        return new Promise((resolve) => {
          video.currentTime = time;
          video.onseeked = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(video, 0, 0);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
          };
        });
      };

      Promise.all(times.map(captureFrame)).then((frames) => {
        setAutoThumbnails(frames);
      });
    };
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processVideoFile(file);
    }
  };

  const processVideoFile = (file: File) => {
    if (file.size > 500 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select a video under 500MB.',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    generateThumbnails(url);
    setStep('details');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      processVideoFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const currentStepIndex = STEPS.findIndex(s => s.id === step);
  const completedSteps = STEPS.slice(0, currentStepIndex).map(s => s.id);

  const goToNextStep = () => {
    const allSteps: Step[] = ['upload', 'details', 'elements', 'visibility'];
    const currentIndex = allSteps.indexOf(step);
    if (currentIndex < allSteps.length - 1) {
      setStep(allSteps[currentIndex + 1]);
    }
  };

  const goToPrevStep = () => {
    const allSteps: Step[] = ['upload', 'details', 'elements', 'visibility'];
    const currentIndex = allSteps.indexOf(step);
    if (currentIndex > 0) {
      setStep(allSteps[currentIndex - 1]);
    } else {
      onBack();
    }
  };

  const canProceed = () => {
    switch (step) {
      case 'details':
        return title.trim().length > 0 && selectedTags.length > 0;
      case 'elements':
        return true; // Optional
      case 'visibility':
        return visibility !== 'scheduled' || scheduledDate.length > 0;
      default:
        return false;
    }
  };

  const getThumbnailUrl = () => {
    if (customThumbnail) return customThumbnail;
    if (selectedThumbnailIndex !== null && autoThumbnails[selectedThumbnailIndex]) {
      return autoThumbnails[selectedThumbnailIndex];
    }
    return autoThumbnails[0] || undefined;
  };

  const handleSubmit = async () => {
    if (!selectedFile || !title.trim() || selectedTags.length === 0) return;

    setIsSubmitting(true);
    setIsUploading(true);

    try {
      if (SIMULATION_MODE || isSimulationMode) {
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 15, 100));
        }, 100);

        await new Promise(resolve => setTimeout(resolve, 800));
        clearInterval(progressInterval);
        setUploadProgress(100);

        const displayName = user?.email?.split('@')[0] || 'You';

        createPost({
          authorId: user?.id || `sim-user-${Date.now()}`,
          author: {
            name: displayName,
            handle: displayName.toLowerCase().replace(/\s+/g, ''),
            avatar: '',
            isVerified: false,
            email: user?.email,
          },
          content: `${title}\n\n${description}`.trim(),
          tags: selectedTags,
          contentType: 'video',
          media: { 
            type: 'video', 
            url: previewUrl,
            thumbnail: getThumbnailUrl(),
          },
        });

        toast({
          title: visibility === 'scheduled' ? 'Video scheduled!' : 'Video uploaded!',
          description: visibility === 'scheduled' 
            ? `Your video will be published on ${new Date(scheduledDate).toLocaleString()}`
            : 'Your video is now live in the feed.',
        });

        onSuccess();
        return;
      }

      // Real Supabase mode
      if (!user) return;

      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, selectedFile);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(fileName);

      const insertData = {
        author_id: user.id,
        content: `${title}\n\n${description}`.trim(),
        visibility: visibility === 'scheduled' ? 'private' : visibility,
        media_url: urlData.publicUrl,
        media_type: 'video',
        thumbnail_url: getThumbnailUrl() || null,
        content_warning_enabled: contentWarning,
        content_warning_type: contentWarning ? contentWarningType : null,
        media_meta: JSON.parse(JSON.stringify({
          title,
          description,
          chapters,
          endScreenElements,
          scheduledDate: visibility === 'scheduled' ? scheduledDate : null,
          commentsEnabled,
        })),
      };

      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert([insertData])
        .select()
        .single();

      if (postError) throw postError;

      if (post) {
        const tagMappings = selectedTags.map((tagId) => ({
          post_id: post.id,
          tag_id: tagId,
        }));
        await supabase.from('post_tag_map').insert(tagMappings);
      }

      onSuccess();
    } catch (error) {
      console.error('Error uploading video:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload video. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full min-h-dvh bg-background"
    >
      <CreatorScreenHeader type="video" onBack={goToPrevStep} onClose={onBack} showAudience={false} />

      {/* YouTube-style Step Pills */}
      {step !== 'upload' && (
        <StepPills
          steps={STEPS}
          currentStep={step}
          completedSteps={completedSteps}
          onStepClick={(stepId) => setStep(stepId as Step)}
          className="border-b border-border"
        />
      )}

      <AnimatePresence mode="wait">
        {step === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
              <motion.button
                onClick={() => fileInputRef.current?.click()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{ scale: isDragOver ? 1.08 : 1 }}
                className="w-32 h-32 rounded-full gradient-brand flex items-center justify-center shadow-lg"
              >
                <Upload className="h-12 w-12 text-white" />
              </motion.button>
              <span className="text-body text-white/70">
                {isDragOver ? 'Drop video here' : 'Tap to upload video'}
              </span>

              <div className="flex items-center gap-4 w-full max-w-[200px]">
                <div className="h-px flex-1 bg-white/20" />
                <span className="text-label text-white/50">or</span>
                <div className="h-px flex-1 bg-white/20" />
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
              >
                <Upload className="h-5 w-5" />
                <span>Choose from files</span>
              </button>

              <p className="text-label text-white/50 text-center max-w-[240px]">
                MP4, MOV or WebM up to 500MB. AI will generate thumbnails automatically.
              </p>
            </div>
          </motion.div>
        )}

        {step === 'details' && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-5">
                {/* Upload Progress */}
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-body">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}

                {/* Video Preview - Larger */}
                <div className="aspect-video rounded-xl overflow-hidden bg-black shadow-lg">
                  <video
                    ref={videoRef}
                    src={previewUrl}
                    className="w-full h-full object-contain"
                    controls
                  />
                </div>

                {/* Thumbnail Selector - Enhanced */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-body font-medium">Thumbnail</label>
                    <button className="flex items-center gap-1 text-label text-primary hover:underline">
                      <Sparkles className="h-3 w-3" />
                      Generate with AI
                    </button>
                  </div>
                  <ThumbnailSelector
                    autoThumbnails={autoThumbnails}
                    selectedIndex={selectedThumbnailIndex}
                    customThumbnail={customThumbnail}
                    onSelectAuto={setSelectedThumbnailIndex}
                    onUploadCustom={setCustomThumbnail}
                  />
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <label className="text-body font-medium">
                    Title <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="Add a compelling title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={100}
                    className="text-title"
                  />
                  <span className="text-label text-muted-foreground">{title.length}/100</span>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-body font-medium">Description</label>
                  <Textarea
                    placeholder="Tell viewers about your video. Use keywords for discoverability."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[100px] resize-none"
                    maxLength={5000}
                  />
                  <span className="text-label text-muted-foreground">{description.length}/5000</span>
                </div>

                {/* Topic Tags */}
                <TopicTagSelector
                  selectedTags={selectedTags}
                  onTagsChange={setSelectedTags}
                />

                {/* Content Warning */}
                <ContentWarningToggle
                  enabled={contentWarning}
                  onEnabledChange={setContentWarning}
                  warningType={contentWarningType}
                  onWarningTypeChange={setContentWarningType}
                />
              </div>
            </ScrollArea>

            {/* Next button */}
            <div className="p-4 border-t border-border">
              <Button
                onClick={goToNextStep}
                disabled={!canProceed()}
                className="w-full"
              >
                Next: Add Elements
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'elements' && (
          <motion.div
            key="elements"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-6">
                {/* Video timeline preview */}
                <div className="aspect-video rounded-xl overflow-hidden bg-black/50 relative">
                  <video
                    src={previewUrl}
                    className="w-full h-full object-contain opacity-50"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-body text-white/70">Add chapters and end screen elements</p>
                  </div>
                </div>

                {/* Chapters - Collapsible */}
                <ChapterEditor
                  chapters={chapters}
                  onChange={setChapters}
                  videoDuration={videoDuration}
                />

                {/* End Screen */}
                <EndScreenEditor
                  elements={endScreenElements}
                  onChange={setEndScreenElements}
                  videoDuration={videoDuration}
                />
              </div>
            </ScrollArea>

            {/* Navigation buttons */}
            <div className="flex gap-3 p-4 border-t border-border">
              <Button variant="outline" onClick={goToPrevStep} className="flex-1">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={goToNextStep} className="flex-1">
                Next: Visibility
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'visibility' && (
          <motion.div
            key="visibility"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-6">
                <VisibilitySettings
                  visibility={visibility}
                  onChange={setVisibility}
                  scheduledDate={scheduledDate}
                  onScheduledDateChange={setScheduledDate}
                  commentsEnabled={commentsEnabled}
                  onCommentsEnabledChange={setCommentsEnabled}
                />
              </div>
            </ScrollArea>

            {/* Publish button */}
            <div className="flex gap-3 p-4 border-t border-border">
              <Button variant="outline" onClick={goToPrevStep} className="flex-1">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || isSubmitting}
                className="flex-1 gradient-brand"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : visibility === 'scheduled' ? (
                  <>Schedule</>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Publish
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile step indicator */}
      {step !== 'upload' && (
        <div className="sm:hidden py-3 border-t border-border">
          <StepDots steps={STEPS} currentStep={step} />
        </div>
      )}
    </motion.div>
  );
}
