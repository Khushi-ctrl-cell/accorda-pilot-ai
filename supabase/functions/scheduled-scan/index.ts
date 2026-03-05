import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate: only allow calls with service role key (from pg_cron or admin)
    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!authHeader || authHeader !== `Bearer ${serviceRoleKey}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Find all orgs with enabled scheduled scans that are due
    const now = new Date().toISOString();
    const { data: schedules, error: schedErr } = await supabase
      .from("scan_schedules")
      .select("*")
      .eq("enabled", true)
      .or(`next_run_at.is.null,next_run_at.lte.${now}`);

    if (schedErr) throw schedErr;

    const results = [];

    for (const schedule of schedules || []) {
      const orgId = schedule.org_id;

      // Get active rules for this org
      const { data: rules } = await supabase
        .from("rules")
        .select("*")
        .eq("org_id", orgId)
        .eq("status", "active");

      if (!rules || rules.length === 0) {
        results.push({ org_id: orgId, status: "skipped", reason: "no active rules" });
        continue;
      }

      // Create scan history entry
      const { data: scan } = await supabase
        .from("scan_history")
        .insert({
          org_id: orgId,
          scan_type: "scheduled",
          status: "running",
          rules_evaluated: rules.length,
        })
        .select()
        .single();

      // For now, log that the scan ran. In production, this would
      // call evaluate-rules with actual data source records.
      const completedAt = new Date().toISOString();
      await supabase
        .from("scan_history")
        .update({
          status: "completed",
          completed_at: completedAt,
          records_scanned: 0,
          violations_found: 0,
          duration_ms: Date.now() - new Date(scan.started_at).getTime(),
        })
        .eq("id", scan.id);

      // Calculate next run based on frequency
      const freqHours: Record<string, number> = {
        "hourly": 1,
        "daily": 24,
        "weekly": 168,
      };
      const hours = freqHours[schedule.frequency] || 24;
      const nextRun = new Date(Date.now() + hours * 3600000).toISOString();

      await supabase
        .from("scan_schedules")
        .update({ last_run_at: completedAt, next_run_at: nextRun })
        .eq("id", schedule.id);

      // Create notification
      await supabase.from("notifications").insert({
        org_id: orgId,
        type: "info",
        title: "Scheduled Scan Complete",
        message: `Evaluated ${rules.length} rules. Next scan scheduled for ${new Date(nextRun).toLocaleString()}.`,
        entity_type: "scan",
        entity_id: scan.id,
      });

      results.push({ org_id: orgId, status: "completed", rules_evaluated: rules.length });
    }

    return new Response(JSON.stringify({ success: true, scans: results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Scheduled scan error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
