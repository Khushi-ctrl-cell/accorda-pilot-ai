
-- Fix 1: Restrict violations INSERT to officers+ (edge functions use service role, bypass RLS)
DROP POLICY IF EXISTS "System can insert violations" ON public.violations;
CREATE POLICY "Officers+ can insert violations" ON public.violations
  FOR INSERT TO authenticated
  WITH CHECK (
    org_id IN (SELECT public.get_user_org_ids(auth.uid()))
    AND (has_role(auth.uid(), org_id, 'admin'::app_role)
      OR has_role(auth.uid(), org_id, 'compliance_officer'::app_role))
  );
