-- rate_limits is a system table used by edge functions via service role.
-- No client-side access should be allowed. Add a deny-all SELECT policy.
CREATE POLICY "No client access to rate_limits"
ON public.rate_limits
FOR ALL
TO authenticated
USING (false);
