
# Content Studio Overhaul: Comprehensive Implementation Plan

## ✅ COMPLETION STATUS (Updated: 2026-01-26)

| Phase | Status | Notes |
|-------|--------|-------|
| **Phase 1: Dashboard Redesign** | ✅ Complete | ContentTypeDashboard with 4-card grid |
| **Phase 2: Expressions Enhancement** | ✅ Complete | DrawingCanvas, InteractiveStickers (poll, question, quiz, countdown, slider), CloseFriendsToggle, HighlightSelector |
| **Phase 3: Video Studio Overhaul** | ✅ Complete | Multi-step wizard, ThumbnailSelector (5 auto + custom), ChapterEditor, EndScreenEditor, VisibilitySettings |
| **Phase 4: Image Studio Enhancement** | ✅ Complete | ImageCarouselEditor (up to 20), CropTool, AdjustmentPanel (10 sliders), FilterLibrary (20+ filters), UserTagOverlay, AltTextInput |
| **Phase 5: Post Composer Enhancement** | ✅ Complete | PollCreator, ThreadComposer, CharacterCounter, GifPicker, LocationPicker, FeelingActivityPicker, ScheduleSelector |
| **Phase 6: Shared Components** | ✅ Complete | DraftManager, UserMentionAutocomplete, database tables, edge functions |

### Database Tables Added:
- `drafts` - Auto-save drafts
- `polls` / `poll_votes` - Poll persistence
- `scheduled_posts` - Scheduling
- `video_chapters` / `video_cards` - Video elements
- `media_user_tags` - Photo tagging
- `expression_responses` - Interactive sticker responses
- `playlists` / `playlist_items` - Video organization

### Edge Functions Deployed:
- `fetch-link-preview` - URL metadata scraping
- `search-gifs` - GIF search (mock/simulation)
- `generate-thumbnail` - AI thumbnail generation

---

## Executive Summary

This plan outlines a complete overhaul of the Content Studio ("+" button) to create a world-class content creation experience matching the leading social media platforms. The implementation will be broken into **6 phases** across **4 content types**: Expressions, Videos, Images, and Posts.

---

## Current State Analysis

### What Already Exists

| Component | Status | Features |
|-----------|--------|----------|
| **CreatorStudio.tsx** | Implemented | Intent-based launcher (Express, Share, Teach, Reflect), tone selection, routes to content-specific studios |
| **ExpressionCreator.tsx** | Functional | Camera capture, gallery upload, text overlays, stickers, sounds, captions with hashtags, simulation mode |
| **VideoStudio.tsx** | Basic | Upload with drag-drop, auto-thumbnail generation (3 options), title/description, topic tags, content warnings |
| **ImageStudio.tsx** | Basic | Gallery selection, 6 filters, brightness/contrast sliders, captions, topic tags, content warnings |
| **PostComposer.tsx** | Basic | Text input, media attachment (up to 4), visibility settings, topic tags, content warnings |
| **StickerPicker.tsx** | Functional | Emoji-based stickers, categories, search |
| **SoundPicker.tsx** | Functional | Royalty-free sound library, categories, volume control |
| **TextOverlayEditor.tsx** | Functional | 5 fonts, colors, backgrounds, alignment, sizes |

### Gap Analysis: What's Missing

