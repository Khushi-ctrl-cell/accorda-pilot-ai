-- Add missing DELETE policies for secondary tables

CREATE POLICY "Users can delete own profile" ON public.profiles
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Admins can delete old audit logs" ON public.audit_log
  FOR DELETE TO authenticated USING (
    org_id IN (SELECT public.get_user_org_ids(auth.uid()))
    AND public.has_role(auth.uid(), 'admin')
    AND created_at < NOW() - INTERVAL '90 days'
  );

CREATE POLICY "Officers+ can delete rule versions" ON public.rule_versions
  FOR DELETE TO authenticated USING (
    org_id IN (SELECT public.get_user_org_ids(auth.uid()))
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'compliance_officer'))
  );

CREATE POLICY "Admins can delete usage metrics" ON public.usage_metrics
  FOR DELETE TO authenticated USING (
    org_id IN (SELECT public.get_user_org_ids(auth.uid()))
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can delete own notifications" ON public.notifications
  FOR DELETE TO authenticated USING (
    org_id IN (SELECT public.get_user_org_ids(auth.uid()))
  );

CREATE POLICY "Admins can delete scan schedules" ON public.scan_schedules
  FOR DELETE TO authenticated USING (
    org_id IN (SELECT public.get_user_org_ids(auth.uid()))
    AND public.has_role(auth.uid(), 'admin')
  );