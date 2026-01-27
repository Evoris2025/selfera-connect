
# AI-Powered "Magik" Auto-Enhancement Button

## Overview

Add a one-tap auto-enhancement feature to the ImageStudio that uses AI to intelligently analyze the current image and calculate optimal adjustments for exposure, contrast, saturation, and other parameters.

---

## How It Works

```text
┌─────────────────────────────────────────────────────────────────┐
│                        ImageStudio                               │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    [Image Preview]                         │  │
│  │                                                            │  │
│  │                         🖼️                                 │  │
│  │                                                            │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ [Filters] [Adjust] [Effects] [Crop]     [✨ Magik]          ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  When user taps "Magik":                                        │
│  1. Show sparkle animation on button                            │
│  2. Send image to AI edge function                              │
│  3. AI analyzes: lighting, colors, content type                 │
│  4. Returns optimal adjustment values                           │
│  5. Apply values with smooth transition                         │
│  6. Record in undo history for reversibility                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## User Experience

### Button Placement
- Positioned in the edit toolbar, prominently displayed alongside tabs
- Uses a sparkle/wand icon with the label "Magik"
- Gradient accent styling to indicate premium feature

### Interaction Flow
1. User taps "Magik" button
2. Button shows loading shimmer animation (~1-2 seconds)
3. Adjustments smoothly transition to AI-recommended values
4. Toast confirmation: "Magik applied ✨"
5. All changes recorded in undo history (Ctrl+Z to revert)

### Edge Cases
- If AI fails, fall back to algorithmic enhancement
- If image is already well-exposed, show "Image looks great already!"
- Disable button while processing to prevent double-taps

---

## Technical Implementation

### Phase 1: Create Edge Function

**New File: `supabase/functions/image-enhance/index.ts`**

The edge function will:
1. Accept a base64 image
2. Send to Lovable AI (Gemini Flash) with a carefully crafted prompt
3. Use structured output (tool calling) to extract adjustment parameters
4. Return JSON with optimal values

AI Prompt Strategy:
```
Analyze this image for optimal photo enhancement. Consider:
- Current exposure (is it under/over-exposed?)
- Contrast levels (is it flat or already punchy?)
- Color saturation (are colors muted or vibrant?)
- White balance (warm, cool, or neutral?)
- Shadow/highlight recovery needed

Return optimal adjustment values for a professional, natural look.
```

Response Format (via tool calling):
```json
{
  "brightness": 105,      // 50-150, default 100
  "contrast": 112,        // 50-150, default 100
  "saturation": 108,      // 0-200, default 100
  "warmth": 3,            // -100 to 100, default 0
  "highlights": -10,      // -100 to 100, default 0
  "shadows": 15           // -100 to 100, default 0
}
```

### Phase 2: Create Client Hook

**New File: `src/hooks/useImageEnhance.ts`**

A hook that:
- Converts current image to base64
- Calls the edge function
- Handles loading/error states
- Returns suggested adjustments

### Phase 3: Add Magik Button Component

**New File: `src/components/creator/image/MagikButton.tsx`**

Features:
- Gradient background with sparkle icon
- Loading state with shimmer animation
- Disabled state while processing
- Haptic feedback on tap (if available)

### Phase 4: Integrate into ImageStudio

**Modify: `src/components/creator/ImageStudio.tsx`**

- Import MagikButton component
- Add to edit toolbar (visible on all edit tabs)
- Wire up to apply adjustments with history recording
- Add smooth CSS transition when values change

---

## AI Model Selection

Using `google/gemini-2.5-flash` because:
- Fast response time (~1-2 seconds)
- Excellent multimodal (image + text) capabilities
- Cost-effective for this use case
- Already available via Lovable AI

---

## Fallback Algorithm

If AI fails or times out, apply algorithmic enhancement:

```typescript
function algorithmicEnhance(imageStats: ImageStats): ImageAdjustments {
  // Analyze image histogram to detect issues
  const avgBrightness = imageStats.avgLuminance;
  const contrastRatio = imageStats.maxLuminance - imageStats.minLuminance;
  
  return {
    brightness: avgBrightness < 100 ? 110 : avgBrightness > 180 ? 95 : 100,
    contrast: contrastRatio < 0.5 ? 115 : 100,
    saturation: 108, // Slight boost looks good on most photos
    warmth: 0,
    highlights: 0,
    shadows: avgBrightness < 80 ? 20 : 0,
  };
}
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `supabase/functions/image-enhance/index.ts` | AI edge function for image analysis |
| `src/hooks/useImageEnhance.ts` | Client hook for calling enhancement API |
| `src/components/creator/image/MagikButton.tsx` | Styled button with loading states |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/creator/ImageStudio.tsx` | Add Magik button to edit view |
| `src/components/creator/image/index.ts` | Export new MagikButton |
| `supabase/config.toml` | Add image-enhance function config |

---

## Animation Details

### Button Animation
- Idle: Subtle gradient pulse
- Hover: Scale up 1.02x with glow
- Loading: Shimmer sweep across button
- Success: Sparkle burst particles

### Value Transition
When AI values are applied, sliders animate smoothly:
```css
.adjustment-value {
  transition: all 400ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## Cost Considerations

- Uses Lovable AI credits (included free usage per month)
- Gemini Flash is the most cost-effective model
- Image compressed before sending to reduce token usage
- Typically ~0.001-0.002 credits per enhancement

---

## Summary

This implementation adds a premium "Magik" button that:

- Uses AI to intelligently analyze each photo
- Calculates optimal brightness, contrast, saturation, warmth, highlights, and shadows
- Applies changes with smooth animations
- Integrates with existing undo/redo system
- Falls back to algorithmic enhancement if AI unavailable
- Provides satisfying visual feedback with sparkle animations
