import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface PendingImage {
  id: string;
  file: File;
  preview: string;
}

interface UseMessageImageUploadResult {
  isUploading: boolean;
  uploadProgress: number;
  pendingImages: PendingImage[];
  selectImages: (files: FileList | File[]) => void;
  removePendingImage: (id: string) => void;
  clearPendingImages: () => void;
  uploadImages: () => Promise<string[]>;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGES = 10;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export function useMessageImageUpload(): UseMessageImageUploadResult {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);

  const selectImages = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles: PendingImage[] = [];
    
    for (const file of fileArray) {
      // Check max limit
      if (pendingImages.length + validFiles.length >= MAX_IMAGES) {
        toast.error(`Maximum ${MAX_IMAGES} images allowed`);
        break;
      }

      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`${file.name}: Invalid format. Use JPEG, PNG, GIF, or WebP`);
        continue;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name}: Must be less than 10MB`);
        continue;
      }

      // Create preview URL
      const preview = URL.createObjectURL(file);
      validFiles.push({
        id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
        file,
        preview,
      });
    }

    if (validFiles.length > 0) {
      setPendingImages(prev => [...prev, ...validFiles]);
    }
  }, [pendingImages.length]);

  const removePendingImage = useCallback((id: string) => {
    setPendingImages(prev => {
      const image = prev.find(img => img.id === id);
      if (image?.preview) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter(img => img.id !== id);
    });
  }, []);

  const clearPendingImages = useCallback(() => {
    pendingImages.forEach(img => {
      if (img.preview) {
        URL.revokeObjectURL(img.preview);
      }
    });
    setPendingImages([]);
    setUploadProgress(0);
  }, [pendingImages]);

  const uploadImages = useCallback(async (): Promise<string[]> => {
    if (pendingImages.length === 0 || !user?.id) {
      return [];
    }

    setIsUploading(true);
    setUploadProgress(0);

    const uploadedUrls: string[] = [];
    const totalImages = pendingImages.length;

    try {
      for (let i = 0; i < pendingImages.length; i++) {
        const pending = pendingImages[i];
        
        // Update progress
        setUploadProgress(Math.round((i / totalImages) * 100));

        // Generate unique file path
        const fileExt = pending.file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `messages/${fileName}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('media')
          .upload(filePath, pending.file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (error) {
          console.error('Upload error:', error);
          toast.error(`Failed to upload ${pending.file.name}`);
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('media')
          .getPublicUrl(data.path);

        uploadedUrls.push(urlData.publicUrl);
      }

      setUploadProgress(100);

      // Clear pending images after successful upload
      clearPendingImages();

      return uploadedUrls;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images');
      return uploadedUrls;
    } finally {
      setIsUploading(false);
    }
  }, [pendingImages, user?.id, clearPendingImages]);

  return {
    isUploading,
    uploadProgress,
    pendingImages,
    selectImages,
    removePendingImage,
    clearPendingImages,
    uploadImages,
  };
}
