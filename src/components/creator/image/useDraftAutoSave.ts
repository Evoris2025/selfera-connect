import { useEffect, useRef, useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { CarouselImage } from './types';
import { toast } from '@/hooks/use-toast';

interface DraftData {
  images: Array<{
    id: string;
    fileName: string;
    filter: number;
    filterIntensity: number;
    brightness: number;
    contrast: number;
    saturation: number;
    warmth: number;
    highlights: number;
    shadows: number;
    vignette: number;
    sharpen: number;
    structure: number;
    fade: number;
    blur: {
      mode: string;
      intensity: number;
      positionX: number;
      positionY: number;
      radius: number;
    };
    colorGrading: {
      shadowTint: string;
      shadowIntensity: number;
      highlightTint: string;
      highlightIntensity: number;
    };
    cropData: {
      scale: number;
      translateX: number;
      translateY: number;
      aspectRatio: string;
      rotation: number;
    };
    aspectRatio: string;
    altText: string;
    userTags: Array<{
      id: string;
      userId: string;
      username: string;
      displayName: string;
      avatar?: string;
      positionX: number;
      positionY: number;
    }>;
  }>;
  caption: string;
  selectedTags: string[];
  location: { name: string; address?: string } | null;
  selectedSound: { id: string; name: string; artist: string } | null;
  contentWarning: boolean;
  contentWarningType: string | null;
  lastSaved: string;
}

interface UseDraftAutoSaveOptions {
  autoSaveIntervalMs?: number;
  onDraftLoaded?: (hasUnsavedDraft: boolean) => void;
}

export function useDraftAutoSave(
  images: CarouselImage[],
  caption: string,
  selectedTags: string[],
  location: { name: string; address?: string } | null,
  selectedSound: { id: string; name: string; artist: string } | null,
  contentWarning: boolean,
  contentWarningType: string | null,
  options: UseDraftAutoSaveOptions = {}
) {
  const { user } = useAuth();
  const { autoSaveIntervalMs = 30000, onDraftLoaded } = options;
  
  const [draftId, setDraftId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const lastSavedDataRef = useRef<string>('');
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Serialize current state for comparison
  const serializeState = useCallback((): string => {
    if (images.length === 0) return '';
    
    const data: DraftData = {
      images: images.map(img => ({
        id: img.id,
        fileName: img.file.name,
        filter: img.filter,
        filterIntensity: img.filterIntensity,
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
        blur: {
          mode: img.blur.mode,
          intensity: img.blur.intensity,
          positionX: img.blur.positionX,
          positionY: img.blur.positionY,
          radius: img.blur.radius,
        },
        colorGrading: {
          shadowTint: img.colorGrading.shadowTint,
          shadowIntensity: img.colorGrading.shadowIntensity,
          highlightTint: img.colorGrading.highlightTint,
          highlightIntensity: img.colorGrading.highlightIntensity,
        },
        cropData: {
          scale: img.cropData.scale,
          translateX: img.cropData.translateX,
          translateY: img.cropData.translateY,
          aspectRatio: img.cropData.aspectRatio,
          rotation: img.cropData.rotation || 0,
        },
        aspectRatio: img.aspectRatio,
        altText: img.altText,
        userTags: img.userTags.map(tag => ({
          id: tag.id,
          userId: tag.userId,
          username: tag.username,
          displayName: tag.displayName,
          avatar: tag.avatar,
          positionX: tag.positionX,
          positionY: tag.positionY,
        })),
      })),
      caption,
      selectedTags,
      location,
      selectedSound,
      contentWarning,
      contentWarningType,
      lastSaved: new Date().toISOString(),
    };
    
    return JSON.stringify(data);
  }, [images, caption, selectedTags, location, selectedSound, contentWarning, contentWarningType]);

  // Save draft to database
  const saveDraft = useCallback(async (force = false) => {
    if (!user || images.length === 0) return;
    
    const currentData = serializeState();
    
    // Skip if no changes since last save (unless forced)
    if (!force && currentData === lastSavedDataRef.current) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      const draftData = JSON.parse(currentData);
      
      if (draftId) {
        // Update existing draft
        const { error } = await supabase
          .from('drafts')
          .update({
            draft_data: draftData,
            title: `Image Post Draft (${images.length} images)`,
            updated_at: new Date().toISOString(),
          })
          .eq('id', draftId);
          
        if (error) throw error;
      } else {
        // Create new draft
        const { data, error } = await supabase
          .from('drafts')
          .insert({
            user_id: user.id,
            content_type: 'image',
            title: `Image Post Draft (${images.length} images)`,
            draft_data: draftData,
          })
          .select()
          .single();
          
        if (error) throw error;
        if (data) setDraftId(data.id);
      }
      
      lastSavedDataRef.current = currentData;
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save draft:', error);
    } finally {
      setIsSaving(false);
    }
  }, [user, images, draftId, serializeState]);

  // Delete draft
  const deleteDraft = useCallback(async () => {
    if (!draftId) return;
    
    try {
      await supabase.from('drafts').delete().eq('id', draftId);
      setDraftId(null);
      lastSavedDataRef.current = '';
      setLastSaved(null);
    } catch (error) {
      console.error('Failed to delete draft:', error);
    }
  }, [draftId]);

  // Check for unsaved changes
  useEffect(() => {
    if (images.length === 0) {
      setHasUnsavedChanges(false);
      return;
    }
    
    const currentData = serializeState();
    setHasUnsavedChanges(currentData !== lastSavedDataRef.current);
  }, [images, caption, selectedTags, location, selectedSound, contentWarning, contentWarningType, serializeState]);

  // Auto-save timer
  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
    }
    
    if (user && images.length > 0) {
      autoSaveTimerRef.current = setInterval(() => {
        saveDraft();
      }, autoSaveIntervalMs);
    }
    
    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [user, images.length, autoSaveIntervalMs, saveDraft]);

  // Load existing draft on mount
  useEffect(() => {
    async function loadDraft() {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('drafts')
          .select('*')
          .eq('user_id', user.id)
          .eq('content_type', 'image')
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();
          
        if (error) {
          if (error.code !== 'PGRST116') { // No rows found is ok
            console.error('Error loading draft:', error);
          }
          onDraftLoaded?.(false);
          return;
        }
        
        if (data) {
          setDraftId(data.id);
          // Draft exists but we don't auto-restore (user must choose)
          onDraftLoaded?.(true);
        }
      } catch (error) {
        console.error('Error loading draft:', error);
        onDraftLoaded?.(false);
      }
    }
    
    loadDraft();
  }, [user, onDraftLoaded]);

  // Save before unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (hasUnsavedChanges && images.length > 0) {
        // Use sendBeacon for reliable background save
        // Note: This is a best-effort save
        saveDraft(true);
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, images.length, saveDraft]);

  return {
    draftId,
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    saveDraft,
    deleteDraft,
  };
}
