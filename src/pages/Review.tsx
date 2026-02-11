import DashboardLayout from "@/components/DashboardLayout";
import SeverityBadge from "@/components/SeverityBadge";
import { mockViolations } from "@/data/mockData";
import { CheckCircle, XCircle, ArrowUpCircle, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

const Review = () => {
  const pendingViolations = mockViolations.filter((v) => v.status === "pending" || v.status === "escalated");
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());

  const handleAction = (id: string, action: string) => {
    setReviewedIds((prev) => new Set(prev).add(id));
    toast.success(`Violation ${id} marked as ${action}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Human Review</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review, approve, or escalate flagged violations · {pendingViolations.length} items pending
          </p>
        </div>

        <div className="space-y-4">
          {pendingViolations.map((v, i) => (
            <motion.div
              key={v.id}
              className={`glass-card rounded-xl p-6 transition-opacity ${
                reviewedIds.has(v.id) ? "opacity-40" : ""
              }`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: reviewedIds.has(v.id) ? 0.4 : 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-primary">{v.id}</span>
                    <SeverityBadge severity={v.severity} />
                    <span className="text-xs text-muted-foreground">
                      {v.recordId} · {v.department}
                    </span>
                  </div>

                  <p className="text-sm text-foreground">{v.ruleName}</p>

                  <div className="rounded-lg bg-muted/60 border border-border/50 p-3">
                    <p className="text-sm text-foreground leading-relaxed">{v.explanation}</p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Policy: {v.policySection}</span>
                    <span>Risk Score: <span className="font-semibold text-foreground">{v.riskScore}</span></span>
                    <span>Detected: {format(new Date(v.detectedAt), "MMM d, h:mm a")}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                {!reviewedIds.has(v.id) && (
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => handleAction(v.id, "approved")}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-compliant/10 border border-compliant/20 px-3 py-2 text-xs font-medium text-compliant hover:bg-compliant/20 transition-colors"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(v.id, "rejected")}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-critical/10 border border-critical/20 px-3 py-2 text-xs font-medium text-critical hover:bg-critical/20 transition-colors"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleAction(v.id, "escalated")}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-warning/10 border border-warning/20 px-3 py-2 text-xs font-medium text-warning hover:bg-warning/20 transition-colors"
                    >
                      <ArrowUpCircle className="h-3.5 w-3.5" />
                      Escalate
                    </button>
                    <button
                      onClick={() => toast.info("Comment feature coming soon")}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-muted border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      Comment
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {pendingViolations.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-compliant" />
              <p className="text-sm font-medium">All violations reviewed</p>
              <p className="text-xs mt-1">No pending items require your attention</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Review;
