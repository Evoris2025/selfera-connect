# MyERA "oversized labels" — diagnosis report (read-only)

## TL;DR

There is **no global token regression** and **no change to `BrandSectionLabel` or `BrandUnderlineTabs`**. The three perceived size issues have three independent causes, in order of severity:

1. **PENDING pill is the wrong component.** It uses `<BrandSectionLabel>` (a screen-level section header, 11px uppercase, `tracking-[0.12em]`) instead of a small inline status pill. This is a hard bug, not a perception issue.
2. **MyERA secondary tabs render in a wider container than Explore's**, which makes the same-size labels feel chunkier. Font-size is provably identical to Explore at any given viewport.
3. **MYERA NETWORK header is currently identical to Explore's section labels** (same component, same default classes, no overrides). Any perceived inflation is coming from the row's right-side button neighbour, not the label itself.

---

## 1. Canonical token audit — UNCHANGED

`tailwind.config.ts` lines 21–40 define the canonical scale:

```
caption:  ['11px', { lineHeight: '1.25', letterSpacing: '0.04em' }]
label:    ['12px', { lineHeight: '1.4' }]
body:     ['14px', { lineHeight: '1.5' }]
title:    ['16px', { lineHeight: '1.375' }]
headline: ['20px', { lineHeight: '1.25' }]
```

`src/index.css` defines a fluid root font-size:
```
font-size: clamp(0.9375rem, 0.875rem + 0.2vw, 1rem);
```
That is the same root used by every page. No `text-base/text-lg` overrides on `html`, `body`, or any cascading selector.

**Verdict:** No token redefinition. All canonical tokens intact.

---

## 2. Primitive audit — UNCHANGED

### `BrandSectionLabel`
Resolved className: `text-caption font-medium uppercase tracking-[0.12em] text-white/55`
→ 11px, lh 1.25, letter-spacing 0.12em, weight 500.
Accepts only `className` and `children`. No size prop, no variant.

### `BrandUnderlineTabs`
Each tab button resolved className:
```
flex-1 min-w-0 justify-center inline-flex
px-1 py-2
text-[clamp(0.6875rem,0.625rem+0.4vw,0.8125rem)]
uppercase tracking-tight font-medium truncate
transition-colors duration-150
outline-none focus:outline-none focus-visible:outline-none
[active] text-gradient-brand | [inactive] text-white/45 hover:text-white/70
```
**Font-size is viewport-driven**, not container-driven: 11px → 13px between ~390px and ~830px viewports. Identical numeric size on Explore and MyERA at the same viewport.

**Verdict:** Defaults unchanged. No size props. Cannot be the source.

---

## 3. Call-site comparison

### MYERA NETWORK header (`src/pages/MyERA.tsx` 494–504)
```tsx
<div className="mt-6 mb-3 flex items-center justify-between">
  <BrandSectionLabel>MYERA NETWORK</BrandSectionLabel>
  <button ...> + Add </button>
</div>
```

### Explore section labels — Explore has none at the screen level. The screen uses `BrandUnderlineTabs` directly under a search bar. The closest comparator is the same `BrandSectionLabel` component used inside `ExploreFilters.tsx` at lines 304/320/337/353/371/417 — all with `className="px-5 mb-2"` only. **Same component, same defaults.**

### MyERA secondary tabs (`src/pages/MyERA.tsx` 506–515)
```tsx
<div className="mb-5 border-b border-white/[0.08]">
  <BrandUnderlineTabs
    tabs={[{id:'discover',label:'Discover'},{id:'mylist',label:'My List'},{id:'interactions',label:'Interactions'}]}
    value={activeNetworkTab} ... />
</div>
```
Parent section is `<motion.section className="px-4 order-1">`. Tabs container has **no horizontal padding** of its own.

### Explore top tabs (`src/pages/Explore.tsx` 164–171)
```tsx
<div className="sticky top-14 z-20 bg-background/95 backdrop-blur px-3 border-b border-white/[0.08]">
  <BrandUnderlineTabs tabs={exploreTabs} value={activeTab} ... />
</div>
```
Parent is the page root `<div className="flex flex-col min-h-full">` (full width). Tabs container adds `px-3`.

### Same component? Same props?
- Component: **Yes**, both `BrandUnderlineTabs`.
- Props: **Yes**, no size overrides on either side.
- Wrapper context: **No.** Explore tabs sit at full screen width minus 24px and divide across **4 cells** → ~91px/cell at 390px viewport. MyERA tabs sit inside `px-4` (32px gutter) and divide across **3 cells** → ~119px/cell at 390px viewport. Same font-size, **~30% wider cells** → labels look larger and heavier because of negative-space framing.

---

## 4. Status pill audit — **ROOT CAUSE FOUND**

`src/pages/MyERA.tsx` line 624–626:
```tsx
{link.status === 'pending' && (
  <BrandSectionLabel>PENDING</BrandSectionLabel>
)}
```

This is the bug. `BrandSectionLabel` is a screen-level section header with `tracking-[0.12em]` and 11px caption typography — when used as a status pill on a list row, it renders as a chunky uppercase block sitting next to the message-icon button, with no border, no background, no compact form factor. There is no other "PENDING" status pill elsewhere in the app to compare against; status visualisation in the codebase typically uses a small bordered chip (e.g. the "{N} ACTIVE" pill in `ExploreFilters.tsx` 287–296: `text-caption uppercase tracking-[0.12em] px-2 py-1 rounded-full border ...`).

