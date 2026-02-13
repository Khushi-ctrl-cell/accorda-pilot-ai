
-- Fix: org creation should be allowed but the "Self insert on join" policy for org_members is fine since new org creators need to add themselves
-- The org insert policy is intentional - new users must be able to create an org
-- No changes needed - the warning is about the org INSERT which is correct behavior
-- But let's also add service_role policies for edge functions that need to bypass RLS

-- Edge functions use service_role key, which bypasses RLS, so no additional policies needed
-- The warning about "true" on org INSERT is acceptable for this use case

SELECT 1; -- No-op, security review complete
