
-- Add is_verified column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;

-- Create index for verified filter performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_verified ON public.profiles(is_verified) WHERE is_verified = true;

-- Add owner_profile_id to service_directory_entries for linking verified profiles
ALTER TABLE public.service_directory_entries 
ADD COLUMN IF NOT EXISTS owner_profile_id uuid REFERENCES public.profiles(id);

-- Create index for directory profile lookups
CREATE INDEX IF NOT EXISTS idx_directory_owner_profile ON public.service_directory_entries(owner_profile_id) WHERE owner_profile_id IS NOT NULL;

-- Update verification_requests to support extended account types
-- Add account_type_requested column for the type user wants to become
ALTER TABLE public.verification_requests
ADD COLUMN IF NOT EXISTS account_type_requested text DEFAULT 'professional';

-- Add admin_notes for rejection/approval notes
ALTER TABLE public.verification_requests
ADD COLUMN IF NOT EXISTS admin_notes text;

-- Allow admins to update verification_requests
CREATE POLICY "Admins can update verification requests"
ON public.verification_requests
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all verification requests
CREATE POLICY "Admins can view all verification requests"
ON public.verification_requests
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
