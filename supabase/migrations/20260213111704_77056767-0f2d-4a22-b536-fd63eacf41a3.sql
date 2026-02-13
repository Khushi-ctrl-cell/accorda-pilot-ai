
-- 1. Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'compliance_officer', 'reviewer', 'auditor');

-- 2. Organizations table
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- 3. Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Organization members (join table)
CREATE TABLE public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, user_id)
);
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- 5. User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, org_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 6. Add org_id to existing tables
ALTER TABLE public.policies ADD COLUMN org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.rules ADD COLUMN org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.violations ADD COLUMN org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.scan_history ADD COLUMN org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- 7. Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Helper: get user's org IDs
CREATE OR REPLACE FUNCTION public.get_user_org_ids(_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT org_id FROM public.organization_members WHERE user_id = _user_id
$$;

-- 8. Drop old permissive RLS policies
DROP POLICY IF EXISTS "Allow public insert on policies" ON public.policies;
DROP POLICY IF EXISTS "Allow public read on policies" ON public.policies;
DROP POLICY IF EXISTS "Allow public update on policies" ON public.policies;

DROP POLICY IF EXISTS "Allow public insert on rules" ON public.rules;
DROP POLICY IF EXISTS "Allow public read on rules" ON public.rules;
DROP POLICY IF EXISTS "Allow public update on rules" ON public.rules;

DROP POLICY IF EXISTS "Allow public insert on violations" ON public.violations;
DROP POLICY IF EXISTS "Allow public read on violations" ON public.violations;
DROP POLICY IF EXISTS "Allow public update on violations" ON public.violations;

DROP POLICY IF EXISTS "Allow public insert on scan_history" ON public.scan_history;
DROP POLICY IF EXISTS "Allow public read on scan_history" ON public.scan_history;
DROP POLICY IF EXISTS "Allow public update on scan_history" ON public.scan_history;

-- 9. New org-scoped RLS policies

-- PROFILES
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- ORGANIZATIONS: members can read their orgs
CREATE POLICY "Members can read org" ON public.organizations
  FOR SELECT TO authenticated USING (id IN (SELECT public.get_user_org_ids(auth.uid())));
CREATE POLICY "Admins can update org" ON public.organizations
  FOR UPDATE TO authenticated USING (
    id IN (SELECT public.get_user_org_ids(auth.uid()))
    AND public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Authenticated can create org" ON public.organizations
  FOR INSERT TO authenticated WITH CHECK (true);

-- ORGANIZATION_MEMBERS
CREATE POLICY "Members can read members" ON public.organization_members
  FOR SELECT TO authenticated USING (org_id IN (SELECT public.get_user_org_ids(auth.uid())));
CREATE POLICY "Admins can insert members" ON public.organization_members
  FOR INSERT TO authenticated WITH CHECK (
    org_id IN (SELECT public.get_user_org_ids(auth.uid()))
    AND public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Self insert on join" ON public.organization_members
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- USER_ROLES
CREATE POLICY "Members can read roles" ON public.user_roles
  FOR SELECT TO authenticated USING (org_id IN (SELECT public.get_user_org_ids(auth.uid())));
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (
    org_id IN (SELECT public.get_user_org_ids(auth.uid()))
    AND public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Admins can update roles" ON public.user_roles
  FOR UPDATE TO authenticated USING (
    org_id IN (SELECT public.get_user_org_ids(auth.uid()))
    AND public.has_role(auth.uid(), 'admin')
  );

-- POLICIES (the compliance policies table)
CREATE POLICY "Org members can read policies" ON public.policies
  FOR SELECT TO authenticated USING (org_id IN (SELECT public.get_user_org_ids(auth.uid())));
CREATE POLICY "Officers+ can insert policies" ON public.policies
  FOR INSERT TO authenticated WITH CHECK (
    org_id IN (SELECT public.get_user_org_ids(auth.uid()))
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'compliance_officer'))
  );
CREATE POLICY "Officers+ can update policies" ON public.policies
  FOR UPDATE TO authenticated USING (
    org_id IN (SELECT public.get_user_org_ids(auth.uid()))
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'compliance_officer'))
  );

-- RULES
CREATE POLICY "Org members can read rules" ON public.rules
  FOR SELECT TO authenticated USING (org_id IN (SELECT public.get_user_org_ids(auth.uid())));
CREATE POLICY "Officers+ can insert rules" ON public.rules
  FOR INSERT TO authenticated WITH CHECK (
    org_id IN (SELECT public.get_user_org_ids(auth.uid()))
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'compliance_officer'))
  );
CREATE POLICY "Officers+ can update rules" ON public.rules
  FOR UPDATE TO authenticated USING (
    org_id IN (SELECT public.get_user_org_ids(auth.uid()))
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'compliance_officer'))
  );

-- VIOLATIONS
CREATE POLICY "Org members can read violations" ON public.violations
  FOR SELECT TO authenticated USING (org_id IN (SELECT public.get_user_org_ids(auth.uid())));
CREATE POLICY "System can insert violations" ON public.violations
  FOR INSERT TO authenticated WITH CHECK (
    org_id IN (SELECT public.get_user_org_ids(auth.uid()))
  );
CREATE POLICY "Reviewers+ can update violations" ON public.violations
  FOR UPDATE TO authenticated USING (
    org_id IN (SELECT public.get_user_org_ids(auth.uid()))
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'compliance_officer') OR public.has_role(auth.uid(), 'reviewer'))
  );

-- SCAN_HISTORY
CREATE POLICY "Org members can read scan_history" ON public.scan_history
  FOR SELECT TO authenticated USING (org_id IN (SELECT public.get_user_org_ids(auth.uid())));
CREATE POLICY "System can insert scan_history" ON public.scan_history
  FOR INSERT TO authenticated WITH CHECK (
    org_id IN (SELECT public.get_user_org_ids(auth.uid()))
  );
CREATE POLICY "System can update scan_history" ON public.scan_history
  FOR UPDATE TO authenticated USING (
    org_id IN (SELECT public.get_user_org_ids(auth.uid()))
  );

-- 10. Triggers for updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 11. Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
