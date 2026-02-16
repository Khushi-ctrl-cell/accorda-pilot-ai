
-- =============================================
-- 1. Rule Versions table for compliance-as-code
-- =============================================
CREATE TABLE public.rule_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_id UUID NOT NULL REFERENCES public.rules(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  description TEXT NOT NULL,
  condition_text TEXT NOT NULL,
  condition_dsl JSONB NOT NULL DEFAULT '{}'::jsonb,
  severity TEXT NOT NULL DEFAULT 'medium',
  target_table TEXT,
  change_summary TEXT,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  org_id UUID REFERENCES public.organizations(id)
);

ALTER TABLE public.rule_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can read rule_versions"
  ON public.rule_versions FOR SELECT
  USING (org_id IN (SELECT get_user_org_ids(auth.uid())));

CREATE POLICY "Officers+ can insert rule_versions"
  ON public.rule_versions FOR INSERT
  WITH CHECK (org_id IN (SELECT get_user_org_ids(auth.uid()))
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'compliance_officer')));

CREATE INDEX idx_rule_versions_rule_id ON public.rule_versions(rule_id);
CREATE INDEX idx_rule_versions_org_id ON public.rule_versions(org_id);

-- =============================================
-- 2. SOC 2 Control Mapping
-- =============================================
ALTER TABLE public.rules ADD COLUMN IF NOT EXISTS control_id TEXT;
ALTER TABLE public.rules ADD COLUMN IF NOT EXISTS control_family TEXT;

-- =============================================
-- 3. Usage Metrics table
-- =============================================
CREATE TABLE public.usage_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  scans_count INTEGER NOT NULL DEFAULT 0,
  rules_count INTEGER NOT NULL DEFAULT 0,
  policies_count INTEGER NOT NULL DEFAULT 0,
  violations_processed INTEGER NOT NULL DEFAULT 0,
  storage_bytes BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.usage_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can read usage_metrics"
  ON public.usage_metrics FOR SELECT
  USING (org_id IN (SELECT get_user_org_ids(auth.uid())));

CREATE POLICY "System can upsert usage_metrics"
  ON public.usage_metrics FOR INSERT
  WITH CHECK (org_id IN (SELECT get_user_org_ids(auth.uid())));

CREATE POLICY "System can update usage_metrics"
  ON public.usage_metrics FOR UPDATE
  USING (org_id IN (SELECT get_user_org_ids(auth.uid())));

CREATE INDEX idx_usage_metrics_org_period ON public.usage_metrics(org_id, period_start);

CREATE TRIGGER update_usage_metrics_updated_at
  BEFORE UPDATE ON public.usage_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 4. Notifications table
-- =============================================
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id),
  user_id UUID,
  type TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can read notifications"
  ON public.notifications FOR SELECT
  USING (org_id IN (SELECT get_user_org_ids(auth.uid())));

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (org_id IN (SELECT get_user_org_ids(auth.uid())));

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (org_id IN (SELECT get_user_org_ids(auth.uid())));

CREATE INDEX idx_notifications_org_read ON public.notifications(org_id, read, created_at DESC);

-- =============================================
-- 5. Scheduled scan config
-- =============================================
CREATE TABLE public.scan_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) UNIQUE,
  frequency TEXT NOT NULL DEFAULT 'daily',
  enabled BOOLEAN NOT NULL DEFAULT true,
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.scan_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can read scan_schedules"
  ON public.scan_schedules FOR SELECT
  USING (org_id IN (SELECT get_user_org_ids(auth.uid())));

CREATE POLICY "Admins can manage scan_schedules"
  ON public.scan_schedules FOR INSERT
  WITH CHECK (org_id IN (SELECT get_user_org_ids(auth.uid())) AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update scan_schedules"
  ON public.scan_schedules FOR UPDATE
  USING (org_id IN (SELECT get_user_org_ids(auth.uid())) AND has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_scan_schedules_updated_at
  BEFORE UPDATE ON public.scan_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
