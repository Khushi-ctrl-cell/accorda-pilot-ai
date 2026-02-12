import DashboardLayout from "@/components/DashboardLayout";
import SeverityBadge from "@/components/SeverityBadge";
import StatusBadge from "@/components/StatusBadge";
import { useViolations } from "@/hooks/useCompliance";
import { Search, AlertTriangle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { format } from "date-fns";

const Violations = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: violations = [], isLoading } = useViolations();

  const filtered = violations.filter((v) => {
    const matchesSearch =
      v.record_id.toLowerCase().includes(search.toLowerCase()) ||
      v.rule_name.toLowerCase().includes(search.toLowerCase()) ||
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

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-12">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground mt-2">Loading violations...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No violations detected</p>
            <p className="text-xs mt-1">Run a compliance scan to check for violations</p>
          </div>
        )}

        {/* Violations Table */}
        {filtered.length > 0 && (
          <div className="glass-card rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Record</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Rule</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Severity</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Risk</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Detected</th>
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
                        <span className="text-sm font-mono font-medium text-foreground">{v.record_id}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-foreground max-w-xs truncate">{v.rule_name}</td>
                    <td className="px-5 py-3"><SeverityBadge severity={v.severity as any} /></td>
                    <td className="px-5 py-3"><StatusBadge status={v.status as any} /></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-12 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${v.risk_score || 0}%`,
                              background:
                                (v.risk_score || 0) >= 80 ? "hsl(var(--critical))" :
                                (v.risk_score || 0) >= 50 ? "hsl(var(--warning))" : "hsl(var(--compliant))",
                            }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-foreground">{v.risk_score || 0}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">
                      {format(new Date(v.detected_at), "MMM d, h:mm a")}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

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
                const v = violations.find((x) => x.id === expandedId);
                if (!v) return null;
                const breakdown = v.condition_breakdown as any;
                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-foreground">
                        Violation Detail — {v.record_id}
                      </h3>
                      <div className="flex items-center gap-2">
                        <SeverityBadge severity={v.severity as any} />
                        <StatusBadge status={v.status as any} />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-muted-foreground">Rule Code</span>
                        <p className="font-mono font-medium text-foreground mt-0.5">{v.rule_code || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Policy Section</span>
                        <p className="font-medium text-foreground mt-0.5">{v.policy_section || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Department</span>
                        <p className="font-medium text-foreground mt-0.5">{v.department || "N/A"}</p>
                      </div>
                    </div>
                    <div className="rounded-lg bg-muted/60 border border-border/50 p-4">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        Explanation
                      </span>
                      <p className="text-sm text-foreground mt-1 leading-relaxed">{v.explanation}</p>
                    </div>
                    {breakdown && (
                      <div className="rounded-lg bg-muted/60 border border-border/50 p-4">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                          Condition Breakdown
                        </span>
                        <div className="mt-2 space-y-1">
                          {breakdown.rule_condition && (
                            <p className="text-xs font-mono text-foreground">Rule: {breakdown.rule_condition}</p>
                          )}
                          {breakdown.evaluation && (
                            <p className="text-xs font-mono text-warning">Eval: {breakdown.evaluation}</p>
                          )}
                        </div>
                      </div>
                    )}
                    {v.reviewed_by && (
                      <div className="text-xs text-muted-foreground">
                        Reviewed by <span className="font-medium text-foreground">{v.reviewed_by}</span> on{" "}
                        {format(new Date(v.reviewed_at!), "MMM d, yyyy 'at' h:mm a")}
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
