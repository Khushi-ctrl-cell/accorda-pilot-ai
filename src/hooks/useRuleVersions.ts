import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/hooks/useOrg";

export function useRuleVersions(ruleId: string | null) {
  const { orgId } = useOrg();
  return useQuery({
    queryKey: ["rule-versions", ruleId, orgId],
    queryFn: async () => {
      if (!ruleId || !orgId) return [];
      const { data, error } = await supabase
        .from("rule_versions")
        .select("*")
        .eq("rule_id", ruleId)
        .eq("org_id", orgId)
        .order("version_number", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!ruleId && !!orgId,
  });
}