```text
+-------------------------+------------------+--------------------+--------------------+--------------------+
| Feature Area            | Your App         | YouTube            | Instagram          | Facebook/Twitter   |
+-------------------------+------------------+--------------------+--------------------+--------------------+
| EXPRESSIONS/STORIES                                                                                      |
+-------------------------+------------------+--------------------+--------------------+--------------------+
| Draw/sketch tools       | Missing          | N/A                | Yes                | N/A                |
| AR effects/face filters | Missing          | N/A                | Yes                | N/A                |
| Polls/Questions         | Missing          | N/A                | Yes                | N/A                |
| Countdown stickers      | Missing          | N/A                | Yes                | N/A                |
| Link stickers           | Missing          | N/A                | Yes (verified)     | N/A                |
| Location tagging        | Missing          | N/A                | Yes                | N/A                |
| User mentions (@)       | Missing          | N/A                | Yes                | N/A                |
| Close Friends sharing   | Partial          | N/A                | Yes                | N/A                |
| Highlights saving       | Missing          | N/A                | Yes                | N/A                |
+-------------------------+------------------+--------------------+--------------------+--------------------+
| VIDEOS                                                                                                   |
+-------------------------+------------------+--------------------+--------------------+--------------------+
| AI-generated thumbnails | Missing          | Yes                | N/A                | N/A                |
| Custom thumbnail upload | Missing          | Yes                | N/A                | N/A                |
| Playlists               | Missing          | Yes                | N/A                | N/A                |
| Audience settings       | Missing          | Yes (Made for Kids)| N/A                | N/A                |
| Age restriction         | Missing          | Yes                | N/A                | N/A                |
| Tags (keyword)          | Missing          | Yes                | N/A                | N/A                |
| Categories              | Missing          | Yes                | N/A                | N/A                |
| Language selection      | Missing          | Yes                | N/A                | N/A                |
| License selection       | Missing          | Yes                | N/A                | N/A                |
| Comments settings       | Missing          | Yes                | N/A                | N/A                |
| End screens             | Missing          | Yes                | N/A                | N/A                |
| Cards (mid-roll links)  | Missing          | Yes                | N/A                | N/A                |
| Chapters/timestamps     | Missing          | Yes                | N/A                | N/A                |
| Scheduling              | Missing          | Yes                | Yes                | Yes                |
| Premiere mode           | Missing          | Yes                | N/A                | N/A                |
| Processing status       | Basic            | Yes                | N/A                | N/A                |
+-------------------------+------------------+--------------------+--------------------+--------------------+
| IMAGES                                                                                                   |
+-------------------------+------------------+--------------------+--------------------+--------------------+
| Multi-image carousel    | Missing          | N/A                | Yes (up to 20)     | Yes                |
| Crop/aspect ratio       | Missing          | N/A                | Yes (1:1, 4:5, 16:9)| N/A               |
| Advanced adjustments    | Partial          | N/A                | Yes (10+ sliders)  | N/A                |
| More filters            | Basic (6)        | N/A                | Yes (40+)          | N/A                |
| User tagging in photo   | Missing          | N/A                | Yes                | Yes                |
| Location tagging        | Missing          | N/A                | Yes                | Yes                |
| Alt text accessibility  | Missing          | N/A                | Yes                | Yes                |
| Reorder images          | Missing          | N/A                | Yes                | Yes                |
| Music for carousels     | Missing          | N/A                | Yes                | N/A                |
+-------------------------+------------------+--------------------+--------------------+--------------------+
| POSTS                                                                                                    |
+-------------------------+------------------+--------------------+--------------------+--------------------+
| Polls                   | Missing          | N/A                | N/A                | Yes                |
| Threads/multi-post      | Missing          | N/A                | N/A                | Yes (X)            |
| Scheduling              | Missing          | N/A                | Yes                | Yes                |
| Link previews           | Missing          | N/A                | N/A                | Yes                |
| Feeling/activity        | Missing          | N/A                | N/A                | Yes (FB)           |
| Check-in/location       | Missing          | N/A                | N/A                | Yes                |
| GIF picker              | Missing          | N/A                | N/A                | Yes                |
| Character limit display | Missing          | N/A                | N/A                | Yes (X: 280)       |
| Quote posts             | Missing          | N/A                | N/A                | Yes                |
| Draft saving            | Missing          | Yes                | Yes                | Yes                |
+-------------------------+------------------+--------------------+--------------------+--------------------+
```

---

## Phase 1: Content Studio Dashboard Redesign

**Goal**: Replace the intent-based launcher with a direct content-type selector

### 1.1 New Dashboard Layout

Create a new dashboard component that opens when the "+" button is pressed with four clear content creation options:

**Visual Layout**:
- Full-screen modal with cinematic dark background
- 2x2 grid of large, tappable cards
- Each card displays: Icon, Title, Description
- Cards: Expression, Video, Image, Post

