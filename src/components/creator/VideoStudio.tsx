import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Upload, Loader2, ChevronRight, ChevronLeft, Check } from 'lucide-react';
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

const STEPS: { id: Step; label: string }[] = [
  { id: 'upload', label: 'Upload' },
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

  const [step, setStep] = useState<Step>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [videoDuration, setVideoDuration] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const generated: string[] = [];

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
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
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
    }
  };

  const currentStepIndex = STEPS.findIndex(s => s.id === step);

  const goToNextStep = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setStep(STEPS[currentStepIndex + 1].id);
    }
  };

  const goToPrevStep = () => {
    if (currentStepIndex > 0) {
      setStep(STEPS[currentStepIndex - 1].id);
    } else if (step === 'upload') {
      onBack();
    } else {
      setStep('upload');
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
      className="flex flex-col h-full max-h-[85vh]"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <button
          onClick={goToPrevStep}
          className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="font-semibold">
          {step === 'upload' ? 'Upload Video' : STEPS.find(s => s.id === step)?.label}
        </h2>
        <div className="w-12" />
      </div>

      {/* Step indicator */}
      {step !== 'upload' && (
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          {STEPS.slice(1).map((s, index) => (
            <div key={s.id} className="flex items-center flex-1">
              <button
                onClick={() => setStep(s.id)}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors",
                  step === s.id ? "text-primary" : "text-muted-foreground"
                )}
              >
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                  step === s.id 
                    ? "bg-primary text-primary-foreground" 
                    : currentStepIndex > index + 1 
                      ? "bg-primary/20 text-primary" 
                      : "bg-secondary text-muted-foreground"
                )}>
                  {currentStepIndex > index + 1 ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {index < STEPS.length - 2 && (
                <div className={cn(
                  "flex-1 h-0.5 mx-2 transition-colors",
                  currentStepIndex > index + 1 ? "bg-primary/40" : "bg-border"
                )} />
              )}
            </div>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-video max-w-[320px] rounded-2xl border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-3 text-muted-foreground hover:text-foreground"
            >
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                <Upload className="h-8 w-8" />
              </div>
              <div className="text-center">
                <span className="text-sm font-medium block">Drag and drop or click to upload</span>
                <span className="text-xs text-muted-foreground">MP4, MOV, WebM (max 500MB)</span>
              </div>
            </button>
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
                    <div className="flex items-center justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}

                {/* Video Preview */}
                <div className="aspect-video rounded-xl overflow-hidden bg-black">
                  <video
                    ref={videoRef}
                    src={previewUrl}
                    className="w-full h-full object-contain"
                    controls
                  />
                </div>

                {/* Thumbnail Selector */}
                <ThumbnailSelector
                  autoThumbnails={autoThumbnails}
                  selectedIndex={selectedThumbnailIndex}
                  customThumbnail={customThumbnail}
                  onSelectAuto={setSelectedThumbnailIndex}
                  onUploadCustom={setCustomThumbnail}
                />

                {/* Title */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Title <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="Add a compelling title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={100}
                  />
                  <span className="text-xs text-muted-foreground">{title.length}/100</span>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Tell viewers about your video. Use keywords for discoverability."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[100px] resize-none"
                    maxLength={5000}
                  />
                  <span className="text-xs text-muted-foreground">{description.length}/5000</span>
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
                {/* Chapters */}
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

            {/* Navigation */}
            <div className="p-4 border-t border-border flex gap-2">
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
              <VisibilitySettings
                visibility={visibility}
                onChange={setVisibility}
                scheduledDate={scheduledDate}
                onScheduledDateChange={setScheduledDate}
                commentsEnabled={commentsEnabled}
                onCommentsEnabledChange={setCommentsEnabled}
              />
            </ScrollArea>

            {/* Publish */}
            <div className="p-4 border-t border-border space-y-3">
              <div className="flex gap-2">
                <Button variant="outline" onClick={goToPrevStep} className="flex-1">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed() || isSubmitting}
                  className="flex-1 gradient-brand text-white"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : visibility === 'scheduled' ? (
                    'Schedule'
                  ) : (
                    'Publish'
                  )}
                </Button>
              </div>
              
              {visibility === 'scheduled' && scheduledDate && (
                <p className="text-xs text-center text-muted-foreground">
                  Will be published on {new Date(scheduledDate).toLocaleString()}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
