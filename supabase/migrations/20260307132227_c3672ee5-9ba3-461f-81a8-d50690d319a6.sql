-- Fix 1: Change rate_limits.user_id from uuid to text so IP strings work
ALTER TABLE public.rate_limits ALTER COLUMN user_id TYPE text USING user_id::text;

-- Fix 2: Drop client-writable policies on usage_metrics
DROP POLICY IF EXISTS "System can upsert usage_metrics" ON public.usage_metrics;
DROP POLICY IF EXISTS "System can update usage_metrics" ON public.usage_metrics;