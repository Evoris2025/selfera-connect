/**
 * Canonical type / avatar / icon scale.
 *
 * One vocabulary used app-wide so proportions feel coherent across surfaces.
 * Read these constants when sizing icons; use the matching Tailwind text-*
 * utilities for typography and the Avatar `size` prop for avatars.
 *
 * TYPE SCALE (Tailwind utilities, defined in tailwind.config.ts):
 *   text-caption   11px  — VIEWS · DATE meta, timestamps, micro-labels
 *   text-label     12px  — handles, secondary names, chip labels, stats
 *   text-body      14px  — primary names, post body, descriptions
 *   text-title     16px  — card titles, section titles
 *   text-headline  20px  — screen titles, modal headers
 *
 * AVATAR SCALE (size prop on the Avatar wrapper):
 *   xs  20px  — comment threads, dense meta rows
 *   sm  32px  — card meta rows, list items
 *   md  48px  — feed post headers, story rail
 *   lg  80px  — profile headers, account hubs
 *
 * ICON SCALE (read from ICON_SIZE):
 *   sm  14px  — inline meta icons (eye, heart, comment counts)
 *   md  18px  — primary action icons (composer, tab icons)
 *   lg  24px  — large-touch action icons (header bar, FAB)
 */
export const ICON_SIZE = { sm: 14, md: 18, lg: 24 } as const;

export type IconSizeKey = keyof typeof ICON_SIZE;

export const AVATAR_SIZE_CLASS = {
  xs: 'h-5 w-5',
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-20 w-20',
} as const;

export type AvatarSizeKey = keyof typeof AVATAR_SIZE_CLASS;
