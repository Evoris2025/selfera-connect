import { useCallback } from 'react';
import type { CarouselImage, CropData, BlurSettings, ColorGrading } from './types';
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
 * Hook for exporting images with all edits applied (filters, adjustments, crop, rotation, blur, color grading).
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

  // Apply blur effect to canvas
  const applyBlurEffect = useCallback((
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    blur: BlurSettings
  ) => {
    if (blur.mode === 'off' || blur.intensity === 0) return;
    
    const { width, height } = canvas;
    const centerX = width * (blur.positionX / 100);
    const centerY = height * (blur.positionY / 100);
    const blurAmount = blur.intensity * 0.15; // Scale blur intensity
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, width, height);
    const originalData = new Uint8ClampedArray(imageData.data);
    
    // Create a temporary canvas for blur
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;
    
    // Draw blurred version
    tempCtx.filter = `blur(${blurAmount}px)`;
    tempCtx.drawImage(canvas, 0, 0);
    const blurredData = tempCtx.getImageData(0, 0, width, height);
    
    // Blend based on distance from focus point
    const radiusNormalized = blur.radius / 100;
    const maxDist = Math.max(width, height) * radiusNormalized;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        
        let dist: number;
        if (blur.mode === 'radial') {
          // Radial: distance from center point
          dist = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        } else {
          // Linear: distance from horizontal line
          dist = Math.abs(y - centerY);
        }
        
        // Calculate blend factor (0 = sharp, 1 = blurred)
        const blendFactor = Math.min(1, Math.max(0, (dist - maxDist * 0.5) / (maxDist * 0.5)));
        
        // Blend original and blurred
        imageData.data[i] = originalData[i] * (1 - blendFactor) + blurredData.data[i] * blendFactor;
        imageData.data[i + 1] = originalData[i + 1] * (1 - blendFactor) + blurredData.data[i + 1] * blendFactor;
        imageData.data[i + 2] = originalData[i + 2] * (1 - blendFactor) + blurredData.data[i + 2] * blendFactor;
        imageData.data[i + 3] = originalData[i + 3];
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  }, []);

  // Apply color grading effect
  const applyColorGrading = useCallback((
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    colorGrading: ColorGrading
  ) => {
    if (colorGrading.shadowIntensity === 0 && colorGrading.highlightIntensity === 0) return;
    
    const { width, height } = canvas;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // Parse HSL colors
    const parseShadowTint = parseHSL(colorGrading.shadowTint);
    const parseHighlightTint = parseHSL(colorGrading.highlightTint);
    
    const shadowRGB = hslToRgb(parseShadowTint.h, parseShadowTint.s, parseShadowTint.l);
    const highlightRGB = hslToRgb(parseHighlightTint.h, parseHighlightTint.s, parseHighlightTint.l);
    
    const shadowIntensity = colorGrading.shadowIntensity / 100 * 0.4; // Max 40% tint
    const highlightIntensity = colorGrading.highlightIntensity / 100 * 0.3; // Max 30% tint
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Calculate luminance (0-1)
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      
      // Apply shadow tint to dark areas
      if (shadowIntensity > 0 && lum < 0.5) {
        const factor = (0.5 - lum) * 2 * shadowIntensity;
        data[i] = r + (shadowRGB.r - r) * factor;
        data[i + 1] = g + (shadowRGB.g - g) * factor;
        data[i + 2] = b + (shadowRGB.b - b) * factor;
      }
      
      // Apply highlight tint to bright areas
      if (highlightIntensity > 0 && lum > 0.5) {
        const factor = (lum - 0.5) * 2 * highlightIntensity;
        data[i] = data[i] + (highlightRGB.r - data[i]) * factor;
        data[i + 1] = data[i + 1] + (highlightRGB.g - data[i + 1]) * factor;
        data[i + 2] = data[i + 2] + (highlightRGB.b - data[i + 2]) * factor;
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
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
          
          // Apply rotation if any
          const rotation = cropData.rotation || 0;
          if (rotation !== 0) {
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate((rotation * Math.PI) / 180);
            ctx.translate(-canvas.width / 2, -canvas.height / 2);
          }
          
          // Draw image
          ctx.drawImage(
            img,
            sourceX, sourceY, sourceW, sourceH,
            0, 0, canvas.width, canvas.height
          );
          
          if (rotation !== 0) {
            ctx.restore();
          }
          
          // Apply blur effect (tilt-shift)
          if (image.blur && image.blur.mode !== 'off') {
            applyBlurEffect(ctx, canvas, image.blur);
          }
          
          // Apply color grading
          if (image.colorGrading) {
            applyColorGrading(ctx, canvas, image.colorGrading);
          }
          
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
  }, [buildFilterString, getAspectRatioDimensions, applyBlurEffect, applyColorGrading]);

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

// Helper functions for color parsing
function parseHSL(hsl: string): { h: number; s: number; l: number } {
  const match = hsl.match(/hsl\((\d+),\s*(\d+)%?,\s*(\d+)%?\)/);
  if (!match) return { h: 0, s: 0, l: 0 };
  return {
    h: parseInt(match[1]) / 360,
    s: parseInt(match[2]) / 100,
    l: parseInt(match[3]) / 100,
  };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}
