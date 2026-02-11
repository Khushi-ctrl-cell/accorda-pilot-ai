export interface PolicyDocument {
  id: string;
  name: string;
  uploadedAt: string;
  status: "processing" | "processed" | "failed";
  rulesExtracted: number;
  sections: number;
  fileSize: string;
}

export interface ComplianceRule {
  id: string;
  policyId: string;
  policyName: string;
  section: string;
  description: string;
  condition: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "active" | "inactive" | "draft";
  createdAt: string;
}

export interface Violation {
  id: string;
  ruleId: string;
  ruleName: string;
  recordId: string;
  policySection: string;
  explanation: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "pending" | "reviewed" | "escalated" | "resolved";
  detectedAt: string;
  department: string;
  riskScore: number;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface DashboardStats {
  totalPolicies: number;
  totalRules: number;
  activeViolations: number;
  resolvedViolations: number;
  complianceScore: number;
  lastScanAt: string;
  departmentScores: { department: string; score: number }[];
  severityBreakdown: { severity: string; count: number }[];
  trendData: { date: string; violations: number; resolved: number }[];
}
