
-- 1. Replace has_role with org-scoped version
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND org_id IN (SELECT public.get_user_org_ids(_user_id))
  )
$$;

-- 2. Create org-specific overload for explicit org_id
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _org_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND org_id = _org_id
      AND role = _role
  )
$$;

-- 3. Update all RLS policies to use the 3-arg org-scoped has_role

-- organizations: Admins can update org
DROP POLICY IF EXISTS "Admins can update org" ON public.organizations;
CREATE POLICY "Admins can update org" ON public.organizations FOR UPDATE
  USING (id IN (SELECT get_user_org_ids(auth.uid())) AND has_role(auth.uid(), id, 'admin'::app_role));

-- organization_members: Admins can delete members
DROP POLICY IF EXISTS "Admins can delete members" ON public.organization_members;
CREATE POLICY "Admins can delete members" ON public.organization_members FOR DELETE
  USING (org_id IN (SELECT get_user_org_ids(auth.uid())) AND has_role(auth.uid(), org_id, 'admin'::app_role));

-- organization_members: Admins can insert members
DROP POLICY IF EXISTS "Admins can insert members" ON public.organization_members;
CREATE POLICY "Admins can insert members" ON public.organization_members FOR INSERT
  WITH CHECK (org_id IN (SELECT get_user_org_ids(auth.uid())) AND has_role(auth.uid(), org_id, 'admin'::app_role));

