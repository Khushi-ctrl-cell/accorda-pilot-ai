import DashboardLayout from "@/components/DashboardLayout";
import StatusBadge from "@/components/StatusBadge";
import { mockPolicies } from "@/data/mockData";
import { Upload, FileText, Search } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useState } from "react";

const Policies = () => {
  const [search, setSearch] = useState("");
  const filtered = mockPolicies.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Policy Documents</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload and manage compliance policy documents
            </p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg gradient-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 transition-opacity">
            <Upload className="h-4 w-4" />
            Upload Policy
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search policies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-input bg-card pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Policy Cards */}
        <div className="grid grid-cols-2 gap-4">
          {filtered.map((policy, i) => (
            <motion.div
              key={policy.id}
              className="glass-card rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground truncate">{policy.name}</h3>
                    <StatusBadge status={policy.status} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Uploaded {format(new Date(policy.uploadedAt), "MMM d, yyyy")} · {policy.fileSize}
                  </p>
                  <div className="flex gap-4 mt-3">
                    <div className="text-center">
                      <p className="text-lg font-bold text-foreground">{policy.rulesExtracted}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Rules</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-foreground">{policy.sections}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Sections</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Policies;
