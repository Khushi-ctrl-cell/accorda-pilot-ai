import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/hooks/useOrg";
import { toast } from "sonner";

// Types matching DB schema
export interface DbPolicy {
  id: string;
  name: string;
  raw_text: string | null;
  file_url: string | null;
  file_size: string | null;
  status: string;
  sections: number;
  rules_extracted: number;
  ai_confidence: number | null;
  org_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbRule {
  id: string;
  rule_code: string;
  policy_id: string | null;
  policy_name: string;
  section: string | null;
  description: string;
  condition_dsl: any;
  condition_text: string;
  target_table: string | null;
  severity: string;
  status: string;
  ai_confidence: number | null;
  org_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbViolation {
  id: string;
  rule_id: string | null;
  rule_code: string | null;
  rule_name: string;
  record_id: string;
  policy_section: string | null;
  explanation: string;
  condition_breakdown: any;
  severity: string;
  status: string;
  department: string | null;
  risk_score: number | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_comment: string | null;
  org_id: string | null;
  detected_at: string;
  created_at: string;
}

export interface DbScanHistory {
  id: string;
  scan_type: string;
  status: string;
  violations_found: number | null;
  violations_resolved: number | null;
  rules_evaluated: number | null;
  records_scanned: number | null;
  duration_ms: number | null;
  org_id: string | null;
  started_at: string;
  completed_at: string | null;
}

export function usePolicies() {
  const { orgId } = useOrg();
  return useQuery({
    queryKey: ["policies", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from("policies")
        .select("*")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as DbPolicy[];
    },
    enabled: !!orgId,
  });
}

export function useRules() {
  const { orgId } = useOrg();
  return useQuery({
    queryKey: ["rules", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from("rules")
        .select("*")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as DbRule[];
    },
    enabled: !!orgId,
  });
}

export function useViolations() {
  const { orgId } = useOrg();
  return useQuery({
    queryKey: ["violations", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from("violations")
        .select("*")
        .eq("org_id", orgId)
        .order("detected_at", { ascending: false });
      if (error) throw error;
      return data as DbViolation[];
    },
    enabled: !!orgId,
  });
}

export function useScanHistory() {
  const { orgId } = useOrg();
  return useQuery({
    queryKey: ["scan_history", orgId],
    queryFn: async () => {
      if (!orgId) return [];
      const { data, error } = await supabase
        .from("scan_history")
        .select("*")
        .eq("org_id", orgId)
        .order("started_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as DbScanHistory[];
    },
    enabled: !!orgId,
  });
}

export function useCreatePolicy() {
  const queryClient = useQueryClient();
  const { orgId } = useOrg();
  return useMutation({
    mutationFn: async (policy: { name: string; raw_text: string; file_size?: string }) => {
      if (!orgId) throw new Error("No organization selected");
      const { data, error } = await supabase
        .from("policies")
        .insert({
          name: policy.name,
          raw_text: policy.raw_text,
          file_size: policy.file_size || "N/A",
          status: "processing",
          org_id: orgId,
        })
        .select()
        .single();
      if (error) throw error;
      return data as DbPolicy;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["policies"] }),
  });
}

export function useParsePolicy() {
  const queryClient = useQueryClient();
  const { orgId } = useOrg();
  return useMutation({
    mutationFn: async (args: { policy_id: string; policy_text: string; policy_name: string }) => {
      const { data, error } = await supabase.functions.invoke("parse-policy", {
        body: { ...args, org_id: orgId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policies"] });
      queryClient.invalidateQueries({ queryKey: ["rules"] });
    },
  });
}

export function useEvaluateRules() {
  const queryClient = useQueryClient();
  const { orgId } = useOrg();
  return useMutation({
    mutationFn: async (args: { records: any[]; rule_ids?: string[]; scan_type?: string }) => {
      const { data, error } = await supabase.functions.invoke("evaluate-rules", {
        body: { ...args, org_id: orgId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["violations"] });
      queryClient.invalidateQueries({ queryKey: ["scan_history"] });
    },
  });
}

export function useUpdateViolation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: { id: string; status: string; reviewed_by?: string; review_comment?: string }) => {
      const { data, error } = await supabase
        .from("violations")
        .update({
          status: args.status,
          reviewed_by: args.reviewed_by,
          reviewed_at: new Date().toISOString(),
          review_comment: args.review_comment,
        })
        .eq("id", args.id)
        .select()
        .single();
      if (error) throw error;
      return data as DbViolation;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["violations"] }),
  });
}

export function useDashboardStats() {
  const { orgId } = useOrg();
  return useQuery({
    queryKey: ["dashboard-stats", orgId],
    queryFn: async () => {
      if (!orgId) return null;
      const [policiesRes, rulesRes, violationsRes] = await Promise.all([
        supabase.from("policies").select("*", { count: "exact" }).eq("org_id", orgId),
        supabase.from("rules").select("*", { count: "exact" }).eq("org_id", orgId),
        supabase.from("violations").select("*").eq("org_id", orgId),
      ]);

      const policies = policiesRes.data || [];
      const rules = rulesRes.data || [];
      const violations = (violationsRes.data || []) as DbViolation[];

      const activeViolations = violations.filter((v) => v.status === "pending" || v.status === "escalated").length;
      const resolvedViolations = violations.filter((v) => v.status === "resolved").length;
      const totalViolations = violations.length || 1;

      const complianceScore = Math.round(((totalViolations - activeViolations) / totalViolations) * 100);

      const deptMap = new Map<string, { total: number; resolved: number }>();
      for (const v of violations) {
        const dept = v.department || "Unknown";
        const existing = deptMap.get(dept) || { total: 0, resolved: 0 };
        existing.total++;
        if (v.status === "resolved") existing.resolved++;
        deptMap.set(dept, existing);
      }
      const departmentScores = Array.from(deptMap.entries()).map(([dept, data]) => ({
        department: dept,
        score: data.total > 0 ? Math.round((data.resolved / data.total) * 100) : 100,
      })).sort((a, b) => a.score - b.score);

      const sevMap = new Map<string, number>();
      for (const v of violations) {
        sevMap.set(v.severity, (sevMap.get(v.severity) || 0) + 1);
      }
      const severityBreakdown = Array.from(sevMap.entries()).map(([severity, count]) => ({ severity, count }));

      const lastScan = await supabase.from("scan_history").select("*").eq("org_id", orgId).order("started_at", { ascending: false }).limit(1);
      const lastScanAt = lastScan.data?.[0]?.started_at || new Date().toISOString();

      return {
        totalPolicies: policies.length,
        totalRules: rules.length,
        activeViolations,
        resolvedViolations,
        complianceScore: violations.length === 0 ? 100 : complianceScore,
        lastScanAt,
        departmentScores,
        severityBreakdown,
        trendData: [] as { date: string; violations: number; resolved: number }[],
      };
    },
    enabled: !!orgId,
  });
}
