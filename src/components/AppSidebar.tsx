import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Scale,
  AlertTriangle,
  ClipboardCheck,
  Settings,
  Shield,
} from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/policies", icon: FileText, label: "Policies" },
  { to: "/rules", icon: Scale, label: "Rules" },
  { to: "/violations", icon: AlertTriangle, label: "Violations" },
  { to: "/review", icon: ClipboardCheck, label: "Review" },
];

const AppSidebar = () => {
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-sidebar-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
          <Shield className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-sidebar-accent-foreground tracking-tight">ComplianceAI</h1>
          <p className="text-[10px] text-sidebar-muted uppercase tracking-widest">Automation Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              }`
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <NavLink
          to="/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
        >
          <Settings className="h-4 w-4" />
          Settings
        </NavLink>
        <div className="mt-3 px-3">
          <div className="flex items-center justify-between text-xs text-sidebar-muted">
            <span>Last scan</span>
            <span className="text-sidebar-accent-foreground">2 min ago</span>
          </div>
          <div className="mt-1.5 h-1 rounded-full bg-sidebar-accent overflow-hidden">
            <div className="h-full w-3/4 rounded-full gradient-success" />
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
