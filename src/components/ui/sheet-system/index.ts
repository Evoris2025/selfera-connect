// Backward-compatibility barrel.
// All brand primitives now live in @/components/brand. Existing imports from
// @/components/ui/sheet-system continue to resolve through this re-export.
export {
  BrandGradientDefs,
  BrandSheetContent,
  BrandDrawerContent,
  BrandSheetTitle,
  BrandSegmentedControl,
  type BrandSegmentedItem,
  BrandSheetSectionLabel,
  BrandSheetItem,
} from '@/components/brand';
