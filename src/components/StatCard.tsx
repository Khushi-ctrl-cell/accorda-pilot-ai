import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: { value: number; positive: boolean };
  variant?: "default" | "success" | "warning" | "critical";
}

const variantStyles = {
  default: "stat-glow",
  success: "border-compliant/20",
  warning: "border-warning/20",
  critical: "border-critical/20",
};

const iconVariants = {
  default: "bg-primary/10 text-primary",
  success: "bg-compliant/10 text-compliant",
  warning: "bg-warning/10 text-warning",
  critical: "bg-critical/10 text-critical",
};

const StatCard = ({ title, value, subtitle, icon, trend, variant = "default" }: StatCardProps) => {
  return (
    <div className={cn("glass-card rounded-xl p-5 transition-all hover:shadow-md", variantStyles[variant])}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          {trend && (
            <p className={cn("text-xs font-medium", trend.positive ? "text-compliant" : "text-critical")}>
              {trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}% from last week
            </p>
          )}
        </div>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", iconVariants[variant])}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
