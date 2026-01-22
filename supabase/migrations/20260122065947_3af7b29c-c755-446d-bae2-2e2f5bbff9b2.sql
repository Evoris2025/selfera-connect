-- Add foreign key for user_support_links to enable joins with profiles for client lookups
-- First check if the constraint exists and add it if not
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_support_links_user_id_fkey'
  ) THEN
    ALTER TABLE public.user_support_links 
    ADD CONSTRAINT user_support_links_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add unique constraint to prevent duplicate connections
ALTER TABLE public.user_support_links 
ADD CONSTRAINT user_support_links_unique_connection 
UNIQUE (user_id, provider_user_id);
