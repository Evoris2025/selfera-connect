import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EnhancementValues {
  brightness: number;
  contrast: number;
  saturation: number;
  warmth: number;
  highlights: number;
  shadows: number;
}

interface UseImageEnhanceReturn {
  enhance: (imageUrl: string) => Promise<EnhancementValues | null>;
  isEnhancing: boolean;
  error: string | null;
}

// Convert image URL to base64
async function imageUrlToBase64(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Only set crossOrigin for remote URLs; blob:/data: URLs fail with it set
    if (!url.startsWith('blob:') && !url.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => {
      const canvas = document.createElement('canvas');
      // Resize to max 512px for faster processing
      const maxSize = 512;
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to base64 JPEG with reduced quality for smaller payload
      const base64 = canvas.toDataURL('image/jpeg', 0.7);
      resolve(base64);
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
}

// Algorithmic fallback enhancement
function algorithmicEnhance(): EnhancementValues {
  // Return subtle, universally flattering adjustments
  return {
    brightness: 105,
    contrast: 108,
    saturation: 110,
    warmth: 2,
    highlights: -5,
    shadows: 12,
  };
}

export function useImageEnhance(): UseImageEnhanceReturn {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enhance = useCallback(async (imageUrl: string): Promise<EnhancementValues | null> => {
    setIsEnhancing(true);
    setError(null);

    try {
      // Convert image to base64
      const imageBase64 = await imageUrlToBase64(imageUrl);
      
      // Call edge function
      const { data, error: fnError } = await supabase.functions.invoke('image-enhance', {
        body: { imageBase64 },
      });

      if (fnError) {
        console.error('Edge function error:', fnError);
        // Use fallback on error
        return algorithmicEnhance();
      }

      if (data?.enhancements) {
        return data.enhancements as EnhancementValues;
      }

      // Fallback if no valid response
      return algorithmicEnhance();
    } catch (err) {
      console.error('Enhancement error:', err);
      setError(err instanceof Error ? err.message : 'Enhancement failed');
      // Return fallback values so the feature still works
      return algorithmicEnhance();
    } finally {
      setIsEnhancing(false);
    }
  }, []);

  return { enhance, isEnhancing, error };
}
