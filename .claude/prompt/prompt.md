# Paddle Battle - React Native iOS Game Development Prompt

## Project Overview

Build **Paddle Battle**, a modern reimagining of the classic Pong game for iOS using React Native. The game should capture the essence of the original while adding vibrant 80s aesthetics, progressive difficulty, and engaging gameplay mechanics.

---

## Core Requirements

### Technology Stack
- **Framework:** React Native (latest stable version)
- **Platform:** iOS (primary target)
- **State Management:** React Context or Zustand
- **Sound:** expo-av or react-native-sound
- **Storage:** AsyncStorage for persistent data (scores, settings, progress)
- **Animations:** React Native Reanimated for smooth 60fps gameplay

---

## Game Mechanics

### Basic Gameplay
- Two paddles: player-controlled (bottom) and AI-controlled (top)
- Single ball that bounces off walls and paddles
- Score points when the opponent misses the ball
- First to reach the level's target score wins
- Touch/swipe controls for paddle movement

### 100 Levels System
Design a progressive level system with increasing challenge:

| Level Range | Target Score | Ball Speed | AI Reaction | Special Elements |
|-------------|--------------|------------|-------------|------------------|
| 1-10        | 5 points     | Slow       | Delayed     | None             |
| 11-25       | 7 points     | Medium     | Normal      | Speed boost zones |
| 26-50       | 10 points    | Fast       | Quick       | Multi-ball events |
| 51-75       | 12 points    | Very Fast  | Aggressive  | Shrinking paddles |
| 76-100      | 15 points    | Extreme    | Near-perfect| All modifiers    |

Each level should have subtle variations:
- Ball starting angle
- Paddle size adjustments
- AI behavior patterns
- Power-up frequency

### Difficulty Modes
Implement three selectable difficulty modes that modify the base level parameters:

**Easy Mode**
- Larger player paddle (1.5x)
- Slower ball acceleration
- AI makes occasional mistakes
- Generous hitboxes

**Medium Mode**
- Standard paddle size
- Normal ball physics
- Balanced AI
- Standard hitboxes

**Difficult Mode**
- Smaller player paddle (0.75x)
- Faster ball acceleration
- Aggressive AI with prediction
- Precise hitboxes
- Ball curves slightly

---

## Visual Design - 80s Aesthetic

### Color Palette
```
Primary Background: #0a0a0a (deep black)
Neon Pink: #ff00ff / #ff69b4
Electric Blue: #00ffff / #00bfff
Laser Green: #39ff14
Sunset Orange: #ff6b35
Purple Haze: #9d00ff
Grid Lines: #1a1a2e with glow
```

### Visual Elements
- **Retro grid background** - Perspective grid lines (like Tron/OutRun)
- **Neon glow effects** on paddles, ball, and UI elements
- **Scanline overlay** (subtle CRT effect)
- **Chromatic aberration** on impacts
- **Particle trails** behind the ball
- **Screen shake** on powerful hits
- **Synthwave sun** in menu backgrounds
- **Glowing score numbers** with digital font (like VCR OSD Mono or Press Start 2P)

### Animations
- Ball trail with gradient fade
- Paddle glow intensifies when moving
- Score flash animation on points
- Level transition with wipe effect
- Victory/defeat screen with retro animations
- Menu items with hover glow effects

---

## Sound Design

### Sound Effects
- `paddle_hit.wav` - Synthesized blip (pitch varies with hit position)
- `wall_bounce.wav` - Lower tone blip
- `score_point.wav` - Triumphant synth sting
- `opponent_score.wav` - Descending tone
- `level_complete.wav` - Victorious 80s fanfare
- `game_over.wav` - Dramatic synth
- `menu_select.wav` - Crisp digital click
- `menu_navigate.wav` - Subtle blip
- `power_up_collect.wav` - Rising synth sweep
- `countdown.wav` - Beep sequence (3, 2, 1, GO!)

### Background Music
- Synthwave/retrowave style tracks
- Different tracks for:
  - Main menu (chill, inviting)
  - Gameplay (energetic, driving)
  - Boss levels (intense)
  - Victory screen (triumphant)
- Volume controls for music and SFX separately

---

## Features to Implement

### Scoreboard System
```javascript
// Data structure suggestion
{
  highScores: [
    { rank: 1, name: "AAA", score: 99999, level: 100, date: "2024-01-15" },
    // Top 10 entries
  ],
  playerStats: {
    totalGamesPlayed: 0,
    totalPointsScored: 0,
    highestLevel: 0,
    totalPlayTime: 0,
    winStreak: 0,
    bestWinStreak: 0
  }
}
```

Features:
- Local high score table (top 10)
- Three-letter name entry (classic arcade style)
- Statistics tracking
- Level completion stars (1-3 based on performance)

### Power-Up System (Bonus Feature)
Add collectible power-ups that spawn randomly:

| Power-Up | Effect | Duration | Visual |
|----------|--------|----------|--------|
| Paddle Extend | Increases paddle size | 10 seconds | Green glow |
| Speed Boost | Ball moves faster | Until score | Orange trail |
| Multi-Ball | Splits into 3 balls | Until 2 lost | Rainbow |
| Slow Motion | Slows everything | 5 seconds | Blue tint |
| Shield | Blocks one miss | One use | Barrier line |
| Magnet | Ball curves to paddle | 8 seconds | Purple pull effect |