**Card Definitions**:
| Card | Icon | Title | Description |
|------|------|-------|-------------|
| Expression | Sparkles | Expression | Share moments that disappear in 24h |
| Video | Video | Video | Upload and share long-form content |
| Image | Image | Photo | Share photos with filters and edits |
| Post | FileText | Post | Share thoughts, polls, and updates |

### 1.2 Technical Implementation

**Files to modify**:
- `src/components/creator/CreatorStudio.tsx` - Replace intent selector with content-type grid

**New component structure**:
```text
CreatorStudio
  ContentTypeDashboard (new)
    ExpressionCreator (existing, enhanced)
    VideoStudio (existing, completely overhauled)
    ImageStudio (existing, significantly enhanced)
    PostComposer (existing, significantly enhanced)
```

---

## Phase 2: Expressions Enhancement (Instagram Stories Parity)

**Goal**: Match Instagram Stories creation experience

### 2.1 New Features to Add

**Drawing Tools**:
- Freehand brush with color picker
- Multiple brush sizes (thin, medium, thick)
- Eraser tool
- Undo/redo functionality

**Interactive Stickers** (new category in StickerPicker):
- Poll sticker (Yes/No, custom options)
- Question sticker (free text responses)
- Quiz sticker (multiple choice)
- Countdown sticker (date/time picker)
- Location sticker (search integration)
- Mention sticker (@username autocomplete)
- Link sticker (URL input)
- Slider/emoji rating sticker

**Enhanced Text Tools**:
- Typewriter animation style
- Pop/zoom animation style
- Gradient text colors
- Text-to-speech audio generation (AI)

**Close Friends Integration**:
- Toggle to share with Close Friends only
- Visual indicator (green ring) on preview

**Highlights Flow**:
- After sharing, prompt to add to Highlight
- Create new Highlight or add to existing

### 2.2 Technical Implementation

**New files**:
- `src/components/creator/DrawingCanvas.tsx`
- `src/components/creator/InteractiveStickers.tsx`
- `src/components/creator/HighlightSelector.tsx`

**Modified files**:
- `src/components/creator/ExpressionCreator.tsx` - Add new tool panels
- `src/components/creator/StickerPicker.tsx` - Add interactive sticker categories

---

## Phase 3: Video Studio Overhaul (YouTube Parity)

**Goal**: Match YouTube's video upload workflow exactly

### 3.1 Multi-Step Wizard Structure

**Step 1: Upload**
- Drag-and-drop zone
- File selection
- Upload progress with percentage
- Processing indicator

**Step 2: Details**
| Field | Type | Requirement |
|-------|------|-------------|
| Title | Text (100 chars max) | Required |
| Description | Textarea (5000 chars) | Optional |
| Thumbnail | Image upload OR auto-generated (3 options) OR AI-generated | Required |
| Playlist | Multi-select or create new | Optional |
| Audience | "Made for wellbeing" toggle | Required |
| Age restriction | Toggle + reason | Optional |
| Tags | Comma-separated (500 chars max) | Optional |
| Category | Dropdown (Wellness, Recovery, Education, etc.) | Required |
| Language | Dropdown | Optional |
| Caption certification | None, This video has captions | Optional |
| Recording date | Date picker | Optional |
| Video location | Location search | Optional |
| License | Standard, Creative Commons | Default: Standard |
| Allow embedding | Toggle | Default: Yes |
| Publish to feed | Toggle | Default: Yes |
| Comments | On, Hold for review, Off | Default: On |
| Show likes | Toggle | Default: Yes |

**Step 3: Video Elements**
| Element | Feature |
|---------|---------|
| End screen | Template selection, timing (last 5-20 seconds) |
| Cards | Add at timestamps, link to other content |
| Chapters | Auto-detect or manual timestamp entry |

**Step 4: Checks**
- Content analysis (in simulation: mock check)
- Copyright check placeholder
- Ad suitability indicator

**Step 5: Visibility**
| Option | Description |
|--------|-------------|
| Private | Only you can view |
| Unlisted | Anyone with link |
| Public | Everyone |
| Schedule | Date/time picker |
| Premiere | Live countdown mode |

### 3.2 AI Thumbnail Generation

