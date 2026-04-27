import * as React from 'react';
import { cn } from '@/lib/utils';

type BrandSurfaceOwnProps<E extends React.ElementType> = {
  as?: E;
  className?: string;
  children?: React.ReactNode;
};

type BrandSurfaceProps<E extends React.ElementType> = BrandSurfaceOwnProps<E> &
  Omit<React.ComponentPropsWithoutRef<E>, keyof BrandSurfaceOwnProps<E>>;

/**
 * Canonical outline-only brand surface.
 * Spec (C3): bg-black border border-white/[0.08] rounded-2xl.
 * NO tinted fills. NO heavier borders. Polymorphic via `as`.
 */
function BrandSurfaceInner<E extends React.ElementType = 'div'>(
  { as, className, children, ...rest }: BrandSurfaceProps<E>,
  ref: React.Ref<Element>,
) {
  const Comp = (as ?? 'div') as React.ElementType;
  return (
    <Comp
      ref={ref}
      className={cn('bg-black border border-white/[0.08] rounded-2xl', className)}
      {...rest}
    >
      {children}
    </Comp>
  );
}

export const BrandSurface = React.forwardRef(BrandSurfaceInner) as <
  E extends React.ElementType = 'div',
>(
  props: BrandSurfaceProps<E> & { ref?: React.Ref<Element> },
) => React.ReactElement | null;
