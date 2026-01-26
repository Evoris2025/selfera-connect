-- Fix overly permissive RLS policy on audit logs
DROP POLICY IF EXISTS "System can create audit logs" ON public.creator_score_audit_logs;

-- Create a security definer function for inserting audit logs
CREATE OR REPLACE FUNCTION public.log_ccs_change(
  p_user_id UUID,
  p_change_type TEXT,
  p_previous_value JSONB,
  p_new_value JSONB,
  p_reason TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO creator_score_audit_logs (user_id, change_type, previous_value, new_value, reason)
  VALUES (p_user_id, p_change_type, p_previous_value, p_new_value, p_reason);
END;
$$;

-- Now audit log inserts only happen through the security definer function
-- No direct INSERT policy needed