**Integration with Lovable AI**:
- Button: "Generate AI thumbnail"
- Prompt: Based on video title, generate 3 thumbnail concepts
- Model: google/gemini-2.5-flash-image
- Display: 3 AI-generated options alongside auto-captured frames

**Edge function required**:
- `supabase/functions/generate-thumbnail/index.ts`

### 3.3 Technical Implementation

**New files**:
- `src/components/creator/video/VideoDetailsStep.tsx`
- `src/components/creator/video/VideoElementsStep.tsx`
- `src/components/creator/video/VideoChecksStep.tsx`
- `src/components/creator/video/VideoVisibilityStep.tsx`
- `src/components/creator/video/ThumbnailSelector.tsx`
- `src/components/creator/video/PlaylistSelector.tsx`
- `src/components/creator/video/EndScreenEditor.tsx`
- `src/components/creator/video/CardEditor.tsx`
- `src/components/creator/video/ChapterEditor.tsx`
- `supabase/functions/generate-thumbnail/index.ts`

**Modified files**:
- `src/components/creator/VideoStudio.tsx` - Complete rewrite as multi-step wizard

---

## Phase 4: Image Studio Enhancement (Instagram Parity)

**Goal**: Match Instagram's image posting experience

### 4.1 New Features

**Multi-Image Carousel**:
- Select up to 20 images
- Drag-to-reorder
- Individual editing per image
- Swipe preview

**Crop & Aspect Ratio**:
- Square (1:1)
- Portrait (4:5)
- Landscape (16:9)
- Original
- Pinch-to-zoom and drag to position

**Advanced Adjustments** (new sliders):
| Adjustment | Range |
|------------|-------|
| Brightness | -100 to +100 |
| Contrast | -100 to +100 |
| Saturation | -100 to +100 |
| Warmth | -100 to +100 |
| Highlights | -100 to +100 |
| Shadows | -100 to +100 |
| Vignette | 0 to 100 |
| Sharpen | 0 to 100 |
| Structure | 0 to 100 |
| Fade | 0 to 100 |

**Expanded Filter Library**:
- 20+ filters (categorized: Vintage, Modern, Mood, B&W)
- Filter intensity slider (0-100%)

**Tagging Features**:
- Tap image to tag users
- User search/autocomplete
- Location tagging with search
- Alt text input for accessibility

**Music for Carousels**:
- Integrate SoundPicker for image slideshows

### 4.2 Technical Implementation

**New files**:
- `src/components/creator/image/ImageCarouselEditor.tsx`
- `src/components/creator/image/CropTool.tsx`
- `src/components/creator/image/AdjustmentPanel.tsx`
- `src/components/creator/image/FilterLibrary.tsx`
- `src/components/creator/image/UserTagOverlay.tsx`
- `src/components/creator/image/LocationPicker.tsx`

**Modified files**:
- `src/components/creator/ImageStudio.tsx` - Complete rewrite as multi-step flow

---

## Phase 5: Post Composer Enhancement (Facebook/X Parity)

**Goal**: Match Facebook and X (Twitter) posting experience

### 5.1 New Features

**Poll Creation**:
- 2-4 options
- Duration selector (1 day, 3 days, 1 week)
- Anonymous results toggle

**Thread Composer**:
- "Add to thread" button
- Multiple posts chained
- Individual character counts
- Reorder thread items

**Character Counter**:
- Optional character limit mode (280 for X-style, unlimited for FB-style)
- Visual progress ring

**Link Preview**:
- Auto-detect URLs
- Fetch metadata (title, image, description)
- Preview card display

**GIF Picker**:
- Giphy integration via edge function
- Trending, search, categories

**Feeling/Activity**:
- Emoji + label selector
- "Feeling happy", "Watching...", "Listening to..."

**Location Check-in**:
- Location search
- Display as "at [Location]"

**Scheduling**:
- Date/time picker
- "Schedule" instead of "Post" button
- Draft saving

**Draft System**:
- Auto-save to localStorage
- "Drafts" tab in dashboard

### 5.2 Technical Implementation

