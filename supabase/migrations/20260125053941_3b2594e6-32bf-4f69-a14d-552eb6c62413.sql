-- Add metadata column for storing decline reasons, cancellation info, etc.
ALTER TABLE public.interactions 
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Add column to track who initiated cancellation
ALTER TABLE public.interactions 
ADD COLUMN IF NOT EXISTS cancelled_by uuid REFERENCES auth.users(id);

-- Create trigger for interaction notifications
CREATE OR REPLACE FUNCTION public.create_notification_on_interaction()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Handle different status changes
  IF TG_OP = 'INSERT' THEN
    -- New interaction request - notify provider
    IF NEW.status = 'requested' THEN
      INSERT INTO notifications (user_id, actor_id, type, target_type, target_id, message)
      VALUES (NEW.provider_user_id, NEW.client_user_id, 'interaction_requested', 'interaction', NEW.id::text, 'New interaction request');
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Status changed - send appropriate notification
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      CASE NEW.status
        WHEN 'accepted' THEN
          INSERT INTO notifications (user_id, actor_id, type, target_type, target_id, message)
          VALUES (NEW.client_user_id, NEW.provider_user_id, 'interaction_accepted', 'interaction', NEW.id::text, 'Your interaction request was accepted');
        WHEN 'declined' THEN
          INSERT INTO notifications (user_id, actor_id, type, target_type, target_id, message)
          VALUES (NEW.client_user_id, NEW.provider_user_id, 'interaction_declined', 'interaction', NEW.id::text, 'Your interaction request was declined');
        WHEN 'confirmed' THEN
          INSERT INTO notifications (user_id, actor_id, type, target_type, target_id, message)
          VALUES (NEW.provider_user_id, NEW.client_user_id, 'interaction_confirmed', 'interaction', NEW.id::text, 'Interaction confirmed');
        WHEN 'completed' THEN
          INSERT INTO notifications (user_id, actor_id, type, target_type, target_id, message)
          VALUES (NEW.client_user_id, NEW.provider_user_id, 'interaction_completed', 'interaction', NEW.id::text, 'Interaction completed');
          INSERT INTO notifications (user_id, actor_id, type, target_type, target_id, message)
          VALUES (NEW.provider_user_id, NEW.client_user_id, 'interaction_completed', 'interaction', NEW.id::text, 'Interaction completed');
        WHEN 'cancelled' THEN
          IF NEW.cancelled_by = NEW.client_user_id THEN
            INSERT INTO notifications (user_id, actor_id, type, target_type, target_id, message)
            VALUES (NEW.provider_user_id, NEW.client_user_id, 'interaction_cancelled', 'interaction', NEW.id::text, 'Interaction cancelled');
          ELSIF NEW.cancelled_by = NEW.provider_user_id THEN
            INSERT INTO notifications (user_id, actor_id, type, target_type, target_id, message)
            VALUES (NEW.client_user_id, NEW.provider_user_id, 'interaction_cancelled', 'interaction', NEW.id::text, 'Interaction cancelled');
          END IF;
        ELSE
          NULL;
      END CASE;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on interactions table
DROP TRIGGER IF EXISTS on_interaction_change ON public.interactions;
CREATE TRIGGER on_interaction_change
  AFTER INSERT OR UPDATE ON public.interactions
  FOR EACH ROW
  EXECUTE FUNCTION public.create_notification_on_interaction();

-- Update RLS policies for interactions to handle new statuses
DROP POLICY IF EXISTS "Providers can update interaction status" ON public.interactions;
CREATE POLICY "Providers can update interaction status" 
ON public.interactions 
FOR UPDATE 
USING (
  auth.uid() = provider_user_id AND 
  status IN ('requested', 'accepted', 'confirmed')
);

-- Allow clients to update their interactions (confirm after accepted, or cancel)
DROP POLICY IF EXISTS "Clients can update draft interactions" ON public.interactions;
CREATE POLICY "Clients can update their interactions" 
ON public.interactions 
FOR UPDATE 
USING (
  auth.uid() = client_user_id AND 
  status IN ('draft', 'accepted', 'confirmed')
);

-- Enable realtime for interactions table
ALTER PUBLICATION supabase_realtime ADD TABLE public.interactions;