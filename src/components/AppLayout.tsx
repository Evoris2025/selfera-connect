import { ReactNode } from 'react';
import { MobileNav } from './MobileNav';
import { DesktopNav } from './DesktopNav';
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
      {/* Left Nav Bar - hidden on mobile & tablet, visible on lg+ (desktop only) */}
      <div className="hidden lg:block">
        <DesktopNav onCreateClick={onCreatePost} followRequestCount={pendingCount} />
      </div>
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col lg:ml-16">
        {showHeader && <AppHeader title={title} />}
        
        {/* 
          Mobile: max-w-lg (phone width)
          Tablet (md): full width
          Desktop (lg+): max-w-lg centered
        */}
        <main className="flex-1 pb-nav-safe lg:pb-0 max-w-lg md:max-w-full lg:max-w-2xl mx-auto w-full">
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
