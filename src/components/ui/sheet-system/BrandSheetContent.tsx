import * as React from 'react';
import { SheetContent } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface BrandSheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetContent> {
  /** Tailwind max-height arbitrary value (default '85vh'). */
  maxHeight?: string;
  /** Hide the canonical drag handle (rare — only for sheets that need a custom top). */
  hideHandle?: boolean;
}

/**
 * Canonical bottom sheet wrapper.
 *
 * Adds: drag handle, hidden default close X, brand padding, safe-area inset,
 * rounded-top corners, dark blur background, white/10 border.
 *
 * Pair with <BrandSheetTitle>, <BrandSegmentedControl>, <BrandSheetItem>, etc.
 */
export const BrandSheetContent = React.forwardRef<
  React.ElementRef<typeof SheetContent>,
  BrandSheetContentProps
>(({ className, children, maxHeight = '85vh', hideHandle, ...props }, ref) => {
  return (
    <SheetContent
      ref={ref}
      side="bottom"
      className={cn(
        'rounded-t-2xl bg-background/95 backdrop-blur-md border-white/10',
        'px-5 pt-1 pb-[calc(env(safe-area-inset-bottom)+32px)]',
        'overflow-y-auto',
        '[&>button]:hidden',
        className,
      )}
      style={{ maxHeight, ...(props.style ?? {}) }}
      {...props}
    >
      {!hideHandle && (
        <div
          aria-hidden
          className="w-10 h-1 rounded-full bg-white/20 mx-auto mt-3 mb-4 shrink-0"
        />
      )}
      {children}
    </SheetContent>
  );
});
BrandSheetContent.displayName = 'BrandSheetContent';
