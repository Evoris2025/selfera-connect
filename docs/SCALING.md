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

### 3. App-shell is a centered mobile column
The outermost container is `max-w-md` (28rem ≈ iPhone 14 Pro Max width) with
`mx-auto` and `min-h-dvh`. On viewports `< 28rem` the column fills the width;
on viewports `≥ 28rem` the column stays 28rem wide and the rest of the screen
shows a neutral backdrop (`bg-background`).

**Never stretch the column wider than 28rem on desktop** — that's what broke
proportions in the previous regression.

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

| Viewport       | Behavior                                                           |
|----------------|--------------------------------------------------------------------|
| `< 28rem`      | Phone — column fills the width (mobile devices)                    |
| `≥ 28rem`      | Column capped at `max-w-md` (28rem); neutral backdrop fills sides  |
| `≥ 64rem`      | Backdrop slot reserved for optional secondary chrome (not built)   |

There is no breakpoint at which the app content stretches beyond `max-w-md`.

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
