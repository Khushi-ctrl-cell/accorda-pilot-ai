import DashboardLayout from "@/components/DashboardLayout";
import { Database, Bell, Shield, Clock } from "lucide-react";

const Settings = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure database connections, monitoring schedules, and notifications
          </p>
        </div>

        {/* Database Connection */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Database className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Database Connection</h3>
              <p className="text-xs text-muted-foreground">Connect to your company database for monitoring</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Host</label>
              <input
                type="text"
                placeholder="db.example.com"
                className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Port</label>
              <input
                type="text"
                placeholder="5432"
                className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Database</label>
              <input
                type="text"
                placeholder="compliance_db"
                className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Schema</label>
              <input
                type="text"
                placeholder="public"
                className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <button className="rounded-lg gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
            Test Connection
          </button>
        </div>

        {/* Monitoring Schedule */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Monitoring Schedule</h3>
              <p className="text-xs text-muted-foreground">Configure scanning frequency</p>
            </div>
          </div>
          <div className="flex gap-2">
            {["Every 5 min", "Every 15 min", "Hourly", "Daily"].map((opt) => (
              <button
                key={opt}
                className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors first:bg-primary first:text-primary-foreground first:border-primary"
              >
                {opt}
              </button>
            ))}
          </div>
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
              { label: "Critical violations", desc: "Immediate email alert" },
              { label: "High severity", desc: "Within 1 hour" },
              { label: "Daily digest", desc: "Summary of all violations" },
            ].map((n) => (
              <div key={n.label} className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{n.label}</p>
                  <p className="text-xs text-muted-foreground">{n.desc}</p>
                </div>
                <div className="h-5 w-9 rounded-full bg-primary/20 relative cursor-pointer">
                  <div className="absolute right-0.5 top-0.5 h-4 w-4 rounded-full bg-primary transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
