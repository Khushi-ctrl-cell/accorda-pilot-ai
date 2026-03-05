import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Database-backed rate limiter (persistent across cold starts)
const RATE_LIMIT_WINDOW_MS = 60000;
const MAX_REQUESTS = 5;

async function checkRateLimit(supabase: any, identifier: string, functionName: string): Promise<boolean> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - RATE_LIMIT_WINDOW_MS);

  const { data } = await supabase
    .from("rate_limits")
    .select("request_count, window_start")
    .eq("user_id", identifier)
    .eq("function_name", functionName)
    .single();

  if (data && new Date(data.window_start) > windowStart) {
    if (data.request_count >= MAX_REQUESTS) return false;
    await supabase.from("rate_limits")
      .update({ request_count: data.request_count + 1 })
      .eq("user_id", identifier).eq("function_name", functionName);
  } else {
    await supabase.from("rate_limits")
      .upsert({ user_id: identifier, function_name: functionName, request_count: 1, window_start: now.toISOString() }, { onConflict: "user_id,function_name" });
  }
  return true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify demo access token to prevent casual abuse
    const demoSecret = Deno.env.get("DEMO_ACCESS_SECRET");
    if (demoSecret) {
      const clientToken = req.headers.get("x-demo-token");
      if (clientToken !== demoSecret) {
        return new Response(
          JSON.stringify({ error: "Invalid demo access token." }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Use only trusted server-set IP header; reject spoofable fallbacks
    const clientIp = req.headers.get("cf-connecting-ip") || "unknown";
    if (!(await checkRateLimit(supabase, clientIp, "create-demo-session"))) {
      return new Response(
        JSON.stringify({ error: "Too many demo requests. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use a dedicated demo account managed server-side
    const demoEmail = Deno.env.get("DEMO_ACCOUNT_EMAIL");
    const demoPassword = Deno.env.get("DEMO_ACCOUNT_PASSWORD");

    if (!demoEmail || !demoPassword) {
      return new Response(
        JSON.stringify({ error: "Demo is not configured. Please sign up for a free trial." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: demoPassword,
    });

    if (error) {
      console.error("Demo login error:", error.message);
      return new Response(
        JSON.stringify({ error: "Demo account unavailable. Please sign up for a free trial." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        access_token: data.session.access_token,
        expires_in: data.session.expires_in,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Demo session error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred. Please try again later." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
