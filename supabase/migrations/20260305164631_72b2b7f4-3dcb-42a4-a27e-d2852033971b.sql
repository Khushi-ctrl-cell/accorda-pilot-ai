
-- Restrict error_log reads to admins only
DROP POLICY IF EXISTS "Org members can read error_log" ON public.error_log;
CREATE POLICY "Admins can read error_log" ON public.error_log
  FOR SELECT TO authenticated
  USING (
    org_id IN (SELECT get_user_org_ids(auth.uid()))
    AND has_role(auth.uid(), org_id, 'admin'::app_role)
  );
