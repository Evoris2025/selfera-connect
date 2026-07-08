/**
 * Single canonical icon set for every content type in the app.
 *
 * Every place that represents one of these seven content types — the profile
 * tab bar, the studio dashboard cards, the drafts drawer, cross-post toggles,
 * the continue-working sheet, tools rail, etc. — MUST import from this file.
 * There is exactly one component per content type app-wide; do not recreate
 * or re-import Lucide icons for these concepts elsewhere.
 *
 * All seven components share:
 *   - viewBox="0 0 24 24" with the drawing extent ~2–22 like Lucide.
 *   - Default strokeWidth={2}, strokeLinecap/join="round".
 *   - vectorEffect="non-scaling-stroke" on every stroked path so a
 *     caller-supplied strokeWidth renders at exactly that width.
 *   - A Lucide-compatible API: `size`, `stroke`, `strokeWidth`,
 *     `className`, plus arbitrary SVG props via `...rest`.
 */
import { Grid3X3, Play, Users, BookOpen } from 'lucide-react';
import { ExpressionIcon as _ExpressionIcon } from './ExpressionIcon';
import { cn } from '@/lib/utils';

type ContentIconProps = React.SVGAttributes<SVGSVGElement> & {
  size?: number | string;
  className?: string;
};

/** Base <svg> wrapper for our custom drawings — mirrors Lucide's defaults. */
function IconSvg({
  size = 24,
  strokeWidth = 2,
  className,
  children,
  ...rest
}: ContentIconProps & { children: React.ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('shrink-0', className)}
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Re-exports of existing icons, so the entire content-type set
// resolves through this single module.
// ─────────────────────────────────────────────────────────────

export const UnifiedIcon = Grid3X3;
export const ExpressionIcon = _ExpressionIcon;
export const VideoIcon = Play;
export const CommunityIcon = Users;
export const SavedIcon = BookOpen;

// ─────────────────────────────────────────────────────────────
// New shared icons — drawn to match Lucide line weight so all
// seven content-type icons read as a single set.
// ─────────────────────────────────────────────────────────────

/** Framed photo with mountain + sun — represents "Images" content. */
export function ImagesIcon(props: ContentIconProps) {
  return (
    <IconSvg {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" vectorEffect="non-scaling-stroke" />
      <circle cx="9" cy="9" r="2" vectorEffect="non-scaling-stroke" />
      <path
        d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"
        vectorEffect="non-scaling-stroke"
      />
    </IconSvg>
  );
}

/** Document with folded corner + text lines — represents "Posts" content. */
export function PostsIcon(props: ContentIconProps) {
  return (
    <IconSvg {...props}>
      <path
        d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"
        vectorEffect="non-scaling-stroke"
      />
      <path d="M14 3v6h6" vectorEffect="non-scaling-stroke" />
      <path d="M8 13h8" vectorEffect="non-scaling-stroke" />
      <path d="M8 17h5" vectorEffect="non-scaling-stroke" />
    </IconSvg>
  );
}

/** Lookup map for consumers that resolve icons by string key. */
export const CONTENT_TYPE_ICONS = {
  Unified: UnifiedIcon,
  Expressions: ExpressionIcon,
  Video: VideoIcon,
  Images: ImagesIcon,
  Posts: PostsIcon,
  Community: CommunityIcon,
  Saved: SavedIcon,
} as const;

export type ContentTypeIconKey = keyof typeof CONTENT_TYPE_ICONS;
