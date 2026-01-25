import { ReactNode } from 'react';
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

  return (
    <div className="min-h-dvh bg-background flex w-full">
      {/* Left Sidebar - hidden on mobile, visible on md+ */}
      <div className="hidden md:block">
        <AppSidebar onCreateClick={onCreatePost} followRequestCount={pendingCount} />
      </div>
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col md:ml-60 lg:ml-64">
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
