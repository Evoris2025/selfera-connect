// Core types
export type { 
  CarouselImage, 
  AspectRatio, 
  CropData, 
  ImageAdjustments, 
  UserTag,
  BlurSettings,
  BlurMode,
  ColorGrading,
} from './types';
export { 
  createCarouselImage, 
  DEFAULT_ADJUSTMENTS, 
  DEFAULT_CROP_DATA,
  DEFAULT_BLUR,
  DEFAULT_COLOR_GRADING,
} from './types';

// Enhanced components (Phase 1-4 upgrades)
export { GalleryFirstSelector } from './GalleryFirstSelector';
export { EnhancedCarouselEditor } from './EnhancedCarouselEditor';
export { EnhancedFilterLibrary, filters, getFilterClass, type ImageFilter, type FilterCategory } from './EnhancedFilterLibrary';
export { EnhancedCropTool, getAspectRatioClass } from './EnhancedCropTool';
export { CropControls } from './CropControls';
export { PerImageUserTags } from './PerImageUserTags';
export { PerImageAltText } from './PerImageAltText';
export { UnsavedChangesDialog } from './UnsavedChangesDialog';
export { UploadProgressOverlay, type UploadStatus } from './UploadProgressOverlay';

// Blur and Color Grading controls
export { BlurControl } from './BlurControl';
export { ColorGradingControl } from './ColorGradingControl';

// Undo/Redo and Presets
export { useEditHistory } from './useEditHistory';
export { useEditPresets, type EditPreset } from './useEditPresets';
export { PresetManager } from './PresetManager';
export { UndoRedoControls } from './UndoRedoControls';

// AI Enhancement
export { MagikButton } from './MagikButton';

// Before/After Comparison
export { BeforeAfterSlider } from './BeforeAfterSlider';

// Hooks
export { useImageCompression } from './useImageCompression';
export { useImageExport } from './useImageExport';
export { useDraftAutoSave } from './useDraftAutoSave';

// Existing components (keeping for backwards compatibility)
export { ImageCarouselEditor } from './ImageCarouselEditor';
export { CropTool } from './CropTool';
export { AdjustmentPanel, getAdjustmentStyles } from './AdjustmentPanel';
export { FilterLibrary } from './FilterLibrary';
export { UserTagOverlay } from './UserTagOverlay';
export { AltTextInput } from './AltTextInput';
