import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Upload, Loader2, Play, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { TopicTagSelector } from './shared/TopicTagSelector';
import { ContentWarningToggle } from './shared/ContentWarningToggle';
import { cn } from '@/lib/utils';

type Step = 'upload' | 'details' | 'review';
type ContentWarningType = 'sensitive' | 'triggering' | 'graphic' | 'other' | null;

interface VideoStudioProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function VideoStudio({ onBack, onSuccess }: VideoStudioProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [step, setStep] = useState<Step>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [selectedThumbnail, setSelectedThumbnail] = useState(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [contentWarning, setContentWarning] = useState(false);
  const [contentWarningType, setContentWarningType] = useState<ContentWarningType>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateThumbnails = useCallback((videoUrl: string) => {
    const video = document.createElement('video');
    video.src = videoUrl;
    video.crossOrigin = 'anonymous';
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      const duration = video.duration;
      const times = [duration * 0.25, duration * 0.5, duration * 0.75];
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
        setThumbnails(frames);
      });
    };
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select a video under 100MB.',
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
      if (file.size > 100 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select a video under 100MB.',
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

  const handleSubmit = async () => {
    if (!user || !selectedFile || !title.trim() || selectedTags.length === 0) return;

    setIsSubmitting(true);
    setIsUploading(true);

    try {
      // Upload video
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Simulate upload progress
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

      // Create post
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
          author_id: user.id,
          content: `${title}\n\n${description}`.trim(),
          visibility: 'public',
          media_url: urlData.publicUrl,
          media_type: 'video',
          thumbnail_url: thumbnails[selectedThumbnail] || null,
          content_warning_enabled: contentWarning,
          content_warning_type: contentWarning ? contentWarningType : null,
          media_meta: {
            title,
            description,
          },
        })
        .select()
        .single();

      if (postError) throw postError;

      // Add tags
      if (post) {
        const tagMappings = selectedTags.map((tagId) => ({
          post_id: post.id,
          tag_id: tagId,
        }));

        await supabase.from('post_tag_map').insert(tagMappings);
      }

      toast({
        title: 'Video uploaded!',
        description: 'Your video has been shared.',
      });

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

  const canSubmit = title.trim().length > 0 && selectedTags.length > 0;

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
          onClick={step === 'upload' ? onBack : () => setStep('upload')}
          className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="font-semibold">
          {step === 'upload' ? 'Upload Video' : step === 'details' ? 'Video Details' : 'Review'}
        </h2>
        {step === 'details' ? (
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className="gradient-brand text-white"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Upload'}
          </Button>
        ) : (
          <div className="w-12" />
        )}
      </div>

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
                <span className="text-xs text-muted-foreground">MP4, MOV, WebM (max 100MB)</span>
              </div>
            </button>
          </motion.div>
        )}

        {step === 'details' && (
          <motion.div
            key="details"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-y-auto p-4 space-y-4"
          >
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

            {/* Thumbnails */}
            {thumbnails.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Thumbnail</label>
                <div className="flex gap-2">
                  {thumbnails.map((thumb, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedThumbnail(index)}
                      className={cn(
                        'flex-1 aspect-video rounded-lg overflow-hidden border-2',
                        selectedThumbnail === index ? 'border-primary' : 'border-transparent'
                      )}
                    >
                      <img src={thumb} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Title <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="Add a title"
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
                placeholder="Tell viewers about your video"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[80px] resize-none"
              />
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
