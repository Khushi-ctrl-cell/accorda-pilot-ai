import { Shield, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Terms = () => {
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

      <div className="max-w-4xl mx-auto px-6 py-16 prose prose-sm dark:prose-invert">
        <h1 className="text-3xl font-bold text-foreground">Terms of Service</h1>
        <p className="text-muted-foreground">Last updated: March 3, 2026</p>

        <h2 className="text-foreground">1. Service Description</h2>
        <p className="text-muted-foreground">ComplianceAI provides automated compliance monitoring, policy-to-rule extraction, continuous scanning, and SOC 2 control mapping as a cloud-based SaaS platform.</p>

        <h2 className="text-foreground">2. Account Terms</h2>
        <p className="text-muted-foreground">You must provide accurate account information and are responsible for maintaining account security. Each organization account is managed by an admin who controls team member access and roles.</p>

        <h2 className="text-foreground">3. Acceptable Use</h2>
        <p className="text-muted-foreground">You agree to use ComplianceAI only for lawful compliance monitoring purposes. You shall not upload malicious content, attempt to circumvent access controls, or reverse-engineer any part of the platform.</p>

        <h2 className="text-foreground">4. Subscription & Billing</h2>
        <p className="text-muted-foreground">Paid plans are billed monthly or annually. Free trials last 14 days. Plan limits (policies, scans, team members) are enforced at the subscription level. Downgrades take effect at the next billing cycle.</p>

        <h2 className="text-foreground">5. Data Ownership</h2>
        <p className="text-muted-foreground">You retain full ownership of all data you upload. ComplianceAI processes your data solely to provide the service. You can export all data at any time using the Data Export feature.</p>

        <h2 className="text-foreground">6. Service Level</h2>
        <p className="text-muted-foreground">We target 99.9% uptime for Professional and Enterprise plans. Scheduled maintenance windows are communicated 48 hours in advance. Enterprise plans include custom SLA guarantees.</p>

        <h2 className="text-foreground">7. Limitation of Liability</h2>
        <p className="text-muted-foreground">ComplianceAI is a monitoring and reporting tool. It does not constitute legal or compliance advice. You remain responsible for your organization's compliance posture and audit outcomes.</p>

        <h2 className="text-foreground">8. Termination</h2>
        <p className="text-muted-foreground">Either party may terminate at any time. Upon termination, you have 30 days to export your data before it is permanently deleted.</p>

        <h2 className="text-foreground">9. Contact</h2>
        <p className="text-muted-foreground">For questions about these terms, contact legal@complianceai.app.</p>
      </div>
    </div>
  );
};

export default Terms;
