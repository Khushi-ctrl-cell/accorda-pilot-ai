import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ComplianceScoreRingProps {
  score: number;
  size?: number;
  className?: string;
}

const ComplianceScoreRing = ({ score, size = 160, className }: ComplianceScoreRingProps) => {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 80) return "hsl(152, 60%, 40%)";
    if (s >= 60) return "hsl(38, 92%, 50%)";
    return "hsl(0, 72%, 51%)";
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(score)}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.span
          className="text-3xl font-bold text-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {score}%
        </motion.span>
        <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          Compliant
        </span>
      </div>
    </div>
  );
};

export default ComplianceScoreRing;
