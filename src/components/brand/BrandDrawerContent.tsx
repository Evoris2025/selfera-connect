import * as React from 'react';
import { DrawerContent } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';

interface BrandDrawerContentProps
  extends React.ComponentPropsWithoutRef<typeof DrawerContent> {
  /** Tailwind max-height arbitrary value (default '85vh'). */
  maxHeight?: string;
}

/**
 * Twin of <BrandSheetContent> for the vaul-based <Drawer> primitive.
 * Used by sheets that benefit from vaul's native iOS-style swipe physics
 * (CommentSheet, ShareSheet).
 *
 * Note: vaul's <DrawerContent> already renders its own drag handle via the
 * primitive — we override the styling to match the canonical brand handle.
 */
export const BrandDrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerContent>,
  BrandDrawerContentProps
>(({ className, children, maxHeight = '85vh', ...props }, ref) => {
  return (
    <DrawerContent
      ref={ref}
      className={cn(
        'rounded-t-2xl bg-background/95 backdrop-blur-md border-white/10',
        'px-5 pt-1 pb-[calc(env(safe-area-inset-bottom)+32px)]',
        // Override vaul's default handle styling to match BrandSheetContent
        '[&>div:first-child]:w-10 [&>div:first-child]:h-1 [&>div:first-child]:rounded-full',
        '[&>div:first-child]:bg-white/20 [&>div:first-child]:mt-3 [&>div:first-child]:mb-4',
        className,
      )}
      style={{ maxHeight, ...(props.style ?? {}) }}
      {...props}
    >
      {children}
    </DrawerContent>
  );
});
BrandDrawerContent.displayName = 'BrandDrawerContent';
