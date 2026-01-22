import { ReactNode } from 'react';
import { MobileNav } from './MobileNav';
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
    <div className="min-h-screen bg-background flex flex-col w-full">
      {showHeader && <AppHeader title={title} />}
      
      <main className="flex-1 pb-28 max-w-lg mx-auto w-full">
        {children}
      </main>
      
      <MobileNav onCreateClick={onCreatePost} followRequestCount={pendingCount} />
    </div>
  );
}
