
DROP POLICY IF EXISTS "Authenticated can insert audit_log" ON public.audit_log;
CREATE POLICY "Authenticated can insert audit_log"
  ON public.audit_log FOR INSERT TO authenticated
  WITH CHECK (
    org_id IN (SELECT public.get_user_org_ids(auth.uid()))
    AND user_id = auth.uid()
  );
