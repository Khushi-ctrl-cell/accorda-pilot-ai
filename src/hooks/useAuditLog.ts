import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "./useOrg";

export interface AuditLogEntry {
  id: string;
  org_id: string;
  user_id: string;
  user_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  before_value: any;
  after_value: any;
  metadata: any;
  created_at: string;
}

export function useAuditLog(limit = 50) {
  const { orgId } = useOrg();
  return useQuery({
    queryKey: ["audit-log", orgId, limit],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from("audit_log")
        .select("*")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data as AuditLogEntry[];
    },
    enabled: !!orgId,
  });
}

export function useErrorLog(limit = 50) {
  const { orgId } = useOrg();
  return useQuery({
    queryKey: ["error-log", orgId, limit],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from("error_log")
        .select("*")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });
}
