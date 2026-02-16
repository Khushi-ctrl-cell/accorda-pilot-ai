import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useViolations, useRules, usePolicies, useDashboardStats } from "@/hooks/useCompliance";
import { Bot, Send, User, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const AICopilot = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm your Compliance AI Copilot. Ask me about violations, rules, risk scores, or audit readiness. I'll analyze your live compliance data." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: violations = [] } = useViolations();
  const { data: rules = [] } = useRules();
  const { data: policies = [] } = usePolicies();
  const { data: stats } = useDashboardStats();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const generateResponse = (query: string): string => {
    const q = query.toLowerCase();
    const activeViolations = violations.filter((v) => v.status === "pending" || v.status === "escalated");
    const criticalViolations = activeViolations.filter((v) => v.severity === "critical");
    const highViolations = activeViolations.filter((v) => v.severity === "high");

    if (q.includes("risk") || q.includes("score")) {
      const avgRisk = violations.length > 0 ? Math.round(violations.reduce((a, v) => a + (v.risk_score || 0), 0) / violations.length) : 0;
      return `**Risk Summary:**\n- Average risk score: **${avgRisk}/100**\n- Critical violations: **${criticalViolations.length}**\n- High severity: **${highViolations.length}**\n- Total active violations: **${activeViolations.length}**\n\n${criticalViolations.length > 0 ? "⚠️ You have critical violations that need immediate attention." : "✅ No critical violations currently active."}`;
    }

    if (q.includes("violation")) {
      if (activeViolations.length === 0) return "✅ No active violations. Your compliance posture looks strong!";
      const summary = activeViolations.slice(0, 5).map((v) => `- **${v.record_id}**: ${v.rule_name} (${v.severity}, risk: ${v.risk_score})`).join("\n");
      return `**${activeViolations.length} Active Violations:**\n${summary}${activeViolations.length > 5 ? `\n\n...and ${activeViolations.length - 5} more. Check the Violations page for full details.` : ""}`;
    }

    if (q.includes("rule")) {
      const active = rules.filter((r) => r.status === "active");
      const bySeverity = ["critical", "high", "medium", "low"].map((s) => `${s}: ${active.filter((r) => r.severity === s).length}`);
      return `**${active.length} Active Rules** across ${policies.length} policies:\n- ${bySeverity.join("\n- ")}\n\nRules with SOC 2 mapping: **${rules.filter((r) => (r as any).control_id).length}**`;
    }

    if (q.includes("audit") || q.includes("readiness") || q.includes("soc")) {
      const mapped = rules.filter((r) => (r as any).control_id).length;
      return `**Audit Readiness Overview:**\n- Compliance score: **${stats?.complianceScore ?? "N/A"}%**\n- SOC 2 mapped rules: **${mapped}/${rules.length}**\n- Active policies: **${policies.length}**\n- Open violations: **${activeViolations.length}**\n\nRecommendation: ${mapped < rules.length ? "Map remaining rules to SOC 2 controls for full coverage." : "Good control coverage! Focus on resolving open violations."}`;
    }

    if (q.includes("department")) {
      const deptMap = new Map<string, number>();
      activeViolations.forEach((v) => deptMap.set(v.department || "Unknown", (deptMap.get(v.department || "Unknown") || 0) + 1));
      if (deptMap.size === 0) return "✅ All departments are currently clean — no active violations.";
      const summary = Array.from(deptMap.entries()).sort((a, b) => b[1] - a[1]).map(([d, c]) => `- **${d}**: ${c} violations`).join("\n");
      return `**Department Risk Breakdown:**\n${summary}`;
    }

    return `I can help you with:\n- **"Show violations"** — Active violation summary\n- **"Risk score"** — Overall risk analysis\n- **"Audit readiness"** — SOC 2 readiness overview\n- **"Rules summary"** — Rule coverage breakdown\n- **"Department risk"** — Per-department analysis\n\nWhat would you like to know?`;
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    // Simulate slight delay for natural feel
    await new Promise((r) => setTimeout(r, 600));
    const response = generateResponse(userMsg);
    setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-2rem)] max-h-[800px]">
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">AI Copilot</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Query your compliance data using natural language
          </p>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-2">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {msg.role === "assistant" && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0 mt-1">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div className={`max-w-[75%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "gradient-primary text-primary-foreground"
                    : "glass-card text-foreground"
                }`}>
                  <div className="whitespace-pre-wrap">{msg.content.replace(/\*\*(.*?)\*\*/g, "$1")}</div>
                </div>
                {msg.role === "user" && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted shrink-0 mt-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="glass-card rounded-xl px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about violations, risk scores, audit readiness..."
            className="flex-1 rounded-lg border border-input bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="rounded-lg gradient-primary px-4 py-3 text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AICopilot;
