
-- 1. Add DELETE policy for violations (admin only)
CREATE POLICY "Admins can delete violations" ON public.violations
  FOR DELETE TO authenticated
  USING (
    org_id IN (SELECT public.get_user_org_ids(auth.uid()))
    AND public.has_role(auth.uid(), 'admin')
  );

-- 2. Add input validation to create_organization_with_admin
CREATE OR REPLACE FUNCTION public.create_organization_with_admin(
  _org_name TEXT,
  _org_slug TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _org_id UUID;
  _user_id UUID;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Input validation
  IF length(trim(_org_name)) < 1 OR length(trim(_org_name)) > 255 THEN
    RAISE EXCEPTION 'Organization name must be 1-255 characters';
  END IF;

  IF length(_org_slug) < 1 OR length(_org_slug) > 100 THEN
    RAISE EXCEPTION 'Organization slug must be 1-100 characters';
  END IF;

  IF _org_slug !~ '^[a-z0-9][a-z0-9-]*[a-z0-9]$' AND length(_org_slug) > 1 THEN
    RAISE EXCEPTION 'Organization slug must contain only lowercase letters, numbers, and hyphens';
  END IF;

  -- Prevent multi-org membership
  IF EXISTS (SELECT 1 FROM public.organization_members WHERE user_id = _user_id) THEN
    RAISE EXCEPTION 'User already belongs to an organization';
  END IF;

  -- Create org
  INSERT INTO public.organizations (name, slug)
  VALUES (trim(_org_name), _org_slug)
  RETURNING id INTO _org_id;

  -- Add user as member
  INSERT INTO public.organization_members (org_id, user_id)
  VALUES (_org_id, _user_id);

  -- Grant admin role
  INSERT INTO public.user_roles (org_id, user_id, role)
  VALUES (_org_id, _user_id, 'admin');

  RETURN _org_id;
END;
$$;
