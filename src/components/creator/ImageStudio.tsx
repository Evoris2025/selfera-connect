import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Loader2, Sliders, Palette, MapPin, Users, Type, Music, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useFeedData } from '@/contexts/FeedDataContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { TopicTagSelector } from './shared/TopicTagSelector';
import { ContentWarningToggle } from './shared/ContentWarningToggle';
import { LocationPicker, type Location } from './post/LocationPicker';
import { SoundPicker } from './SoundPicker';
import { compressImage } from '@/lib/imageCompression';
import {
  ImageCarouselEditor,
  createCarouselImage,
  CropTool,
  AdjustmentPanel,
  FilterLibrary,
  UserTagOverlay,
  AltTextInput,
  getAdjustmentStyles,
  getFilterClass,
  type CarouselImage,
  type UserTag,
  type ImageAdjustments,
} from './image';
import { cn } from '@/lib/utils';

// Simulation mode flag
const SIMULATION_MODE = true;

type Step = 'select' | 'edit' | 'details';
type EditTab = 'filters' | 'adjust' | 'crop';
type ContentWarningType = 'sensitive' | 'triggering' | 'graphic' | 'other' | null;

interface ImageStudioProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function ImageStudio({ onBack, onSuccess }: ImageStudioProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { createPost, isSimulationMode } = useFeedData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Multi-image state
  const [step, setStep] = useState<Step>('select');
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [editTab, setEditTab] = useState<EditTab>('filters');

  // Current image editing state
  const [filterIntensity, setFilterIntensity] = useState(100);

  // Details state
  const [caption, setCaption] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [contentWarning, setContentWarning] = useState(false);
  const [contentWarningType, setContentWarningType] = useState<ContentWarningType>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [userTags, setUserTags] = useState<UserTag[]>([]);
  const [isTagging, setIsTagging] = useState(false);
  const [selectedSound, setSelectedSound] = useState<any>(null);
  const [showSoundPicker, setShowSoundPicker] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentImage = images[selectedImageIndex];

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limit to 20 images total
    const availableSlots = 20 - images.length;
    const filesToAdd = files.slice(0, availableSlots);

    // Compress images before adding
    const compressedFiles = await Promise.all(
      filesToAdd.map(file => compressImage(file, { maxWidth: 1920, maxHeight: 1920 }))
    );

    const newImages = compressedFiles.map(file => createCarouselImage(file));
    setImages(prev => [...prev, ...newImages]);
    
    if (images.length === 0) {
      setStep('edit');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const updateCurrentImage = useCallback((updates: Partial<CarouselImage>) => {
    setImages(prev => prev.map((img, i) => 
      i === selectedImageIndex ? { ...img, ...updates } : img
    ));
  }, [selectedImageIndex]);

  const handleAdjustmentsChange = (adjustments: ImageAdjustments) => {
    updateCurrentImage(adjustments);
  };

  const getImageStyles = (image: CarouselImage) => {
    const adjustmentStyles = getAdjustmentStyles({
      brightness: image.brightness,
      contrast: image.contrast,
      saturation: image.saturation,
      warmth: image.warmth,
      highlights: image.highlights,
      shadows: image.shadows,
      vignette: image.vignette,
      sharpen: image.sharpen,
      structure: image.structure,
      fade: image.fade,
    });

    return adjustmentStyles;
  };

  const handleSubmit = async () => {
    if (images.length === 0 || selectedTags.length === 0) return;

    setIsSubmitting(true);

    try {
      if (SIMULATION_MODE || isSimulationMode) {
        const displayName = user?.email?.split('@')[0] || 'You';

        // Create post with first image
        const firstImageUrl = images[0]?.previewUrl || '';
        
        createPost({
          authorId: user?.id || `sim-user-${Date.now()}`,
          author: {
            name: displayName,
            handle: displayName.toLowerCase().replace(/\s+/g, ''),
            avatar: '',
            isVerified: false,
            email: user?.email,
          },
          content: caption.trim() + (location ? `\n📍 ${location.name}` : ''),
          tags: selectedTags,
          contentType: 'image',
          media: { type: 'image', url: firstImageUrl },
        });

        toast({
          title: images.length > 1 ? 'Photos shared!' : 'Photo shared!',
          description: 'Your photo is now live in the feed.',
        });

        onSuccess();
        return;
      }

      // Real Supabase mode
      if (!user) return;

      // Upload all images
      const uploadedUrls: string[] = [];
      for (const image of images) {
        const fileExt = image.file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(fileName, image.file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('media')
          .getPublicUrl(fileName);

        uploadedUrls.push(urlData.publicUrl);
      }

      // Create post
      const { error: postError, data: post } = await supabase
        .from('posts')
        .insert([{
          author_id: user.id,
          content: caption.trim() || null,
          visibility: 'public',
          media_url: uploadedUrls[0],
          media_type: 'image',
          content_warning_enabled: contentWarning,
          content_warning_type: contentWarning ? contentWarningType : null,
          media_meta: {
            images: images.map((img, i) => ({
              url: uploadedUrls[i],
              filter: img.filter,
              adjustments: {
                brightness: img.brightness,
                contrast: img.contrast,
                saturation: img.saturation,
                warmth: img.warmth,
                highlights: img.highlights,
                shadows: img.shadows,
                vignette: img.vignette,
                sharpen: img.sharpen,
                structure: img.structure,
                fade: img.fade,
              },
              aspectRatio: img.aspectRatio,
              altText: img.altText,
            })),
            location: location ? { name: location.name, address: location.address || null } : null,
            userTags: userTags.map(t => ({ id: t.id, userId: t.userId, username: t.username, positionX: t.positionX, positionY: t.positionY })),
            sound: selectedSound ? { id: selectedSound.id, name: selectedSound.name, artist: selectedSound.artist } : null,
          },
        }])
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
          onClick={step === 'select' ? onBack : () => setStep(step === 'details' ? 'edit' : 'select')}
          className="p-2 -ml-2 hover:bg-secondary transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
        <h2 className="font-semibold">
          {step === 'select' ? 'Select Photos' : step === 'edit' ? 'Edit' : 'Details'}
        </h2>
        {step === 'edit' ? (
          <Button size="sm" variant="ghost" onClick={() => setStep('details')}>
            Next
          </Button>
        ) : step === 'details' ? (
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={selectedTags.length === 0 || isSubmitting}
            className="bg-primary text-primary-foreground"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Share'}
          </Button>
        ) : (
          <div className="w-12" />
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Select Photos */}
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
              multiple
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
              <span className="text-sm font-medium">Tap to select photos</span>
              <span className="text-xs text-muted-foreground">Select up to 20 images</span>
            </button>
          </motion.div>
        )}

        {/* Step 2: Edit Photos */}
        {step === 'edit' && currentImage && (
          <motion.div
            key="edit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-y-auto"
          >
            {/* Carousel Editor */}
            <div className="p-4">
              <ImageCarouselEditor
                images={images}
                selectedIndex={selectedImageIndex}
                onImagesChange={setImages}
                onSelectImage={setSelectedImageIndex}
                onAddImages={() => fileInputRef.current?.click()}
              />
            </div>

            {/* Editing Tabs */}
            <Tabs value={editTab} onValueChange={(v) => setEditTab(v as EditTab)} className="px-4">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="filters" className="gap-1.5">
                  <Palette className="h-4 w-4" />
                  Filters
                </TabsTrigger>
                <TabsTrigger value="adjust" className="gap-1.5">
                  <Sliders className="h-4 w-4" />
                  Adjust
                </TabsTrigger>
                <TabsTrigger value="crop" className="gap-1.5">
                  <Type className="h-4 w-4" />
                  Crop
                </TabsTrigger>
              </TabsList>

              <TabsContent value="filters" className="space-y-4">
                <FilterLibrary
                  selectedFilter={currentImage.filter}
                  filterIntensity={filterIntensity}
                  previewUrl={currentImage.previewUrl}
                  onFilterSelect={(index) => updateCurrentImage({ filter: index })}
                  onIntensityChange={setFilterIntensity}
                />
              </TabsContent>

              <TabsContent value="adjust">
                <AdjustmentPanel
                  adjustments={{
                    brightness: currentImage.brightness,
                    contrast: currentImage.contrast,
                    saturation: currentImage.saturation,
                    warmth: currentImage.warmth,
                    highlights: currentImage.highlights,
                    shadows: currentImage.shadows,
                    vignette: currentImage.vignette,
                    sharpen: currentImage.sharpen,
                    structure: currentImage.structure,
                    fade: currentImage.fade,
                  }}
                  onAdjustmentsChange={handleAdjustmentsChange}
                />
              </TabsContent>

              <TabsContent value="crop">
                <CropTool
                  aspectRatio={currentImage.aspectRatio}
                  onAspectRatioChange={(ratio) => updateCurrentImage({ aspectRatio: ratio })}
                />
              </TabsContent>
            </Tabs>

            {/* Hidden file input for adding more */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </motion.div>
        )}

        {/* Step 3: Details */}
        {step === 'details' && (
          <motion.div
            key="details"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-y-auto p-4 space-y-5"
          >
            {/* Preview Thumbnails */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <div
                  key={img.id}
                  className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-border"
                >
                  <img
                    src={img.previewUrl}
                    alt={`Preview ${i + 1}`}
                    className={cn('w-full h-full object-cover', getFilterClass(img.filter))}
                    style={getImageStyles(img)}
                  />
                </div>
              ))}
            </div>

            {/* Caption */}
            <Textarea
              placeholder="Write a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="min-h-[100px] resize-none"
            />

            {/* User Tagging */}
            <UserTagOverlay
              tags={userTags}
              onTagsChange={setUserTags}
              imageUrl={images[0]?.previewUrl || ''}
              isEditing={isTagging}
              onEditingChange={setIsTagging}
            />

            {/* Location */}
            <LocationPicker
              value={location}
              onChange={setLocation}
            />

            {/* Alt Text for first image */}
            <AltTextInput
              value={images[0]?.altText || ''}
              onChange={(text) => {
                setImages(prev => prev.map((img, i) => 
                  i === 0 ? { ...img, altText: text } : img
                ));
              }}
            />

            {/* Music (for carousels) */}
            {images.length > 1 && (
              <div className="space-y-2">
                <button
                  onClick={() => setShowSoundPicker(!showSoundPicker)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors w-full',
                    selectedSound 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <Music className="h-4 w-4" />
                  <span className="text-sm">
                    {selectedSound ? selectedSound.name : 'Add music to carousel'}
                  </span>
                </button>

                {showSoundPicker && (
                  <div className="relative h-[300px] border border-border rounded-xl overflow-hidden">
                    <SoundPicker
                      isOpen={showSoundPicker}
                      onClose={() => setShowSoundPicker(false)}
                      selectedSound={selectedSound}
                      onSelect={(sound) => {
                        setSelectedSound(sound);
                      }}
                    />
                  </div>
                )}
              </div>
            )}

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
