import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// In-memory rate limiter (resets on cold start)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 10;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (entry && entry.resetAt > now) {
    if (entry.count >= MAX_REQUESTS) return false;
    entry.count++;
  } else {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
  }
  return true;
}

function isValidUUID(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
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

    // Rate limiting
    if (!checkRateLimit(userId)) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();

    // Input validation
    const policy_id = body.policy_id;
    const policy_text = body.policy_text;
    const policy_name = body.policy_name;
    const org_id = body.org_id;

    if (typeof policy_text !== "string" || policy_text.trim().length === 0 || policy_text.length > 1_000_000) {
      return new Response(JSON.stringify({ error: "policy_text is required and must be under 1MB" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (typeof policy_name !== "string" || policy_name.trim().length === 0 || policy_name.length > 500) {
      return new Response(JSON.stringify({ error: "policy_name is required and must be under 500 characters" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (policy_id && (typeof policy_id !== "string" || !isValidUUID(policy_id))) {
      return new Response(JSON.stringify({ error: "policy_id must be a valid UUID" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!org_id || typeof org_id !== "string" || !isValidUUID(org_id)) {
      return new Response(JSON.stringify({ error: "org_id is required and must be a valid UUID" }), {
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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a compliance rule extraction engine. Given a policy document text, extract structured compliance rules.

For each rule you extract, return a JSON object with these fields:
- rule_code: A unique rule identifier like "R-001", "R-002", etc.
- section: The policy section reference (e.g., "Section 4.2")
- description: A human-readable description of the rule
- condition_text: The rule expressed as a logical condition (e.g., "IF invoice_amount > 500000 AND approval_role != 'Senior Manager' THEN violation")
- condition_dsl: A structured JSON object representing the condition with fields:
  - field: the database field to check
  - operator: the comparison operator (">", "<", "==", "!=", ">=", "<=")
  - value: the threshold value
  - logic: "AND" or "OR" for combining multiple conditions
  - conditions: array of sub-conditions (for compound rules)
- target_table: the likely database table this rule applies to (e.g., "invoices", "expenses", "contracts")
- severity: "low", "medium", "high", or "critical"
- confidence: a number between 0 and 1 indicating extraction confidence

Return ONLY a JSON array of rule objects. No markdown, no explanation.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Extract compliance rules from this policy document titled "${policy_name}":\n\n${policy_text}` },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI processing failed");
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "[]";

    let rules;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      rules = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      rules = [];
    }

    if (!Array.isArray(rules)) rules = [rules];

    const avgConfidence = rules.length > 0
      ? rules.reduce((sum: number, r: any) => sum + (r.confidence || 0.7), 0) / rules.length
      : 0;

    const sections = new Set(rules.map((r: any) => r.section)).size;

    const insertedRules = [];
    for (const rule of rules) {
      const { data, error } = await supabase.from("rules").insert({
        rule_code: rule.rule_code || `R-${Date.now()}`,
        policy_id: policy_id,
        policy_name: policy_name,
        section: rule.section,
        description: rule.description,
        condition_dsl: rule.condition_dsl || {},
        condition_text: rule.condition_text,
        target_table: rule.target_table,
        severity: rule.severity || "medium",
        status: "active",
        ai_confidence: rule.confidence || 0.7,
        org_id: org_id,
      }).select().single();

      if (error) {
        console.error("Error inserting rule:", error);
      } else {
        insertedRules.push(data);
      }
    }

    if (policy_id) {
      await supabase.from("policies").update({
        status: "processed",
        rules_extracted: insertedRules.length,
        sections: sections,
        ai_confidence: avgConfidence,
      }).eq("id", policy_id);
    }

    return new Response(JSON.stringify({
      rules: insertedRules,
      count: insertedRules.length,
      sections,
      confidence: avgConfidence,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("parse-policy error:", e);
    return new Response(JSON.stringify({ error: "An error occurred while processing your request. Please try again later." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
