import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import ComplianceScoreRing from "@/components/ComplianceScoreRing";
import SeverityBadge from "@/components/SeverityBadge";
import { useDashboardStats, useViolations, useEvaluateRules } from "@/hooks/useCompliance";
import { FileText, Scale, AlertTriangle, CheckCircle, Clock, Loader2, Play } from "lucide-react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Dashboard = () => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: violations = [] } = useViolations();
  const evaluateRules = useEvaluateRules();
  const navigate = useNavigate();

  const recentViolations = violations.filter((v) => v.status === "pending").slice(0, 3);

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
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Compliance Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Real-time compliance monitoring · Last scan {format(new Date(stats.lastScanAt), "MMM d, h:mm a")}
            </p>
          </div>
          <button
            onClick={handleDemoScan}
            disabled={evaluateRules.isPending}
            className="inline-flex items-center gap-2 rounded-lg gradient-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {evaluateRules.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Run Scan
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            title="Active Policies"
            value={stats.totalPolicies}
            subtitle={`${stats.totalRules} rules extracted`}
            icon={<FileText className="h-5 w-5" />}
          />
          <StatCard title="Active Rules" value={stats.totalRules} icon={<Scale className="h-5 w-5" />} />
          <StatCard
            title="Open Violations"
            value={stats.activeViolations}
            icon={<AlertTriangle className="h-5 w-5" />}
            variant="warning"
          />
          <StatCard
            title="Resolved"
            value={stats.resolvedViolations}
            icon={<CheckCircle className="h-5 w-5" />}
            variant="success"
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Compliance Score */}
          <motion.div
            className="glass-card rounded-xl p-6 flex flex-col items-center justify-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">
              Overall Compliance Score
            </h3>
            <ComplianceScoreRing score={stats.complianceScore} />
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              Updated in real-time
            </div>
          </motion.div>

          {/* Severity Breakdown or placeholder */}
          <motion.div
            className="glass-card rounded-xl p-6 col-span-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">
              Severity Breakdown
            </h3>
            {stats.severityBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.severityBreakdown} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis dataKey="severity" type="category" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={60} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                No violations data yet. Upload a policy and run a scan.
              </div>
            )}
          </motion.div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Department Scores */}
          <motion.div
            className="glass-card rounded-xl p-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">
              Department Scores
            </h3>
            {stats.departmentScores.length > 0 ? (
              <div className="space-y-3">
                {stats.departmentScores.map((dept) => (
                  <div key={dept.department} className="flex items-center gap-3">
                    <span className="w-24 truncate text-xs text-muted-foreground">{dept.department}</span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background:
                            dept.score >= 80 ? "hsl(var(--compliant))" :
                            dept.score >= 60 ? "hsl(var(--warning))" : "hsl(var(--critical))",
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${dept.score}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                    <span className="w-8 text-right text-xs font-semibold text-foreground">{dept.score}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No department data yet</p>
            )}
          </motion.div>

          {/* Placeholder for trend */}
          <motion.div
            className="glass-card rounded-xl p-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button onClick={() => navigate("/policies")} className="w-full text-left rounded-lg border border-border/50 p-3 hover:bg-muted/50 transition-colors">
                <p className="text-sm font-medium text-foreground">Upload Policy</p>
                <p className="text-xs text-muted-foreground">Extract rules with AI</p>
              </button>
              <button onClick={handleDemoScan} className="w-full text-left rounded-lg border border-border/50 p-3 hover:bg-muted/50 transition-colors">
                <p className="text-sm font-medium text-foreground">Run Compliance Scan</p>
                <p className="text-xs text-muted-foreground">Evaluate rules against records</p>
              </button>
              <button onClick={() => navigate("/review")} className="w-full text-left rounded-lg border border-border/50 p-3 hover:bg-muted/50 transition-colors">
                <p className="text-sm font-medium text-foreground">Review Violations</p>
                <p className="text-xs text-muted-foreground">Approve, reject, or escalate</p>
              </button>
            </div>
          </motion.div>

          {/* Recent Violations */}
          <motion.div
            className="glass-card rounded-xl p-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Recent Violations
              </h3>
              <button onClick={() => navigate("/violations")} className="text-xs text-primary hover:underline">
                View all
              </button>
            </div>
            {recentViolations.length > 0 ? (
              <div className="space-y-3">
                {recentViolations.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-start gap-3 rounded-lg border border-border/50 p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate("/violations")}
                  >
                    <div className="mt-0.5">
                      <SeverityBadge severity={v.severity as any} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{v.record_id}</p>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">{v.rule_name}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {format(new Date(v.detected_at), "MMM d")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No pending violations</p>
            )}
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
