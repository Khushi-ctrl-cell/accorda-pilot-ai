import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface Org {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
}

type AppRole = "admin" | "compliance_officer" | "reviewer" | "auditor";

interface OrgContextType {
  org: Org | null;
  orgId: string | null;
  roles: AppRole[];
  loading: boolean;
  hasRole: (role: AppRole) => boolean;
  canWrite: boolean; // admin or compliance_officer
  canReview: boolean; // admin, compliance_officer, or reviewer
  isAdmin: boolean;
}

const OrgContext = createContext<OrgContextType>({
  org: null,
  orgId: null,
  roles: [],
  loading: true,
  hasRole: () => false,
  canWrite: false,
  canReview: false,
  isAdmin: false,
});

export function OrgProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [org, setOrg] = useState<Org | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setOrg(null);
      setRoles([]);
      setLoading(false);
      return;
    }

    const fetchOrgAndRoles = async () => {
      setLoading(true);
      try {
        // Get user's org membership
        const { data: memberships } = await supabase
          .from("organization_members")
          .select("org_id")
          .eq("user_id", user.id)
          .limit(1);

        if (memberships && memberships.length > 0) {
          const orgId = memberships[0].org_id;

          // Fetch org details and roles in parallel
          const [orgRes, rolesRes] = await Promise.all([
            supabase.from("organizations").select("*").eq("id", orgId).single(),
            supabase.from("user_roles").select("role").eq("user_id", user.id).eq("org_id", orgId),
          ]);

          if (orgRes.data) setOrg(orgRes.data as Org);
          if (rolesRes.data) setRoles(rolesRes.data.map((r) => r.role as AppRole));
        }
      } catch (err) {
        console.error("Failed to fetch org:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrgAndRoles();
  }, [user]);

  const hasRole = (role: AppRole) => roles.includes(role);
  const isAdmin = hasRole("admin");
  const canWrite = isAdmin || hasRole("compliance_officer");
  const canReview = canWrite || hasRole("reviewer");

  return (
    <OrgContext.Provider value={{ org, orgId: org?.id ?? null, roles, loading, hasRole, canWrite, canReview, isAdmin }}>
      {children}
    </OrgContext.Provider>
  );
}

export const useOrg = () => useContext(OrgContext);
