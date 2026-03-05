import { motion } from "framer-motion";

const integrations = [
  { name: "Slack", desc: "Real-time violation alerts in your channels", status: "Coming Soon", emoji: "💬" },
  { name: "Jira", desc: "Auto-create remediation tickets", status: "Coming Soon", emoji: "📋" },
  { name: "GitHub", desc: "Policy change tracking & version control", status: "Coming Soon", emoji: "🐙" },
];

const IntegrationsPreview = () => (
  <section className="py-20 border-t border-border/50">
    <div className="max-w-5xl mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-foreground">Integrations</h2>
        <p className="mt-3 text-muted-foreground">Connect Accorda to your existing workflow tools</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {integrations.map((i, idx) => (
          <motion.div
            key={i.name}
            className="glass-card rounded-xl p-6 text-center"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
          >
            <div className="text-4xl mb-3">{i.emoji}</div>
            <h3 className="text-sm font-semibold text-foreground mb-1">{i.name}</h3>
            <p className="text-xs text-muted-foreground mb-3">{i.desc}</p>
            <span className="inline-flex items-center rounded-full bg-warning/10 border border-warning/20 px-3 py-1 text-xs font-medium text-warning">
              {i.status}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default IntegrationsPreview;
