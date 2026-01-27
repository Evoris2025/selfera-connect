

# ERA Studio Zigzag Connector Refinement

## Overview
Refine the zigzag connector lines between cards with balanced positioning (left side stays, right side pulled in), slightly reduced gap, while maintaining the thick card styling.

---

## Changes to `src/components/creator/ContentTypeDashboard.tsx`

### 1. Reduce Gap Between Cards

**Line 133** - Update the gap value:
- Change: `gap-6` to `gap-5`

This gives slightly tighter vertical spacing while maintaining room for the zigzag connectors.

---

### 2. Add Balanced Zigzag Connectors

Insert connector elements between each card (except after the last one). The connectors will use **matching left/right inset values** so both sides are equally positioned:

**Connector Structure:**
```text
Card 01 (Expression)
    │ ← vertical line starts at left-6
    └──────────────┐ ← horizontal crosses to right-6
                   │ ← vertical drops down
Card 02 (Video)
                   │ ← vertical starts at right-6  
    ┌──────────────┘ ← horizontal crosses to left-6
    │ ← vertical drops down
Card 03 (Photo)
... and so on
```

**Positioning:**
- Left anchor: `left-6` (consistent)
- Right anchor: `right-6` (pulled in from edge, matching left)
- This creates a balanced, symmetrical zigzag

**Connector Code (inserted after each card except the last):**

```tsx
{index < contentTypes.length - 1 && (
  <div className="relative h-5 mx-4">
    {/* Vertical line from current card */}
    <div 
      className={cn(
        "absolute top-0 w-px h-2 bg-border/40",
        isEven ? "left-6" : "right-6"
      )} 
    />
    {/* Horizontal line crossing */}
    <div className="absolute top-2 left-6 right-6 h-px bg-border/40" />
    {/* Vertical line to next card */}
    <div 
      className={cn(
        "absolute top-2 w-px h-3 bg-border/40",
        isEven ? "right-6" : "left-6"
      )} 
    />
  </div>
)}
```

---

### 3. Keep Cards Thick

No changes to card padding - maintain the current `p-4` and all card styling as-is.

---

## Visual Result

```text
┌─────────────────────────┐
│   01  |  Expression     │
└─────────────────────────┘
   │
   └───────────────────┐    ← right side pulled in (right-6)
                       │
┌──────────────────────┼──┐
│   Video  |  02       │  │
└──────────────────────┴──┘
                       │
   ┌───────────────────┘
   │
┌──┼──────────────────────┐
│  │  03  |  Photo        │
└──┴──────────────────────┘
   │
   └───────────────────┐
                       │
┌──────────────────────┼──┐
│   Post  |  04        │  │
└──────────────────────┴──┘
```

---

## Summary of Changes

| Aspect | Current | Updated |
|--------|---------|---------|
| Card gap | `gap-6` | `gap-5` |
| Left connector position | N/A | `left-6` |
| Right connector position | N/A | `right-6` (balanced with left) |
| Card padding | `p-4` | **Unchanged** |
| Card styling | Current | **Unchanged** |
| Connector height | N/A | `h-5` container |

