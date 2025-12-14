-- Create table for storing user profile tab order
CREATE TABLE public.user_profile_tab_order (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  ordered_tab_ids TEXT[] NOT NULL DEFAULT ARRAY['posts', 'expressions', 'reels', 'community', 'library']::TEXT[],
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_profile_tab_order ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own tab order"
ON public.user_profile_tab_order
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tab order"
ON public.user_profile_tab_order
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tab order"
ON public.user_profile_tab_order
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tab order"
ON public.user_profile_tab_order
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_profile_tab_order_updated_at
BEFORE UPDATE ON public.user_profile_tab_order
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();