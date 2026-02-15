import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ConditionDSL {
  field?: string;
  operator?: string;
  value?: any;
  logic?: "AND" | "OR";
  conditions?: ConditionDSL[];
}

function evaluateCondition(condition: ConditionDSL, record: Record<string, any>): { passed: boolean; details: string } {
  // Compound condition
  if (condition.conditions && condition.conditions.length > 0) {
    const results = condition.conditions.map((c) => evaluateCondition(c, record));
    const passed = condition.logic === "OR"
      ? results.some((r) => r.passed)
      : results.every((r) => r.passed);
    return {
      passed,
      details: results.map((r) => r.details).join(` ${condition.logic || "AND"} `),
    };
  }

  // Simple condition
  const { field, operator, value } = condition;
  if (!field || !operator) return { passed: true, details: "No condition defined" };

  const recordValue = record[field];
  if (recordValue === undefined) return { passed: true, details: `Field '${field}' not found in record` };

  let passed = true;
  switch (operator) {
    case ">": passed = recordValue > value; break;
    case "<": passed = recordValue < value; break;
    case ">=": passed = recordValue >= value; break;
    case "<=": passed = recordValue <= value; break;
    case "==": passed = recordValue == value; break;
    case "!=": passed = recordValue != value; break;
    default: passed = true;
  }

  // For violation rules, the condition describes the VIOLATION state
  // So if condition matches, it's a violation (passed = true means violation found)
  return {
    passed,
    details: `${field} ${operator} ${value}: actual=${recordValue} → ${passed ? "VIOLATION" : "COMPLIANT"}`,
  };
}

function calculateRiskScore(severity: string, conditionResults: { passed: boolean }[]): number {
  const baseScores: Record<string, number> = { critical: 90, high: 75, medium: 55, low: 30 };
  const base = baseScores[severity] || 50;
  const failedRatio = conditionResults.filter((r) => r.passed).length / Math.max(conditionResults.length, 1);
  return Math.min(100, Math.round(base + failedRatio * 10));
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Authenticate the caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub;

    const { records, rule_ids, scan_type = "manual", org_id } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user has access to the org
    if (org_id) {
      const { data: membership } = await supabase
        .from("organization_members")
        .select("org_id")
        .eq("user_id", userId)
        .eq("org_id", org_id)
        .single();
      if (!membership) {
        return new Response(JSON.stringify({ error: "Access denied to this organization" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Create scan record
    const { data: scan } = await supabase.from("scan_history").insert({
      scan_type,
      status: "running",
      org_id: org_id || null,
    }).select().single();

    // Fetch active rules (scoped to org)
    let rulesQuery = supabase.from("rules").select("*").eq("status", "active");
    if (org_id) rulesQuery = rulesQuery.eq("org_id", org_id);
    if (rule_ids?.length) {
      rulesQuery = rulesQuery.in("id", rule_ids);
    }
    const { data: rules, error: rulesError } = await rulesQuery;
    if (rulesError) throw new Error(`Failed to fetch rules: ${rulesError.message}`);

    const violations: any[] = [];
    const recordsToEval = records || [];

    for (const rule of (rules || [])) {
      const conditionDsl = rule.condition_dsl as ConditionDSL;

      for (const record of recordsToEval) {
        // Only evaluate if the record's table matches the rule's target
        if (rule.target_table && record._table && record._table !== rule.target_table) continue;

        const result = evaluateCondition(conditionDsl, record);

        if (result.passed) {
          // Violation detected
          const riskScore = calculateRiskScore(rule.severity, [result]);

          const { data: violation, error: vError } = await supabase.from("violations").insert({
            rule_id: rule.id,
            rule_code: rule.rule_code,
            rule_name: rule.description,
            record_id: record.id || record._id || `REC-${Date.now()}`,
            policy_section: rule.section,
            explanation: `Rule ${rule.rule_code} violated: ${rule.description}. ${result.details}`,
            condition_breakdown: {
              rule_condition: rule.condition_text,
              evaluation: result.details,
              record_values: record,
            },
            severity: rule.severity,
            status: "pending",
            department: record.department || "Unknown",
            risk_score: riskScore,
            org_id: org_id || null,
          }).select().single();

          if (vError) {
            console.error("Error inserting violation:", vError);
          } else {
            violations.push(violation);
          }
        }
      }
    }

    // Update scan record
    if (scan) {
      await supabase.from("scan_history").update({
        status: "completed",
        violations_found: violations.length,
        rules_evaluated: rules?.length || 0,
        records_scanned: recordsToEval.length,
        completed_at: new Date().toISOString(),
        duration_ms: Date.now() - new Date(scan.started_at).getTime(),
      }).eq("id", scan.id);
    }

    return new Response(JSON.stringify({
      scan_id: scan?.id,
      violations_found: violations.length,
      rules_evaluated: rules?.length || 0,
      records_scanned: recordsToEval.length,
      violations,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("evaluate-rules error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
