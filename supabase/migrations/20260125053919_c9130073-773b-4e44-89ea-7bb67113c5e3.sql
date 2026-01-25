-- Add 'accepted' and 'declined' to interaction_status enum
-- These must be committed before they can be used
ALTER TYPE public.interaction_status ADD VALUE IF NOT EXISTS 'accepted';
ALTER TYPE public.interaction_status ADD VALUE IF NOT EXISTS 'declined';