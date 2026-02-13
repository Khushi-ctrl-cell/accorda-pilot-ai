import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Shield, Loader2, Building2 } from "lucide-react";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";
import { useOrg } from "@/hooks/useOrg";

const Onboarding = () => {
  const { user } = useAuth();
  const { org, loading: orgLoading } = useOrg();
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(false);

  if (orgLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (org) return <Navigate to="/" replace />;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim() || !user) return;
    setLoading(true);

    try {
      const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

      // Create org
      const { data: newOrg, error: orgErr } = await supabase
        .from("organizations")
        .insert({ name: orgName.trim(), slug })
        .select()
        .single();
      if (orgErr) throw orgErr;

      // Add user as member
      const { error: memErr } = await supabase
        .from("organization_members")
        .insert({ org_id: newOrg.id, user_id: user.id });
      if (memErr) throw memErr;

      // Grant admin role
      const { error: roleErr } = await supabase
        .from("user_roles")
        .insert({ org_id: newOrg.id, user_id: user.id, role: "admin" });
      if (roleErr) throw roleErr;

      toast.success("Organization created! You're now the admin.");
      // Force reload to pick up new org context
      window.location.href = "/";
    } catch (err: any) {
      toast.error(err.message || "Failed to create organization");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary mx-auto mb-4">
            <Shield className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Set up your organization</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Create your organization to start using ComplianceAI
          </p>
        </div>

        <form onSubmit={handleCreate} className="glass-card rounded-xl p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Organization Name</label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Acme Corp"
              className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg gradient-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Building2 className="h-4 w-4" />}
            Create Organization
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
