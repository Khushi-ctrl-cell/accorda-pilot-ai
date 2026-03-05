-- Remove any client-side INSERT policy on audit_log (audit entries must come from edge functions via service role)
DROP POLICY IF EXISTS "Authenticated can insert audit_log" ON public.audit_log;
DROP POLICY IF EXISTS "System can insert audit_log" ON public.audit_log;