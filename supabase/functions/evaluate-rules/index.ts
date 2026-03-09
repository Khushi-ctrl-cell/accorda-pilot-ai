import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Database-backed rate limiter (persistent across cold starts)
const RATE_LIMIT_WINDOW_MS = 60000;
const MAX_REQUESTS = 30;

async function checkRateLimit(supabase: any, userId: string, functionName: string): Promise<boolean> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - RATE_LIMIT_WINDOW_MS);

  const { data } = await supabase
    .from("rate_limits")
    .select("request_count, window_start")
    .eq("user_id", userId)
    .eq("function_name", functionName)
    .single();

  if (data && new Date(data.window_start) > windowStart) {
    if (data.request_count >= MAX_REQUESTS) return false;
    await supabase.from("rate_limits")
      .update({ request_count: data.request_count + 1 })
      .eq("user_id", userId).eq("function_name", functionName);
  } else {
    await supabase.from("rate_limits")
      .upsert({ user_id: userId, function_name: functionName, request_count: 1, window_start: now.toISOString() }, { onConflict: "user_id,function_name" });
  }
  return true;
}

function isValidUUID(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

interface ConditionDSL {
  field?: string;
  operator?: string;
  value?: any;
  logic?: "AND" | "OR";
  conditions?: ConditionDSL[];
}

function evaluateCondition(condition: ConditionDSL, record: Record<string, any>): { passed: boolean; details: string } {
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

  return {
    passed,
    details: `${field} ${operator} ${value}: result=${passed ? "VIOLATION" : "COMPLIANT"}`,
  };
}

function collectConditionFields(condition: ConditionDSL): Set<string> {
  const fields = new Set<string>();
  if (condition.field) fields.add(condition.field);
  if (condition.conditions) {
    for (const c of condition.conditions) {
      for (const f of collectConditionFields(c)) fields.add(f);
    }
  }
  return fields;
}

function calculateRiskScore(severity: string, conditionResults: { passed: boolean }[]): number {
  const baseScores: Record<string, number> = { critical: 90, high: 75, medium: 55, low: 30 };
  const base = baseScores[severity] || 50;
  const failedRatio = conditionResults.filter((r) => r.passed).length / Math.max(conditionResults.length, 1);
  return Math.min(100, Math.round(base + failedRatio * 10));
}

async function logError(
  supabase: any,
  orgId: string,
  functionName: string,
  errorMessage: string,
  errorDetails: any = null,
  requestPayload: any = null,
  retryCount = 0
) {
  try {
    await supabase.from("error_log").insert({
      org_id: orgId,
      function_name: functionName,
      error_message: errorMessage,
      error_details: errorDetails,
      request_payload: requestPayload ? { scan_type: requestPayload.scan_type, record_count: requestPayload.records?.length } : null,
      retry_count: retryCount,
      status: "failed",
    });
  } catch (e) {
    console.error("Failed to log error:", e);
  }
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
    const userId = claimsData.claims.sub as string;

    // Rate limiting (database-backed)
    const rateLimitClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    if (!(await checkRateLimit(rateLimitClient, userId, "evaluate-rules"))) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const records = body.records;
    const rule_ids = body.rule_ids;
    const scan_type = body.scan_type || "manual";
    const org_id = body.org_id;

    if (!org_id || typeof org_id !== "string" || !isValidUUID(org_id)) {
      return new Response(JSON.stringify({ error: "org_id is required and must be a valid UUID" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (records && (!Array.isArray(records) || records.length > 10000)) {
      return new Response(JSON.stringify({ error: "records must be an array with at most 10,000 items" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (rule_ids && (!Array.isArray(rule_ids) || !rule_ids.every((id: any) => typeof id === "string" && isValidUUID(id)))) {
      return new Response(JSON.stringify({ error: "rule_ids must be an array of valid UUIDs" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (typeof scan_type !== "string" || !["manual", "scheduled", "automated"].includes(scan_type)) {
      return new Response(JSON.stringify({ error: "scan_type must be 'manual', 'scheduled', or 'automated'" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user has access to the org
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

    // Verify user has admin or compliance_officer role (Officers+ only)
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("org_id", org_id)
      .in("role", ["admin", "compliance_officer"])
      .limit(1);
    if (!roleData || roleData.length === 0) {
      return new Response(JSON.stringify({ error: "Insufficient permissions. Only admins and compliance officers can run scans." }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create scan record
    const { data: scan } = await supabase.from("scan_history").insert({
      scan_type,
      status: "running",
      org_id: org_id,
    }).select().single();

    // Fetch active rules (scoped to org)
    let rulesQuery = supabase.from("rules").select("*").eq("status", "active").eq("org_id", org_id);
    if (rule_ids?.length) {
      rulesQuery = rulesQuery.in("id", rule_ids);
    }
    const { data: rules, error: rulesError } = await rulesQuery;
    if (rulesError) {
      await logError(supabase, org_id, "evaluate-rules", `Failed to fetch rules: ${rulesError.message}`, rulesError, body);
      throw new Error(`Failed to fetch rules: ${rulesError.message}`);
    }

    const violations: any[] = [];
    const recordsToEval = records || [];

    for (const rule of (rules || [])) {
      const conditionDsl = rule.condition_dsl as ConditionDSL;

      for (const record of recordsToEval) {
        if (rule.target_table && record._table && record._table !== rule.target_table) continue;

        const result = evaluateCondition(conditionDsl, record);

        if (result.passed) {
          const riskScore = calculateRiskScore(rule.severity, [result]);

          // Only store fields referenced in the rule condition, not the full record
          const relevantFields = collectConditionFields(conditionDsl);
          const safeRecord = Object.fromEntries(
            Object.entries(record).filter(([k]) => relevantFields.has(k) || k === "id" || k === "_id" || k === "_table")
          );

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
              record_fields: safeRecord,
            },
            severity: rule.severity,
            status: "pending",
            department: record.department || "Unknown",
            risk_score: riskScore,
            org_id: org_id,
          }).select().single();

          if (vError) {
            console.error("Error inserting violation:", vError);
          } else {
            violations.push(violation);
          }
        }
      }
    }

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

    // Audit log: scan completed
    await supabase.from("audit_log").insert({
      org_id,
      user_id: userId,
      action: "scan.completed",
      entity_type: "scan",
      entity_id: scan?.id || null,
      after_value: {
        violations_found: violations.length,
        rules_evaluated: rules?.length || 0,
        records_scanned: recordsToEval.length,
        scan_type,
      },
    }).then(() => {}).catch(() => {});

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
    return new Response(JSON.stringify({ error: "An error occurred while processing your request. Please try again later." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
