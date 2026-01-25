
# Increase Loading Screen Logo Size by 300%

## Current State
The Selfera logo on the loading screen is currently sized at `h-12` (48px height) which appears too small.

## Change Required
Increase the logo size by 300% (3x the current size):
- **Current**: `h-12` (48px)
- **New**: `h-36` (144px)

## Files to Update

### `src/App.tsx`
Update the logo in both loading states:

**Line 44** (ProtectedRoute loading state):
```tsx
// Before
<img src={logo} alt="SelfERA" className="h-12 object-contain animate-pulse" />

// After
<img src={logo} alt="SelfERA" className="h-36 object-contain animate-pulse" />
```

**Line 65** (HomeRoute loading state):
```tsx
// Before
<img src={logo} alt="SelfERA" className="h-12 object-contain animate-pulse" />

// After
<img src={logo} alt="SelfERA" className="h-36 object-contain animate-pulse" />
```

## Summary
| Location | Before | After |
|----------|--------|-------|
| ProtectedRoute (line 44) | `h-12` (48px) | `h-36` (144px) |
| HomeRoute (line 65) | `h-12` (48px) | `h-36` (144px) |

This is a simple two-line change that will make the logo significantly more prominent on the loading screen.
