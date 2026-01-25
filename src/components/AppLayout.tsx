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
      {/* Left Sidebar - hidden on mobile & tablet, visible on lg+ (desktop only) */}
      <div className="hidden lg:block">
        <AppSidebar onCreateClick={onCreatePost} followRequestCount={pendingCount} />
      </div>
      
      {/* Main content area */}
      <div className={`flex-1 flex flex-col transition-[margin] duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60 xl:ml-64'}`}>
        {showHeader && <AppHeader title={title} />}
        
        {/* 
          Mobile: max-w-lg (phone width)
          Tablet (md): full width
          Desktop (lg+): max-w-lg centered
        */}
        <main className="flex-1 pb-nav-safe lg:pb-0 max-w-lg md:max-w-full lg:max-w-lg mx-auto w-full">
          {children}
        </main>
        
        {/* Bottom Nav - visible on mobile and tablet (md), hidden on desktop (lg+) */}
        <div className="lg:hidden">
          <MobileNav onCreateClick={onCreatePost} followRequestCount={pendingCount} />
        </div>
      </div>
    </div>
  );
}
