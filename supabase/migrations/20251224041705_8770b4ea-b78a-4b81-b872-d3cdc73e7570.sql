-- Create table for user grid layout preference
CREATE TABLE public.user_grid_layout_preference (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  layout_style TEXT NOT NULL DEFAULT 'uniform' CHECK (layout_style IN ('uniform', 'masonry', 'featured')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_grid_layout_preference ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view any grid layout preference"
ON public.user_grid_layout_preference
FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own grid layout preference"
ON public.user_grid_layout_preference
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own grid layout preference"
ON public.user_grid_layout_preference
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own grid layout preference"
ON public.user_grid_layout_preference
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_grid_layout_preference_updated_at
  BEFORE UPDATE ON public.user_grid_layout_preference
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();