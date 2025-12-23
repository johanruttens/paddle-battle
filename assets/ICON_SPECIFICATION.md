# Paddle Battle App Icon Specification

## Required Dimensions

- **App Store Icon:** 1024 x 1024 pixels
- **Format:** PNG
- **Color Space:** sRGB
- **Transparency:** Not allowed
- **Rounded Corners:** Do NOT add - Apple applies automatically

## Design Concept

### Primary Elements
1. **Paddle** - Horizontal bar at bottom (cyan #00ffff)
2. **Ball** - Circle in motion (white with glow)
3. **Background** - Dark gradient (#0a0a0a to #1a1a2e)

### Color Palette
| Element | Color | Hex |
|---------|-------|-----|
| Player Paddle | Cyan | #00ffff |
| AI Paddle | Magenta | #ff00ff |
| Ball | White | #ffffff |
| Background Dark | Near Black | #0a0a0a |
| Background Light | Dark Blue | #1a1a2e |
| Glow Effect | Cyan | #00ffff (50% opacity) |

### Design Guidelines

1. **Simple Silhouette**
   - Icon should be recognizable at 29x29 pixels
   - Avoid fine details that blur at small sizes

2. **Suggested Layouts**

   **Option A: Ball & Paddle**
   ```
   ┌─────────────────┐
   │                 │
   │       ●         │  <- Ball with glow
   │                 │
   │    ━━━━━━━━     │  <- Cyan paddle
   └─────────────────┘
   ```

   **Option B: Abstract "PB"**
   ```
   ┌─────────────────┐
   │  ━━━━━          │  <- Top paddle (magenta)
   │       ●         │  <- Ball
   │     ━━━━━━      │  <- Bottom paddle (cyan)
   └─────────────────┘
   ```

   **Option C: Dynamic Motion**
   ```
   ┌─────────────────┐
   │     ╱           │
   │    ●            │  <- Ball with motion trail
   │   ╲             │
   │  ━━━━━━━━━      │  <- Paddle
   └─────────────────┘
   ```

3. **Neon Glow Effect**
   - Add subtle glow around paddle and ball
   - Matches in-game aesthetic
   - Creates depth on dark background

## Technical Requirements

- File: `assets/icon.png`
- Exact size: 1024 x 1024 px
- No alpha channel (must be fully opaque)
- Square corners only

## Generation Options

### Option 1: Use AI Image Generator
Prompt: "Minimalist app icon, dark background #0a0a0a, glowing cyan horizontal paddle bar at bottom, white ball with motion blur and cyan glow, neon arcade style, simple geometric shapes, suitable for iOS app icon, 1024x1024 square"

### Option 2: Use Design Tool
- Figma, Sketch, or Adobe Illustrator
- Export at 1024x1024 PNG

### Option 3: Use Icon Generator Service
- icons8.com/icon-generator
- makeappicon.com
- appicon.co

## Preview Sizes to Test

After creating icon, verify it looks good at these sizes:
- 1024px (App Store)
- 180px (iPhone @3x)
- 120px (iPhone @2x)
- 87px (Settings @3x)
- 58px (Settings @2x)
- 29px (Smallest visible size)

## Splash Screen

Also needed: `assets/splash.png`
- Dimensions: 1284 x 2778 px (or larger)
- Same style as icon
- Centered logo/title
- Dark background #0a0a0a
