-- Create table to store user device viewport metrics
CREATE TABLE public.user_device_metrics (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  device_type TEXT NOT NULL DEFAULT 'phone',
  viewport_width INTEGER NOT NULL,
  device_pixel_ratio DECIMAL(4,2) NOT NULL,
  pointer_type TEXT NOT NULL DEFAULT 'coarse',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_device_metrics ENABLE ROW LEVEL SECURITY;

-- Users can view their own metrics
CREATE POLICY "Users can view their own device metrics"
ON public.user_device_metrics FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own metrics
CREATE POLICY "Users can insert their own device metrics"
ON public.user_device_metrics FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own metrics
CREATE POLICY "Users can update their own device metrics"
ON public.user_device_metrics FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own metrics
CREATE POLICY "Users can delete their own device metrics"
ON public.user_device_metrics FOR DELETE
USING (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE TRIGGER update_user_device_metrics_updated_at
BEFORE UPDATE ON public.user_device_metrics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();