-- user_roles: Admins can manage/update/delete roles
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR INSERT
  WITH CHECK (org_id IN (SELECT get_user_org_ids(auth.uid())) AND has_role(auth.uid(), org_id, 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE
  USING (org_id IN (SELECT get_user_org_ids(auth.uid())) AND has_role(auth.uid(), org_id, 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE
  USING (org_id IN (SELECT get_user_org_ids(auth.uid())) AND has_role(auth.uid(), org_id, 'admin'::app_role));

-- violations: Reviewers+ can update
DROP POLICY IF EXISTS "Reviewers+ can update violations" ON public.violations;
CREATE POLICY "Reviewers+ can update violations" ON public.violations FOR UPDATE
  USING (org_id IN (SELECT get_user_org_ids(auth.uid())) AND (has_role(auth.uid(), org_id, 'admin'::app_role) OR has_role(auth.uid(), org_id, 'compliance_officer'::app_role) OR has_role(auth.uid(), org_id, 'reviewer'::app_role)));

-- violations: Admins can delete
DROP POLICY IF EXISTS "Admins can delete violations" ON public.violations;
CREATE POLICY "Admins can delete violations" ON public.violations FOR DELETE
  USING (org_id IN (SELECT get_user_org_ids(auth.uid())) AND has_role(auth.uid(), org_id, 'admin'::app_role));

-- rules: Officers+ insert/update/delete
DROP POLICY IF EXISTS "Officers+ can insert rules" ON public.rules;
CREATE POLICY "Officers+ can insert rules" ON public.rules FOR INSERT
  WITH CHECK (org_id IN (SELECT get_user_org_ids(auth.uid())) AND (has_role(auth.uid(), org_id, 'admin'::app_role) OR has_role(auth.uid(), org_id, 'compliance_officer'::app_role)));

DROP POLICY IF EXISTS "Officers+ can update rules" ON public.rules;
CREATE POLICY "Officers+ can update rules" ON public.rules FOR UPDATE
  USING (org_id IN (SELECT get_user_org_ids(auth.uid())) AND (has_role(auth.uid(), org_id, 'admin'::app_role) OR has_role(auth.uid(), org_id, 'compliance_officer'::app_role)));

DROP POLICY IF EXISTS "Officers+ can delete rules" ON public.rules;
CREATE POLICY "Officers+ can delete rules" ON public.rules FOR DELETE
  USING (org_id IN (SELECT get_user_org_ids(auth.uid())) AND (has_role(auth.uid(), org_id, 'admin'::app_role) OR has_role(auth.uid(), org_id, 'compliance_officer'::app_role)));

-- policies: Officers+ insert/update, Admins delete
DROP POLICY IF EXISTS "Officers+ can insert policies" ON public.policies;
CREATE POLICY "Officers+ can insert policies" ON public.policies FOR INSERT
  WITH CHECK (org_id IN (SELECT get_user_org_ids(auth.uid())) AND (has_role(auth.uid(), org_id, 'admin'::app_role) OR has_role(auth.uid(), org_id, 'compliance_officer'::app_role)));

DROP POLICY IF EXISTS "Officers+ can update policies" ON public.policies;
CREATE POLICY "Officers+ can update policies" ON public.policies FOR UPDATE
  USING (org_id IN (SELECT get_user_org_ids(auth.uid())) AND (has_role(auth.uid(), org_id, 'admin'::app_role) OR has_role(auth.uid(), org_id, 'compliance_officer'::app_role)));

DROP POLICY IF EXISTS "Admins can delete policies" ON public.policies;
CREATE POLICY "Admins can delete policies" ON public.policies FOR DELETE
  USING (org_id IN (SELECT get_user_org_ids(auth.uid())) AND has_role(auth.uid(), org_id, 'admin'::app_role));

-- rule_versions: Officers+ insert/delete
DROP POLICY IF EXISTS "Officers+ can insert rule_versions" ON public.rule_versions;
CREATE POLICY "Officers+ can insert rule_versions" ON public.rule_versions FOR INSERT
  WITH CHECK (org_id IN (SELECT get_user_org_ids(auth.uid())) AND (has_role(auth.uid(), org_id, 'admin'::app_role) OR has_role(auth.uid(), org_id, 'compliance_officer'::app_role)));

DROP POLICY IF EXISTS "Officers+ can delete rule versions" ON public.rule_versions;
CREATE POLICY "Officers+ can delete rule versions" ON public.rule_versions FOR DELETE
  USING (org_id IN (SELECT get_user_org_ids(auth.uid())) AND (has_role(auth.uid(), org_id, 'admin'::app_role) OR has_role(auth.uid(), org_id, 'compliance_officer'::app_role)));

-- scan_schedules: Admins manage/update/delete
DROP POLICY IF EXISTS "Admins can manage scan_schedules" ON public.scan_schedules;
CREATE POLICY "Admins can manage scan_schedules" ON public.scan_schedules FOR INSERT
  WITH CHECK (org_id IN (SELECT get_user_org_ids(auth.uid())) AND has_role(auth.uid(), org_id, 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update scan_schedules" ON public.scan_schedules;
CREATE POLICY "Admins can update scan_schedules" ON public.scan_schedules FOR UPDATE
  USING (org_id IN (SELECT get_user_org_ids(auth.uid())) AND has_role(auth.uid(), org_id, 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete scan schedules" ON public.scan_schedules;
CREATE POLICY "Admins can delete scan schedules" ON public.scan_schedules FOR DELETE
  USING (org_id IN (SELECT get_user_org_ids(auth.uid())) AND has_role(auth.uid(), org_id, 'admin'::app_role));

-- scan_history: Admins can delete
DROP POLICY IF EXISTS "Admins can delete scan_history" ON public.scan_history;
CREATE POLICY "Admins can delete scan_history" ON public.scan_history FOR DELETE
  USING (org_id IN (SELECT get_user_org_ids(auth.uid())) AND has_role(auth.uid(), org_id, 'admin'::app_role));

-- audit_log: Admins can delete old
DROP POLICY IF EXISTS "Admins can delete old audit logs" ON public.audit_log;
CREATE POLICY "Admins can delete old audit logs" ON public.audit_log FOR DELETE
  USING (org_id IN (SELECT get_user_org_ids(auth.uid())) AND has_role(auth.uid(), org_id, 'admin'::app_role) AND created_at < (now() - '90 days'::interval));

-- error_log: Admins can delete
DROP POLICY IF EXISTS "Admins can delete error_log" ON public.error_log;
CREATE POLICY "Admins can delete error_log" ON public.error_log FOR DELETE
  USING (org_id IN (SELECT get_user_org_ids(auth.uid())) AND has_role(auth.uid(), org_id, 'admin'::app_role));

-- usage_metrics: Admins can delete
DROP POLICY IF EXISTS "Admins can delete usage metrics" ON public.usage_metrics;
CREATE POLICY "Admins can delete usage metrics" ON public.usage_metrics FOR DELETE
  USING (org_id IN (SELECT get_user_org_ids(auth.uid())) AND has_role(auth.uid(), org_id, 'admin'::app_role));
