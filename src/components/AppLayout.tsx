import { ReactNode, useState, useEffect } from 'react';
import { MobileNav } from './MobileNav';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { useFollowRequests } from '@/hooks/useFollowRequests';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  showHeader?: boolean;
  onCreatePost?: () => void;
}

export function AppLayout({ children, title, showHeader = true, onCreatePost }: AppLayoutProps) {
  const { pendingCount } = useFollowRequests();
  
  // Listen for sidebar collapse state changes - start collapsed by default
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      // Default to collapsed unless explicitly pinned
      const isPinned = localStorage.getItem('sidebar-pinned') === 'true';
      return !isPinned;
    }
    return true; // Default collapsed
  });

  useEffect(() => {
    const handleStorage = () => {
      setSidebarCollapsed(localStorage.getItem('sidebar-collapsed') === 'true');
    };
    
    // Listen for storage changes and custom events
    window.addEventListener('storage', handleStorage);
    window.addEventListener('sidebar-toggle', handleStorage);
    
    // Check periodically for changes (fallback for same-tab updates)
    const interval = setInterval(handleStorage, 100);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('sidebar-toggle', handleStorage);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-dvh bg-background flex w-full">
      {/* Left Sidebar - hidden on mobile, visible on md+ */}
      <div className="hidden md:block">
        <AppSidebar onCreateClick={onCreatePost} followRequestCount={pendingCount} />
      </div>
      
      {/* Main content area */}
      <div className={`flex-1 flex flex-col transition-[margin] duration-300 ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-60 lg:ml-64'}`}>
        {showHeader && <AppHeader title={title} />}
        
        <main className="flex-1 pb-nav-safe md:pb-0 max-w-lg mx-auto w-full">
          {children}
        </main>
        
        {/* Bottom Nav - visible on mobile only */}
        <div className="md:hidden">
          <MobileNav onCreateClick={onCreatePost} followRequestCount={pendingCount} />
        </div>
      </div>
    </div>
  );
}
