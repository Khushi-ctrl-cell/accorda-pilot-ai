import DashboardLayout from "@/components/DashboardLayout";
import { useAuditLog, useErrorLog } from "@/hooks/useAuditLog";
import { format } from "date-fns";
import { Loader2, Activity, AlertCircle, User, FileText, Scale, AlertTriangle, Shield, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const actionIcons: Record<string, typeof Activity> = {
  policy: FileText,
  rule: Scale,
  violation: AlertTriangle,
  scan: Shield,
  role: User,
  organization: Shield,
};

const actionColors: Record<string, string> = {
  "policy.created": "text-primary",
  "policy.parsed": "text-primary",
  "policy.deleted": "text-destructive",
  "rule.created": "text-primary",
  "rule.updated": "text-warning",
  "rule.deleted": "text-destructive",
  "violation.resolved": "text-compliant",
  "violation.escalated": "text-warning",
  "violation.reviewed": "text-primary",
  "scan.completed": "text-compliant",
  "role.assigned": "text-primary",
  "role.removed": "text-destructive",
};

function formatAction(action: string): string {
  return action
    .split(".")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

const ActivityLog = () => {
  const { data: auditEntries = [], isLoading: auditLoading } = useAuditLog(100);
  const { data: errorEntries = [], isLoading: errorLoading } = useErrorLog(50);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Activity Log</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Organization-wide audit trail and error monitoring
          </p>
        </div>

        <Tabs defaultValue="audit" className="space-y-4">
          <TabsList>
            <TabsTrigger value="audit">
              <Activity className="h-4 w-4 mr-2" />
              Audit Trail ({auditEntries.length})
            </TabsTrigger>
            <TabsTrigger value="errors">
              <AlertCircle className="h-4 w-4 mr-2" />
              Error Log ({errorEntries.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="audit">
            {auditLoading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : auditEntries.length === 0 ? (
              <div className="glass-card rounded-xl p-12 text-center">
                <Activity className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No activity recorded yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Actions like policy uploads, scans, and reviews will appear here
                </p>
              </div>
            ) : (
              <div className="glass-card rounded-xl divide-y divide-border">
                {auditEntries.map((entry) => {
                  const Icon = actionIcons[entry.entity_type] || Activity;
                  const colorClass = actionColors[entry.action] || "text-muted-foreground";

                  return (
                    <div key={entry.id} className="flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors">
                      <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-muted ${colorClass}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {formatAction(entry.action)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {entry.user_email || entry.user_id.slice(0, 8)}
                          {entry.entity_id && (
                            <span className="ml-2 font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded">
                              {entry.entity_id.slice(0, 8)}...
                            </span>
                          )}
                        </p>
                        {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                          <p className="text-[11px] text-muted-foreground mt-1">
                            {Object.entries(entry.metadata)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(" · ")}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground whitespace-nowrap">
                        <Clock className="h-3 w-3" />
                        {format(new Date(entry.created_at), "MMM d, h:mm a")}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="errors">
            {errorLoading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : errorEntries.length === 0 ? (
              <div className="glass-card rounded-xl p-12 text-center">
                <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No errors recorded</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Failed backend function invocations will be logged here
                </p>
              </div>
            ) : (
              <div className="glass-card rounded-xl divide-y divide-border">
                {errorEntries.map((entry: any) => (
                  <div key={entry.id} className="flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors">
                    <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                      <AlertCircle className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {entry.function_name}
                        <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                          entry.status === "resolved" ? "bg-compliant/10 text-compliant" : "bg-destructive/10 text-destructive"
                        }`}>
                          {entry.status}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {entry.error_message}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Retries: {entry.retry_count}/{entry.max_retries}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground whitespace-nowrap">
                      <Clock className="h-3 w-3" />
                      {format(new Date(entry.created_at), "MMM d, h:mm a")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ActivityLog;
