import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, X, Check, Loader2, RotateCcw, Sun, Contrast } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/contexts/AuthContext';
import { useFeedData } from '@/contexts/FeedDataContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { TopicTagSelector } from './shared/TopicTagSelector';
import { ContentWarningToggle } from './shared/ContentWarningToggle';
import { cn } from '@/lib/utils';

// Simulation mode flag - when true, uses FeedDataContext instead of Supabase
const SIMULATION_MODE = true;

type Step = 'select' | 'edit' | 'share';
type ContentWarningType = 'sensitive' | 'triggering' | 'graphic' | 'other' | null;

interface ImageStudioProps {
  onBack: () => void;
  onSuccess: () => void;
}

const filters = [
  { name: 'Original', class: '' },
  { name: 'Warm', class: 'sepia-[0.3] saturate-[1.2]' },
  { name: 'Cool', class: 'hue-rotate-[20deg] saturate-[0.9]' },
  { name: 'Fade', class: 'brightness-[1.1] contrast-[0.9] saturate-[0.8]' },
  { name: 'Vivid', class: 'saturate-[1.4] contrast-[1.1]' },
  { name: 'Mono', class: 'grayscale' },
];

export function ImageStudio({ onBack, onSuccess }: ImageStudioProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { createPost, isSimulationMode } = useFeedData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>('select');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [caption, setCaption] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [contentWarning, setContentWarning] = useState(false);
  const [contentWarningType, setContentWarningType] = useState<ContentWarningType>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setStep('edit');
    }
  };

  const getFilterStyle = () => {
    return {
      filter: `brightness(${brightness}%) contrast(${contrast}%)`,
    };
  };

  const handleSubmit = async () => {
    if (!selectedFile || selectedTags.length === 0) return;

    setIsSubmitting(true);

    try {
      // Use simulation mode via FeedDataContext
      if (SIMULATION_MODE || isSimulationMode) {
        const displayName = user?.email?.split('@')[0] || 'You';

        // Create post via FeedDataContext - it will appear instantly in feed
        createPost({
          authorId: user?.id || `sim-user-${Date.now()}`,
          author: {
            name: displayName,
            handle: displayName.toLowerCase().replace(/\s+/g, ''),
            avatar: '',
            isVerified: false,
            email: user?.email,
          },
          content: caption.trim(),
          tags: selectedTags,
          contentType: 'image',
          media: { type: 'image', url: previewUrl },
        });

        toast({
          title: 'Photo shared!',
          description: 'Your photo is now live in the feed.',
        });

        onSuccess();
        return;
      }

      // Real Supabase mode (when not in simulation)
      if (!user) return;

      // Upload image
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(fileName);

      // Create post
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
          author_id: user.id,
          content: caption.trim() || null,
          visibility: 'public',
          media_url: urlData.publicUrl,
          media_type: 'image',
          content_warning_enabled: contentWarning,
          content_warning_type: contentWarning ? contentWarningType : null,
          media_meta: {
            filter: filters[selectedFilter].name,
            brightness,
            contrast,
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

      onSuccess();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: 'Error',
        description: 'Failed to share photo. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
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
          onClick={step === 'select' ? onBack : () => setStep(step === 'share' ? 'edit' : 'select')}
          className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="font-semibold">
          {step === 'select' ? 'Select Photo' : step === 'edit' ? 'Edit' : 'Share'}
        </h2>
        {step === 'edit' ? (
          <Button size="sm" variant="ghost" onClick={() => setStep('share')}>
            Next
          </Button>
        ) : step === 'share' ? (
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={selectedTags.length === 0 || isSubmitting}
            className="gradient-brand text-white"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Share'}
          </Button>
        ) : (
          <div className="w-12" />
        )}
      </div>

      <AnimatePresence mode="wait">
        {step === 'select' && (
          <motion.div
            key="select"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-square max-w-[280px] rounded-2xl border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-3 text-muted-foreground hover:text-foreground"
            >
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                <span className="text-3xl">📷</span>
              </div>
              <span className="text-sm font-medium">Tap to select a photo</span>
            </button>
          </motion.div>
        )}

        {step === 'edit' && (
          <motion.div
            key="edit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-y-auto"
          >
            {/* Image Preview */}
            <div className="aspect-square bg-black flex items-center justify-center overflow-hidden">
              <img
                src={previewUrl}
                alt="Preview"
                className={cn('max-w-full max-h-full object-contain', filters[selectedFilter].class)}
                style={getFilterStyle()}
              />
            </div>

            {/* Filters */}
            <div className="p-4 space-y-4">
              <div className="flex gap-3 overflow-x-auto pb-2">
                {filters.map((filter, index) => (
                  <button
                    key={filter.name}
                    onClick={() => setSelectedFilter(index)}
                    className={cn(
                      'flex-shrink-0 flex flex-col items-center gap-1',
                      selectedFilter === index && 'text-primary'
                    )}
                  >
                    <div
                      className={cn(
                        'w-16 h-16 rounded-lg overflow-hidden border-2',
                        selectedFilter === index ? 'border-primary' : 'border-transparent'
                      )}
                    >
                      <img
                        src={previewUrl}
                        alt={filter.name}
                        className={cn('w-full h-full object-cover', filter.class)}
                      />
                    </div>
                    <span className="text-xs">{filter.name}</span>
                  </button>
                ))}
              </div>

              {/* Adjustments */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Sun className="h-4 w-4 text-muted-foreground" />
                  <Slider
                    value={[brightness]}
                    onValueChange={([v]) => setBrightness(v)}
                    min={50}
                    max={150}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-xs text-muted-foreground w-8">{brightness}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <Contrast className="h-4 w-4 text-muted-foreground" />
                  <Slider
                    value={[contrast]}
                    onValueChange={([v]) => setContrast(v)}
                    min={50}
                    max={150}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-xs text-muted-foreground w-8">{contrast}%</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedFilter(0);
                    setBrightness(100);
                    setContrast(100);
                  }}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'share' && (
          <motion.div
            key="share"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-y-auto p-4 space-y-4"
          >
            {/* Preview */}
            <div className="aspect-square max-w-[200px] mx-auto rounded-xl overflow-hidden">
              <img
                src={previewUrl}
                alt="Preview"
                className={cn('w-full h-full object-cover', filters[selectedFilter].class)}
                style={getFilterStyle()}
              />
            </div>

            {/* Caption */}
            <Textarea
              placeholder="Write a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="min-h-[80px] resize-none"
            />

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
