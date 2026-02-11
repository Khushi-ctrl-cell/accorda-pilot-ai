import { cn } from "@/lib/utils";

interface SeverityBadgeProps {
  severity: "low" | "medium" | "high" | "critical";
  className?: string;
}

const severityConfig = {
  low: { label: "Low", className: "bg-primary/10 text-primary border-primary/20" },
  medium: { label: "Medium", className: "bg-warning/10 text-warning border-warning/20" },
  high: { label: "High", className: "bg-warning/15 text-warning border-warning/30" },
  critical: { label: "Critical", className: "bg-critical/10 text-critical border-critical/20" },
};

const SeverityBadge = ({ severity, className }: SeverityBadgeProps) => {
  const config = severityConfig[severity];
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

export default SeverityBadge;
