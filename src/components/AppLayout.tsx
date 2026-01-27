import { ReactNode, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MobileNav } from './MobileNav';
import { DesktopNav } from './DesktopNav';
import { AppHeader } from './AppHeader';
import { CreatorStudio } from './creator/CreatorStudio';
import { useFollowRequests } from '@/hooks/useFollowRequests';
import { useNavbar } from '@/contexts/NavbarContext';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  showHeader?: boolean;
  onCreatePost?: () => void;
}

export function AppLayout({ children, title, showHeader = true, onCreatePost }: AppLayoutProps) {
  const { pendingCount } = useFollowRequests();
  const { isNavbarVisible } = useNavbar();
  const [creatorOpen, setCreatorOpen] = useState(false);

  // Handle create click - prefer internal CreatorStudio, fallback to prop
  const handleCreateClick = () => {
    if (onCreatePost) {
      onCreatePost();
    } else {
      setCreatorOpen(true);
    }
  };

  return (
    <div className="min-h-dvh bg-background flex w-full">
      {/* Left Nav Bar - hidden on mobile & tablet, visible on lg+ (desktop only) */}
      <div className="hidden lg:block">
        <DesktopNav onCreateClick={handleCreateClick} followRequestCount={pendingCount} />
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
        {/* Stable wrapper div prevents layout shifts during AnimatePresence */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
          <AnimatePresence mode="wait">
            {isNavbarVisible && (
              <motion.div 
                key="mobile-nav"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              >
                <MobileNav onCreateClick={handleCreateClick} followRequestCount={pendingCount} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Creator Studio - available globally when no onCreatePost prop */}
      {!onCreatePost && (
        <CreatorStudio
          open={creatorOpen}
          onOpenChange={setCreatorOpen}
        />
      )}
    </div>
  );
}
