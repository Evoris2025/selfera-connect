/**
 * Image compression utility for reducing file sizes before upload.
 * Uses canvas-based compression for JPEG/PNG/WebP.
 */

interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1, default 0.8
  outputType?: 'image/jpeg' | 'image/png' | 'image/webp';
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.8,
};

/**
 * Compresses an image file using canvas.
 * GIF files are returned as-is since canvas doesn't preserve animation.
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  // Skip compression for GIFs (would lose animation)
  if (file.type === 'image/gif') {
    return file;
  }

  // Skip if file is already small (under 200KB)
  if (file.size < 200 * 1024) {
    return file;
  }

  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      // Calculate new dimensions
      let { width, height } = img;
      const maxW = opts.maxWidth || 1920;
      const maxH = opts.maxHeight || 1920;
      
      if (width > maxW || height > maxH) {
        const ratio = Math.min(maxW / width, maxH / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      
      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file); // Fallback to original
        return;
      }
      
      // Draw with smooth scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);
      
      // Determine output type - prefer WebP for best compression
      const outputType = opts.outputType || 
        (file.type === 'image/png' ? 'image/png' : 'image/webp');
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          
          // Only use compressed version if it's actually smaller
          if (blob.size >= file.size) {
            resolve(file);
            return;
          }
          
          // Create new file with compressed blob
          const ext = outputType === 'image/webp' ? 'webp' : 
                      outputType === 'image/png' ? 'png' : 'jpg';
          const newName = file.name.replace(/\.[^.]+$/, `.${ext}`);
          
          const compressedFile = new File([blob], newName, {
            type: outputType,
            lastModified: Date.now(),
          });
          
          resolve(compressedFile);
        },
        outputType,
        opts.quality
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file); // Fallback to original on error
    };
    
    img.src = url;
  });
}

/**
 * Compresses multiple images in parallel.
 */
export async function compressImages(
  files: File[],
  options: CompressionOptions = {}
): Promise<File[]> {
  return Promise.all(files.map(file => compressImage(file, options)));
}

/**
 * Formats file size for display.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
