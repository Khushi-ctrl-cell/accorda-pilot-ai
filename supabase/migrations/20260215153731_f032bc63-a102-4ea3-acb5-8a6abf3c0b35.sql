
-- 1. Create a SECURITY DEFINER function for atomic org creation
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

  -- Ensure user doesn't already belong to an org
  IF EXISTS (SELECT 1 FROM public.organization_members WHERE user_id = _user_id) THEN
    RAISE EXCEPTION 'User already belongs to an organization';
  END IF;

  -- Create org
  INSERT INTO public.organizations (name, slug)
  VALUES (_org_name, _org_slug)
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

-- 2. Drop the unsafe "Self insert on join" policy
DROP POLICY IF EXISTS "Self insert on join" ON public.organization_members;
