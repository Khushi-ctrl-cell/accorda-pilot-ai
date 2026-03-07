import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import AnimatedCounter from "./command-center/AnimatedCounter";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: { value: number; positive: boolean };
  variant?: "default" | "success" | "warning" | "critical";
}

const variantBorders = {
  default: "border-primary/15",
  success: "border-compliant/20",
  warning: "border-warning/20",
  critical: "border-critical/20",
};

const variantGlows = {
  default: "hover:shadow-[0_0_20px_hsl(var(--primary)/0.1)]",
  success: "hover:shadow-[0_0_20px_hsl(var(--compliant)/0.1)]",
  warning: "hover:shadow-[0_0_20px_hsl(var(--warning)/0.1)]",
  critical: "hover:shadow-[0_0_20px_hsl(var(--critical)/0.1)]",
};

const iconVariants = {
  default: "bg-primary/10 text-primary",
  success: "bg-compliant/10 text-compliant",
  warning: "bg-warning/10 text-warning",
  critical: "bg-critical/10 text-critical",
};

const StatCard = ({ title, value, subtitle, icon, trend, variant = "default" }: StatCardProps) => {
  const numValue = typeof value === "number" ? value : parseInt(value, 10);
  const isNum = !isNaN(numValue);

  return (
    <div className={cn(
      "glass-panel rounded-xl p-4 transition-all hover-tilt",
      variantBorders[variant],
      variantGlows[variant],
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
          <p className="text-2xl font-display font-bold tracking-tight text-foreground">
            {isNum ? <AnimatedCounter value={numValue} /> : value}
          </p>
          {subtitle && <p className="text-[10px] text-muted-foreground">{subtitle}</p>}
          {trend && (
            <p className={cn("text-[10px] font-medium", trend.positive ? "text-compliant" : "text-critical")}>
              {trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", iconVariants[variant])}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
