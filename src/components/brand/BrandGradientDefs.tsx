/**
 * Global SVG <defs> block holding the canonical SelfERA brand gradient.
 *
 * Mounted ONCE at the app root (App.tsx). Every gradient-stroked icon in the
 * app references it via stroke="url(#selfera-brand-gradient)".
 *
 * Stops mirror the canonical .text-gradient-brand utility in src/index.css
 * (--gradient-start / --gradient-mid / --gradient-end). Update there, not here.
 */
export function BrandGradientDefs() {
  return (
    <svg
      width="0"
      height="0"
      aria-hidden
      focusable="false"
      style={{ position: 'absolute', pointerEvents: 'none' }}
    >
      <defs>
        <linearGradient id="selfera-brand-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(var(--gradient-start))" />
          <stop offset="50%" stopColor="hsl(var(--gradient-mid))" />
          <stop offset="100%" stopColor="hsl(var(--gradient-end))" />
        </linearGradient>
      </defs>
    </svg>
  );
}
