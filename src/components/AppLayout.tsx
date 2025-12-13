import { ReactNode } from 'react';
import { DesktopSidebar } from './DesktopSidebar';
import { MobileNav } from './MobileNav';
import { AppHeader } from './AppHeader';

interface AppLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  rightSidebar?: ReactNode;
}

export function AppLayout({ children, showHeader = true, rightSidebar }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex w-full">
      <DesktopSidebar />
      
      <div className="flex-1 flex flex-col min-h-screen">
        {showHeader && <AppHeader />}
        
        <div className="flex-1 flex">
          <main className="flex-1 pb-20 md:pb-0">
            {children}
          </main>
          
          {rightSidebar && (
            <aside className="hidden lg:block w-80 p-4 border-l border-border">
              {rightSidebar}
            </aside>
          )}
        </div>
      </div>
      
      <MobileNav />
    </div>
  );
}
