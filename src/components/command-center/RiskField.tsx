import { motion } from "framer-motion";

interface RiskFieldProps {
  riskLevel: "stable" | "warning" | "critical";
}

const RiskField = ({ riskLevel }: RiskFieldProps) => {
  const colors = {
    stable: { from: "hsl(152, 60%, 40%)", to: "hsl(187, 92%, 55%)" },
    warning: { from: "hsl(38, 92%, 50%)", to: "hsl(25, 90%, 55%)" },
    critical: { from: "hsl(0, 84%, 60%)", to: "hsl(340, 65%, 50%)" },
  };

  const c = colors[riskLevel];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {/* Wave 1 */}
      <motion.div
        className="absolute -left-1/2 top-0 w-[200%] h-full opacity-[0.04]"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${c.from} 25%, ${c.to} 50%, ${c.from} 75%, transparent 100%)`,
        }}
        animate={{ x: ["-50%", "0%"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      {/* Wave 2 */}
      <motion.div
        className="absolute -left-1/2 top-0 w-[200%] h-full opacity-[0.03]"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${c.to} 30%, ${c.from} 60%, transparent 100%)`,
        }}
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      />
      {/* Radial vignette from core */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 45%, ${c.from}08 0%, transparent 60%)`,
        }}
      />
    </div>
  );
};

export default RiskField;
