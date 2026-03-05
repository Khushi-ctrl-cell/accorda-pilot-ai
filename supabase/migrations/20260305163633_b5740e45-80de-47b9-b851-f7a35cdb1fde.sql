
-- 1. Remove client-side INSERT on audit_log (edge functions use service role, bypassing RLS)
DROP POLICY IF EXISTS "Authenticated can insert audit_log" ON public.audit_log;

-- 2. Create trigger to enforce reviewed_by from authenticated user
CREATE OR REPLACE FUNCTION public.set_reviewed_by()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  IF NEW.status IN ('reviewed', 'resolved', 'escalated') THEN
    NEW.reviewed_by := COALESCE(auth.email(), auth.uid()::text);
    NEW.reviewed_at := now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_reviewed_by
  BEFORE UPDATE ON public.violations
  FOR EACH ROW EXECUTE FUNCTION public.set_reviewed_by();