### Boss Battles (Every 25 Levels)
Special levels with unique AI opponents:
- **Level 25:** "The Wall" - Extra wide paddle, slow but covers more
- **Level 50:** "The Twins" - Two smaller AI paddles
- **Level 75:** "The Ghost" - Paddle becomes invisible periodically
- **Level 100:** "The Master" - Combines all boss abilities

### Combo System (Bonus Feature)
- Track consecutive returns without missing
- Combo multiplier for score
- Visual combo counter with escalating effects
- Combo milestone rewards (5x, 10x, 25x, 50x)

---

## UI/UX Requirements

### Screens to Build

1. **Splash Screen**
   - Animated logo with neon flicker
   - "Press to Start" with pulse animation

2. **Main Menu**
   - Play (Continue / New Game)
   - Level Select
   - Difficulty
   - Scoreboard
   - Settings
   - Credits

3. **Level Select**
   - Grid of 100 levels
   - Locked/unlocked states
   - Star ratings displayed
   - Current progress indicator

4. **Game Screen**
   - Score display (both players)
   - Level indicator
   - Pause button
   - Combo counter
   - Power-up indicators

5. **Pause Menu**
   - Resume
   - Restart Level
   - Settings
   - Quit to Menu

6. **Settings**
   - Music volume slider
   - SFX volume slider
   - Vibration toggle
   - Control sensitivity
   - Visual effects toggle (for performance)

7. **Game Over / Victory Screen**
   - Final score
   - Stars earned
   - High score entry (if qualified)
   - Next Level / Retry / Menu options

---

## Technical Specifications

### Performance Targets
- 60 FPS gameplay
- < 100ms input latency
- Smooth animations throughout
- Efficient memory usage

### Control Options
- **Touch drag:** Direct paddle control following finger
- **Tilt controls:** Optional accelerometer support
- **Haptic feedback:** Vibration on hits and events

### Game Physics
```javascript
// Suggested ball physics parameters
const PHYSICS = {
  initialBallSpeed: 5,
  maxBallSpeed: 15,
  speedIncrement: 0.2, // Per hit
  bounceAngleRange: 60, // Degrees from perpendicular
  paddleInfluence: 0.5, // How much paddle movement affects angle
};
```

### Save System
- Auto-save progress after each level
- Save current game state on app background
- Resume capability

---

## Project Structure Suggestion

```
PaddleBattle/
├── src/
│   ├── components/
│   │   ├── game/
│   │   │   ├── Ball.tsx
│   │   │   ├── Paddle.tsx
│   │   │   ├── PowerUp.tsx
│   │   │   ├── GameBoard.tsx
│   │   │   └── ScoreDisplay.tsx
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── NeonText.tsx
│   │   │   ├── RetroGrid.tsx
│   │   │   └── Modal.tsx
│   │   └── effects/
│   │       ├── ParticleSystem.tsx
│   │       ├── GlowEffect.tsx
│   │       └── Scanlines.tsx
│   ├── screens/
│   │   ├── SplashScreen.tsx
│   │   ├── MainMenuScreen.tsx
│   │   ├── GameScreen.tsx
│   │   ├── LevelSelectScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── ScoreboardScreen.tsx
│   ├── hooks/
│   │   ├── useGameLoop.ts
│   │   ├── useSound.ts
│   │   ├── useStorage.ts
│   │   └── useHaptics.ts
│   ├── context/
│   │   ├── GameContext.tsx
│   │   └── SettingsContext.tsx
│   ├── utils/
│   │   ├── physics.ts
│   │   ├── ai.ts
│   │   ├── levelConfig.ts
│   │   └── constants.ts
│   ├── assets/
│   │   ├── sounds/
│   │   ├── fonts/
│   │   └── images/
│   └── types/
│       └── index.ts
├── App.tsx
└── package.json
```

---

## Additional Creative Features to Consider

### Unlockables
- Custom paddle skins (neon colors, patterns, shapes)
- Ball trails (fire, ice, rainbow, pixel)
- Background themes (Tron, Outrun, Arcade, Space)
- Achievement badges

### Achievements System
- "First Blood" - Win your first game
- "Streak Master" - 10 wins in a row
- "Perfectionist" - Complete a level without losing a point
- "Century Club" - Beat all 100 levels
- "Speed Demon" - Win in under 60 seconds
- "Comeback King" - Win after being down 0-4

### Daily Challenge Mode
- New challenge every day
- Unique modifiers
- Leaderboard for daily scores
- Streak bonuses for consecutive days

### Practice Mode
- Adjustable AI difficulty
- No scoring pressure
- Test power-ups
- Learn patterns

---

## Implementation Priority

### Phase 1: Core Game
1. Basic paddle and ball physics
2. Simple AI opponent
3. Score tracking
4. Single level playable

### Phase 2: Polish
1. 80s visual theme
2. Sound effects and music
3. Animations and effects
4. Menu system

### Phase 3: Content
1. All 100 levels
2. Difficulty modes
3. Scoreboard system
4. Save/load progress

### Phase 4: Extras
1. Power-ups
2. Boss battles
3. Achievements
4. Unlockables

---

## Notes for Development

- Test frequently on actual iOS devices for performance
- Use React Native's `useCallback` and `useMemo` to prevent re-renders
- Consider using a game loop with `requestAnimationFrame` via Reanimated
- Implement collision detection efficiently (AABB initially, refine if needed)
- Add analytics hooks for future optimization
- Include accessibility options (high contrast mode, larger touch targets)

---

**Let's create an addictively fun, visually stunning tribute to the arcade era!** 🕹️✨