
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (
    org_id IN (SELECT get_user_org_ids(auth.uid()))
    AND (user_id = auth.uid() OR user_id IS NULL)
  );
