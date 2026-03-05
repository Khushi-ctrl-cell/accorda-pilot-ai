import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";

const integrations = [
  {
    name: "Slack",
    emoji: "💬",
    desc: "Get real-time violation alerts in your Slack channels. Notify teams instantly when critical issues are detected.",
    status: "Coming Soon",
    features: ["Channel alerts", "Severity filtering", "Thread updates"],
  },
  {
    name: "Jira",
    emoji: "📋",
    desc: "Automatically create remediation tickets in Jira when violations are detected. Track resolution in your existing workflow.",
    status: "Coming Soon",
    features: ["Auto-create tickets", "Priority mapping", "Status sync"],
  },
  {
    name: "GitHub",
    emoji: "🐙",
    desc: "Track policy changes via pull requests. Version control your compliance rules alongside your code.",
    status: "Coming Soon",
    features: ["PR tracking", "Diff review", "Webhook triggers"],
  },
];

const Integrations = () => (
  <DashboardLayout>
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Integrations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect Accorda to your workflow tools for seamless compliance enforcement
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {integrations.map((i, idx) => (
          <motion.div
            key={i.name}
            className="glass-card rounded-xl p-6 space-y-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{i.emoji}</span>
                <h3 className="text-sm font-bold text-foreground">{i.name}</h3>
              </div>
              <span className="inline-flex items-center rounded-full bg-warning/10 border border-warning/20 px-3 py-1 text-xs font-medium text-warning">
                {i.status}
              </span>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">{i.desc}</p>

            <ul className="space-y-1">
              {i.features.map((f) => (
                <li key={f} className="text-xs text-muted-foreground flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-primary" />
                  {f}
                </li>
              ))}
            </ul>

            <button
              disabled
              className="w-full rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground cursor-not-allowed opacity-50"
            >
              Connect
            </button>
          </motion.div>
        ))}
      </div>

      <div className="glass-card rounded-xl p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Need a specific integration? <a href="mailto:founders@accorda.ai" className="text-primary hover:underline">Let us know</a> — we build based on customer demand.
        </p>
      </div>
    </div>
  </DashboardLayout>
);

export default Integrations;
