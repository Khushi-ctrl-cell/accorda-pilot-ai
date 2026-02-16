import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { OrgProvider } from "@/hooks/useOrg";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Policies from "./pages/Policies";
import Rules from "./pages/Rules";
import Violations from "./pages/Violations";
import Review from "./pages/Review";
import Settings from "./pages/Settings";
import ActivityLog from "./pages/ActivityLog";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Landing from "./pages/Landing";
import Demo from "./pages/Demo";
import SOC2Controls from "./pages/SOC2Controls";
import DataExport from "./pages/DataExport";
import AICopilot from "./pages/AICopilot";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <OrgProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public pages */}
              <Route path="/landing" element={<Landing />} />
              <Route path="/demo" element={<Demo />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/onboarding" element={<Onboarding />} />
              {/* Protected pages */}
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/policies" element={<ProtectedRoute><Policies /></ProtectedRoute>} />
              <Route path="/rules" element={<ProtectedRoute><Rules /></ProtectedRoute>} />
              <Route path="/violations" element={<ProtectedRoute><Violations /></ProtectedRoute>} />
              <Route path="/review" element={<ProtectedRoute><Review /></ProtectedRoute>} />
              <Route path="/soc2" element={<ProtectedRoute><SOC2Controls /></ProtectedRoute>} />
              <Route path="/export" element={<ProtectedRoute><DataExport /></ProtectedRoute>} />
              <Route path="/copilot" element={<ProtectedRoute><AICopilot /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/activity" element={<ProtectedRoute><ActivityLog /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </OrgProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
