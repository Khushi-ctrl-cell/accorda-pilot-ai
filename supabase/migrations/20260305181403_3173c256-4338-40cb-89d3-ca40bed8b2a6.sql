
-- Remediation actions table
CREATE TABLE public.remediation_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  violation_id UUID REFERENCES public.violations(id) ON DELETE CASCADE NOT NULL,
  org_id UUID REFERENCES public.organizations(id) NOT NULL,
  suggested_action TEXT NOT NULL,
  action_type TEXT NOT NULL DEFAULT 'manual',
  command TEXT,
  status TEXT NOT NULL DEFAULT 'suggested',
  risk_reduction INTEGER DEFAULT 0,
  executed_at TIMESTAMP WITH TIME ZONE,
  executed_by TEXT,
  approved_by TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.remediation_actions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Org members can read remediation_actions"
  ON public.remediation_actions FOR SELECT TO authenticated
  USING (org_id IN (SELECT get_user_org_ids(auth.uid())));

CREATE POLICY "Officers+ can insert remediation_actions"
  ON public.remediation_actions FOR INSERT TO authenticated
  WITH CHECK (
    org_id IN (SELECT get_user_org_ids(auth.uid()))
    AND (has_role(auth.uid(), org_id, 'admin'::app_role)
      OR has_role(auth.uid(), org_id, 'compliance_officer'::app_role))
  );

CREATE POLICY "Reviewers+ can update remediation_actions"
  ON public.remediation_actions FOR UPDATE TO authenticated
  USING (
    org_id IN (SELECT get_user_org_ids(auth.uid()))
    AND (has_role(auth.uid(), org_id, 'admin'::app_role)
      OR has_role(auth.uid(), org_id, 'compliance_officer'::app_role)
      OR has_role(auth.uid(), org_id, 'reviewer'::app_role))
  );

CREATE POLICY "Admins can delete remediation_actions"
  ON public.remediation_actions FOR DELETE TO authenticated
  USING (
    org_id IN (SELECT get_user_org_ids(auth.uid()))
    AND has_role(auth.uid(), org_id, 'admin'::app_role)
  );

-- Updated_at trigger
CREATE TRIGGER update_remediation_actions_updated_at
  BEFORE UPDATE ON public.remediation_actions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
