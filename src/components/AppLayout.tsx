import { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MobileNav } from './MobileNav';
import { AppHeader } from './AppHeader';
import { DesktopLeftRail } from './DesktopLeftRail';
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
      {/*
       * Outer flex: at lg+, the DesktopLeftRail sits as a sibling to the
       * mobile column. Below lg, the rail is display:none (handled inside
       * the rail component itself) and the column behaves identically.
       */}
      <div className="flex min-h-dvh w-full">
        <DesktopLeftRail />

        {/* Mobile column — unchanged shape/behavior on every viewport. */}
        <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col bg-background shadow-cinematic">
          {showHeader && <AppHeader title={title} brandMark={brandMark} />}

          <main className="flex-1 pb-nav-safe w-full lg:pb-0">
            {children}
          </main>

          {/* Bottom Nav — hidden at lg+ where the side rail handles primary nav. */}
          <div className="sticky bottom-0 left-0 right-0 z-50 w-full lg:hidden">
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
    </div>
  );
}
