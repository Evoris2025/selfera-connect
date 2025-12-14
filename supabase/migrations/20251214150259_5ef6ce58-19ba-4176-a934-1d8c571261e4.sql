-- Create user profile grid order table
CREATE TABLE public.user_profile_grid_order (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ordered_post_ids UUID[] NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_profile_grid_order ENABLE ROW LEVEL SECURITY;

-- Users can view their own grid order
CREATE POLICY "Users can view their own grid order" ON public.user_profile_grid_order
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own grid order
CREATE POLICY "Users can insert their own grid order" ON public.user_profile_grid_order
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own grid order
CREATE POLICY "Users can update their own grid order" ON public.user_profile_grid_order
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own grid order
CREATE POLICY "Users can delete their own grid order" ON public.user_profile_grid_order
  FOR DELETE USING (auth.uid() = user_id);

-- Add index for faster lookups
CREATE INDEX idx_user_profile_grid_order_user ON public.user_profile_grid_order(user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_user_profile_grid_order_updated_at
  BEFORE UPDATE ON public.user_profile_grid_order
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();