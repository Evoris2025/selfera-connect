import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Loader2, Sliders, Palette, Crop, MapPin, Music, X, Image as ImageIcon, SplitSquareVertical } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { useImageEnhance } from '@/hooks/useImageEnhance';
import { CreatorScreenHeader } from './CreatorScreenHeader';

// Enhanced imports
import {
  type CarouselImage,
  type UserTag,
  type ImageAdjustments,
  type UploadStatus,
  type EditPreset,
  type BlurSettings,
  type ColorGrading,
  createCarouselImage,
  DEFAULT_ADJUSTMENTS,
  DEFAULT_BLUR,
  DEFAULT_COLOR_GRADING,
  GalleryFirstSelector,
  EnhancedCarouselEditor,
  EnhancedFilterLibrary,
  EffectPreviewImage,
  CropControls,
  PerImageUserTags,
  PerImageAltText,
  UnsavedChangesDialog,
  UploadProgressOverlay,
  useImageCompression,
  useImageExport,
  filters,
  // Undo/Redo and Presets
  useEditHistory,
  useEditPresets,
  PresetManager,
  UndoRedoControls,
  // New: Blur and Color Grading
  BlurControl,
  ColorGradingControl,
  // New: Draft Auto-Save
  useDraftAutoSave,
} from './image';

// Simulation mode flag — only enabled when no authenticated user
const SIMULATION_MODE = false;

