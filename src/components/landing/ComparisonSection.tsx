import { CheckCircle, XCircle, Minus } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { name: "AI Policy-to-Rules", accorda: true, vanta: false, drata: false },
  { name: "Continuous Monitoring", accorda: true, vanta: true, drata: true },
  { name: "SOC 2 Control Mapping", accorda: true, vanta: true, drata: true },
  { name: "Compliance-as-Code", accorda: true, vanta: false, drata: false },
  { name: "AI Remediation Suggestions", accorda: true, vanta: false, drata: false },
  { name: "Rule Version Control & Diff", accorda: true, vanta: false, drata: false },
  { name: "Immutable Audit Trail", accorda: true, vanta: true, drata: true },
  { name: "Custom Rule Engine (DSL)", accorda: true, vanta: false, drata: "partial" },
  { name: "Autonomous Compliance Agents", accorda: true, vanta: false, drata: false },
  { name: "Starting Price", accorda: "$299/mo", vanta: "$10k+/yr", drata: "$8k+/yr" },
];

const Icon = ({ val }: { val: boolean | string }) => {
  if (val === true) return <CheckCircle className="h-4 w-4 text-compliant" />;
  if (val === "partial") return <Minus className="h-4 w-4 text-warning" />;
  if (typeof val === "string") return <span className="text-xs font-semibold text-foreground">{val}</span>;
  return <XCircle className="h-4 w-4 text-muted-foreground/40" />;
};

const ComparisonSection = () => (
  <section className="py-20 border-t border-border/50">
    <div className="max-w-5xl mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-foreground">How Accorda compares</h2>
        <p className="mt-3 text-muted-foreground">
          Built for modern SaaS teams, not legacy audit workflows
        </p>
      </div>
      <motion.div
        className="glass-card rounded-xl overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left p-4 text-muted-foreground font-medium">Feature</th>
              <th className="p-4 text-center font-bold text-primary">Accorda</th>
              <th className="p-4 text-center font-medium text-muted-foreground">Vanta</th>
              <th className="p-4 text-center font-medium text-muted-foreground">Drata</th>
            </tr>
          </thead>
          <tbody>
            {features.map((f, i) => (
              <tr key={f.name} className={i % 2 === 0 ? "bg-muted/30" : ""}>
                <td className="p-4 text-foreground font-medium">{f.name}</td>
                <td className="p-4 text-center"><div className="flex justify-center"><Icon val={f.accorda} /></div></td>
                <td className="p-4 text-center"><div className="flex justify-center"><Icon val={f.vanta} /></div></td>
                <td className="p-4 text-center"><div className="flex justify-center"><Icon val={f.drata} /></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  </section>
);

export default ComparisonSection;
