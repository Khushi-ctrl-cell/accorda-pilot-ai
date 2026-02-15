
-- Tighten the organizations INSERT policy since org creation now goes through
-- the SECURITY DEFINER function (which bypasses RLS). This removes the WITH CHECK (true).
DROP POLICY IF EXISTS "Authenticated can create org" ON public.organizations;

-- Only allow org creation if user has no existing org (safety net, real creation is via RPC)
CREATE POLICY "Authenticated can create org" ON public.organizations
  FOR INSERT TO authenticated
  WITH CHECK (
    NOT EXISTS (SELECT 1 FROM public.organization_members WHERE user_id = auth.uid())
  );
