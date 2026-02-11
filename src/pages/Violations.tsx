import DashboardLayout from "@/components/DashboardLayout";
import SeverityBadge from "@/components/SeverityBadge";
import StatusBadge from "@/components/StatusBadge";
import { mockViolations } from "@/data/mockData";
import { Search, AlertTriangle, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { format } from "date-fns";

const Violations = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = mockViolations.filter((v) => {
    const matchesSearch =
      v.recordId.toLowerCase().includes(search.toLowerCase()) ||
      v.ruleName.toLowerCase().includes(search.toLowerCase()) ||
      v.explanation.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Violations</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Detected policy violations with explanations and audit trail
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search violations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-input bg-card pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex gap-1">
            {["all", "pending", "reviewed", "escalated", "resolved"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                  statusFilter === s
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Violations Table */}
        <div className="glass-card rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Record
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Rule
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Severity
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Risk
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Detected
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <motion.tr
                  key={v.id}
                  className="border-b border-border/30 hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => setExpandedId(expandedId === v.id ? null : v.id)}
                  layout
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0" />
                      <span className="text-sm font-mono font-medium text-foreground">{v.recordId}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-foreground">{v.ruleName}</td>
                  <td className="px-5 py-3">
                    <SeverityBadge severity={v.severity} />
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={v.status} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-12 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${v.riskScore}%`,
                            background:
                              v.riskScore >= 80
                                ? "hsl(var(--critical))"
                                : v.riskScore >= 50
                                ? "hsl(var(--warning))"
                                : "hsl(var(--compliant))",
                          }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-foreground">{v.riskScore}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">
                    {format(new Date(v.detectedAt), "MMM d, h:mm a")}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Expanded Detail */}
        <AnimatePresence>
          {expandedId && (
            <motion.div
              className="glass-card rounded-xl p-6"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              {(() => {
                const v = mockViolations.find((x) => x.id === expandedId);
                if (!v) return null;
                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-foreground">
                        Violation Detail — {v.recordId}
                      </h3>
                      <div className="flex items-center gap-2">
                        <SeverityBadge severity={v.severity} />
                        <StatusBadge status={v.status} />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-muted-foreground">Rule ID</span>
                        <p className="font-mono font-medium text-foreground mt-0.5">{v.ruleId}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Policy Section</span>
                        <p className="font-medium text-foreground mt-0.5">{v.policySection}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Department</span>
                        <p className="font-medium text-foreground mt-0.5">{v.department}</p>
                      </div>
                    </div>
                    <div className="rounded-lg bg-muted/60 border border-border/50 p-4">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        Explanation
                      </span>
                      <p className="text-sm text-foreground mt-1 leading-relaxed">{v.explanation}</p>
                    </div>
                    {v.reviewedBy && (
                      <div className="text-xs text-muted-foreground">
                        Reviewed by <span className="font-medium text-foreground">{v.reviewedBy}</span> on{" "}
                        {format(new Date(v.reviewedAt!), "MMM d, yyyy 'at' h:mm a")}
                      </div>
                    )}
                  </div>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default Violations;