**New files**:
- `src/components/creator/post/PollCreator.tsx`
- `src/components/creator/post/ThreadComposer.tsx`
- `src/components/creator/post/LinkPreview.tsx`
- `src/components/creator/post/GifPicker.tsx`
- `src/components/creator/post/FeelingActivityPicker.tsx`
- `src/components/creator/post/ScheduleSelector.tsx`
- `src/components/creator/post/DraftsManager.tsx`
- `supabase/functions/fetch-link-preview/index.ts`
- `supabase/functions/search-gifs/index.ts`

**Modified files**:
- `src/components/creator/PostComposer.tsx` - Complete rewrite with all new features

---

## Phase 6: Shared Components & Integration

### 6.1 Shared Components to Create

**LocationPicker.tsx**:
- Search input with autocomplete
- Recent locations
- Map preview (optional)

**UserMentionAutocomplete.tsx**:
- @ trigger detection
- User search
- Profile preview on hover

**ScheduleSelector.tsx**:
- Date picker
- Time picker
- Timezone display
- Schedule confirmation

**DraftManager.tsx**:
- localStorage persistence
- Draft list UI
- Resume/delete drafts

### 6.2 Database Schema Updates

**New tables needed**:

```sql
-- Drafts table
CREATE TABLE drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL, -- 'expression', 'video', 'image', 'post'
  draft_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Playlists table (for video organization)
CREATE TABLE playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  visibility TEXT DEFAULT 'public',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Playlist items
CREATE TABLE playlist_items (
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  PRIMARY KEY (playlist_id, post_id)
);

-- Polls table
CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  options JSONB NOT NULL,
  duration_hours INTEGER DEFAULT 24,
  ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Poll votes
CREATE TABLE poll_votes (
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  option_index INTEGER NOT NULL,
  voted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (poll_id, user_id)
);

-- Scheduled posts
CREATE TABLE scheduled_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_data JSONB NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Video chapters
CREATE TABLE video_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  timestamp_seconds INTEGER NOT NULL,
  title TEXT NOT NULL
);

-- Video cards
CREATE TABLE video_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  timestamp_seconds INTEGER NOT NULL,
  card_type TEXT NOT NULL,
  card_data JSONB NOT NULL
);

-- User tags in media
CREATE TABLE media_user_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  tagged_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  position_x FLOAT,
  position_y FLOAT,
  media_index INTEGER DEFAULT 0
);

-- Expression interactive responses (poll, question, quiz answers)
CREATE TABLE expression_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expression_id UUID REFERENCES expressions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  sticker_type TEXT NOT NULL,
  response_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### 6.3 Edge Functions to Create

| Function | Purpose |
|----------|---------|
| `generate-thumbnail` | AI thumbnail generation using Lovable AI |
| `fetch-link-preview` | Scrape URL metadata for link previews |
| `search-gifs` | Giphy API integration |
| `process-video` | Video transcoding status (placeholder) |
| `publish-scheduled` | Cron job to publish scheduled posts |

---

## Implementation Priorities

### Recommended Order

1. **Phase 1** (Dashboard) - 1 session
2. **Phase 5** (Posts) - 2-3 sessions (most user-facing impact)
3. **Phase 4** (Images) - 2 sessions
4. **Phase 2** (Expressions) - 2 sessions
5. **Phase 3** (Videos) - 3-4 sessions (most complex)
6. **Phase 6** (Integration) - 1-2 sessions

### Dependencies

```text
Phase 1 (Dashboard)
    |
    +-- Phase 2 (Expressions) -- requires StickerPicker updates
    |
    +-- Phase 3 (Videos) -- requires AI edge function
    |
    +-- Phase 4 (Images) -- requires UserTagPicker
    |
    +-- Phase 5 (Posts) -- requires GIF/Link edge functions
    |
    +-- Phase 6 (Shared) -- final integration
```

---

## Success Metrics

After implementation, the Content Studio will support:

- **4 distinct content types** with unique workflows
- **40+ features** matching leading platforms
- **AI-powered** thumbnail generation
- **Interactive** story elements
- **Multi-image** carousel support
- **Video chapters** and end screens
- **Polls** and threads
- **Scheduling** and drafts
- **Complete accessibility** (alt text, captions)

This comprehensive overhaul positions SelfERA as a true competitor to mainstream social platforms while maintaining focus on mental health and wellbeing content.
