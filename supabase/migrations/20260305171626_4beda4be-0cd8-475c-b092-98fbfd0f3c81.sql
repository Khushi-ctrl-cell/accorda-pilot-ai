-- Drop client-side INSERT policies on system-only tables (edge functions use service role, bypassing RLS)
DROP POLICY IF EXISTS "System can insert scan_history" ON public.scan_history;
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can insert error_log" ON public.error_log;