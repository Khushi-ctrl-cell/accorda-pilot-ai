import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import SeverityBadge from "@/components/SeverityBadge";
import NeuralMap from "@/components/command-center/NeuralMap";
import RiskField from "@/components/command-center/RiskField";
import TimelineStream from "@/components/command-center/TimelineStream";
import { useDashboardStats, useViolations, useEvaluateRules } from "@/hooks/useCompliance";
import { FileText, Scale, AlertTriangle, CheckCircle, Loader2, Play } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Dashboard = () => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: violations = [] } = useViolations();
  const evaluateRules = useEvaluateRules();
  const navigate = useNavigate();

  const recentViolations = violations.filter((v) => v.status === "pending").slice(0, 4);

  const handleDemoScan = async () => {
    try {
      toast.info("Running demo compliance scan...");
      const demoRecords = [
        { id: "INV-2026-9901", _table: "invoices", invoice_amount: 750000, approval_role: "Associate Manager", department: "Procurement" },
        { id: "EXP-2026-5502", _table: "expenses", travel_type: "domestic", hotel_expense: 12000, department: "Sales" },
        { id: "PO-2026-3301", _table: "purchase_orders", po_amount: 1500000, authorization_count: 1, department: "Operations" },
        { id: "CUS-DB-99", _table: "customer_data", data_type: "PII", encryption_status: false, retention_months: 30, department: "IT Security" },
      ];
      const result = await evaluateRules.mutateAsync({ records: demoRecords, scan_type: "manual" });
      toast.success(`Scan complete: ${result.violations_found} violations found across ${result.records_scanned} records`);
    } catch (err: any) {
      toast.error(err.message || "Scan failed");
    }
  };

  if (statsLoading || !stats) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <motion.div
            className="flex flex-col items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div
              className="h-16 w-16 rounded-full flex items-center justify-center animate-breathe"
              style={{
                background: "radial-gradient(circle, hsl(263, 84%, 58%, 0.2) 0%, transparent 70%)",
                border: "2px solid hsl(263, 84%, 58%, 0.3)",
              }}
            >
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
            <p className="text-xs text-muted-foreground font-display">Initializing Neural System...</p>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  const riskLevel: "stable" | "warning" | "critical" =
    stats.complianceScore >= 80 ? "stable" : stats.complianceScore >= 60 ? "warning" : "critical";

  return (
    <DashboardLayout>
      <div className="relative">
        {/* Risk field background */}
        <RiskField riskLevel={riskLevel} />

        <div className="relative z-10 space-y-6">
          {/* Header */}
          <motion.div
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <h1 className="text-xl font-display font-bold tracking-tight text-foreground">
                Compliance Neural System
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Living intelligence · Last scan {format(new Date(stats.lastScanAt), "MMM d, h:mm a")}
              </p>
            </div>
            <button
              onClick={handleDemoScan}
              disabled={evaluateRules.isPending}
              className="inline-flex items-center gap-2 rounded-xl gradient-primary px-4 py-2 text-xs font-display font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ boxShadow: "0 0 20px hsl(263, 84%, 58%, 0.3)" }}
            >
              {evaluateRules.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
              Run Scan
            </button>
          </motion.div>

          {/* Stats Rail */}
          <motion.div
            className="grid grid-cols-4 gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <StatCard
              title="Policies"
              value={stats.totalPolicies}
              subtitle={`${stats.totalRules} rules`}
              icon={<FileText className="h-4 w-4" />}
            />
            <StatCard title="Rules" value={stats.totalRules} icon={<Scale className="h-4 w-4" />} />
            <StatCard
              title="Open Violations"
              value={stats.activeViolations}
              icon={<AlertTriangle className="h-4 w-4" />}
              variant="warning"
            />
            <StatCard
              title="Resolved"
              value={stats.resolvedViolations}
              icon={<CheckCircle className="h-4 w-4" />}
              variant="success"
            />
          </motion.div>

          {/* Neural Map — the living system */}
          <motion.div
            className="glass-panel rounded-2xl p-6 relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground">
                Neural Map
              </h2>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-compliant animate-pulse" />
                <span className="text-[10px] text-muted-foreground">Live</span>
              </div>
            </div>
            <NeuralMap
              complianceScore={stats.complianceScore}
              totalPolicies={stats.totalPolicies}
              totalRules={stats.totalRules}
              activeViolations={stats.activeViolations}
              resolvedViolations={stats.resolvedViolations}
            />
          </motion.div>

          {/* Bottom: Timeline + Violations */}
          <div className="grid grid-cols-3 gap-4">
            {/* Timeline Stream */}
            <motion.div
              className="glass-panel rounded-2xl p-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-[10px] font-display font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                Compliance Lifecycle
              </h3>
              <TimelineStream />
            </motion.div>

            {/* Department Scores */}
            <motion.div
              className="glass-panel rounded-2xl p-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <h3 className="text-[10px] font-display font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                Department Health
              </h3>
              {stats.departmentScores.length > 0 ? (
                <div className="space-y-2.5">
                  {stats.departmentScores.map((dept) => (
                    <div key={dept.department} className="flex items-center gap-2.5">
                      <span className="w-20 truncate text-[10px] text-muted-foreground">{dept.department}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-muted/30 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            background:
                              dept.score >= 80 ? "hsl(var(--compliant))" :
                              dept.score >= 60 ? "hsl(var(--warning))" : "hsl(var(--critical))",
                            boxShadow:
                              dept.score >= 80 ? "0 0 6px hsl(var(--compliant) / 0.4)" :
                              dept.score >= 60 ? "0 0 6px hsl(var(--warning) / 0.4)" : "0 0 6px hsl(var(--critical) / 0.4)",
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${dept.score}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>
                      <span className="w-7 text-right text-[10px] font-display font-semibold text-foreground">{dept.score}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-6">No department data</p>
              )}
            </motion.div>

            {/* Recent Violations */}
            <motion.div
              className="glass-panel rounded-2xl p-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-display font-semibold uppercase tracking-wider text-muted-foreground">
                  Violation Signals
                </h3>
                <button onClick={() => navigate("/violations")} className="text-[10px] text-primary hover:underline">
                  View all
                </button>
              </div>
              {recentViolations.length > 0 ? (
                <div className="space-y-2">
                  {recentViolations.map((v, i) => (
                    <motion.div
                      key={v.id}
                      className="flex items-start gap-2.5 rounded-xl border border-border/30 p-2.5 hover:border-primary/20 hover:bg-primary/5 transition-all cursor-pointer"
                      onClick={() => navigate("/violations")}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                    >
                      <div className="mt-0.5">
                        <SeverityBadge severity={v.severity as any} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-foreground truncate">{v.record_id}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{v.rule_name}</p>
                      </div>
                      <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                        {format(new Date(v.detected_at), "MMM d")}
                      </span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-6">No active signals</p>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
