import { motion } from "framer-motion";
import { FileText, Scale, Scan, AlertTriangle, Wrench, CheckCircle } from "lucide-react";

interface TimelineEvent {
  id: string;
  label: string;
  icon: typeof FileText;
  color: string;
  time?: string;
}

const defaultEvents: TimelineEvent[] = [
  { id: "1", label: "Policy Uploaded", icon: FileText, color: "hsl(var(--primary))" },
  { id: "2", label: "AI Rule Extracted", icon: Scale, color: "hsl(var(--accent))" },
  { id: "3", label: "Scan Executed", icon: Scan, color: "hsl(187, 92%, 55%)" },
  { id: "4", label: "Violation Detected", icon: AlertTriangle, color: "hsl(var(--warning))" },
  { id: "5", label: "Remediation Suggested", icon: Wrench, color: "hsl(var(--primary))" },
  { id: "6", label: "Resolution Logged", icon: CheckCircle, color: "hsl(var(--compliant))" },
];

const TimelineStream = () => {
  return (
    <div className="space-y-0">
      {defaultEvents.map((event, i) => (
        <motion.div
          key={event.id}
          className="flex items-center gap-3 relative"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.15, duration: 0.4 }}
        >
          {/* Vertical connector line */}
          {i < defaultEvents.length - 1 && (
            <div
              className="absolute left-[15px] top-[32px] w-[2px] h-[24px]"
              style={{
                background: `linear-gradient(to bottom, ${event.color}40, ${defaultEvents[i + 1].color}40)`,
              }}
            />
          )}

          {/* Node */}
          <motion.div
            className="relative z-10 flex h-[30px] w-[30px] items-center justify-center rounded-full shrink-0"
            style={{
              background: `${event.color}15`,
              border: `1.5px solid ${event.color}50`,
              boxShadow: `0 0 12px ${event.color}20`,
            }}
            animate={{
              boxShadow: [
                `0 0 8px ${event.color}15`,
                `0 0 16px ${event.color}30`,
                `0 0 8px ${event.color}15`,
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
          >
            <event.icon className="h-3.5 w-3.5" style={{ color: event.color }} />
          </motion.div>

          {/* Label */}
          <span className="text-xs text-muted-foreground py-3">{event.label}</span>
        </motion.div>
      ))}
    </div>
  );
};

export default TimelineStream;
