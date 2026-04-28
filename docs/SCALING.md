# SelfERA Scaling & Responsive Philosophy

This is the canonical document for how SelfERA sizes and frames itself across
every device class. All current and future code must follow these rules.

---

## Philosophy

SelfERA is a **mobile-first social app**. The phone (390×844, iPhone 14) is the
canonical layout. On every larger device we **keep mobile proportions and frame
the app** — we do not stretch the content to fill the screen.

This matches how Instagram, TikTok, and X present their web apps on desktop:
a centered mobile-width column, optionally with a sidebar of secondary chrome
on wider screens. The user sees the same proportions on iPhone, iPad, and a
27" iMac — only the framing changes.

---

## The Six Rules

### 1. Everything in rem
No fixed-pixel font sizes, paddings, widths, or heights for UI chrome. Use
Tailwind's spacing scale (rem-based) and the canonical text/icon/avatar tokens
in `src/lib/scale.ts` + `tailwind.config.ts`. Arbitrary values like
`text-[15px]`, `w-[44px]`, `h-[60px]`, `p-[10px]` are **forbidden in PR
review**. The only exception is media (image / video) intrinsic dimensions.

### 2. Root font-size is fluid
`html { font-size: clamp(0.9375rem, 0.875rem + 0.2vw, 1rem); }`

The entire app is sized in rem, so this single clamp gently scales every text
and spacing token with viewport width while still respecting the user's
browser/system text-size preference (the rem floor is preserved).

### 3. App-shell is a stepped mobile-canonical column
The outermost container is `mx-auto` with a stepped `max-width` ladder so the
column has a sensible shape on every device class — phone fills the viewport,
tablet breathes a little, desktop returns to the mobile-canonical width and
hands secondary chrome to the `DesktopLeftRail`. See the breakpoint table
below.

**Never stretch the column past `max-w-xl` (36rem) on tablet or past
`max-w-md` (28rem) on desktop** — wider canvases broke proportions in the
previous regression.

### 4. Viewport meta is locked
```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```
No `maximum-scale`, no `user-scalable=no`, no `minimum-scale`. Never block user
zoom — it is an accessibility requirement.

### 5. Safe areas respected
Use `env(safe-area-inset-top)` / `env(safe-area-inset-bottom)` on the top
header and bottom tab bar so the iOS notch and home indicator don't overlap
content. The `pt-safe`, `pb-safe`, `pb-nav-safe` utilities in `index.css`
already wrap this.

### 6. Touch targets ≥ 2.75rem (44px at default root)
Every clickable element (icon button, tab, chip, action) must have a hit area
of at least `2.75rem × 2.75rem` (Tailwind: `h-11 w-11`). The hit area can be
larger than the visual element using padding (e.g. a 20px icon inside a `p-3`
button → 44px hit area).

---

## What NOT to do — never reintroduce

These all caused the white-screen and 72%-shrink regressions:

- CSS `zoom` on **any** element, ever
- CSS `transform: scale()` on the app shell, root, or page wrappers
- Any preview-zoom hook, viewport-zoom hook, device-metric-sync hook, or
  zoom-control component
- viewport meta tag with `maximum-scale`, `minimum-scale`, or
  `user-scalable=no`
- Fixed-pixel widths on the app shell (no `width: 390px` containers)
- localStorage-driven scaling preferences

---

## Breakpoint table

| Viewport            | Column max-width        | Behavior                                                                                          |
|---------------------|-------------------------|---------------------------------------------------------------------------------------------------|
| `< 768px` (phone)   | none (full width)       | Column fills the viewport edge-to-edge                                                            |
| `768–1023px` (md)   | `max-w-xl` (36rem/576px)| Column grows to breathe on tablet, centered, neutral backdrop on either side                      |
| `≥ 1024px` (lg)     | `max-w-md` (28rem/448px)| `DesktopLeftRail` appears as a sibling and carries primary nav; column returns to mobile-canonical|
| `≥ 1280px` (xl)     | `max-w-md` (28rem/448px)| Same as `lg`; right rail slot reserved for future secondary chrome                                |

Implementation lives on the column wrapper in `src/components/AppLayout.tsx`:
`w-full md:max-w-xl lg:max-w-md mx-auto`. Do NOT widen the column past these
caps and do NOT collapse the ladder back to a single `max-w-md` — the tablet
range needs the extra breathing room.

### Horizontal rows: navigation vs content

Two distinct patterns. Choose by the row's purpose, not its visual similarity.

**Navigation chrome — must FIT, never scroll**

Tab bars, stat rows, sub-nav, in-card stat strips. The user must see every
option/value at a glance. Never make these scrollable.

Pattern:
- Container: `flex w-full items-end gap-2` (or `items-center` / `gap-1` for
  stat rows)
- Each item: `flex-1 min-w-0 justify-center inline-flex`
- Labels: canonical caption / body sizing; `tracking-wider` not
  `tracking-[0.1em]`
- Safety net: `truncate w-full text-center` on long labels (stat row labels
  only)

If labels still overflow after these reductions, clamp the font size:
`text-[clamp(0.625rem,0.55rem+0.4vw,0.75rem)]`. Last resort only: abbreviate
the label.

**Content rails — scroll with peek + fade**

Stories, suggestion carousels, trending lists, any row of user-generated
items. The user is meant to discover by scrolling.

Pattern:
- Container: `flex overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 pl-4 pr-10 rail-fade-right`
- Each item: `flex-shrink-0 snap-start`

---

## Linting note

The following arbitrary values are flagged in code review:

- `text-[Npx]`
- `w-[Npx]`
- `h-[Npx]`
- `p-[Npx]`, `pt-[Npx]`, `pb-[Npx]`, `pl-[Npx]`, `pr-[Npx]`
- `m-[Npx]`, `gap-[Npx]`

Replace with the nearest Tailwind spacing token, the canonical type tokens
(`text-caption`, `text-label`, `text-body`, `text-title`, `text-headline`),
or the `ICON_SIZE` constants from `src/lib/scale.ts`. The only allowed
exception is media intrinsic dimensions (e.g. a fixed `w-[200px]` thumbnail
inside a horizontally-scrolling rail where the media has a known aspect).

---

## Accessibility note

- **Never block user zoom.** The viewport meta must allow pinch and browser
  zoom up to at least 500%.
- Test with browser zoom at 200% and system text size set to "Large" — the app
  must remain usable, with no overlapping text or clipped controls.
- Never rely on hover-only affordances; every interactive element must be
  reachable via keyboard and have a visible focus ring.
