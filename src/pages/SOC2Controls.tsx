import DashboardLayout from "@/components/DashboardLayout";
import { useRules } from "@/hooks/useCompliance";
import { useViolations } from "@/hooks/useCompliance";
import { useDashboardStats } from "@/hooks/useCompliance";
import { Shield, CheckCircle, AlertTriangle, XCircle, Loader2, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const SOC2_CONTROLS = [
  { id: "CC1", name: "Control Environment", desc: "Governance, ethics, and organizational structure" },
  { id: "CC2", name: "Communication & Information", desc: "Internal and external communication of policies" },
  { id: "CC3", name: "Risk Assessment", desc: "Identifying and analyzing risks" },
  { id: "CC4", name: "Monitoring Activities", desc: "Ongoing evaluations and remediation" },
  { id: "CC5", name: "Control Activities", desc: "Policies and procedures to mitigate risks" },
  { id: "CC6", name: "Logical & Physical Access", desc: "Restricting access to systems and data" },
  { id: "CC7", name: "System Operations", desc: "Managing system operations and detecting anomalies" },
  { id: "CC8", name: "Change Management", desc: "Managing infrastructure and software changes" },
  { id: "CC9", name: "Risk Mitigation", desc: "Identifying and mitigating vendor and business risks" },
];

const SOC2Controls = () => {
  const { data: rules = [], isLoading: rulesLoading } = useRules();
  const { data: violations = [] } = useViolations();
  const { data: stats } = useDashboardStats();

  const controlCoverage = SOC2_CONTROLS.map((control) => {
    const mappedRules = rules.filter((r) => (r as any).control_id?.startsWith(control.id));
    const activeRules = mappedRules.filter((r) => r.status === "active");
    const relatedViolations = violations.filter((v) => {
      const rule = rules.find((r) => r.id === v.rule_id);
      return (rule as any)?.control_id?.startsWith(control.id);
    });
    const openViolations = relatedViolations.filter((v) => v.status === "pending" || v.status === "escalated");

    return {
      ...control,
      totalRules: mappedRules.length,
      activeRules: activeRules.length,
      violations: relatedViolations.length,
      openViolations: openViolations.length,
      status: mappedRules.length === 0 ? "unmapped" : openViolations.length > 0 ? "at-risk" : "compliant",
    };
  });

  const totalMapped = controlCoverage.filter((c) => c.totalRules > 0).length;
  const totalCompliant = controlCoverage.filter((c) => c.status === "compliant").length;
  const coveragePercent = Math.round((totalMapped / SOC2_CONTROLS.length) * 100);

  // Compute audit readiness score
  const activeViolations = violations.filter((v) => v.status === "pending" || v.status === "escalated");
  const highSevOpen = activeViolations.filter((v) => v.severity === "critical" || v.severity === "high").length;
  const controlsContinuous = totalCompliant;
  const controlsEnforced = Math.round((controlsContinuous / SOC2_CONTROLS.length) * 100);
  const violationPenalty = Math.min(highSevOpen * 5, 30);
  const auditReadiness = Math.max(0, Math.min(100, controlsEnforced - violationPenalty + (coveragePercent > 80 ? 10 : 0)));

  if (rulesLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">SOC 2 Control Mapping</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Map compliance rules to SOC 2 Trust Services Criteria
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="glass-card rounded-xl p-5 text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Audit Readiness</p>
            <motion.p
              className={`text-3xl font-bold ${auditReadiness >= 70 ? "text-compliant" : auditReadiness >= 40 ? "text-warning" : "text-critical"}`}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            >
              {auditReadiness}%
            </motion.p>
          </div>
          <div className="glass-card rounded-xl p-5 text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Controls Covered</p>
            <p className="text-3xl font-bold text-foreground">{totalMapped}/{SOC2_CONTROLS.length}</p>
          </div>
          <div className="glass-card rounded-xl p-5 text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Controls Compliant</p>
            <p className="text-3xl font-bold text-compliant">{totalCompliant}</p>
          </div>
          <div className="glass-card rounded-xl p-5 text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">High-Sev Open</p>
            <p className="text-3xl font-bold text-critical">{highSevOpen}</p>
          </div>
        </div>

        {/* Controls Grid */}
        <div className="space-y-3">
          {controlCoverage.map((control, i) => (
            <motion.div
              key={control.id}
              className="glass-card rounded-xl p-5"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${
                    control.status === "compliant" ? "bg-compliant/10" :
                    control.status === "at-risk" ? "bg-warning/10" : "bg-muted"
                  }`}>
                    {control.status === "compliant" ? (
                      <CheckCircle className="h-5 w-5 text-compliant" />
                    ) : control.status === "at-risk" ? (
                      <AlertTriangle className="h-5 w-5 text-warning" />
                    ) : (
                      <XCircle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-primary">{control.id}</span>
                      <span className="text-sm font-medium text-foreground">{control.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{control.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-xs shrink-0">
                  <div className="text-center">
                    <p className="font-semibold text-foreground">{control.activeRules}</p>
                    <p className="text-muted-foreground">Rules</p>
                  </div>
                  <div className="text-center">
                    <p className={`font-semibold ${control.openViolations > 0 ? "text-warning" : "text-foreground"}`}>
                      {control.openViolations}
                    </p>
                    <p className="text-muted-foreground">Open</p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider ${
                    control.status === "compliant" ? "bg-compliant/10 text-compliant" :
                    control.status === "at-risk" ? "bg-warning/10 text-warning" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {control.status}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SOC2Controls;
