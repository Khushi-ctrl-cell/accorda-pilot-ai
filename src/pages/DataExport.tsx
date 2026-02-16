import DashboardLayout from "@/components/DashboardLayout";
import { useViolations, useRules, usePolicies, useScanHistory } from "@/hooks/useCompliance";
import { useAuditLog } from "@/hooks/useAuditLog";
import { Download, FileText, FileSpreadsheet, Database, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

function downloadCSV(filename: string, headers: string[], rows: string[][]) {
  const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadJSON(filename: string, data: any) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const DataExport = () => {
  const { data: violations = [] } = useViolations();
  const { data: rules = [] } = useRules();
  const { data: policies = [] } = usePolicies();
  const { data: scans = [] } = useScanHistory();
  const { data: auditLogs = [] } = useAuditLog();

  const exportViolationsCSV = () => {
    const headers = ["ID", "Record", "Rule", "Severity", "Status", "Risk Score", "Department", "Detected At", "Explanation"];
    const rows = violations.map((v) => [v.id, v.record_id, v.rule_name, v.severity, v.status, String(v.risk_score ?? 0), v.department ?? "", v.detected_at, v.explanation]);
    downloadCSV(`violations-${format(new Date(), "yyyy-MM-dd")}.csv`, headers, rows);
    toast.success("Violations exported");
  };

  const exportAuditLogCSV = () => {
    const headers = ["Timestamp", "Action", "Entity Type", "Entity ID", "User Email"];
    const rows = auditLogs.map((l: any) => [l.created_at, l.action, l.entity_type, l.entity_id ?? "", l.user_email ?? ""]);
    downloadCSV(`audit-log-${format(new Date(), "yyyy-MM-dd")}.csv`, headers, rows);
    toast.success("Audit log exported");
  };

  const exportFullJSON = () => {
    downloadJSON(`complianceai-export-${format(new Date(), "yyyy-MM-dd")}.json`, {
      exported_at: new Date().toISOString(),
      policies,
      rules,
      violations,
      scan_history: scans,
      audit_log: auditLogs,
    });
    toast.success("Full data exported as JSON");
  };

  const exports = [
    { icon: FileSpreadsheet, title: "Violations CSV", desc: `${violations.length} violations`, action: exportViolationsCSV },
    { icon: FileText, title: "Audit Log CSV", desc: `${auditLogs.length} log entries`, action: exportAuditLogCSV },
    { icon: Database, title: "Full Org Data (JSON)", desc: "Policies, rules, violations, scans, audit log", action: exportFullJSON },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Data Export</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Export compliance data for audits, reporting, and portability
          </p>
        </div>

        <div className="space-y-3">
          {exports.map((exp) => (
            <div key={exp.title} className="glass-card rounded-xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <exp.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{exp.title}</p>
                  <p className="text-xs text-muted-foreground">{exp.desc}</p>
                </div>
              </div>
              <button
                onClick={exp.action}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DataExport;
