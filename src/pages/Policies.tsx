import DashboardLayout from "@/components/DashboardLayout";
import StatusBadge from "@/components/StatusBadge";
import { usePolicies, useCreatePolicy, useParsePolicy } from "@/hooks/useCompliance";
import { Upload, FileText, Search, Loader2, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

const Policies = () => {
  const [search, setSearch] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [policyName, setPolicyName] = useState("");
  const [policyText, setPolicyText] = useState("");

  const { data: policies = [], isLoading } = usePolicies();
  const createPolicy = useCreatePolicy();
  const parsePolicy = useParsePolicy();

  const filtered = policies.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleUploadAndParse = async () => {
    if (!policyName.trim() || !policyText.trim()) {
      toast.error("Please provide both policy name and text");
      return;
    }

    try {
      const policy = await createPolicy.mutateAsync({
        name: policyName,
        raw_text: policyText,
        file_size: `${(new Blob([policyText]).size / 1024).toFixed(1)} KB`,
      });

      toast.info("AI is extracting compliance rules...");

      const result = await parsePolicy.mutateAsync({
        policy_id: policy.id,
        policy_text: policyText,
        policy_name: policyName,
      });

      toast.success(`Extracted ${result.count} rules with ${Math.round((result.confidence || 0) * 100)}% confidence`);
      setShowUpload(false);
      setPolicyName("");
      setPolicyText("");
    } catch (err: any) {
      toast.error(err.message || "Failed to process policy");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Policy Documents</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload policy documents and extract compliance rules with AI
            </p>
          </div>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="inline-flex items-center gap-2 rounded-lg gradient-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
          >
            <Upload className="h-4 w-4" />
            Upload Policy
          </button>
        </div>

        {/* Upload Form */}
        {showUpload && (
          <motion.div
            className="glass-card rounded-xl p-6 space-y-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              AI-Powered Policy Extraction
            </h3>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Policy Name</label>
              <input
                type="text"
                value={policyName}
                onChange={(e) => setPolicyName(e.target.value)}
                placeholder="e.g., Procurement & Invoicing Policy"
                className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Policy Text</label>
              <textarea
                value={policyText}
                onChange={(e) => setPolicyText(e.target.value)}
                placeholder="Paste your policy document text here..."
                rows={8}
                className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleUploadAndParse}
                disabled={createPolicy.isPending || parsePolicy.isPending}
                className="inline-flex items-center gap-2 rounded-lg gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {(createPolicy.isPending || parsePolicy.isPending) && <Loader2 className="h-4 w-4 animate-spin" />}
                <Sparkles className="h-4 w-4" />
                Extract Rules with AI
              </button>
              <button
                onClick={() => setShowUpload(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search policies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-input bg-card pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-12">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground mt-2">Loading policies...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No policies yet</p>
            <p className="text-xs mt-1">Upload a policy document to get started</p>
          </div>
        )}

        {/* Policy Cards */}
        <div className="grid grid-cols-2 gap-4">
          {filtered.map((policy, i) => (
            <motion.div
              key={policy.id}
              className="glass-card rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground truncate">{policy.name}</h3>
                    <StatusBadge status={policy.status as any} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Uploaded {format(new Date(policy.created_at), "MMM d, yyyy")} · {policy.file_size || "N/A"}
                  </p>
                  <div className="flex gap-4 mt-3">
                    <div className="text-center">
                      <p className="text-lg font-bold text-foreground">{policy.rules_extracted}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Rules</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-foreground">{policy.sections}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Sections</p>
                    </div>
                    {policy.ai_confidence != null && (
                      <div className="text-center">
                        <p className="text-lg font-bold text-foreground">{Math.round(policy.ai_confidence * 100)}%</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">AI Confidence</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Policies;
