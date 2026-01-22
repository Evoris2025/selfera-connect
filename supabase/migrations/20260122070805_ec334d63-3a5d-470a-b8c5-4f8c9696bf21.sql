-- Create function to notify provider when a connection is requested
CREATE OR REPLACE FUNCTION public.create_notification_on_connection_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Notify the provider about the new connection request
  INSERT INTO notifications (user_id, actor_id, type, target_type, target_id, message)
  VALUES (
    NEW.provider_user_id,
    NEW.user_id,
    'connection_request',
    'support_link',
    NEW.id::text,
    NEW.provider_role || ' connection request'
  );
  RETURN NEW;
END;
$function$;

-- Create trigger on user_support_links INSERT
CREATE TRIGGER on_connection_request_notification
  AFTER INSERT ON user_support_links
  FOR EACH ROW
  EXECUTE FUNCTION public.create_notification_on_connection_request();

-- Enable realtime for user_support_links table
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_support_links;