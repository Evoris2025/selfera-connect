import { useCallback } from 'react';
import type { CarouselImage, CropData } from './types';
import { filters } from './FilterLibrary';

interface ExportOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'image/webp' | 'image/jpeg' | 'image/png';
}

interface ExportResult {
  file: File;
  url: string;
}

/**
 * Hook for exporting images with all edits applied (filters, adjustments, crop).
 * Uses canvas to render the final output.
 */
export function useImageExport() {
  const getAspectRatioDimensions = useCallback((ratio: CropData['aspectRatio'], imgWidth: number, imgHeight: number) => {
    switch (ratio) {
      case 'square':
        const minDim = Math.min(imgWidth, imgHeight);
        return { width: minDim, height: minDim };
      case 'portrait':
        return { width: imgWidth, height: imgWidth * (5 / 4) };
      case 'landscape':
        return { width: imgHeight * (16 / 9), height: imgHeight };
      default:
        return { width: imgWidth, height: imgHeight };
    }
  }, []);

  const buildFilterString = useCallback((image: CarouselImage): string => {
    const parts: string[] = [];
    
    // Base adjustments
    parts.push(`brightness(${image.brightness}%)`);
    parts.push(`contrast(${image.contrast}%)`);
    parts.push(`saturate(${image.saturation}%)`);
    
    // Warmth as hue rotation
    if (image.warmth !== 0) {
      const hue = image.warmth > 0 ? image.warmth * 0.2 : image.warmth * 0.3;
      parts.push(`hue-rotate(${hue}deg)`);
      if (image.warmth > 0) {
        parts.push(`sepia(${image.warmth * 0.002})`);
      }
    }
    
    // Fade effect
    if (image.fade > 0) {
      const fadeAmount = 1 - (image.fade * 0.003);
      parts.push(`contrast(${100 * fadeAmount}%)`);
    }
    
    // Apply filter class properties
    const filter = filters[image.filter];
    if (filter && image.filter > 0 && image.filterIntensity > 0) {
      // Parse the CSS filter class and extract values
      const filterClass = filter.class;
      
      // Handle grayscale
      if (filterClass.includes('grayscale')) {
        const intensity = (image.filterIntensity / 100);
        parts.push(`grayscale(${intensity})`);
      }
      
      // Handle sepia
      const sepiaMatch = filterClass.match(/sepia-\[([^\]]+)\]/);
      if (sepiaMatch) {
        const baseSepia = parseFloat(sepiaMatch[1]);
        parts.push(`sepia(${baseSepia * (image.filterIntensity / 100)})`);
      }
    }
    
    return parts.join(' ');
  }, []);

  const exportImage = useCallback(async (
    image: CarouselImage,
    options: ExportOptions = {}
  ): Promise<ExportResult> => {
    const {
      maxWidth = 1920,
      maxHeight = 1920,
      quality = 0.85,
      format = 'image/webp',
    } = options;

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          // Calculate crop dimensions
          const cropData = image.cropData;
          const aspectDims = getAspectRatioDimensions(
            cropData.aspectRatio,
            img.naturalWidth,
            img.naturalHeight
          );
          
          // Apply scale and constrain to max dimensions
          let outputWidth = aspectDims.width * cropData.scale;
          let outputHeight = aspectDims.height * cropData.scale;
          
          // Scale down if exceeds max
          if (outputWidth > maxWidth || outputHeight > maxHeight) {
            const scaleRatio = Math.min(maxWidth / outputWidth, maxHeight / outputHeight);
            outputWidth *= scaleRatio;
            outputHeight *= scaleRatio;
          }
          
          // Create canvas
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(outputWidth);
          canvas.height = Math.round(outputHeight);
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          
          // Apply filters
          ctx.filter = buildFilterString(image);
          
          // Enable smooth scaling
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          
          // Calculate source crop region
          const sourceAspect = aspectDims.width / aspectDims.height;
          const imgAspect = img.naturalWidth / img.naturalHeight;
          
          let sourceX = 0, sourceY = 0, sourceW = img.naturalWidth, sourceH = img.naturalHeight;
          
          if (imgAspect > sourceAspect) {
            // Image is wider, crop sides
            sourceW = img.naturalHeight * sourceAspect;
            sourceX = (img.naturalWidth - sourceW) / 2 + (cropData.translateX * sourceW / 100);
          } else {
            // Image is taller, crop top/bottom
            sourceH = img.naturalWidth / sourceAspect;
            sourceY = (img.naturalHeight - sourceH) / 2 + (cropData.translateY * sourceH / 100);
          }
          
          // Clamp source region
          sourceX = Math.max(0, Math.min(img.naturalWidth - sourceW, sourceX));
          sourceY = Math.max(0, Math.min(img.naturalHeight - sourceH, sourceY));
          
          // Draw image
          ctx.drawImage(
            img,
            sourceX, sourceY, sourceW, sourceH,
            0, 0, canvas.width, canvas.height
          );
          
          // Apply vignette if set
          if (image.vignette > 0) {
            const gradient = ctx.createRadialGradient(
              canvas.width / 2, canvas.height / 2, 0,
              canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
            );
            gradient.addColorStop(0.5, 'rgba(0,0,0,0)');
            gradient.addColorStop(1, `rgba(0,0,0,${image.vignette / 100 * 0.7})`);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          
          // Export to blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to export image'));
                return;
              }
              
              const ext = format === 'image/webp' ? 'webp' : format === 'image/png' ? 'png' : 'jpg';
              const fileName = image.file.name.replace(/\.[^.]+$/, `.${ext}`);
              
              const file = new File([blob], fileName, { type: format });
              const url = URL.createObjectURL(blob);
              
              resolve({ file, url });
            },
            format,
            quality
          );
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image for export'));
      };
      
      img.src = image.previewUrl;
    });
  }, [buildFilterString, getAspectRatioDimensions]);

  const exportAllImages = useCallback(async (
    images: CarouselImage[],
    options: ExportOptions = {},
    onProgress?: (current: number, total: number, status: 'preparing' | 'exporting') => void
  ): Promise<ExportResult[]> => {
    const results: ExportResult[] = [];
    
    for (let i = 0; i < images.length; i++) {
      onProgress?.(i + 1, images.length, 'exporting');
      const result = await exportImage(images[i], options);
      results.push(result);
    }
    
    return results;
  }, [exportImage]);

  return {
    exportImage,
    exportAllImages,
  };
}
