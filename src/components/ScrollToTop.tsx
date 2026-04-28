import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Native-feel scroll restoration.
 *
 * On every PUSH/REPLACE navigation, scroll the window to the top instantly
 * (no smooth animation — native apps don't smooth-scroll on tab change).
 * On POP (browser back/forward), preserve the previous scroll position so
 * the user lands where they left off.
 *
 * Mounted once inside <BrowserRouter> in App.tsx.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType === 'POP') return;
    // Use 'auto' (instant) — 'instant' isn't in the official types yet.
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    } catch {
      window.scrollTo(0, 0);
    }
    // Also reset the document scrolling element in case a nested container
    // owns the scroll on certain pages.
    if (document.scrollingElement) {
      document.scrollingElement.scrollTop = 0;
    }
  }, [pathname, navigationType]);

  return null;
}
