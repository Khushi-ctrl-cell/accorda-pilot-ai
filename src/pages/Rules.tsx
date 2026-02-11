import DashboardLayout from "@/components/DashboardLayout";
import SeverityBadge from "@/components/SeverityBadge";
import StatusBadge from "@/components/StatusBadge";
import { mockRules } from "@/data/mockData";
import { Search, Code2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const Rules = () => {
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");

  const filtered = mockRules.filter((r) => {
    const matchesSearch =
      r.description.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = severityFilter === "all" || r.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Compliance Rules</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Machine-readable rules extracted from policy documents
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search rules..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-input bg-card pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex gap-1">
            {["all", "critical", "high", "medium", "low"].map((s) => (
              <button
                key={s}
                onClick={() => setSeverityFilter(s)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                  severityFilter === s
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Rules List */}
        <div className="space-y-3">
          {filtered.map((rule, i) => (
            <motion.div
              key={rule.id}
              className="glass-card rounded-xl p-5"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-semibold text-primary">{rule.id}</span>
                    <SeverityBadge severity={rule.severity} />
                    <StatusBadge status={rule.status} />
                  </div>
                  <p className="text-sm font-medium text-foreground">{rule.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {rule.policyName} · {rule.section}
                  </p>
                </div>
              </div>

              {/* Rule Condition */}
              <div className="mt-3 rounded-lg bg-muted/60 border border-border/50 p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <Code2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Rule Condition
                  </span>
                </div>
                <code className="text-xs font-mono text-foreground leading-relaxed">{rule.condition}</code>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Rules;
