import { useId } from 'react';
import { cn } from '@/lib/utils';

interface ExpressionIconProps extends React.SVGAttributes<SVGSVGElement> {
  className?: string;
  size?: number | string;
  /** When true, uses currentColor for the stroke instead of the brand gradient. */
  monochrome?: boolean;
}

/**
 * ExpressionIcon — thin-stroke overlapping comedy/tragedy theater masks,
 * styled to match the app's other line-icons. Defaults to the SelfERA
 * blue → purple brand gradient stroke.
 *
 * Drop-in replacement for Lucide's `Sparkles` where it represents the
 * "Expression" concept (badges, tabs, buttons, drafts, dashboard, etc.).
 */
export function ExpressionIcon({
  className,
  size = 24,
  monochrome = false,
  ...rest
}: ExpressionIconProps) {
  const gradientId = useId();
  const stroke = monochrome ? 'currentColor' : `url(#${gradientId})`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('shrink-0', className)}
      aria-hidden="true"
      {...rest}
    >
      {!monochrome && (
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#3b82f6" />
            <stop offset="1" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      )}

      {/* Left mask (tragedy / sad) — tilted diagonally left */}
      <g transform="translate(8 12.4) rotate(-24) translate(-12 -12)">
        <path d="M6.5 6.5c1.5-1 3.5-1.5 5.5-1.5s4 .5 5.5 1.5c.4 3.3.4 6.7-.6 9.4-.9 2.4-3 3.6-4.9 3.6s-4-1.2-4.9-3.6c-1-2.7-1-6.1-.6-9.4Z" />
        <path d="M9.5 10.5h.01" />
        <path d="M14.5 10.5h.01" />
        <path d="M9.5 16.4c.8-1.2 2-1.9 2.5-1.9s1.7.7 2.5 1.9" />
      </g>

      {/* Right mask (comedy / happy) — tilted diagonally right */}
      <g transform="translate(16 12.4) rotate(24) translate(-12 -12)">
        <path d="M6.5 6.5c1.5-1 3.5-1.5 5.5-1.5s4 .5 5.5 1.5c.4 3.3.4 6.7-.6 9.4-.9 2.4-3 3.6-4.9 3.6s-4-1.2-4.9-3.6c-1-2.7-1-6.1-.6-9.4Z" />
        <path d="M9.5 10.5h.01" />
        <path d="M14.5 10.5h.01" />
        <path d="M9.5 15c.8 1.2 2 1.9 2.5 1.9s1.7-.7 2.5-1.9" />
      </g>
    </svg>
  );
}

export default ExpressionIcon;
