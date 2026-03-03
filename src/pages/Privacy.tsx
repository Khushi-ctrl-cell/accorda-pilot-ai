import { Shield, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Privacy = () => {
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
        <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: March 3, 2026</p>

        <h2 className="text-foreground">1. Information We Collect</h2>
        <p className="text-muted-foreground">We collect information you provide directly: account details (name, email), organizational data, compliance policies you upload, and usage data generated through our platform.</p>

        <h2 className="text-foreground">2. How We Use Your Information</h2>
        <p className="text-muted-foreground">We use collected information to provide and improve our compliance monitoring services, process uploaded policies through our AI engine, generate compliance reports, and send alerts about violations and system status.</p>

        <h2 className="text-foreground">3. Data Storage & Security</h2>
        <p className="text-muted-foreground">All data is encrypted at rest (AES-256) and in transit (TLS 1.3). We employ multi-tenant data isolation, role-based access control, and immutable audit logging. Data is stored in SOC 2 compliant infrastructure.</p>

        <h2 className="text-foreground">4. Data Retention</h2>
        <p className="text-muted-foreground">We retain your data for as long as your account is active. Compliance data, including audit logs and violation records, is retained per your organization's configured retention policy. You can export all data at any time.</p>

        <h2 className="text-foreground">5. Data Sharing</h2>
        <p className="text-muted-foreground">We do not sell your data. We share data only with infrastructure providers necessary to operate our service, and only as required by law. All sub-processors maintain SOC 2 compliance.</p>

        <h2 className="text-foreground">6. Your Rights</h2>
        <p className="text-muted-foreground">You have the right to access, export, correct, and delete your data. Use our Data Export feature for full portability. Contact privacy@complianceai.app for data requests.</p>

        <h2 className="text-foreground">7. Contact</h2>
        <p className="text-muted-foreground">For privacy inquiries, contact privacy@complianceai.app.</p>
      </div>
    </div>
  );
};

export default Privacy;
