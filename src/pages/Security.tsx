import { Shield, Lock, Eye, Server, Key, ArrowLeft, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const securityFeatures = [
  {
    icon: Lock,
    title: "Encryption",
    items: ["AES-256 encryption at rest", "TLS 1.3 for all data in transit", "Encrypted backups with geo-redundancy"],
  },
  {
    icon: Key,
    title: "Access Control",
    items: ["Role-based access (Admin, Officer, Reviewer, Auditor)", "Row-level security on all data", "Multi-tenant data isolation"],
  },
  {
    icon: Eye,
    title: "Audit & Monitoring",
    items: ["Immutable audit log with before/after snapshots", "All actions attributed to authenticated users", "Real-time anomaly detection"],
  },
  {
    icon: Server,
    title: "Infrastructure",
    items: ["SOC 2 Type II compliant hosting", "Automated vulnerability scanning", "Zero-trust network architecture"],
  },
];

const SecurityPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold text-foreground tracking-tight">ComplianceAI</span>
          </div>
          <button onClick={() => navigate("/landing")} className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <Lock className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-foreground">Security at ComplianceAI</h1>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            We protect your compliance data with the same rigor we help you achieve. Security isn't a feature — it's our foundation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {securityFeatures.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="glass-card rounded-xl p-6"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">{feature.title}</h3>
              </div>
              <ul className="space-y-2">
                {feature.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-compliant shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 glass-card rounded-xl p-8 text-center">
          <h2 className="text-xl font-bold text-foreground mb-3">Security Disclosure</h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            If you discover a security vulnerability, please report it responsibly to security@complianceai.app. We investigate all reports within 24 hours.
          </p>
        </div>
      </section>
    </div>
  );
};

export default SecurityPage;
