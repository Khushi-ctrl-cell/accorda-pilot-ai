
-- Audit log table for tracking all important changes (immutable-style)
CREATE TABLE public.audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES public.organizations(id),
  user_id UUID NOT NULL,
  user_email TEXT,
  action TEXT NOT NULL, -- e.g. 'role.assigned', 'role.removed', 'policy.created', 'violation.resolved', 'org.updated', 'rule.updated'
  entity_type TEXT NOT NULL, -- e.g. 'role', 'policy', 'rule', 'violation', 'organization'
  entity_id TEXT, -- the ID of the affected entity
  before_value JSONB, -- snapshot before change
  after_value JSONB, -- snapshot after change
  metadata JSONB, -- additional context
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Error log table for failed edge function invocations and retries
CREATE TABLE public.error_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES public.organizations(id),
  function_name TEXT NOT NULL, -- e.g. 'parse-policy', 'evaluate-rules'
  error_message TEXT NOT NULL,
  error_details JSONB,
  request_payload JSONB, -- sanitized input (no secrets)
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  status TEXT NOT NULL DEFAULT 'failed', -- 'failed', 'retrying', 'resolved'
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_log ENABLE ROW LEVEL SECURITY;

-- Audit log: org members can read, system can insert
CREATE POLICY "Org members can read audit_log" ON public.audit_log
  FOR SELECT TO authenticated
  USING (org_id IN (SELECT public.get_user_org_ids(auth.uid())));

CREATE POLICY "Authenticated can insert audit_log" ON public.audit_log
  FOR INSERT TO authenticated
  WITH CHECK (org_id IN (SELECT public.get_user_org_ids(auth.uid())));

-- Error log: org members can read, system can insert and update
CREATE POLICY "Org members can read error_log" ON public.error_log
  FOR SELECT TO authenticated
  USING (org_id IN (SELECT public.get_user_org_ids(auth.uid())));

CREATE POLICY "System can insert error_log" ON public.error_log
  FOR INSERT TO authenticated
  WITH CHECK (org_id IN (SELECT public.get_user_org_ids(auth.uid())));

CREATE POLICY "System can update error_log" ON public.error_log
  FOR UPDATE TO authenticated
  USING (org_id IN (SELECT public.get_user_org_ids(auth.uid())));

-- Admins can delete error_log entries
CREATE POLICY "Admins can delete error_log" ON public.error_log
  FOR DELETE TO authenticated
  USING (
    org_id IN (SELECT public.get_user_org_ids(auth.uid()))
    AND public.has_role(auth.uid(), 'admin')
  );

-- Index for fast lookups
CREATE INDEX idx_audit_log_org_created ON public.audit_log(org_id, created_at DESC);
CREATE INDEX idx_audit_log_entity ON public.audit_log(entity_type, entity_id);
CREATE INDEX idx_error_log_org_created ON public.error_log(org_id, created_at DESC);
CREATE INDEX idx_error_log_status ON public.error_log(status);
