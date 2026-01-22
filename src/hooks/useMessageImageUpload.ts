import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface UseMessageImageUploadResult {
  isUploading: boolean;
  uploadProgress: number;
  pendingImage: { file: File; preview: string } | null;
  selectImage: (file: File) => void;
  clearPendingImage: () => void;
  uploadImage: () => Promise<string | null>;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export function useMessageImageUpload(): UseMessageImageUploadResult {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [pendingImage, setPendingImage] = useState<{ file: File; preview: string } | null>(null);

  const selectImage = useCallback((file: File) => {
    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Please select a valid image (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Image must be less than 10MB');
      return;
    }

    // Create preview URL
    const preview = URL.createObjectURL(file);
    setPendingImage({ file, preview });
  }, []);

  const clearPendingImage = useCallback(() => {
    if (pendingImage?.preview) {
      URL.revokeObjectURL(pendingImage.preview);
    }
    setPendingImage(null);
    setUploadProgress(0);
  }, [pendingImage]);

  const uploadImage = useCallback(async (): Promise<string | null> => {
    if (!pendingImage || !user?.id) {
      return null;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Generate unique file path
      const fileExt = pendingImage.file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `messages/${fileName}`;

      // Simulate progress (Supabase doesn't provide real progress for small files)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('media')
        .upload(filePath, pendingImage.file, {
          cacheControl: '3600',
          upsert: false,
        });

      clearInterval(progressInterval);

      if (error) {
        console.error('Upload error:', error);
        toast.error('Failed to upload image');
        return null;
      }

      setUploadProgress(100);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(data.path);

      // Clear pending image after successful upload
      clearPendingImage();

      return urlData.publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [pendingImage, user?.id, clearPendingImage]);

  return {
    isUploading,
    uploadProgress,
    pendingImage,
    selectImage,
    clearPendingImage,
    uploadImage,
  };
}
