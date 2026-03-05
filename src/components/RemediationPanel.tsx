import { useRemediationActions, useApproveRemediation, useExecuteRemediation } from "@/hooks/useRemediation";
import { useAuth } from "@/hooks/useAuth";
import { useOrg } from "@/hooks/useOrg";
import { Wrench, CheckCircle, Play, Loader2, Terminal, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  violationId: string;
}

const RemediationPanel = ({ violationId }: Props) => {
  const { data: actions = [], isLoading } = useRemediationActions(violationId);
  const approve = useApproveRemediation();
  const execute = useExecuteRemediation();
  const { user } = useAuth();
  const { canReview } = useOrg();

  const email = user?.email || user?.id || "unknown";

  if (isLoading) return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
  if (actions.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center gap-2 text-xs font-semibold text-primary">
        <Wrench className="h-3.5 w-3.5" />
        AI Suggested Remediation
      </div>
      <AnimatePresence>
        {actions.map((a) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-2"
          >
            <p className="text-sm text-foreground">{a.suggested_action}</p>

            {a.command && (
              <div className="rounded-md bg-sidebar-background p-2 flex items-start gap-2">
                <Terminal className="h-3.5 w-3.5 text-sidebar-foreground mt-0.5 shrink-0" />
                <code className="text-xs text-sidebar-foreground font-mono break-all">{a.command}</code>
              </div>
            )}

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <ShieldAlert className="h-3 w-3" />
                Risk reduction: ~{a.risk_reduction || 0}%
              </span>
              <span>Type: {a.action_type}</span>
              <span className={`font-medium ${
                a.status === "executed" ? "text-compliant" :
                a.status === "approved" ? "text-primary" :
                "text-warning"
              }`}>
                {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
              </span>
            </div>

            {canReview && a.status === "suggested" && (
              <div className="flex gap-2 pt-1">
                <button
                  onClick={async () => {
                    try {
                      await approve.mutateAsync({ id: a.id, userEmail: email });
                      toast.success("Remediation approved");
                    } catch { toast.error("Failed to approve"); }
                  }}
                  disabled={approve.isPending}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  Approve
                </button>
              </div>
            )}

            {canReview && a.status === "approved" && (
              <div className="flex gap-2 pt-1">
                <button
                  onClick={async () => {
                    try {
                      await execute.mutateAsync({ id: a.id, userEmail: email });
                      toast.success("Remediation executed");
                    } catch { toast.error("Failed to execute"); }
                  }}
                  disabled={execute.isPending}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-compliant/10 border border-compliant/20 px-3 py-1.5 text-xs font-medium text-compliant hover:bg-compliant/20 transition-colors"
                >
                  <Play className="h-3.5 w-3.5" />
                  Execute Fix
                </button>
              </div>
            )}

            {a.status === "executed" && (
              <p className="text-xs text-compliant flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Executed by {a.executed_by}
              </p>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default RemediationPanel;
