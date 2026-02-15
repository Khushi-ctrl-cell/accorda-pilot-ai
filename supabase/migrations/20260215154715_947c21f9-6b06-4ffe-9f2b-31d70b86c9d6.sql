
-- Add DELETE policies for tables missing them

CREATE POLICY "Admins can delete policies" ON public.policies
  FOR DELETE TO authenticated
  USING (
    org_id IN (SELECT public.get_user_org_ids(auth.uid()))
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Officers+ can delete rules" ON public.rules
  FOR DELETE TO authenticated
  USING (
    org_id IN (SELECT public.get_user_org_ids(auth.uid()))
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'compliance_officer'))
  );

CREATE POLICY "Admins can delete scan_history" ON public.scan_history
  FOR DELETE TO authenticated
  USING (
    org_id IN (SELECT public.get_user_org_ids(auth.uid()))
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete members" ON public.organization_members
  FOR DELETE TO authenticated
  USING (
    org_id IN (SELECT public.get_user_org_ids(auth.uid()))
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete roles" ON public.user_roles
  FOR DELETE TO authenticated
  USING (
    org_id IN (SELECT public.get_user_org_ids(auth.uid()))
    AND public.has_role(auth.uid(), 'admin')
  );
