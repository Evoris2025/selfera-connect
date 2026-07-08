import { useId } from 'react';
import { cn } from '@/lib/utils';

interface ExpressionIconProps extends React.SVGAttributes<SVGSVGElement> {
  className?: string;
  size?: number | string;
  /** When true, uses currentColor for the stroke instead of the brand gradient. */
  monochrome?: boolean;
}

/**
 * ExpressionIcon — two overlapping theater masks (sad on the left,
 * happy on the right) arranged diagonally, drawn in the same thin
 * line style as Lucide icons.
 *
 * Behaves like a Lucide icon: fills the 24×24 viewBox edge-to-edge,
 * defaults strokeWidth to 2, and forwards `stroke` / `strokeWidth`
 * from the parent (via `vectorEffect="non-scaling-stroke"` so a
 * caller-supplied stroke width renders at exactly that width).
 */
export function ExpressionIcon({
  className,
  size = 24,
  monochrome = false,
  stroke: strokeProp,
  strokeWidth: strokeWidthProp,
  ...rest
}: ExpressionIconProps) {
  const gradientId = useId();
  const useGradient = !monochrome && strokeProp === undefined;
  const stroke = strokeProp ?? (monochrome ? 'currentColor' : `url(#${gradientId})`);
  const strokeWidth = strokeWidthProp ?? 2;

  const paths = (
    <>
      {/* Left mask (tragedy / sad) — top-left, tilted counter-clockwise */}
      <g transform="translate(-4.5 -3.2) scale(1.1) rotate(-22 12 12)">
        <path
          d="M6.5 6.5c1.5-1 3.5-1.5 5.5-1.5s4 .5 5.5 1.5c.4 3.3.4 6.7-.6 9.4-.9 2.4-3 3.6-4.9 3.6s-4-1.2-4.9-3.6c-1-2.7-1-6.1-.6-9.4Z"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M9.5 16.4c.8-1.2 2-1.9 2.5-1.9s1.7.7 2.5 1.9"
          vectorEffect="non-scaling-stroke"
        />
      </g>

      {/* Right mask (comedy / happy) — bottom-right, tilted clockwise */}
      <g transform="translate(7.6 5.8) scale(0.85) rotate(22 12 12)">
        <path
          d="M6.5 6.5c1.5-1 3.5-1.5 5.5-1.5s4 .5 5.5 1.5c.4 3.3.4 6.7-.6 9.4-.9 2.4-3 3.6-4.9 3.6s-4-1.2-4.9-3.6c-1-2.7-1-6.1-.6-9.4Z"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M9.5 15c.8 1.2 2 1.9 2.5 1.9s1.7-.7 2.5-1.9"
          vectorEffect="non-scaling-stroke"
        />
      </g>
    </>
  );

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('shrink-0', className)}
      aria-hidden="true"
      {...rest}
    >
      {useGradient && (
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#3b82f6" />
            <stop offset="1" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      )}
      {paths}
    </svg>
  );
}

export default ExpressionIcon;
