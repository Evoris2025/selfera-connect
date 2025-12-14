-- Enable realtime for reactions table
ALTER TABLE public.reactions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reactions;