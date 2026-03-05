import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "./useOrg";

export interface RemediationAction {
  id: string;
  violation_id: string;
  org_id: string;
  suggested_action: string;
  action_type: string;
  command: string | null;
  status: string;
  risk_reduction: number | null;
  executed_at: string | null;
  executed_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
}

export function useRemediationActions(violationId?: string) {
  const { orgId } = useOrg();
  return useQuery({
    queryKey: ["remediation_actions", orgId, violationId],
    enabled: !!orgId,
    queryFn: async () => {
      let query = supabase
        .from("remediation_actions" as any)
        .select("*")
        .eq("org_id", orgId!);
      if (violationId) query = query.eq("violation_id", violationId);
      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as RemediationAction[];
    },
  });
}

export function useApproveRemediation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, userEmail }: { id: string; userEmail: string }) => {
      const { error } = await supabase
        .from("remediation_actions" as any)
        .update({
          status: "approved",
          approved_by: userEmail,
          approved_at: new Date().toISOString(),
        } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["remediation_actions"] }),
  });
}

export function useExecuteRemediation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, userEmail }: { id: string; userEmail: string }) => {
      const { error } = await supabase
        .from("remediation_actions" as any)
        .update({
          status: "executed",
          executed_by: userEmail,
          executed_at: new Date().toISOString(),
        } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["remediation_actions"] }),
  });
}
