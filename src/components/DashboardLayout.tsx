import { ReactNode } from "react";
import AppSidebar from "./AppSidebar";
import AIIntelligenceCore from "./command-center/AIIntelligenceCore";

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-background grid-bg">
      <AppSidebar />
      <main className="ml-16 min-h-screen relative">
        <div className="p-6">{children}</div>
      </main>
      <AIIntelligenceCore />
    </div>
  );
};

export default DashboardLayout;
