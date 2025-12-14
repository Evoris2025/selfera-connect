import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import '@/i18n';
import { getCurrentLanguage, getLanguageDirection } from "@/i18n";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import logo from '@/assets/logo.jpg';

import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Feed from "./pages/Feed";
import Explore from "./pages/Explore";
import VideoHub from "./pages/VideoHub";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import Directory from "./pages/Directory";
import CrisisSupport from "./pages/CrisisSupport";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <img src={logo} alt="SelfERA" className="w-12 h-12 rounded-2xl object-cover animate-pulse" />
          <span className="font-logo text-xl tracking-[0.2em] uppercase logo-glow">
            <span className="font-light text-foreground/50">SELF</span>
            <span className="font-semibold gradient-brand-text">ERA</span>
          </span>
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <img src={logo} alt="SelfERA" className="w-12 h-12 rounded-2xl object-cover animate-pulse" />
          <span className="font-logo text-xl tracking-[0.2em] uppercase logo-glow">
            <span className="font-light text-foreground/50">SELF</span>
            <span className="font-semibold gradient-brand-text">ERA</span>
          </span>
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
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
      <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
      <Route path="/search" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
      <Route path="/videos" element={<ProtectedRoute><VideoHub /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/profile/:handle?" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      {/* Public routes */}
      <Route path="/directory" element={<Directory />} />
      <Route path="/crisis" element={<CrisisSupport />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
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
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
