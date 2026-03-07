import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";

interface NeuralNode {
  id: string;
  label: string;
  sublabel?: string;
  x: number;
  y: number;
  size: number;
  color: string;
  glowColor: string;
  route?: string;
  value?: number | string;
}

interface NeuralConnection {
  from: string;
  to: string;
  active?: boolean;
  signalColor?: string;
}

interface NeuralMapProps {
  complianceScore: number;
  totalPolicies: number;
  totalRules: number;
  activeViolations: number;
  resolvedViolations: number;
}

const NeuralMap = ({ complianceScore, totalPolicies, totalRules, activeViolations, resolvedViolations }: NeuralMapProps) => {
  const navigate = useNavigate();
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const nodes: NeuralNode[] = useMemo(() => [
    {
      id: "core",
      label: "Compliance Engine",
      sublabel: `${complianceScore}% Health`,
      x: 50, y: 50,
      size: 80,
      color: complianceScore >= 80 ? "hsl(152, 60%, 40%)" : complianceScore >= 60 ? "hsl(38, 92%, 50%)" : "hsl(0, 84%, 60%)",
      glowColor: complianceScore >= 80 ? "hsl(152, 60%, 40%)" : complianceScore >= 60 ? "hsl(38, 92%, 50%)" : "hsl(0, 84%, 60%)",
      value: `${complianceScore}%`,
    },
    {
      id: "policies",
      label: "Policies",
      sublabel: `${totalPolicies} active`,
      x: 20, y: 25,
      size: 48,
      color: "hsl(var(--primary))",
      glowColor: "hsl(263, 84%, 58%)",
      route: "/policies",
      value: totalPolicies,
    },
    {
      id: "rules",
      label: "Rules",
      sublabel: `${totalRules} enforcing`,
      x: 80, y: 25,
      size: 48,
      color: "hsl(var(--accent))",
      glowColor: "hsl(187, 92%, 55%)",
      route: "/rules",
      value: totalRules,
    },
    {
      id: "violations",
      label: "Violations",
      sublabel: `${activeViolations} open`,
      x: 15, y: 75,
      size: activeViolations > 0 ? 52 : 40,
      color: activeViolations > 0 ? "hsl(0, 84%, 60%)" : "hsl(var(--muted-foreground))",
      glowColor: "hsl(0, 84%, 60%)",
      route: "/violations",
      value: activeViolations,
    },
    {
      id: "remediations",
      label: "Resolved",
      sublabel: `${resolvedViolations} fixed`,
      x: 85, y: 75,
      size: 44,
      color: "hsl(152, 60%, 40%)",
      glowColor: "hsl(152, 60%, 40%)",
      route: "/review",
      value: resolvedViolations,
    },
    {
      id: "soc2",
      label: "SOC 2",
      sublabel: "Controls",
      x: 50, y: 12,
      size: 38,
      color: "hsl(var(--primary))",
      glowColor: "hsl(263, 84%, 58%)",
      route: "/soc2",
    },
    {
      id: "scans",
      label: "Scans",
      sublabel: "Activity",
      x: 50, y: 88,
      size: 36,
      color: "hsl(187, 92%, 55%)",
      glowColor: "hsl(187, 92%, 55%)",
      route: "/activity",
    },
  ], [complianceScore, totalPolicies, totalRules, activeViolations, resolvedViolations]);

  const connections: NeuralConnection[] = [
    { from: "policies", to: "core", active: true, signalColor: "hsl(263, 84%, 58%)" },
    { from: "rules", to: "core", active: true, signalColor: "hsl(187, 92%, 55%)" },
    { from: "core", to: "violations", active: activeViolations > 0, signalColor: "hsl(0, 84%, 60%)" },
    { from: "core", to: "remediations", active: true, signalColor: "hsl(152, 60%, 40%)" },
    { from: "soc2", to: "core", active: true, signalColor: "hsl(263, 84%, 58%)" },
    { from: "core", to: "scans", active: true, signalColor: "hsl(187, 92%, 55%)" },
    { from: "policies", to: "rules", active: true, signalColor: "hsl(263, 84%, 58%)" },
    { from: "violations", to: "remediations", active: resolvedViolations > 0, signalColor: "hsl(152, 60%, 40%)" },
  ];

  const getNode = (id: string) => nodes.find(n => n.id === id)!;

  return (
    <div className="relative w-full" style={{ height: "520px" }}>
      {/* SVG Connections */}
      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
        <defs>
          {connections.map((conn, i) => (
            <linearGradient key={`grad-${i}`} id={`conn-grad-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={conn.signalColor} stopOpacity="0.1" />
              <stop offset="50%" stopColor={conn.signalColor} stopOpacity="0.4" />
              <stop offset="100%" stopColor={conn.signalColor} stopOpacity="0.1" />
            </linearGradient>
          ))}
        </defs>

        {connections.map((conn, i) => {
          const from = getNode(conn.from);
          const to = getNode(conn.to);
          return (
            <g key={i}>
              {/* Base line */}
              <line
                x1={`${from.x}%`} y1={`${from.y}%`}
                x2={`${to.x}%`} y2={`${to.y}%`}
                stroke={`url(#conn-grad-${i})`}
                strokeWidth="1.5"
              />
              {/* Signal pulse (animated dot traveling along line) */}
              {conn.active && (
                <motion.circle
                  r="3"
                  fill={conn.signalColor || "hsl(263, 84%, 58%)"}
                  initial={{ opacity: 0 }}
                  animate={{
                    cx: [`${from.x}%`, `${to.x}%`],
                    cy: [`${from.y}%`, `${to.y}%`],
                    opacity: [0, 1, 1, 0],
                  }}
                  transition={{
                    duration: 3 + i * 0.5,
                    repeat: Infinity,
                    ease: "linear",
                    delay: i * 0.8,
                  }}
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Nodes */}
      {nodes.map((node, i) => (
        <motion.div
          key={node.id}
          className="absolute flex flex-col items-center cursor-pointer"
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
            transform: "translate(-50%, -50%)",
            zIndex: node.id === "core" ? 10 : 5,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
          onClick={() => node.route && navigate(node.route)}
          onMouseEnter={() => setHoveredNode(node.id)}
          onMouseLeave={() => setHoveredNode(null)}
        >
          {/* Glow ring */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: node.size + 20,
              height: node.size + 20,
              background: `radial-gradient(circle, ${node.glowColor}20 0%, transparent 70%)`,
            }}
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: node.id === "core" ? 3 : 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          />

          {/* Node circle */}
          <div
            className="rounded-full flex items-center justify-center relative"
            style={{
              width: node.size,
              height: node.size,
              background: `radial-gradient(circle at 30% 30%, ${node.color}30, ${node.color}10)`,
              border: `2px solid ${node.color}60`,
              boxShadow: hoveredNode === node.id
                ? `0 0 30px ${node.glowColor}50, inset 0 0 20px ${node.glowColor}10`
                : `0 0 15px ${node.glowColor}20`,
              transition: "box-shadow 0.3s ease",
            }}
          >
            {node.id === "core" ? (
              <span className="text-xl font-display font-bold text-foreground">{node.value}</span>
            ) : (
              <span className="text-sm font-display font-semibold text-foreground">{node.value ?? ""}</span>
            )}
          </div>

          {/* Label */}
          <div className="mt-2 text-center">
            <p className="text-xs font-display font-semibold text-foreground whitespace-nowrap">{node.label}</p>
            {node.sublabel && (
              <p className="text-[10px] text-muted-foreground whitespace-nowrap">{node.sublabel}</p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default NeuralMap;
