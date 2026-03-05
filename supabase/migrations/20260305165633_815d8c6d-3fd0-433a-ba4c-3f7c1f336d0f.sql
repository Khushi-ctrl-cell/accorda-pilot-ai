
-- Fix 1: Notification DELETE policy - add user ownership check
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications" ON public.notifications
  FOR DELETE TO authenticated USING (
    org_id IN (SELECT public.get_user_org_ids(auth.uid()))
    AND (user_id = auth.uid() OR user_id IS NULL)
  );

-- Fix 2: Usage metrics - remove permissive write policies, keep service-role-only writes
DROP POLICY IF EXISTS "System can upsert usage_metrics" ON public.usage_metrics;
DROP POLICY IF EXISTS "System can update usage_metrics" ON public.usage_metrics;
