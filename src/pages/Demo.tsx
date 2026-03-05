import { useState } from "react";
import { Shield, Play, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Demo = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      // Request demo session from server-side edge function (no credentials in client code)
      const { data, error } = await supabase.functions.invoke("create-demo-session", {
        headers: { "x-demo-token": import.meta.env.VITE_DEMO_ACCESS_SECRET || "" },
      });
      if (error || !data?.access_token) {
        toast.error("Demo account not configured yet. Please sign up to try the platform.");
        navigate("/auth");
        return;
      }
      // Set the session using the server-provided tokens
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token || "",
      });
      if (sessionError) {
        toast.error("Demo unavailable. Please sign up for a free trial.");
        navigate("/auth");
        return;
      }
      navigate("/");
    } catch {
      toast.error("Demo unavailable. Please sign up for a free trial.");
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary mx-auto">
          <Shield className="h-8 w-8 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Live Demo</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Experience ComplianceAI with pre-loaded SOC 2 policies, rules, and violations.
          </p>
        </div>

        <div className="glass-card rounded-xl p-6 space-y-4 text-left">
          <h3 className="text-sm font-semibold text-foreground">What you'll see:</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              Pre-loaded compliance policies with AI-extracted rules
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              Active violations across departments with risk scores
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              SOC 2 control mapping (CC1–CC9) with coverage dashboard
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              Audit readiness score and compliance trends
            </li>
          </ul>
        </div>

        <button
          onClick={handleDemoLogin}
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg gradient-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          Launch Demo
        </button>

        <p className="text-xs text-muted-foreground">
          Or{" "}
          <button onClick={() => navigate("/auth")} className="text-primary hover:underline font-medium">
            create your own account
          </button>{" "}
          to start with your policies.
        </p>
      </div>
    </div>
  );
};

export default Demo;
