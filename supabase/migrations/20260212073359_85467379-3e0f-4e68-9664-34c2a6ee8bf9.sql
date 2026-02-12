
-- Policies table
CREATE TABLE public.policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  raw_text TEXT,
  file_url TEXT,
  file_size TEXT,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'processed', 'failed')),
  sections INTEGER NOT NULL DEFAULT 0,
  rules_extracted INTEGER NOT NULL DEFAULT 0,
  ai_confidence NUMERIC(3,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;

-- Public read for now (no auth yet), will tighten later
CREATE POLICY "Allow public read on policies" ON public.policies FOR SELECT USING (true);
CREATE POLICY "Allow public insert on policies" ON public.policies FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on policies" ON public.policies FOR UPDATE USING (true);

-- Rules table (structured JSON rules extracted from policies)
CREATE TABLE public.rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_code TEXT NOT NULL UNIQUE,
  policy_id UUID REFERENCES public.policies(id) ON DELETE CASCADE,
  policy_name TEXT NOT NULL,
  section TEXT,
  description TEXT NOT NULL,
  condition_dsl JSONB NOT NULL DEFAULT '{}',
  condition_text TEXT NOT NULL,
  target_table TEXT,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  ai_confidence NUMERIC(3,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on rules" ON public.rules FOR SELECT USING (true);
CREATE POLICY "Allow public insert on rules" ON public.rules FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on rules" ON public.rules FOR UPDATE USING (true);

-- Violations table
CREATE TABLE public.violations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_id UUID REFERENCES public.rules(id) ON DELETE SET NULL,
  rule_code TEXT,
  rule_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  policy_section TEXT,
  explanation TEXT NOT NULL,
  condition_breakdown JSONB,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'escalated', 'resolved')),
  department TEXT,
  risk_score INTEGER DEFAULT 50,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  review_comment TEXT,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.violations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on violations" ON public.violations FOR SELECT USING (true);
CREATE POLICY "Allow public insert on violations" ON public.violations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on violations" ON public.violations FOR UPDATE USING (true);

-- Scan history table for monitoring timeline
CREATE TABLE public.scan_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scan_type TEXT NOT NULL DEFAULT 'scheduled' CHECK (scan_type IN ('scheduled', 'manual', 'event')),
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  violations_found INTEGER DEFAULT 0,
  violations_resolved INTEGER DEFAULT 0,
  rules_evaluated INTEGER DEFAULT 0,
  records_scanned INTEGER DEFAULT 0,
  duration_ms INTEGER,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on scan_history" ON public.scan_history FOR SELECT USING (true);
CREATE POLICY "Allow public insert on scan_history" ON public.scan_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on scan_history" ON public.scan_history FOR UPDATE USING (true);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_policies_updated_at BEFORE UPDATE ON public.policies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rules_updated_at BEFORE UPDATE ON public.rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
