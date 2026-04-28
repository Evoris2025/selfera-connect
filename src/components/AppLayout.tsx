import { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MobileNav } from './MobileNav';
import { AppHeader } from './AppHeader';
import { useFollowRequests } from '@/hooks/useFollowRequests';
import { useNavbar } from '@/contexts/NavbarContext';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  showHeader?: boolean;
  /**
   * When true, the header center renders the SelfERA <BrandMark/> lockup
   * instead of the text title. Additive — does not affect existing call sites.
   */
  brandMark?: boolean;
}

/**
 * App shell — see docs/SCALING.md.
 *
 * The app is mobile-first. The phone (≈ 390×844) is the canonical layout.
 * On every wider device we KEEP the mobile column proportions and frame the
 * column with a neutral backdrop — we do not stretch content to fill the
 * screen. This matches Instagram / TikTok / X on desktop.
 *
 *   - Outer wrapper paints the backdrop on viewports ≥ 28rem.
 *   - Inner column is `max-w-md` (28rem) `mx-auto`, `min-h-dvh`.
 *   - Bottom nav is positioned within the column (sticky), so it auto-scopes.
 *
 * NEVER apply CSS `zoom` or `transform: scale()` to this shell — both
 * previously caused white-screen and 72%-shrink regressions.
 */
export function AppLayout({ children, title, showHeader = true, brandMark = false }: AppLayoutProps) {
  const { pendingCount } = useFollowRequests();
  const { isNavbarVisible } = useNavbar();

  return (
    <div className="min-h-dvh w-full bg-background">
      {/* Centered mobile column — never wider than 28rem on any device. */}
      <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col bg-background shadow-cinematic">
        {showHeader && <AppHeader title={title} brandMark={brandMark} />}

        <main className="flex-1 pb-nav-safe w-full">
          {children}
        </main>

        {/* Bottom Nav — sticky inside the column so it auto-scopes to mobile width. */}
        <div className="sticky bottom-0 left-0 right-0 z-50 w-full">
          <AnimatePresence mode="wait">
            {isNavbarVisible && (
              <motion.div
                key="mobile-nav"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              >
                <MobileNav followRequestCount={pendingCount} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
