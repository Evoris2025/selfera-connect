import { useCallback, useRef } from 'react';
import { compressImage } from '@/lib/imageCompression';
import type { CarouselImage } from './types';

interface UseImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

/**
 * Hook for non-blocking background image compression.
 * Images are shown immediately, compression happens in background.
 */
export function useImageCompression(
  onImageUpdate: (id: string, updates: Partial<CarouselImage>) => void,
  options: UseImageCompressionOptions = {}
) {
  const compressionQueue = useRef<Map<string, AbortController>>(new Map());

  const compressInBackground = useCallback(async (image: CarouselImage) => {
    // Cancel any existing compression for this image
    const existing = compressionQueue.current.get(image.id);
    if (existing) {
      existing.abort();
    }

    const controller = new AbortController();
    compressionQueue.current.set(image.id, controller);

    // Mark as compressing
    onImageUpdate(image.id, { isCompressing: true });

    try {
      const compressed = await compressImage(image.file, {
        maxWidth: options.maxWidth || 1920,
        maxHeight: options.maxHeight || 1920,
        quality: options.quality || 0.85,
      });

      // Check if aborted
      if (controller.signal.aborted) return;

      // Update with compressed file
      onImageUpdate(image.id, {
        compressedFile: compressed,
        isCompressing: false,
      });

      compressionQueue.current.delete(image.id);
    } catch (error) {
      if (controller.signal.aborted) return;
      
      console.error('Compression failed for image:', image.id, error);
      // Fall back to original file
      onImageUpdate(image.id, {
        compressedFile: image.file,
        isCompressing: false,
      });
      compressionQueue.current.delete(image.id);
    }
  }, [onImageUpdate, options]);

  const cancelCompression = useCallback((imageId: string) => {
    const controller = compressionQueue.current.get(imageId);
    if (controller) {
      controller.abort();
      compressionQueue.current.delete(imageId);
    }
  }, []);

  const cancelAll = useCallback(() => {
    compressionQueue.current.forEach((controller) => controller.abort());
    compressionQueue.current.clear();
  }, []);

  return {
    compressInBackground,
    cancelCompression,
    cancelAll,
  };
}
