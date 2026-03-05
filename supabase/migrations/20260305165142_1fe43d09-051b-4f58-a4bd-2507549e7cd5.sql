
-- Remove the dangerous self-join policy that allows any user to join any org
DROP POLICY IF EXISTS "Self insert on join" ON public.organization_members;