type Step = 'select' | 'edit' | 'details';
type EditTab = 'filters' | 'adjust' | 'crop' | 'effects';
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
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);

  // Details state
  const [caption, setCaption] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [contentWarning, setContentWarning] = useState(false);
  const [contentWarningType, setContentWarningType] = useState<ContentWarningType>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [selectedSound, setSelectedSound] = useState<any>(null);
  const [showSoundPicker, setShowSoundPicker] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadProgress, setUploadProgress] = useState<{ id: string; previewUrl: string; status: 'pending' | 'preparing' | 'uploading' | 'complete' | 'error' }[]>([]);

  // Unsaved changes dialog
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<'back' | 'close' | null>(null);

  // Track if user has made changes
  const [hasChanges, setHasChanges] = useState(false);

  const currentImage = images[selectedImageIndex];

  // Image compression hook
  const updateImage = useCallback((id: string, updates: Partial<CarouselImage>) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, ...updates } : img));
    setHasChanges(true);
  }, []);

  const { compressInBackground, cancelAll } = useImageCompression(updateImage);

  // Image export hook
  const { exportAllImages } = useImageExport();

  // Edit history hook for undo/redo (max 20 actions)
  const { 
    recordChange, 
    undo, 
    redo, 
    canUndo, 
    canRedo, 
    historyLength,
    clearHistory 
  } = useEditHistory({ maxHistorySize: 20 });

  // Presets hook
  const { 
    presets, 
    savePreset, 
    deletePreset, 
    renamePreset, 
    applyPreset: getPresetValues 
  } = useEditPresets();

  // AI Enhancement hook
  const { enhance, isEnhancing } = useImageEnhance();
  const [magikSuccess, setMagikSuccess] = useState(false);

  // Draft auto-save (every 30s + on unload)
  const { lastSaved: draftLastSaved, isSaving: isDraftSaving, deleteDraft } = useDraftAutoSave(
    images,
    caption,
    selectedTags,
    location,
    selectedSound,
    contentWarning,
    contentWarningType,
    { autoSaveIntervalMs: 30000 }
  );

  // Start background compression when images are added
  useEffect(() => {
    images.forEach(img => {
      if (!img.compressedFile && !img.isCompressing) {
        compressInBackground(img);
      }
    });
  }, [images, compressInBackground]);

  // Keep latest images in a ref so unmount cleanup sees the final list (not stale empty array)
  const imagesRef = useRef<CarouselImage[]>([]);
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAll();
      // Revoke object URLs for ALL images that existed at unmount time
      imagesRef.current.forEach(img => {
        if (img.previewUrl) URL.revokeObjectURL(img.previewUrl);
      });
    };
  }, [cancelAll]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (step !== 'edit') return;
      
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, canUndo, canRedo]);

  const handleImagesChange = useCallback((newImages: CarouselImage[]) => {
    setImages(newImages);
    setHasChanges(true);
    
    // Adjust selected index if needed
    if (selectedImageIndex >= newImages.length) {
      setSelectedImageIndex(Math.max(0, newImages.length - 1));
    }
  }, [selectedImageIndex]);

  // Update with history recording
  const updateCurrentImageWithHistory = useCallback((
    type: 'filter' | 'adjustment' | 'crop',
    updates: Partial<CarouselImage>
  ) => {
    if (!currentImage) return;
    
    // Record previous state for undo
    const previousState: Partial<CarouselImage> = {};
    (Object.keys(updates) as Array<keyof CarouselImage>).forEach(key => {
      (previousState as Record<string, unknown>)[key] = currentImage[key];
    });
    
    recordChange(currentImage.id, type, previousState, updates);
    updateImage(currentImage.id, updates);
  }, [currentImage, updateImage, recordChange]);

  const updateCurrentImage = useCallback((updates: Partial<CarouselImage>) => {
    if (!currentImage) return;
    updateImage(currentImage.id, updates);
  }, [currentImage, updateImage]);

  // Undo/Redo handlers
  const handleUndo = useCallback(() => {
    undo((imageId, state) => {
      updateImage(imageId, state);
    });
  }, [undo, updateImage]);

  const handleRedo = useCallback(() => {
    redo((imageId, state) => {
      updateImage(imageId, state);
    });
  }, [redo, updateImage]);

  // Apply preset to current image
  const handleApplyPreset = useCallback((preset: EditPreset) => {
    if (!currentImage) return;
    
    const values = getPresetValues(preset);
    
    // Record for undo
    const previousState: Partial<CarouselImage> = {
      filter: currentImage.filter,
      filterIntensity: currentImage.filterIntensity,
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
    };
    
    const newState: Partial<CarouselImage> = {
      filter: values.filter,
      filterIntensity: values.filterIntensity,
      ...values.adjustments,
    };
    
    recordChange(currentImage.id, 'batch', previousState, newState);
    updateImage(currentImage.id, newState);
    
    toast({
      title: 'Preset applied',
      description: `Applied "${preset.name}" to this image.`,
    });
  }, [currentImage, getPresetValues, recordChange, updateImage]);

  // Save current settings as preset
  const handleSavePreset = useCallback((name: string) => {
    if (!currentImage) return;
    
    savePreset(
      name,
      currentImage.filter,
      currentImage.filterIntensity,
      {
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
      }
    );
    
    toast({
      title: 'Preset saved',
      description: `"${name}" has been saved to your presets.`,
    });
  }, [currentImage, savePreset]);

  const handleAdjustmentsChange = (adjustments: ImageAdjustments) => {
    updateCurrentImage(adjustments);
  };

  // AI Magik enhancement handler
  const handleMagikEnhance = useCallback(async () => {
    if (!currentImage || isEnhancing) return;
    
    setMagikSuccess(false);
    
    const enhancements = await enhance(currentImage.previewUrl);
    
    if (enhancements) {
      // Record current state for undo
      const previousState: Partial<CarouselImage> = {
        brightness: currentImage.brightness,
        contrast: currentImage.contrast,
        saturation: currentImage.saturation,
        warmth: currentImage.warmth,
        highlights: currentImage.highlights,
        shadows: currentImage.shadows,
      };
      
      // Apply enhancements
      const newState: Partial<CarouselImage> = {
        brightness: enhancements.brightness,
        contrast: enhancements.contrast,
        saturation: enhancements.saturation,
        warmth: enhancements.warmth,
        highlights: enhancements.highlights,
        shadows: enhancements.shadows,
      };
      
      recordChange(currentImage.id, 'batch', previousState, newState);
      updateImage(currentImage.id, newState);
      
      setMagikSuccess(true);
      
      // Reset success state after animation
      setTimeout(() => setMagikSuccess(false), 2000);
    }
  }, [currentImage, isEnhancing, enhance, recordChange, updateImage]);

  // Navigation with unsaved changes check
  const handleBack = useCallback(() => {
    if (step === 'select') {
      if (images.length > 0 && hasChanges) {
        setPendingNavigation('back');
        setShowUnsavedDialog(true);
      } else {
        onBack();
      }
    } else if (step === 'edit') {
      setStep('select');
    } else {
      setStep('edit');
    }
  }, [step, images.length, hasChanges, onBack]);

  const handleClose = useCallback(() => {
    if (hasChanges && (images.length > 0 || step !== 'select')) {
      setPendingNavigation('close');
      setShowUnsavedDialog(true);
    } else {
      onBack();
    }
  }, [hasChanges, images.length, step, onBack]);

  const handleDiscardChanges = () => {
    setShowUnsavedDialog(false);
    onBack();
  };

  const handleKeepEditing = () => {
    setShowUnsavedDialog(false);
    setPendingNavigation(null);
  };

  // Proceed from select to edit (with validation)
  const handleProceedToEdit = () => {
    if (images.length === 0) {
      toast({
        title: 'No images selected',
        description: 'Please select at least one image to continue.',
        variant: 'destructive',
      });
      return;
    }
    setStep('edit');
  };

  // Proceed from edit to details
  const handleProceedToDetails = () => {
    if (images.length === 0) {
      setStep('select');
      return;
    }
    setStep('details');
  };

  // Validate before share
  const canShare = images.length > 0 && selectedTags.length >= 1 && selectedTags.length <= 5;

  const handleSubmit = async () => {
    if (!canShare) {
      if (selectedTags.length === 0) {
        toast({
          title: 'Topic tags required',
          description: 'Please select at least one topic tag.',
          variant: 'destructive',
        });
      } else if (selectedTags.length > 5) {
        toast({
          title: 'Too many tags',
          description: 'Please select up to 5 topic tags.',
          variant: 'destructive',
        });
      }
      return;
    }

    setIsSubmitting(true);
    setUploadStatus('preparing');

    // Initialize progress tracking
    setUploadProgress(images.map(img => ({
      id: img.id,
      previewUrl: img.previewUrl,
      status: 'pending',
    })));

    try {
      if (SIMULATION_MODE || isSimulationMode) {
        // Simulate upload progress
        for (let i = 0; i < images.length; i++) {
          setUploadProgress(prev => prev.map((p, idx) => 
            idx === i ? { ...p, status: 'uploading' } : p
          ));
          await new Promise(r => setTimeout(r, 300));
          setUploadProgress(prev => prev.map((p, idx) => 
            idx === i ? { ...p, status: 'complete' } : p
          ));
        }

        setUploadStatus('finalizing');
        await new Promise(r => setTimeout(r, 200));

        const displayName = user?.email?.split('@')[0] || 'You';
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

        setUploadStatus('complete');
        await new Promise(r => setTimeout(r, 500));

        toast({
          title: images.length > 1 ? 'Photos shared!' : 'Photo shared!',
          description: 'Your post is now live in the feed.',
        });

        await deleteDraft();
        onSuccess();
        return;
      }

      // Real Supabase mode
      if (!user) return;

      // Export images with all edits applied
      setUploadStatus('preparing');
      const exportedImages = await exportAllImages(images, {}, (current, total, status) => {
        setUploadProgress(prev => prev.map((p, idx) => ({
          ...p,
          status: idx < current ? 'complete' : idx === current - 1 ? 'preparing' : 'pending',
        })));
      });

      // Upload all images
      setUploadStatus('uploading');
      const uploadedUrls: string[] = [];
      
      for (let i = 0; i < exportedImages.length; i++) {
        setUploadProgress(prev => prev.map((p, idx) => 
          idx === i ? { ...p, status: 'uploading' } : p
        ));

        const { file } = exportedImages[i];
        const now = new Date();
        const fileName = `${user.id}/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;

        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(fileName, file);

        if (uploadError) {
          setUploadProgress(prev => prev.map((p, idx) => 
            idx === i ? { ...p, status: 'error' } : p
          ));
          throw uploadError;
        }

        const { data: urlData } = supabase.storage
          .from('media')
          .getPublicUrl(fileName);

        uploadedUrls.push(urlData.publicUrl);
        
        setUploadProgress(prev => prev.map((p, idx) => 
          idx === i ? { ...p, status: 'complete' } : p
        ));
      }

      // Create post
      setUploadStatus('finalizing');
      
      // Serialize media_meta to be JSON-compatible
      const mediaMeta = {
        images: images.map((img, i) => ({
          url: uploadedUrls[i],
          filter: img.filter,
          filterIntensity: img.filterIntensity,
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
          crop: {
            scale: img.cropData.scale,
            translateX: img.cropData.translateX,
            translateY: img.cropData.translateY,
            aspectRatio: img.cropData.aspectRatio,
          },
          aspectRatio: img.aspectRatio,
          altText: img.altText,
          userTags: img.userTags.map(tag => ({
            id: tag.id,
            userId: tag.userId,
            username: tag.username,
            displayName: tag.displayName,
            avatar: tag.avatar || null,
            positionX: tag.positionX,
            positionY: tag.positionY,
          })),
        })),
        location: location ? { name: location.name, address: location.address || null } : null,
        sound: selectedSound ? { id: selectedSound.id, name: selectedSound.name, artist: selectedSound.artist } : null,
      };

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
          media_meta: mediaMeta,
        }])
        .select()
        .single();

      if (postError) throw postError;

      // Add topic tags
      if (post && selectedTags.length > 0) {
        const tagMappings = selectedTags.map((tagId) => ({
          post_id: post.id,
          tag_id: tagId,
        }));

        await supabase.from('post_tag_map').insert(tagMappings);
      }

      setUploadStatus('complete');
      await new Promise(r => setTimeout(r, 500));

      toast({
        title: images.length > 1 ? 'Photos shared!' : 'Photo shared!',
        description: 'Your post is now live in the feed.',
      });

      // Successfully posted — remove the saved draft
      await deleteDraft();
      onSuccess();
    } catch (error) {
      console.error('Error creating post:', error);
      setUploadStatus('error');
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Some images failed to upload. Please retry.',
        variant: 'destructive',
      });
    } finally {
      // Always release the submitting lock so the user can retry or close the overlay
      setIsSubmitting(false);
    }
  };

  const handleRetryUpload = (_imageId: string) => {
    // Reset state and re-run the full submit pipeline
    setUploadStatus('idle');
    setUploadProgress([]);
    handleSubmit();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full min-h-dvh bg-background"
    >
      <CreatorScreenHeader type="photo" onBack={handleBack} onClose={handleClose} showAudience={false} />

      {/* Step controls bar */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-1">
          <button
            onClick={handleBack}
            className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          {step === 'edit' && (
            <UndoRedoControls
              canUndo={canUndo}
              canRedo={canRedo}
              onUndo={handleUndo}
              onRedo={handleRedo}
            />
          )}
        </div>
        <h2 className="font-semibold">
          {step === 'select' ? 'Select Photos' : step === 'edit' ? 'Edit' : 'Details'}
        </h2>
        <div className="flex items-center gap-2">
          {step === 'edit' && (
            <Button size="sm" variant="ghost" onClick={handleProceedToDetails}>
              Next
            </Button>
          )}
          {step === 'details' && (
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!canShare || isSubmitting}
              className="bg-primary text-primary-foreground"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Share'}
            </Button>
          )}
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Select Photos */}
        {step === 'select' && (
          <motion.div
            key="select"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col"
          >
            <GalleryFirstSelector
              images={images}
              onImagesChange={handleImagesChange}
              onProceed={handleProceedToEdit}
              maxImages={20}
            />
          </motion.div>
        )}

        {/* Step 2: Edit Photos */}
        {step === 'edit' && currentImage && (
          <motion.div
            key="edit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col min-h-0"
          >
            {/* Carousel Editor - fills available space above toolbar */}
            <div className="flex-1 min-h-0 p-4 pb-0">
              <EnhancedCarouselEditor
                images={images}
                selectedIndex={selectedImageIndex}
                onImagesChange={handleImagesChange}
                onSelectImage={setSelectedImageIndex}
                onAddImages={() => fileInputRef.current?.click()}
                maxImages={20}
                showBeforeAfter={showBeforeAfter}
                onToggleBeforeAfter={() => setShowBeforeAfter(!showBeforeAfter)}
                isCropMode={editTab === 'crop'}
                onCropChange={(cropData) => updateCurrentImageWithHistory('crop', { 
                  cropData, 
                  aspectRatio: cropData.aspectRatio 
                })}
                className="h-full"
              />
            </div>

            {/* Editing Tabs - fixed at bottom with consistent height */}
            <Tabs value={editTab} onValueChange={(v) => setEditTab(v as EditTab)} className="shrink-0 px-4 pt-2 pb-4">
              <div className="flex items-center gap-2 mb-3">
                <TabsList className="grid flex-1 grid-cols-4">
                  <TabsTrigger value="filters" className="gap-1 text-label">
                    <Palette className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Filters</span>
                  </TabsTrigger>
                  <TabsTrigger value="adjust" className="gap-1 text-label">
                    <Sliders className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Adjust</span>
                  </TabsTrigger>
                  <TabsTrigger value="effects" className="gap-1 text-label">
                    <ImageIcon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Effects</span>
                  </TabsTrigger>
                  <TabsTrigger value="crop" className="gap-1 text-label">
                    <Crop className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Crop</span>
                  </TabsTrigger>
                </TabsList>
                <button
                  type="button"
                  onClick={() => setShowBeforeAfter(!showBeforeAfter)}
                  aria-pressed={showBeforeAfter}
                  aria-label="Compare before and after"
                  className={cn(
                    'inline-flex items-center justify-center gap-1 text-label whitespace-nowrap px-3 h-9 rounded-md font-medium transition-colors border',
                    showBeforeAfter
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-secondary text-muted-foreground hover:text-foreground border-border'
                  )}
                >
                  <SplitSquareVertical className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Compare</span>
                </button>
              </div>

              <TabsContent value="filters" className="space-y-4 max-h-[180px] overflow-y-auto">
                {/* Preset Manager */}
                <PresetManager
                  presets={presets}
                  currentFilter={currentImage.filter}
                  currentFilterIntensity={currentImage.filterIntensity}
                  currentAdjustments={{
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
                  onSavePreset={handleSavePreset}
                  onApplyPreset={handleApplyPreset}
                  onDeletePreset={deletePreset}
                  onRenamePreset={renamePreset}
                />
                
                <EnhancedFilterLibrary
                  selectedFilter={currentImage.filter}
                  filterIntensity={currentImage.filterIntensity}
                  previewUrl={currentImage.previewUrl}
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
                  onFilterSelect={(index) => updateCurrentImageWithHistory('filter', { filter: index })}
                  onIntensityChange={(intensity) => updateCurrentImageWithHistory('filter', { filterIntensity: intensity })}
                  onMagikClick={handleMagikEnhance}
                  isMagikLoading={isEnhancing}
                  isMagikSuccess={magikSuccess}
                />
              </TabsContent>

              <TabsContent value="adjust" className="max-h-[180px] overflow-y-auto">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Using inline adjustment sliders with history */}
                    {Object.entries({
                      brightness: { label: 'Brightness', min: 50, max: 150, default: 100 },
                      contrast: { label: 'Contrast', min: 50, max: 150, default: 100 },
                      saturation: { label: 'Saturation', min: 0, max: 200, default: 100 },
                      warmth: { label: 'Warmth', min: -100, max: 100, default: 0 },
                      highlights: { label: 'Highlights', min: -100, max: 100, default: 0 },
                      shadows: { label: 'Shadows', min: -100, max: 100, default: 0 },
                      vignette: { label: 'Vignette', min: 0, max: 100, default: 0 },
                      fade: { label: 'Fade', min: 0, max: 100, default: 0 },
                      sharpen: { label: 'Sharpen', min: 0, max: 100, default: 0 },
                      structure: { label: 'Structure', min: 0, max: 100, default: 0 },
                    }).map(([key, config]) => (
                      <div key={key} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-label text-muted-foreground">{config.label}</span>
                          <span className="text-label font-medium tabular-nums">
                            {currentImage[key as keyof CarouselImage] as number}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={config.min}
                          max={config.max}
                          value={currentImage[key as keyof CarouselImage] as number}
                          onChange={(e) => updateCurrentImageWithHistory('adjustment', { [key]: parseInt(e.target.value) })}
                          className="w-full h-1 bg-secondary rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full"
                        />
                      </div>
                    ))}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // Record all adjustments for undo
                      const previousState: Partial<CarouselImage> = {
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
                      };
                      recordChange(currentImage.id, 'adjustment', previousState, DEFAULT_ADJUSTMENTS);
                      updateImage(currentImage.id, DEFAULT_ADJUSTMENTS);
                    }}
                    className="w-full text-label"
                  >
                    Reset All Adjustments
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="effects" className="space-y-6 max-h-[180px] overflow-y-auto">
                {/* Tilt-Shift Blur */}
                <BlurControl
                  blur={currentImage.blur || DEFAULT_BLUR}
                  onBlurChange={(blur) => updateCurrentImageWithHistory('adjustment', { blur })}
                />
                
                {/* Color Grading */}
                <ColorGradingControl
                  colorGrading={currentImage.colorGrading || DEFAULT_COLOR_GRADING}
                  onColorGradingChange={(colorGrading) => updateCurrentImageWithHistory('adjustment', { colorGrading })}
                />
              </TabsContent>

              <TabsContent value="crop" className="max-h-[280px] md:max-h-[340px] overflow-y-auto pr-1">
                <CropControls
                  cropData={currentImage.cropData}
                  onCropChange={(cropData) => updateCurrentImageWithHistory('crop', { 
                    cropData, 
                    aspectRatio: cropData.aspectRatio 
                  })}
                />
              </TabsContent>
            </Tabs>

            {/* Hidden file input for adding more */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length > 0) {
                  const availableSlots = 20 - images.length;
                  const filesToAdd = files.slice(0, availableSlots);
                  const newImages = filesToAdd.map(f => createCarouselImage(f));
                  handleImagesChange([...images, ...newImages]);
                }
                e.target.value = '';
              }}
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
                  className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-border relative"
                >
                  <EffectPreviewImage
                    src={img.previewUrl}
                    alt={`Preview ${i + 1}`}
                    adjustments={{
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
                    }}
                    presetFilterClass={img.filter > 0 ? filters[img.filter]?.class : ''}
                    presetIntensity={img.filterIntensity}
                    className="absolute inset-0 w-full h-full object-cover"
                    draggable={false}
                  />
                  <div className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-background/80 flex items-center justify-center text-caption font-medium">
                    {i + 1}
                  </div>
                </div>
              ))}
            </div>

            {/* Caption */}
            <div className="space-y-2">
              <Textarea
                placeholder="Write a caption..."
                value={caption}
                onChange={(e) => {
                  setCaption(e.target.value);
                  setHasChanges(true);
                }}
                className="min-h-[100px] resize-none"
              />
              <p className="text-label text-muted-foreground text-right">
                {caption.length} / 2,200
              </p>
            </div>

            {/* Per-Image User Tagging */}
            <PerImageUserTags
              images={images}
              selectedImageIndex={selectedImageIndex}
              onImageSelect={setSelectedImageIndex}
              onTagsChange={(imageId, tags) => updateImage(imageId, { userTags: tags })}
            />

            {/* Location */}
            <LocationPicker
              value={location}
              onChange={(loc) => {
                setLocation(loc);
                setHasChanges(true);
              }}
            />

            {/* Per-Image Alt Text */}
            <PerImageAltText
              images={images}
              selectedImageIndex={selectedImageIndex}
              onImageSelect={setSelectedImageIndex}
              onAltTextChange={(imageId, altText) => updateImage(imageId, { altText })}
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
                  <span className="text-body">
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
                        setHasChanges(true);
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Topic Tags (Required) */}
            <div className="space-y-2">
              <TopicTagSelector
                selectedTags={selectedTags}
                onTagsChange={(tags) => {
                  setSelectedTags(tags);
                  setHasChanges(true);
                }}
              />
              {selectedTags.length === 0 && (
                <p className="text-label text-destructive">At least one topic tag is required</p>
              )}
              {selectedTags.length > 5 && (
                <p className="text-label text-destructive">Maximum 5 topic tags allowed</p>
              )}
            </div>

            {/* Content Warning */}
            <ContentWarningToggle
              enabled={contentWarning}
              onEnabledChange={(enabled) => {
                setContentWarning(enabled);
                setHasChanges(true);
              }}
              warningType={contentWarningType}
              onWarningTypeChange={(type) => {
                setContentWarningType(type);
                setHasChanges(true);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unsaved Changes Dialog */}
      <UnsavedChangesDialog
        isOpen={showUnsavedDialog}
        onDiscard={handleDiscardChanges}
        onKeepEditing={handleKeepEditing}
      />

      {/* Upload Progress Overlay */}
      <UploadProgressOverlay
        isOpen={isSubmitting}
        status={uploadStatus}
        images={uploadProgress}
        currentIndex={uploadProgress.filter(p => p.status === 'complete').length}
        totalImages={images.length}
        onRetry={handleRetryUpload}
        onClose={() => {
          setIsSubmitting(false);
          setUploadStatus('idle');
        }}
      />
    </motion.div>
  );
}
