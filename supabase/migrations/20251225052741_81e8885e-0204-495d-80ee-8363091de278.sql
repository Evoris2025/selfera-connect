-- Allow new mosaic layout styles for grid layout preference

-- 1) Normalize legacy/unknown values so the new constraint won't fail
UPDATE public.user_grid_layout_preference
SET layout_style = 'uniform'
WHERE layout_style NOT IN ('uniform', 'mosaic4', 'mosaic5', 'mosaic6', 'mosaic7', 'mosaic8');

-- 2) Replace the old constraint (uniform/masonry/featured) with the new set
ALTER TABLE public.user_grid_layout_preference
  DROP CONSTRAINT IF EXISTS user_grid_layout_preference_layout_style_check;

ALTER TABLE public.user_grid_layout_preference
  ADD CONSTRAINT user_grid_layout_preference_layout_style_check
  CHECK (layout_style IN ('uniform', 'mosaic4', 'mosaic5', 'mosaic6', 'mosaic7', 'mosaic8'));
