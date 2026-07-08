# Profile toolbar → 7 tabs + single shared icon set app-wide

## Goal

Replace the current 5-tab profile toolbar (Posts, Expressions, Reels, Community, Library) with the exact 7-tab sequence:

**Unified · Expressions · Video · Images · Posts · Community · Saved**

Every content-type icon in the app (toolbar, studio cards, drafts drawer, cross-post toggles, continue-working sheet, tools rail, everywhere) becomes a direct reuse of a single shared component per type — never a page-local recreation.

## 1. Create a single canonical icon module

New file: `src/components/icons/contentTypeIcons.tsx`. Exports one component per content type. Every other file imports from here — no more scattered Lucide imports for these concepts.

| Content type | Component | Underlying icon |
| --- | --- | --- |
| Unified      | `UnifiedIcon`      | Lucide `Grid3X3` re-export |
| Expressions  | `ExpressionIcon`   | existing `src/components/icons/ExpressionIcon.tsx` re-export |
| Video        | `VideoIcon`        | Lucide `Play` re-export |
| Images       | `ImagesIcon`       | **new** thin-stroke SVG (framed photo with mountain + sun) |
| Posts        | `PostsIcon`        | **new** thin-stroke SVG (document with 3 text lines) |
| Community    | `CommunityIcon`    | Lucide `Users` re-export |
| Saved        | `SavedIcon`        | Lucide `BookOpen` re-export |

All seven components share:
- `viewBox="0 0 24 24"`, drawing extent ~2–22 like Lucide.
- Default `strokeWidth={2}`, `strokeLinecap="round"`, `strokeLinejoin="round"`.
- `vectorEffect="non-scaling-stroke"` on every path so any caller-supplied `strokeWidth` renders exactly.
- Accept `size`, `stroke`, `strokeWidth`, `className`, and pass through `...rest` — API identical to Lucide.

`ImagesIcon` and `PostsIcon` are drawn from scratch matching Lucide line weight so all 7 read as one icon set.

## 2. Rewrite the profile tab definitions

Edit `src/hooks/useProfileTabOrder.ts`:

```
DEFAULT_TABS = [
  { id: 'unified',     icon: 'Unified',     label: 'Unified' },
  { id: 'expressions', icon: 'Expressions', label: 'Expressions' },
  { id: 'video',       icon: 'Video',       label: 'Video' },
  { id: 'images',      icon: 'Images',      label: 'Images' },
  { id: 'posts',       icon: 'Posts',       label: 'Posts' },
  { id: 'community',   icon: 'Community',   label: 'Community' },
  { id: 'saved',       icon: 'Saved',       label: 'Saved' },
]
```

Migration for existing persisted orders: filter out unknown ids, then append any new default ids at the end — same pattern the hook already uses for "missing tabs".

## 3. Update `RearrangeableTabBar`

Edit `src/components/profile/RearrangeableTabBar.tsx`:

- Drop the Lucide + `ExpressionIcon` imports; import the 7 icons from `contentTypeIcons`.
- Rewrite `ICON_MAP` to map the 7 icon keys to those components.
- Remove the special-case `monochrome` / size-boost wrapper for Expression — no longer needed once every icon is drawn to the same viewBox extent and stroke width.
- Update `isGridTab` (currently `['posts', 'expressions', 'reels']`) to `['unified', 'expressions', 'video', 'images', 'posts']` so the layout picker still triggers on grid-like tabs.
- The 5-item flex row (`flex-1` per tab) becomes cramped at 7; switch the tab container to a horizontal scroller: `overflow-x-auto` with `min-w-[56px]` per tab and `scrollbar-none`. On phones wide enough, 7 × 56 = 392 fits within 390 CSS px with a hair of scroll — matches the "scroll if it overflows" requirement.
- Active-underline indicator, triple-tap-to-rearrange, and hold-for-layout behavior remain unchanged; the hint text below stays the same.

## 4. Wire up the new sections in `Profile.tsx`

Edit `src/pages/Profile.tsx`:

- Initial `activeTab` changes from `'posts'` to `'unified'`.
- Rename the existing `activeTab === 'reels'` branch to `'video'` and `'library'` to `'saved'` (pure key rename; the underlying grid content is unchanged for this pass).
- Add two new branches:
  - `'unified'` → renders a merged grid of the user's posts + expressions + video + images (reuse the existing PostGrid component with the union feed the profile already loads; empty state matches the other tabs).
  - `'images'` → renders only image-type posts (filter the existing profile feed by media kind = image).
- The existing `'posts'` branch stays but its content narrows to text/link posts only (filter by media kind ≠ image/video) so Unified / Images / Video / Posts don't duplicate content.

## 5. App-wide icon audit — swap every content-type icon to the shared components

Files to edit (each swaps a Lucide or local icon for the shared component of the same type):

- `src/components/creator/ContentTypeDashboard.tsx` — Video card: `Video` → `VideoIcon`; Photo card: `ImageIcon` → `ImagesIcon`; Post card: `FileText` → `PostsIcon`. Expression already uses `ExpressionIcon`; re-import via the new module.
- `src/components/creator/shared/ContinueWorkingSheet.tsx` — same three swaps.
- `src/components/creator/shared/DraftManager.tsx` — same three swaps.
- `src/components/creator/shared/UnifiedDraftsDrawer.tsx` — same three swaps.
- `src/components/creator/shared/CrossPostToggles.tsx` — same swaps for any content-type toggles present.
- `src/components/creator/shared/ToolsRail.tsx` — audit and swap any content-type icons.
- Any other file surfaced by `rg -n "from 'lucide-react'" src | rg "Video|FileText|Image as ImageIcon|Play|Users|BookOpen|Grid3X3"` **when the usage represents one of these seven content types** (unrelated uses of `Video`/`Play`/etc. for playback controls or generic UI stay as-is).

After this pass there is exactly one component per content type reachable from `contentTypeIcons.tsx`, and every representation of that content type across the app renders the same glyph at the same weight.

## 6. Behavior kept intact

- Blue-underline active indicator on the selected tab (`gradient-brand` bar) — unchanged.
- `Triple-tap to rearrange • Hold grid icon for layout` hint — unchanged.
- Grid layout picker still opens on long-press for grid-style tabs.
- Rearrange mode, drag-and-drop, and save-to-Cloud persistence — unchanged (only the default tab list changes).

## Technical details

- New Images icon SVG (approx): `<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>` — identical geometry to Lucide `ImageIcon` but exported through our shared module so future restyles happen in one file.
- New Posts icon SVG (approx): `<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/><path d="M8 13h8"/><path d="M8 17h5"/>` — document with folded corner and text lines.
- `useProfileTabOrder` migration path: unknown ids in a saved `ordered_tab_ids` (e.g. old `'reels'`, `'library'`) get dropped by the existing `.filter(Boolean)`; the existing "append missing" step then adds `unified`, `video`, `images`, `saved` to the end. Users with a customized order will see new tabs appended; users on default get the exact 7-in-order layout.
- Tab bar overflow: switching from `flex-1` per tab to `min-w-[56px] flex-shrink-0` inside an `overflow-x-auto scrollbar-none` container satisfies "horizontally scrollable rather than shrinking icons unevenly".
- No database schema change required; `user_profile_tab_order.ordered_tab_ids` is already a `text[]` and stores whatever id strings we hand it.

## Out of scope for this pass

- No changes to what content each tab renders beyond the Unified/Images additions and the Posts narrowing described in §4. If you also want new empty-state copy, filter chips, or sort controls per tab, that's a follow-up.
- No changes to the Studio dashboard layout, card copy, or accent colors — only the icon components inside those cards.
