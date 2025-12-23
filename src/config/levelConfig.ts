/**
 * Level Configuration System
 * Algorithmically generates 100 levels with progressive difficulty
 */

export interface LevelConfig {
  level: number;
  targetScore: number;
  ballSpeed: number;
  maxBallSpeed: number;
  ballSpeedIncrement: number;
  aiReactionSpeed: number;
  aiPredictionError: number;
  aiMaxSpeed: number;
  paddleWidthMultiplier: number;
  specialModifiers: LevelModifier[];
}

export type LevelModifier =
  | 'speedBoost'      // Ball speeds up in certain zones
  | 'multiBall'       // Multiple balls (future)
  | 'shrinkingPaddle' // Paddle shrinks over time
  | 'narrowField'     // Play area narrows
  | 'boss';           // Boss level

export type Difficulty = 'easy' | 'medium' | 'hard';

// Difficulty multipliers
const DIFFICULTY_MODIFIERS: Record<Difficulty, {
  playerPaddleMultiplier: number;
  ballSpeedMultiplier: number;
  aiReactionMultiplier: number;
  aiErrorMultiplier: number;
}> = {
  easy: {
    playerPaddleMultiplier: 1.3,    // Larger paddle
    ballSpeedMultiplier: 0.85,       // Slower ball
    aiReactionMultiplier: 0.7,       // Slower AI
    aiErrorMultiplier: 1.5,          // More AI mistakes
  },
  medium: {
    playerPaddleMultiplier: 1.0,
    ballSpeedMultiplier: 1.0,
    aiReactionMultiplier: 1.0,
    aiErrorMultiplier: 1.0,
  },
  hard: {
    playerPaddleMultiplier: 0.8,    // Smaller paddle
    ballSpeedMultiplier: 1.2,        // Faster ball
    aiReactionMultiplier: 1.4,       // Faster AI
    aiErrorMultiplier: 0.5,          // Fewer AI mistakes
  },
};

// Base configuration values
const BASE_CONFIG = {
  targetScore: {
    tier1: 5,   // Levels 1-10
    tier2: 7,   // Levels 11-25
    tier3: 10,  // Levels 26-50
    tier4: 12,  // Levels 51-75
    tier5: 15,  // Levels 76-100
  },
  ballSpeed: {
    min: 5,
    max: 12,
  },
  maxBallSpeed: {
    min: 12,
    max: 20,
  },
  ballSpeedIncrement: {
    min: 0.2,
    max: 0.5,
  },
  aiReaction: {
    min: 0.04,  // Slower (harder for player)
    max: 0.12,  // Faster (easier for player)
  },
  aiError: {
    min: 10,    // More accurate (harder)
    max: 40,    // Less accurate (easier)
  },
  aiMaxSpeed: {
    min: 3,
    max: 7,
  },
};

// Boss levels every 25 levels
const BOSS_LEVELS = [25, 50, 75, 100];

/**
 * Generate configuration for a specific level
 */
export function generateLevelConfig(level: number, difficulty: Difficulty): LevelConfig {
  const progress = (level - 1) / 99; // 0 to 1
  const diffMod = DIFFICULTY_MODIFIERS[difficulty];

  // Determine tier for target score
  let targetScore: number;
  if (level <= 10) targetScore = BASE_CONFIG.targetScore.tier1;
  else if (level <= 25) targetScore = BASE_CONFIG.targetScore.tier2;
  else if (level <= 50) targetScore = BASE_CONFIG.targetScore.tier3;
  else if (level <= 75) targetScore = BASE_CONFIG.targetScore.tier4;
  else targetScore = BASE_CONFIG.targetScore.tier5;

  // Calculate ball speed (increases with level)
  const ballSpeed = lerp(
    BASE_CONFIG.ballSpeed.min,
    BASE_CONFIG.ballSpeed.max,
    easeInQuad(progress)
  ) * diffMod.ballSpeedMultiplier;

  // Calculate max ball speed
  const maxBallSpeed = lerp(
    BASE_CONFIG.maxBallSpeed.min,
    BASE_CONFIG.maxBallSpeed.max,
    easeInQuad(progress)
  ) * diffMod.ballSpeedMultiplier;

  // Calculate ball speed increment
  const ballSpeedIncrement = lerp(
    BASE_CONFIG.ballSpeedIncrement.min,
    BASE_CONFIG.ballSpeedIncrement.max,
    progress
  );

  // AI gets better as levels increase (reaction speed increases)
  const aiReactionSpeed = lerp(
    BASE_CONFIG.aiReaction.max, // Start easy
    BASE_CONFIG.aiReaction.min, // End hard
    easeInQuad(progress)
  ) * diffMod.aiReactionMultiplier;

  // AI prediction error decreases (gets more accurate)
  const aiPredictionError = lerp(
    BASE_CONFIG.aiError.max,
    BASE_CONFIG.aiError.min,
    progress
  ) * diffMod.aiErrorMultiplier;

  // AI max speed increases
  const aiMaxSpeed = lerp(
    BASE_CONFIG.aiMaxSpeed.min,
    BASE_CONFIG.aiMaxSpeed.max,
    progress
  );

  // Paddle width (player advantage decreases)
  const paddleWidthMultiplier = lerp(1.1, 0.9, progress) * diffMod.playerPaddleMultiplier;

  // Determine special modifiers
  const specialModifiers: LevelModifier[] = [];

  if (BOSS_LEVELS.includes(level)) {
    specialModifiers.push('boss');
  }

  // Add modifiers at certain level ranges
  if (level >= 15 && level % 5 === 0 && !BOSS_LEVELS.includes(level)) {
    specialModifiers.push('speedBoost');
  }
  if (level >= 60 && level % 7 === 0) {
    specialModifiers.push('shrinkingPaddle');
  }

  return {
    level,
    targetScore,
    ballSpeed,
    maxBallSpeed,
    ballSpeedIncrement,
    aiReactionSpeed,
    aiPredictionError,
    aiMaxSpeed,
    paddleWidthMultiplier,
    specialModifiers,
  };
}

/**
 * Get all 100 level configs (for level select preview)
 */
export function getAllLevelConfigs(difficulty: Difficulty): LevelConfig[] {
  return Array.from({ length: 100 }, (_, i) => generateLevelConfig(i + 1, difficulty));
}

/**
 * Get boss name for boss levels
 */
export function getBossName(level: number): string | null {
  switch (level) {
    case 25: return 'THE WALL';
    case 50: return 'THE TWINS';
    case 75: return 'THE GHOST';
    case 100: return 'THE MASTER';
    default: return null;
  }
}

/**
 * Get level tier name
 */
export function getLevelTier(level: number): string {
  if (level <= 10) return 'BEGINNER';
  if (level <= 25) return 'ROOKIE';
  if (level <= 50) return 'CHALLENGER';
  if (level <= 75) return 'EXPERT';
  return 'MASTER';
}

/**
 * Get tier color
 */
export function getTierColor(level: number): string {
  if (level <= 10) return '#39ff14';  // Green
  if (level <= 25) return '#00ffff';  // Cyan
  if (level <= 50) return '#ff6b35';  // Orange
  if (level <= 75) return '#ff00ff';  // Magenta
  return '#9d00ff';                    // Purple
}

// Utility functions
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function easeInQuad(t: number): number {
  return t * t;
}

function easeOutQuad(t: number): number {
  return t * (2 - t);
}
