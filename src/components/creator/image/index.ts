// Core types
export type { 
  CarouselImage, 
  AspectRatio, 
  CropData, 
  ImageAdjustments, 
  UserTag 
} from './types';
export { 
  createCarouselImage, 
  DEFAULT_ADJUSTMENTS, 
  DEFAULT_CROP_DATA 
} from './types';

// Enhanced components (Phase 1-4 upgrades)
export { GalleryFirstSelector } from './GalleryFirstSelector';
export { EnhancedCarouselEditor } from './EnhancedCarouselEditor';
export { EnhancedFilterLibrary, filters, getFilterClass, type ImageFilter, type FilterCategory } from './EnhancedFilterLibrary';
export { EnhancedCropTool, getAspectRatioClass } from './EnhancedCropTool';
export { PerImageUserTags } from './PerImageUserTags';
export { PerImageAltText } from './PerImageAltText';
export { UnsavedChangesDialog } from './UnsavedChangesDialog';
export { UploadProgressOverlay, type UploadStatus } from './UploadProgressOverlay';

// Hooks
export { useImageCompression } from './useImageCompression';
export { useImageExport } from './useImageExport';

// Existing components (keeping for backwards compatibility)
export { ImageCarouselEditor } from './ImageCarouselEditor';
export { CropTool } from './CropTool';
export { AdjustmentPanel, getAdjustmentStyles } from './AdjustmentPanel';
export { FilterLibrary } from './FilterLibrary';
export { UserTagOverlay } from './UserTagOverlay';
export { AltTextInput } from './AltTextInput';
export { GalleryGrid } from './GalleryGrid';
