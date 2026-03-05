
-- Drop overly permissive UPDATE policy on error_log
DROP POLICY IF EXISTS "System can update error_log" ON public.error_log;

-- Replace with admin-only policy scoped to resolving errors
CREATE POLICY "Admins can resolve error_log" ON public.error_log
  FOR UPDATE TO authenticated
  USING (
    org_id IN (SELECT get_user_org_ids(auth.uid()))
    AND has_role(auth.uid(), org_id, 'admin'::app_role)
  )
  WITH CHECK (status = 'resolved');
