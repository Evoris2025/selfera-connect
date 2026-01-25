

# Fix Desktop Navigation for MyERA, Notifications, and Messages

## Problem
The MyERA, Notifications, and Messages pages have their own navigation bars rendered directly (using `MobileNav`), instead of using the `AppLayout` component. This causes the navigation to appear at the bottom on desktop, when it should appear on the left side like other pages.

## Solution
Wrap these three pages with the `AppLayout` component, which handles the responsive navigation logic:
- Desktop (lg+): Shows `DesktopNav` on the left side
- Tablet (md) and Mobile: Shows `MobileNav` at the bottom

## Changes Required

### 1. MyERA Page (`src/pages/MyERA.tsx`)
**Current structure:**
```tsx
return (
  <div className="min-h-screen bg-background pb-24">
    {/* Page content */}
    <MobileNav ... />
  </div>
);
```

**New structure:**
```tsx
return (
  <AppLayout showHeader={false}>
    <div className="min-h-screen bg-background">
      {/* Page content - remove MobileNav, it's handled by AppLayout */}
    </div>
  </AppLayout>
);
```

Changes:
- Import `AppLayout` instead of (or in addition to) `MobileNav`
- Remove the direct `MobileNav` component
- Remove `pb-24` padding (AppLayout handles navigation spacing with `pb-nav-safe`)
- Wrap content in `AppLayout` with `showHeader={false}` (page has its own hero section)

### 2. Notifications Page (`src/pages/Notifications.tsx`)
**Current structure:**
```tsx
return (
  <div className="flex flex-col h-[100dvh] bg-background">
    {/* Header and content */}
    <MobileNav />
  </div>
);
```

**New structure:**
```tsx
return (
  <AppLayout showHeader={false}>
    <div className="flex flex-col min-h-[100dvh] bg-background">
      {/* Header and content - remove MobileNav */}
    </div>
  </AppLayout>
);
```

Changes:
- Import `AppLayout`
- Remove the direct `MobileNav` component
- Wrap content in `AppLayout` with `showHeader={false}` (page has its own header)
- Adjust height handling as needed

### 3. Messages Page (`src/pages/Messages.tsx`)
**Current structure:**
```tsx
return (
  <div className="...">
    {/* Page content */}
    <MobileNav />
    <NewConversationModal ... />
  </div>
);
```

**New structure:**
```tsx
return (
  <AppLayout showHeader={false}>
    <div className="...">
      {/* Page content - remove MobileNav */}
      <NewConversationModal ... />
    </div>
  </AppLayout>
);
```

Changes:
- Import `AppLayout`
- Remove the direct `MobileNav` component
- Wrap content in `AppLayout` with `showHeader={false}` (page has its own header)

## Technical Details

### AppLayout Props
- `showHeader={false}` - These pages have their own custom headers, so we disable AppLayout's header
- The `onCreatePost` prop can be added if these pages need to trigger the creator studio

### Why This Works
`AppLayout` already contains the correct responsive logic:
```tsx
{/* Desktop - left sidebar */}
<div className="hidden lg:block">
  <DesktopNav ... />
</div>

{/* Mobile/Tablet - bottom bar */}
<div className="lg:hidden">
  <MobileNav ... />
</div>
```

By using `AppLayout`, these pages will automatically get the correct navigation placement based on screen size.

## Files to Modify
1. `src/pages/MyERA.tsx` - Wrap with AppLayout, remove MobileNav
2. `src/pages/Notifications.tsx` - Wrap with AppLayout, remove MobileNav
3. `src/pages/Messages.tsx` - Wrap with AppLayout, remove MobileNav

