
# Plan: Revert Feed to Traditional Scrollable Layout

## Summary
Remove the TikTok-style vertical swipe navigation from the feed and restore a traditional scrollable list layout where all posts are visible and users scroll naturally through content.

## What Will Change

**Before (Current - TikTok Style)**
- Shows one post at a time in a fixed-height container
- Requires swiping up/down to navigate between posts
- Has progress dots, post counter (1/8), and "Swipe up for more" hints
- Uses absolute positioning causing the empty space issue you see

**After (Traditional Scroll)**
- All posts visible in a scrollable list
- Natural vertical scrolling like Instagram's main feed
- No swipe hints or progress indicators
- Content flows smoothly with infinite scroll when reaching bottom

## Technical Changes

### File: `src/components/feed/CrossroadFeed.tsx`

**Remove:**
- `currentIndex` state and single-post-at-a-time logic
- Framer Motion drag gestures and `AnimatePresence` for swipe navigation
- `HeartOverlay` component (double-tap like will remain on individual PostCards)
- `useDoubleTap` hook (PostCard already handles double-tap)
- `triggerHaptic` utility (PostCard already has this)
- Progress indicator dots on the right side
- Post counter ("1 / 8") overlay
- "Swipe up for more" hint overlay
- Keyboard navigation (arrow keys/j/k)
- Fixed height container with `calc(100dvh - 200px)`

**Restore:**
- Simple scrollable container with `flex-1 overflow-y-auto`
- Map through all posts and render each `PostCard`
- Intersection Observer for infinite scroll (load more when near bottom)
- Standard padding and spacing between posts

### File: `src/components/PostCard.tsx`

**Remove:**
- Extra bottom padding (`pb-24`) that was added for the navbar overlap fix in swipe mode

The PostCard already has its own double-tap to like functionality built in, so that feature is preserved.

## Preserved Features
- Pull-to-refresh functionality (handled by parent component)
- Double-tap to like on individual posts (built into PostCard)
- Infinite scroll loading more posts
- All post interactions (reactions, comments, share, etc.)
- Expressions row at the top of the feed

## Result
The feed will display posts in a continuous, naturally scrollable list similar to Instagram's home feed, where you can scroll through multiple posts without the single-post-at-a-time constraint.
