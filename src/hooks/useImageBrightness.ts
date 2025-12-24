import { useState, useEffect } from 'react';

type TextColorMode = 'light' | 'dark';

export function useImageBrightness(imageUrl: string): TextColorMode {
  const [colorMode, setColorMode] = useState<TextColorMode>('light');

  useEffect(() => {
    if (!imageUrl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          setColorMode('light');
          return;
        }

        // Sample a smaller version for performance
        const sampleSize = 50;
        canvas.width = sampleSize;
        canvas.height = sampleSize;
        
        ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
        
        const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
        const data = imageData.data;
        
        let totalLuminance = 0;
        const pixelCount = sampleSize * sampleSize;
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Calculate relative luminance using sRGB formula
          const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          totalLuminance += luminance;
        }
        
        const avgLuminance = totalLuminance / pixelCount;
        
        // If average luminance is above threshold, background is light -> use dark text
        // Otherwise background is dark -> use light text
        setColorMode(avgLuminance > 0.5 ? 'dark' : 'light');
      } catch (error) {
        // If CORS or other error, default to light text (assuming dark background)
        setColorMode('light');
      }
    };

    img.onerror = () => {
      setColorMode('light');
    };

    img.src = imageUrl;
  }, [imageUrl]);

  return colorMode;
}
