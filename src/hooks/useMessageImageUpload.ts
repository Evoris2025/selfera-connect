import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { compressImage, formatFileSize } from '@/lib/imageCompression';

interface PendingImage {
  id: string;
  file: File;
  preview: string;
  originalSize?: number;
  compressedSize?: number;
}

interface UseMessageImageUploadResult {
  isUploading: boolean;
  uploadProgress: number;
  pendingImages: PendingImage[];
  selectImages: (files: FileList | File[]) => void;
  removePendingImage: (id: string) => void;
  clearPendingImages: () => void;
  uploadImages: () => Promise<string[]>;
  isDragging: boolean;
  handleDragEnter: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGES = 10;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export function useMessageImageUpload(): UseMessageImageUploadResult {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);

  const processAndAddImages = useCallback(async (files: File[]) => {
    const currentCount = pendingImages.length;
    const validFiles: PendingImage[] = [];
    
    for (const file of files) {
      // Check max limit
      if (currentCount + validFiles.length >= MAX_IMAGES) {
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

      // Compress the image
      const originalSize = file.size;
      const compressedFile = await compressImage(file, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.85,
      });

      // Show compression result if significant
      if (compressedFile.size < originalSize * 0.9) {
        const saved = originalSize - compressedFile.size;
        console.log(`Compressed ${file.name}: ${formatFileSize(originalSize)} → ${formatFileSize(compressedFile.size)} (saved ${formatFileSize(saved)})`);
      }

      // Create preview URL
      const preview = URL.createObjectURL(compressedFile);
      validFiles.push({
        id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
        file: compressedFile,
        preview,
        originalSize,
        compressedSize: compressedFile.size,
      });
    }

    if (validFiles.length > 0) {
      setPendingImages(prev => [...prev, ...validFiles]);
      
      // Show compression summary for multiple images
      if (validFiles.length > 1) {
        const totalOriginal = validFiles.reduce((acc, f) => acc + (f.originalSize || 0), 0);
        const totalCompressed = validFiles.reduce((acc, f) => acc + (f.compressedSize || 0), 0);
        if (totalCompressed < totalOriginal * 0.9) {
          toast.success(`Compressed ${validFiles.length} images (saved ${formatFileSize(totalOriginal - totalCompressed)})`);
        }
      }
    }
  }, [pendingImages.length]);

  const selectImages = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    processAndAddImages(fileArray);
  }, [processAndAddImages]);

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

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      // Filter for image files only
      const imageFiles = Array.from(files).filter(file => 
        ALLOWED_TYPES.includes(file.type)
      );
      
      if (imageFiles.length === 0) {
        toast.error('Please drop image files only (JPEG, PNG, GIF, or WebP)');
        return;
      }
      
      if (imageFiles.length < files.length) {
        toast.info(`${files.length - imageFiles.length} non-image files were skipped`);
      }
      
      processAndAddImages(imageFiles);
    }
  }, [processAndAddImages]);

  return {
    isUploading,
    uploadProgress,
    pendingImages,
    selectImages,
    removePendingImage,
    clearPendingImages,
    uploadImages,
    isDragging,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
  };
}
