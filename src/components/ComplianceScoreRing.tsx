import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ComplianceScoreRingProps {
  score: number;
  size?: number;
  className?: string;
}

const ComplianceScoreRing = ({ score, size = 160, className }: ComplianceScoreRingProps) => {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 80) return "hsl(152, 60%, 40%)";
    if (s >= 60) return "hsl(38, 92%, 50%)";
    return "hsl(0, 84%, 60%)";
  };

  const color = getColor(score);

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      {/* Outer glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size + 30,
          height: size + 30,
          background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={strokeWidth}
          opacity={0.3}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          filter={`drop-shadow(0 0 6px ${color})`}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.span
          className="text-3xl font-display font-bold text-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {score}%
        </motion.span>
        <span className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground">
          System Health
        </span>
      </div>
    </div>
  );
};

export default ComplianceScoreRing;
