import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "pending" | "reviewed" | "escalated" | "resolved" | "processing" | "processed" | "failed" | "active" | "inactive" | "draft";
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-warning/10 text-warning border-warning/20" },
  reviewed: { label: "Reviewed", className: "bg-primary/10 text-primary border-primary/20" },
  escalated: { label: "Escalated", className: "bg-critical/10 text-critical border-critical/20" },
  resolved: { label: "Resolved", className: "bg-compliant/10 text-compliant border-compliant/20" },
  processing: { label: "Processing", className: "bg-primary/10 text-primary border-primary/20 animate-pulse-glow" },
  processed: { label: "Processed", className: "bg-compliant/10 text-compliant border-compliant/20" },
  failed: { label: "Failed", className: "bg-critical/10 text-critical border-critical/20" },
  active: { label: "Active", className: "bg-compliant/10 text-compliant border-compliant/20" },
  inactive: { label: "Inactive", className: "bg-muted text-muted-foreground border-border" },
  draft: { label: "Draft", className: "bg-muted text-muted-foreground border-border" },
};

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = statusConfig[status] || statusConfig.pending;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;
