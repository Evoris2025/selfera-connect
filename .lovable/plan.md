

# Expressions Feature Enhancement - Complete Implementation Plan

## Overview

This plan implements a comprehensive upgrade to the Expressions feature (SelfERA's equivalent of Instagram Stories/Reels) across three phases, adding essential UX improvements, creative tools, and social/discovery features.

---

## Phase 1: Essential UX Enhancements

### 1.1 Progress Bar Timer with Auto-Advance

**Current State:** Static progress dots at top, no auto-advance
**Target:** Instagram-style segmented progress bar with animated timer

**Implementation:**
- Add multi-segment progress bar to `ExpressionViewer.tsx`
- Each expression gets 5-10 seconds of auto-play time (configurable for videos)
- Animated fill indicator shows time remaining per segment
- Auto-advance to next expression when timer completes
- Visual continuity between user's expression segments

**Technical Changes:**
- Create new `ExpressionProgressBar` component
- Add `duration` state and `useEffect` timer logic
- Implement smooth CSS transition for progress fill
- Handle video duration detection for variable timing

### 1.2 Tap-to-Pause Functionality

**Current State:** Tap only triggers double-tap detection for likes
**Target:** Single tap pauses, hold pauses, release resumes

**Implementation:**
- Add `isPaused` state to `ExpressionViewer.tsx`
- Single tap anywhere (not on buttons) toggles pause
- Long press (hold) pauses while held
- Pause indicator overlay appears when paused
- Progress bar stops animating when paused
- Video pauses/resumes accordingly

**Technical Changes:**
- Add `onPointerDown`, `onPointerUp` handlers
- Implement hold detection with timeout
- Coordinate pause state with progress timer
- Show subtle "Paused" overlay indicator

### 1.3 Smooth Segment Transitions

**Current State:** Basic framer-motion slide transitions
**Target:** Premium Instagram-like cube/slide transitions

**Implementation:**
- Enhanced `AnimatePresence` transition variants
- Horizontal swipe for next user's expressions
- Vertical swipe already exists for navigation
- Cross-fade between segments of same user
- Haptic feedback on segment change

### 1.4 Story Reactions (Floating Emoji Responses)

**Current State:** Only heart reaction exists
**Target:** Quick emoji picker with floating animation

**Implementation:**
- Create `ExpressionReactionPicker` component
- Positioned at bottom of viewer (above username)
- 5-6 preset emoji options matching SelfERA's reaction types
- On tap: emoji floats up with particle burst animation
- Reaction sent to expression author (simulation mode: toast notification)

**Technical Changes:**
- New component with emoji grid
- Framer-motion floating animation
- Add `expressionReactions` to FeedDataContext
- Haptic feedback on send

---

## Phase 2: Creation Tools

### 2.1 Text Overlay Tools

**Current State:** No text overlay capability in ExpressionCreator
**Target:** Full text editing with fonts, colors, animations

**Implementation:**
- Create `TextOverlayEditor` component for ExpressionCreator
- Add text button to preview step toolbar
- Features:
  - Multiple font families (4-5 options: Sans, Serif, Script, Bold, Neon)
  - Color picker (preset colors + gradient options)
  - Text alignment (left, center, right)
  - Text background styles (none, solid, gradient pill)
  - Drag-to-position with pinch-to-resize
  - Optional text animations (fade-in, typewriter, bounce)

**Technical Changes:**
- New `TextOverlayEditor.tsx` component
- `TextOverlay` type added to FeedExpression
- Canvas-based or DOM overlay rendering
- Touch gesture handling for positioning
- Store overlay data with expression

### 2.2 Sticker/GIF Library

**Current State:** None
**Target:** Searchable sticker library with positioning

**Implementation:**
- Create `StickerPicker` component
- Categories: Emotions, Wellness, Nature, Reactions, Custom
- Drag-and-drop placement on media
- Scale and rotate gestures
- Static stickers (SVG/PNG) for MVP - no external API needed

**Technical Changes:**
- Curated sticker asset collection
- `Sticker` type with position, scale, rotation
- Gesture handlers for manipulation
- Render stickers on expression canvas

### 2.3 Music/Sound Library Integration

**Current State:** Displays "Original Sound" indicator but no library
**Target:** Trending sounds library with audio sync

**Implementation:**
- Create `SoundPicker` component/sheet
- Sections: Trending, Search, Favorites, Recent
- Preview audio clips before selection
- Timeline sync point selection (when sound starts)
- Volume control (original vs. added audio)

**Technical Changes:**
- Sound metadata storage in expression
- Audio element for playback
- For simulation mode: use royalty-free sample tracks
- `selectedSound` field in FeedExpression type

**Note:** Full music library requires licensing. MVP implementation will include:
- 10-15 royalty-free ambient/meditation tracks
- Sound effect library for wellness theme
- Infrastructure ready for future integration

---

## Phase 3: Social & Discovery Features

### 3.1 Highlights Feature

**Current State:** Expressions expire after 24 hours, no persistence
**Target:** Save expressions permanently to profile collections

**Implementation:**

**Database Changes:**
- New `expression_highlights` table:
  - `id`, `user_id`, `name`, `cover_url`, `created_at`, `updated_at`
- New `expression_highlight_items` table:
  - `id`, `highlight_id`, `expression_id`, `media_url`, `media_type`, `order_index`, `created_at`
- RLS policies for user ownership

**UI Components:**
- `HighlightCircle` component on profile (below bio, above grid)
- `CreateHighlightModal` - name highlight, select cover
- `AddToHighlightSheet` - appears when expression about to expire
- `HighlightViewer` - similar to ExpressionViewer but for highlights
- Horizontal scroll row of highlight circles on profile

**Technical Flow:**
1. User creates expressions (24h lifecycle)
2. Before expiry, prompt to save to highlight
3. User selects existing highlight or creates new
4. Expression persists beyond 24 hours in highlight
5. Profile shows highlight circles users can tap to view

### 3.2 User Tagging/Mentions

**Current State:** No tagging capability
**Target:** Tag users in expressions with notification

**Implementation:**
- Create `UserTagPicker` component
- Triggered by @ symbol in text overlay or dedicated button
- Search users by name/handle
- Position tag on media (tap to place)
- Tagged users receive notification
- Viewer can tap tag to view profile

**Technical Changes:**
- `tags` array in expression data structure
- `ExpressionTag` type: `{ userId, userName, position: {x, y} }`
- Integration with notification system
- Tap handler in viewer to navigate to profile

### 3.3 Close Friends Privacy Logic

**Current State:** All expressions public to followers
**Target:** Private expressions visible only to Close Friends list

**Implementation:**

**Database Changes:**
- New `close_friends` table:
  - `user_id`, `friend_user_id`, `created_at`
- Add `visibility` field to expressions: `'public' | 'close_friends'`
- RLS policy updates for visibility filtering

**UI Components:**
- `CloseFriendsList` management in Settings
- Green ring indicator for Close Friends expressions (Instagram-style)
- Toggle in ExpressionCreator: "Share to Close Friends only"
- Badge on expression row for Close Friends content

**Technical Flow:**
1. User manages Close Friends list in settings
2. When creating expression, toggle privacy option
3. Close Friends expressions show green ring
4. Non-Close Friends see public expressions only
5. Expression queries filter by visibility + close friends status

---

## File Changes Summary

### New Files to Create:

**Phase 1:**
- `src/components/expressions/ExpressionProgressBar.tsx`
- `src/components/expressions/ExpressionReactionPicker.tsx`
- `src/components/expressions/PauseOverlay.tsx`

**Phase 2:**
- `src/components/creator/TextOverlayEditor.tsx`
- `src/components/creator/StickerPicker.tsx`
- `src/components/creator/SoundPicker.tsx`
- `src/components/creator/shared/DraggableOverlay.tsx`
- `src/data/stickerLibrary.ts`
- `src/data/soundLibrary.ts`

**Phase 3:**
- `src/components/profile/HighlightCircle.tsx`
- `src/components/profile/HighlightRow.tsx`
- `src/components/expressions/CreateHighlightModal.tsx`
- `src/components/expressions/AddToHighlightSheet.tsx`
- `src/components/expressions/HighlightViewer.tsx`
- `src/components/creator/UserTagPicker.tsx`
- `src/components/settings/CloseFriendsList.tsx`
- `src/hooks/useHighlights.ts`
- `src/hooks/useCloseFriends.ts`

### Files to Modify:

**Phase 1:**
- `src/components/ExpressionViewer.tsx` - Major updates for timer, pause, reactions
- `src/contexts/FeedDataContext.tsx` - Add expression reactions

**Phase 2:**
- `src/components/creator/ExpressionCreator.tsx` - Add overlay tools
- `src/contexts/FeedDataContext.tsx` - Update FeedExpression type

**Phase 3:**
- `src/pages/Profile.tsx` - Add highlights row
- `src/components/ExpressionsRow.tsx` - Close Friends indicator
- `src/pages/Settings.tsx` - Close Friends management link
- Database migrations for highlights and close_friends tables

---

## Database Migrations

### Migration 1: Highlights Tables
```text
- expression_highlights (id, user_id, name, cover_url, timestamps)
- expression_highlight_items (id, highlight_id, expression_id, media_url, media_type, order_index)
- RLS: Users can CRUD their own highlights
```

### Migration 2: Close Friends Table
```text
- close_friends (user_id, friend_user_id, created_at)
- Add visibility column to expressions table
- RLS: Users manage their own close friends
- Update expressions RLS for visibility filtering
```

### Migration 3: Expression Tags
```text
- Add tags JSONB column to expressions table
- Or create expression_tags join table
```

---

## Implementation Order

1. **Phase 1.1-1.3** - Progress bar, pause, transitions (core UX)
2. **Phase 1.4** - Reactions (engagement)
3. **Phase 2.1** - Text overlays (most impactful creation tool)
4. **Phase 2.2** - Stickers (creation enhancement)
5. **Phase 2.3** - Sounds (creation enhancement)
6. **Phase 3.1** - Highlights (persistence/discovery)
7. **Phase 3.2** - User tagging (social)
8. **Phase 3.3** - Close Friends (privacy)

---

## Technical Considerations

- All Phase 1 & 2 features work in simulation mode via FeedDataContext
- Phase 3 database features will create real tables but maintain simulation mode support
- Sticker and sound libraries use bundled assets (no external API dependencies)
- Music licensing deferred - MVP uses royalty-free wellness audio
- Performance: Lazy load sticker/sound pickers to avoid bundle bloat

