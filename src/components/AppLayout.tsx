import { ReactNode } from 'react';
import { MobileNav } from './MobileNav';
import { AppHeader } from './AppHeader';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  showHeader?: boolean;
}

export function AppLayout({ children, title, showHeader = true }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col w-full">
      {showHeader && <AppHeader title={title} />}
      
      <main className="flex-1 pb-20 max-w-lg mx-auto w-full">
        {children}
      </main>
      
      <MobileNav />
    </div>
  );
}
