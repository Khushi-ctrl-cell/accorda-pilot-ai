import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Bell, Shield, Clock, Loader2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/hooks/useOrg";
import { toast } from "sonner";

const FREQUENCIES = [
  { label: "Every 6 hours", value: "6h" },
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
];

const Settings = () => {
  const { orgId, isAdmin } = useOrg();
  const [frequency, setFrequency] = useState("daily");
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!orgId) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("scan_schedules")
        .select("*")
        .eq("org_id", orgId)
        .single();
      if (data) {
        setFrequency(data.frequency);
        setEnabled(data.enabled);
      }
      setLoading(false);
    };
    fetch();
  }, [orgId]);

  const handleSave = async () => {
    if (!orgId) return;
    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from("scan_schedules")
        .select("id")
        .eq("org_id", orgId)
        .single();

      if (existing) {
        await supabase
          .from("scan_schedules")
          .update({ frequency, enabled })
          .eq("org_id", orgId);
      } else {
        await supabase
          .from("scan_schedules")
          .insert({ org_id: orgId, frequency, enabled });
      }
      toast.success("Scan schedule updated");
    } catch {
      toast.error("Failed to update schedule");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure monitoring schedules and notification preferences
          </p>
        </div>

        {/* Monitoring Schedule */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Monitoring Schedule</h3>
              <p className="text-xs text-muted-foreground">Configure automated compliance scanning frequency</p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Enable Scheduled Scans</p>
                  <p className="text-xs text-muted-foreground">Automatically run compliance scans on schedule</p>
                </div>
                <button
                  onClick={() => setEnabled(!enabled)}
                  disabled={!isAdmin}
                  className={`h-6 w-11 rounded-full relative transition-colors ${enabled ? "bg-primary" : "bg-muted"}`}
                >
                  <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-card shadow transition-all ${enabled ? "right-0.5" : "left-0.5"}`} />
                </button>
              </div>

              <div className="flex gap-2">
                {FREQUENCIES.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFrequency(opt.value)}
                    disabled={!isAdmin}
                    className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                      frequency === opt.value
                        ? "gradient-primary text-primary-foreground border-primary"
                        : "border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {isAdmin && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Save Schedule
                </button>
              )}
            </>
          )}
        </div>

        {/* Notifications */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Bell className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
              <p className="text-xs text-muted-foreground">Alert preferences for violations</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: "Critical violations", desc: "Immediate in-app alert", defaultOn: true },
              { label: "High severity", desc: "Within 1 hour", defaultOn: true },
              { label: "Weekly digest", desc: "Summary of all violations", defaultOn: true },
              { label: "SLA breach warnings", desc: "Alert when resolution exceeds SLA", defaultOn: false },
            ].map((n) => (
              <div key={n.label} className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{n.label}</p>
                  <p className="text-xs text-muted-foreground">{n.desc}</p>
                </div>
                <div className={`h-6 w-11 rounded-full relative cursor-pointer transition-colors ${n.defaultOn ? "bg-primary" : "bg-muted"}`}>
                  <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-card shadow transition-all ${n.defaultOn ? "right-0.5" : "left-0.5"}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Security</h3>
              <p className="text-xs text-muted-foreground">Data protection and access controls</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Encryption</span>
              <span className="text-foreground font-medium">AES-256 at rest, TLS 1.3 in transit</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Access Control</span>
              <span className="text-foreground font-medium">RBAC with row-level security</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Audit Logging</span>
              <span className="text-compliant font-medium">Active</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
