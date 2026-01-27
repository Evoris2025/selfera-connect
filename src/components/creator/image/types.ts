// Core types for ImageStudio

export type AspectRatio = 'original' | 'square' | 'portrait' | 'landscape';
export type BlurMode = 'off' | 'radial' | 'linear';

export interface CropData {
  scale: number;
  translateX: number;
  translateY: number;
  aspectRatio: AspectRatio;
  rotation: number; // -45 to 45 degrees
}

export interface BlurSettings {
  mode: BlurMode;
  intensity: number; // 0-100
  positionX: number; // 0-100 for center position
  positionY: number; // 0-100 for center position
  radius: number; // 0-100 for radial size or linear spread
}

export interface ColorGrading {
  shadowTint: string; // HSL color string like 'hsl(220, 80%, 30%)'
  shadowIntensity: number; // 0-100
  highlightTint: string;
  highlightIntensity: number; // 0-100
}

export interface ImageAdjustments {
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
}

export interface CarouselImage {
  id: string;
  file: File;
  previewUrl: string;
  // Compressed file (ready for upload)
  compressedFile?: File;
  isCompressing?: boolean;
  // Filter
  filter: number;
  filterIntensity: number;
  // Adjustments
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
  // Blur (Tilt-Shift)
  blur: BlurSettings;
  // Color Grading
  colorGrading: ColorGrading;
  // Crop
  cropData: CropData;
  aspectRatio: AspectRatio;
  // Metadata
  altText: string;
  // Per-image user tags
  userTags: UserTag[];
}

export interface UserTag {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatar?: string;
  positionX: number; // 0-100 percentage
  positionY: number; // 0-100 percentage
}

export const DEFAULT_ADJUSTMENTS: ImageAdjustments = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  warmth: 0,
  highlights: 0,
  shadows: 0,
  vignette: 0,
  sharpen: 0,
  structure: 0,
  fade: 0,
};

export const DEFAULT_BLUR: BlurSettings = {
  mode: 'off',
  intensity: 50,
  positionX: 50,
  positionY: 50,
  radius: 50,
};

export const DEFAULT_COLOR_GRADING: ColorGrading = {
  shadowTint: 'hsl(220, 50%, 30%)',
  shadowIntensity: 0,
  highlightTint: 'hsl(40, 50%, 70%)',
  highlightIntensity: 0,
};

export const DEFAULT_CROP_DATA: CropData = {
  scale: 1,
  translateX: 0,
  translateY: 0,
  aspectRatio: 'original',
  rotation: 0,
};

export function createCarouselImage(file: File): CarouselImage {
  return {
    id: `img-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    file,
    previewUrl: URL.createObjectURL(file),
    compressedFile: undefined,
    isCompressing: false,
    filter: 0,
    filterIntensity: 100,
    ...DEFAULT_ADJUSTMENTS,
    blur: { ...DEFAULT_BLUR },
    colorGrading: { ...DEFAULT_COLOR_GRADING },
    cropData: { ...DEFAULT_CROP_DATA },
    aspectRatio: 'original',
    altText: '',
    userTags: [],
  };
}
