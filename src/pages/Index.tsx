import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import ComplianceScoreRing from "@/components/ComplianceScoreRing";
import SeverityBadge from "@/components/SeverityBadge";
import { mockDashboardStats, mockViolations } from "@/data/mockData";
import { FileText, Scale, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const stats = mockDashboardStats;
  const recentViolations = mockViolations.filter((v) => v.status === "pending").slice(0, 3);
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Compliance Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time compliance monitoring · Last scan {format(new Date(stats.lastScanAt), "MMM d, h:mm a")}
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            title="Active Policies"
            value={stats.totalPolicies}
            subtitle={`${stats.totalRules} rules extracted`}
            icon={<FileText className="h-5 w-5" />}
          />
          <StatCard
            title="Active Rules"
            value={stats.totalRules}
            icon={<Scale className="h-5 w-5" />}
            trend={{ value: 8, positive: true }}
          />
          <StatCard
            title="Open Violations"
            value={stats.activeViolations}
            icon={<AlertTriangle className="h-5 w-5" />}
            variant="warning"
            trend={{ value: 12, positive: false }}
          />
          <StatCard
            title="Resolved"
            value={stats.resolvedViolations}
            icon={<CheckCircle className="h-5 w-5" />}
            variant="success"
            trend={{ value: 15, positive: true }}
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

          {/* Trend Chart */}
          <motion.div
            className="glass-card rounded-xl p-6 col-span-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">
              Violations Trend
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={stats.trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="violations"
                  stroke="hsl(var(--warning))"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "hsl(var(--warning))" }}
                  name="Violations"
                />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  stroke="hsl(var(--compliant))"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "hsl(var(--compliant))" }}
                  name="Resolved"
                />
              </LineChart>
            </ResponsiveContainer>
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
            <div className="space-y-3">
              {stats.departmentScores.map((dept) => (
                <div key={dept.department} className="flex items-center gap-3">
                  <span className="w-24 truncate text-xs text-muted-foreground">{dept.department}</span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background:
                          dept.score >= 80
                            ? "hsl(var(--compliant))"
                            : dept.score >= 60
                            ? "hsl(var(--warning))"
                            : "hsl(var(--critical))",
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
          </motion.div>

          {/* Severity Breakdown */}
          <motion.div
            className="glass-card rounded-xl p-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">
              Severity Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={stats.severityBreakdown} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis
                  dataKey="severity"
                  type="category"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  width={60}
                />
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
              <button
                onClick={() => navigate("/violations")}
                className="text-xs text-primary hover:underline"
              >
                View all
              </button>
            </div>
            <div className="space-y-3">
              {recentViolations.map((v) => (
                <div
                  key={v.id}
                  className="flex items-start gap-3 rounded-lg border border-border/50 p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => navigate("/violations")}
                >
                  <div className="mt-0.5">
                    <SeverityBadge severity={v.severity} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{v.recordId}</p>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">{v.ruleName}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {format(new Date(v.detectedAt), "MMM d")}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
