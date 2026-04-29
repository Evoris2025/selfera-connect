/**
 * App-wide canonical horizontal page inset ("content well").
 *
 * Single source of truth for the left/right padding shared by every tab's
 * page-level wrapper so that section headers, body rows, stat strips,
 * identity cards, tab rows, and inline labels all line up on the same
 * vertical axis.
 *
 * Chosen value: `px-4` (16px). This is the value already used by the
 * majority of pages (Feed, Explore, MyERA, Notifications, Messages).
 *
 * Horizontal scrollers ("rails") intentionally bleed past the inset using
 * `-mx-4 pl-4 pr-10` so the rail spans full content width while the first
 * card visually starts at the content-well line.
 */
export const PAGE_INSET = 'px-4';

/** Negative inset companion for full-bleed rails inside a `PAGE_INSET` parent. */
export const PAGE_INSET_BLEED = '-mx-4';

/** Leading padding for the first item of a full-bleed rail. */
export const RAIL_LEADING = 'pl-4';