**Verdict:** Wrong primitive. `BrandSectionLabel` is for screen-level headers, not row badges.

---

## 5. Cascade audit — clean

Walking up from each affected element to `<AppLayout>`:

- `MYERA NETWORK` → `<div mt-6 mb-3 flex …>` → `<motion.section px-4 order-1>` → `<div flex flex-col>` → `<div ... main flex flex-col>` (no font-size cascades)
- Secondary tabs → `<div mb-5 border-b …>` → same `<motion.section px-4>` → same parents
- PENDING → row `<motion.div className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-white/5">` → list `<div space-y-2>` → tab content → same section

**No ancestor applies `text-base`, `text-lg`, `text-sm`, `prose`, or any cascading font-size/leading.**

---

## 6. Runtime computed sizes (analytical, not inspected)

At a 390px viewport:
- `BrandSectionLabel` (MYERA NETWORK / SORT BY / FOLLOW REQUESTS): **11px**, lh 1.25, ls 0.12em — identical across every screen.
- `BrandUnderlineTabs` cell label (DISCOVER, EXPRESSIONS, anywhere): font-size = `clamp(11px, 10px + 0.4vw, 13px)` ≈ **11.56px** at 390px viewport. **Identical between Explore and MyERA.**
- PENDING (`BrandSectionLabel`): **11px** + ls 0.12em — looks oversized in a row context because section-label letter-spacing is wider than a status pill's expected `tracking-tight`/`tracking-wider`, and there's no chip chrome to constrain it.

---

## Diagnosis summary

| Question | Answer |
|---|---|
| Tokens redefined? | **No.** |
| `BrandSectionLabel` defaults changed? | **No.** |
| `BrandUnderlineTabs` defaults changed? | **No.** |
| MyERA passes size overrides? | **No.** |
| Parent wrapper cascading larger font? | **No.** |
| Wrong primitive used somewhere? | **Yes — `BrandSectionLabel` for the PENDING row pill.** |
| Wrapper geometry difference between MyERA and Explore tabs? | **Yes — MyERA's tab container has no `px-3` padding and only 3 cells (vs Explore's `px-3` + 4 cells), making each cell ~30% wider.** |

### Single most likely root causes

1. **PENDING pill (line 625, `src/pages/MyERA.tsx`)** — wrong component. `BrandSectionLabel` should never be used as a row-level status badge.
2. **Secondary tab container (line 507, `src/pages/MyERA.tsx`)** — missing `px-3` (and arguably tighter overall horizontal padding) makes 3 wide cells feel oversized. Explore's same primitive looks compact because `px-3` is added to the tab container itself, not the parent section.

(MYERA NETHEADER is not actually inflated at the component level — it matches Explore's filter-sheet labels exactly. Any perception of "larger" is coming from the visual weight of the `+ Add` chip beside it, not the label itself.)

---

## Proposed minimal fix (for next default-mode pass — DO NOT APPLY YET)

Two surgical edits in `src/pages/MyERA.tsx`. No other files touched. No new tokens, no new components.

### Edit A — line 624–626 (PENDING pill)

Replace:
```tsx
{link.status === 'pending' && (
  <BrandSectionLabel>PENDING</BrandSectionLabel>
)}
```
with the same chip primitive Explore uses for `{N} ACTIVE` (compact bordered pill):
```tsx
{link.status === 'pending' && (
  <span className="shrink-0 text-[10px] uppercase tracking-[0.08em] font-medium px-2 py-0.5 rounded-full border border-white/15 text-white/55">
    Pending
  </span>
)}
```

### Edit B — line 507 (secondary tab container alignment)

Replace:
```tsx
<div className="mb-5 border-b border-white/[0.08]">
  <BrandUnderlineTabs ... />
</div>
```
with the same wrapper Explore uses (add `px-3` and reduce bottom margin to match Explore's tab spacing):
```tsx
<div className="-mx-4 mb-4 px-3 border-b border-white/[0.08]">
  <BrandUnderlineTabs ... />
</div>
```
The negative `-mx-4` cancels the parent `px-4`, then `px-3` gives the same internal gutter Explore uses, restoring identical cell width per tab. Three tabs across the same width as Explore's four read as compact, not chunky.

### Optional Edit C — MYERA NETWORK header

No change needed. The header already uses the canonical `BrandSectionLabel` with no overrides. If the user still perceives it as heavy after Edits A+B, the cause is the `+ Add` chip's visual weight, not the label.

---

## Files inspected (no edits made)

- `tailwind.config.ts`
- `src/index.css`
- `src/components/brand/BrandSectionLabel.tsx`
- `src/components/brand/BrandUnderlineTabs.tsx`
- `src/pages/MyERA.tsx` (lines 478–640)
- `src/pages/Explore.tsx` (lines 119–192)
- `src/components/explore/ExploreFilters.tsx` (lines 280–430, for chip-pill comparator)

Awaiting approval to apply Edits A and B.
