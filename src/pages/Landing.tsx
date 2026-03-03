import { Shield, CheckCircle, BarChart3, Zap, ArrowRight, Lock, FileText, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const features = [
  { icon: FileText, title: "Policy-to-Rules Engine", desc: "Upload compliance policies. AI extracts machine-readable rules automatically." },
  { icon: Zap, title: "Continuous Monitoring", desc: "Scheduled and on-demand scans detect violations in real-time across your data." },
  { icon: BarChart3, title: "SOC 2 Control Mapping", desc: "Map rules to SOC 2 controls (CC1–CC9). Track coverage and audit readiness." },
  { icon: Lock, title: "Immutable Audit Trail", desc: "Every action logged with before/after snapshots. Always audit-ready." },
  { icon: CheckCircle, title: "Risk Scoring", desc: "Department-level compliance scores, severity weighting, and MTTR tracking." },
  { icon: Clock, title: "Compliance-as-Code", desc: "Version-controlled rules with diff comparison, rollback, and change history." },
];

const plans = [
  {
    name: "Starter",
    price: "$299",
    period: "/mo",
    desc: "For teams beginning their SOC 2 journey",
    features: ["5 policies", "50 rules", "Weekly scans", "3 team members", "Email alerts", "CSV export"],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Professional",
    price: "$799",
    period: "/mo",
    desc: "For scaling compliance programs",
    features: ["Unlimited policies", "Unlimited rules", "Daily scans", "10 team members", "SOC 2 mapping", "PDF reports", "Slack alerts", "Rule versioning"],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For regulated enterprises",
    features: ["Everything in Pro", "Unlimited members", "Real-time scans", "SSO / SAML", "Custom integrations", "Dedicated support", "SLA guarantees", "AI Copilot"],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold text-foreground tracking-tight">ComplianceAI</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#security" className="hover:text-foreground transition-colors">Security</a>
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/auth")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </button>
            <button onClick={() => navigate("/auth")} className="rounded-lg gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
              Start Free Trial
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 py-24 md:py-32">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-xs font-medium text-primary mb-6">
              <Zap className="h-3 w-3" />
              SOC 2 Compliance Automation for SaaS
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-tight">
              Compliance-as-Code for{" "}
              <span className="bg-gradient-to-r from-primary to-[hsl(240,60%,55%)] bg-clip-text text-transparent">
                Modern SaaS
              </span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Upload your policies. AI extracts rules. Continuous monitoring detects violations. 
              SOC 2 control mapping keeps you audit-ready — automatically.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <button onClick={() => navigate("/auth")} className="rounded-lg gradient-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity inline-flex items-center gap-2">
                Start Free Trial <ArrowRight className="h-4 w-4" />
              </button>
              <button onClick={() => navigate("/demo")} className="rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                View Live Demo
              </button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">14-day free trial · No credit card required</p>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 border-t border-border/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground">Everything you need for SOC 2 compliance</h2>
            <p className="mt-3 text-muted-foreground">From policy ingestion to audit-ready reporting</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="glass-card rounded-xl p-6"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 border-t border-border/50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground">Simple, transparent pricing</h2>
            <p className="mt-3 text-muted-foreground">Start free. Scale as your compliance needs grow.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl p-6 ${
                  plan.highlighted
                    ? "gradient-primary text-primary-foreground ring-2 ring-primary shadow-lg"
                    : "glass-card"
                }`}
              >
                <h3 className={`text-lg font-bold ${plan.highlighted ? "" : "text-foreground"}`}>{plan.name}</h3>
                <p className={`text-xs mt-1 ${plan.highlighted ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                  {plan.desc}
                </p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className={`text-sm ${plan.highlighted ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {plan.period}
                  </span>
                </div>
                <ul className="mt-6 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle className={`h-4 w-4 shrink-0 ${plan.highlighted ? "text-primary-foreground/80" : "text-compliant"}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate("/auth")}
                  className={`mt-6 w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                    plan.highlighted
                      ? "bg-white text-primary hover:bg-white/90"
                      : "gradient-primary text-primary-foreground hover:opacity-90"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="py-20 border-t border-border/50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Lock className="h-10 w-10 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-foreground">Enterprise-grade security</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Your compliance data is protected with encryption at rest and in transit, 
            role-based access control, immutable audit logs, and SOC 2 aligned infrastructure.
          </p>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {["AES-256 Encryption", "RBAC", "Immutable Logs", "Multi-tenant Isolation"].map((s) => (
              <div key={s} className="glass-card rounded-lg p-4">
                <p className="text-xs font-medium text-foreground">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span>ComplianceAI © 2026</span>
          </div>
          <div className="flex gap-4">
            <button onClick={() => navigate("/privacy")} className="hover:text-foreground transition-colors">Privacy Policy</button>
            <button onClick={() => navigate("/terms")} className="hover:text-foreground transition-colors">Terms of Service</button>
            <button onClick={() => navigate("/security")} className="hover:text-foreground transition-colors">Security</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
