import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import '@/i18n';
import { getCurrentLanguage, getLanguageDirection } from "@/i18n";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { MockSystemProvider } from "@/contexts/MockSystemContext";
import { FeedDataProvider } from "@/contexts/FeedDataContext";
import { NavbarProvider } from "@/contexts/NavbarContext";
import { SafetyProvider } from "@/contexts/SafetyContext";
import logo from '@/assets/selfera-logo.png';
import { BrandGradientDefs } from '@/components/brand';
import { ScrollToTop } from '@/components/ScrollToTop';

import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Feed from "./pages/Feed";
import Explore from "./pages/Explore";
import Community from "./pages/Community";
import MyERA from "./pages/MyERA";
import Notifications from "./pages/Notifications";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import Directory from "./pages/Directory";
import ProviderDashboard from "./pages/ProviderDashboard";
import CrisisSupport from "./pages/CrisisSupport";
import Settings from "./pages/Settings";
import Transparency from "./pages/Transparency";
import AdminConsole from "./pages/AdminConsole";
import Guidelines from "./pages/Guidelines";
import CreatorDashboard from "./pages/CreatorDashboard";
import Studio from "./pages/Studio";
import NotFound from "./pages/NotFound";
import DebugBrand from "./pages/DebugBrand";

const queryClient = new QueryClient();

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <div className="flex items-center animate-fade-in">
          <img src={logo} alt="SelfERA" className="h-72 object-contain animate-pulse" />
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
}

// Home route - redirects based on auth state
function HomeRoute() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <div className="flex items-center animate-fade-in">
          <img src={logo} alt="SelfERA" className="h-72 object-contain animate-pulse" />
        </div>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/feed" replace />;
  }
  
  return <Landing />;
}

function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
        <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
        <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
        <Route path="/community/:communityId" element={<ProtectedRoute><Community /></ProtectedRoute>} />
        <Route path="/my-era" element={<ProtectedRoute><MyERA /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/profile/:handle?" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/provider-dashboard" element={<ProtectedRoute><ProviderDashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminConsole /></ProtectedRoute>} />
        <Route path="/creator-dashboard" element={<ProtectedRoute><CreatorDashboard /></ProtectedRoute>} />
        <Route path="/studio" element={<ProtectedRoute><Studio /></ProtectedRoute>} />
        <Route path="/studio/:type" element={<ProtectedRoute><Studio /></ProtectedRoute>} />
        {/* Public routes */}
        <Route path="/directory" element={<Directory />} />
        <Route path="/crisis" element={<CrisisSupport />} />
        <Route path="/transparency" element={<Transparency />} />
        <Route path="/guidelines" element={<Guidelines />} />
        <Route path="/debug/brand" element={<DebugBrand />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

const App = () => {
  useEffect(() => {
    const lang = getCurrentLanguage();
    document.documentElement.dir = getLanguageDirection(lang);
    document.documentElement.lang = lang;
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SafetyProvider>
          <MockSystemProvider>
            <FeedDataProvider>
              <NavbarProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrandGradientDefs />
                  <BrowserRouter>
                    <ScrollToTop />
                    <AppRoutes />
                  </BrowserRouter>
                </TooltipProvider>
              </NavbarProvider>
            </FeedDataProvider>
          </MockSystemProvider>
        </SafetyProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
