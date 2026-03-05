import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useOrg } from "@/hooks/useOrg";
import { Shield, Loader2, Building2, FileText, Play, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Navigate, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  { label: "Create Org", icon: Building2 },
  { label: "Upload Policy", icon: FileText },
  { label: "Run First Scan", icon: Play },
];

const Onboarding = () => {
  const { user } = useAuth();
  const { org, loading: orgLoading } = useOrg();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(false);
  const [policyName, setPolicyName] = useState("");
  const [policyText, setPolicyText] = useState("");
  const [createdOrgId, setCreatedOrgId] = useState<string | null>(null);

  if (orgLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If already has org, check if we're mid-onboarding steps
  if (org && step === 0) setStep(1);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim() || !user) return;
    setLoading(true);
    try {
      const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const { data: newOrgId, error } = await supabase.rpc("create_organization_with_admin", {
        _org_name: orgName.trim(),
        _org_slug: slug,
      });
      if (error) throw error;
      setCreatedOrgId(newOrgId);
      toast.success("Organization created!");
      setStep(1);
      // Reload to pick up org context
      window.location.href = "/onboarding?step=1";
    } catch (err: any) {
      toast.error(err.message || "Failed to create organization");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policyName.trim() || !policyText.trim()) return;
    setLoading(true);
    try {
      const orgId = org?.id || createdOrgId;
      const { error } = await supabase.from("policies").insert({
        name: policyName.trim(),
        raw_text: policyText.trim(),
        org_id: orgId,
        file_size: `${new Blob([policyText]).size} bytes`,
      });
      if (error) throw error;
      toast.success("Policy uploaded!");
      setStep(2);
    } catch (err: any) {
      toast.error(err.message || "Failed to upload policy");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (step === 1) setStep(2);
    else navigate("/");
  };

  const handleFinish = () => {
    navigate("/");
  };

  // If user has org but landed here via URL
  if (org && step === 0) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-lg space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary mx-auto mb-4">
            <Shield className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Welcome to Accorda</h1>
          <p className="text-sm text-muted-foreground mt-2">Let's get you set up in 3 easy steps</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s.label} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                i < step ? "bg-compliant/10 text-compliant border border-compliant/20" :
                i === step ? "gradient-primary text-primary-foreground" :
                "bg-muted text-muted-foreground border border-border"
              }`}>
                {i < step ? <CheckCircle className="h-3 w-3" /> : <s.icon className="h-3 w-3" />}
                {s.label}
              </div>
              {i < STEPS.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
            </div>
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.form
              key="step-0"
              onSubmit={handleCreateOrg}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card rounded-xl p-6 space-y-4"
            >
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
            </motion.form>
          )}

          {step === 1 && (
            <motion.form
              key="step-1"
              onSubmit={handleUploadPolicy}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card rounded-xl p-6 space-y-4"
            >
              <div>
                <label className="text-xs font-medium text-muted-foreground">Policy Name</label>
                <input
                  type="text"
                  value={policyName}
                  onChange={(e) => setPolicyName(e.target.value)}
                  placeholder="Data Protection Policy"
                  className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Policy Text</label>
                <textarea
                  value={policyText}
                  onChange={(e) => setPolicyText(e.target.value)}
                  placeholder="Paste your compliance policy text here..."
                  rows={5}
                  className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg gradient-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                  Upload Policy
                </button>
                <button
                  type="button"
                  onClick={handleSkip}
                  className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                >
                  Skip
                </button>
              </div>
            </motion.form>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card rounded-xl p-6 space-y-4 text-center"
            >
              <CheckCircle className="h-12 w-12 text-compliant mx-auto" />
              <h3 className="text-lg font-bold text-foreground">You're all set!</h3>
              <p className="text-sm text-muted-foreground">
                Head to the dashboard to run your first compliance scan and start monitoring violations.
              </p>
              <button
                onClick={handleFinish}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg gradient-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
              >
                <Play className="h-4 w-4" />
                Go to Dashboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Onboarding;
