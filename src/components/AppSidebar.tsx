import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Scale,
  AlertTriangle,
  ClipboardCheck,
  Settings,
  Shield,
  LogOut,
  User,
  Activity,
  ShieldCheck,
  Download,
  Sparkles,
  Puzzle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useOrg } from "@/hooks/useOrg";
import { useUnreadCount } from "@/hooks/useNotifications";
import { motion } from "framer-motion";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/policies", icon: FileText, label: "Policies" },
  { to: "/rules", icon: Scale, label: "Rules" },
  { to: "/violations", icon: AlertTriangle, label: "Violations" },
  { to: "/review", icon: ClipboardCheck, label: "Review" },
  { to: "/soc2", icon: ShieldCheck, label: "SOC 2" },
  { to: "/copilot", icon: Sparkles, label: "AI Copilot" },
  { to: "/export", icon: Download, label: "Export" },
  { to: "/integrations", icon: Puzzle, label: "Integrations" },
  { to: "/activity", icon: Activity, label: "Activity" },
];

const AppSidebar = () => {
  const { user, signOut } = useAuth();
  const { org, roles } = useOrg();
  const navigate = useNavigate();
  const { data: unreadCount = 0 } = useUnreadCount();
  const [expanded, setExpanded] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "User";
  const roleLabel = roles.length > 0 ? roles[0].replace("_", " ") : "member";

  return (
    <motion.aside
      className="fixed left-0 top-0 z-40 flex h-screen flex-col bg-sidebar border-r border-sidebar-border"
      initial={false}
      animate={{ width: expanded ? 220 : 64 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 px-3 border-b border-sidebar-border overflow-hidden">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg gradient-primary">
          <Shield className="h-4 w-4 text-primary-foreground" />
        </div>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="overflow-hidden"
          >
            <h1 className="text-sm font-display font-bold text-sidebar-accent-foreground tracking-tight whitespace-nowrap">Accorda</h1>
            <p className="text-[9px] text-sidebar-muted uppercase tracking-widest truncate">
              {org?.name || "Intelligence"}
            </p>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-150 group relative ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Active indicator glow */}
                {isActive && (
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full"
                    style={{
                      background: "hsl(var(--primary))",
                      boxShadow: "0 0 8px hsl(var(--primary) / 0.5)",
                    }}
                  />
                )}
                <item.icon className="h-4 w-4 shrink-0" />
                {expanded && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="whitespace-nowrap text-xs"
                  >
                    {item.label}
                  </motion.span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-2 space-y-1">
        <NavLink
          to="/settings"
          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
        >
          <Settings className="h-4 w-4 shrink-0" />
          {expanded && <span className="whitespace-nowrap">Settings</span>}
        </NavLink>

        <div className="flex items-center gap-2 px-2.5 py-1.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sidebar-accent">
            <User className="h-3.5 w-3.5 text-sidebar-foreground" />
          </div>
          {expanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 min-w-0"
            >
              <p className="text-[11px] font-medium text-sidebar-accent-foreground truncate">{displayName}</p>
              <p className="text-[9px] text-sidebar-muted capitalize">{roleLabel}</p>
            </motion.div>
          )}
          {expanded && unreadCount > 0 && (
            <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground px-0.5">
              {unreadCount}
            </span>
          )}
          {expanded && (
            <button
              onClick={handleSignOut}
              className="text-sidebar-muted hover:text-sidebar-foreground transition-colors"
              title="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
};

export default AppSidebar;
