import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Difficulty } from '../config/levelConfig';

const STORAGE_KEYS = {
  GAME_PROGRESS: '@paddlebattle/progress',
  SETTINGS: '@paddlebattle/settings',
  STATS: '@paddlebattle/stats',
  HIGH_SCORES: '@paddlebattle/highscores',
};

// Progress data
export interface GameProgress {
  currentLevel: number;
  highestLevelUnlocked: number;
  levelStars: Record<number, number>; // level -> stars (1-3)
  difficulty: Difficulty;
}

// Player stats
export interface PlayerStats {
  totalGamesPlayed: number;
  totalPointsScored: number;
  totalPointsAgainst: number;
  totalWins: number;
  totalLosses: number;
  currentWinStreak: number;
  bestWinStreak: number;
  totalPlayTimeSeconds: number;
  levelsCompleted: number;
  perfectLevels: number; // Won without losing a point
}

// High score entry
export interface HighScoreEntry {
  name: string;
  score: number;
  level: number;
  difficulty: Difficulty;
  date: string;
}

// Settings
export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  vibrationEnabled: boolean;
  difficulty: Difficulty;
}

// Default values
const DEFAULT_PROGRESS: GameProgress = {
  currentLevel: 1,
  highestLevelUnlocked: 1,
  levelStars: {},
  difficulty: 'medium',
};

const DEFAULT_STATS: PlayerStats = {
  totalGamesPlayed: 0,
  totalPointsScored: 0,
  totalPointsAgainst: 0,
  totalWins: 0,
  totalLosses: 0,
  currentWinStreak: 0,
  bestWinStreak: 0,
  totalPlayTimeSeconds: 0,
  levelsCompleted: 0,
  perfectLevels: 0,
};

const DEFAULT_SETTINGS: GameSettings = {
  musicVolume: 0.7,
  sfxVolume: 1.0,
  vibrationEnabled: true,
  difficulty: 'medium',
};

// Storage functions
export async function loadProgress(): Promise<GameProgress> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.GAME_PROGRESS);
    if (data) {
      return { ...DEFAULT_PROGRESS, ...JSON.parse(data) };
    }
  } catch (error) {
    console.warn('Failed to load progress:', error);
  }
  return DEFAULT_PROGRESS;
}

export async function saveProgress(progress: Partial<GameProgress>): Promise<void> {
  try {
    const current = await loadProgress();
    const updated = { ...current, ...progress };
    await AsyncStorage.setItem(STORAGE_KEYS.GAME_PROGRESS, JSON.stringify(updated));
  } catch (error) {
    console.warn('Failed to save progress:', error);
  }
}

export async function loadStats(): Promise<PlayerStats> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.STATS);
    if (data) {
      return { ...DEFAULT_STATS, ...JSON.parse(data) };
    }
  } catch (error) {
    console.warn('Failed to load stats:', error);
  }
  return DEFAULT_STATS;
}

export async function saveStats(stats: Partial<PlayerStats>): Promise<void> {
  try {
    const current = await loadStats();
    const updated = { ...current, ...stats };
    await AsyncStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(updated));
  } catch (error) {
    console.warn('Failed to save stats:', error);
  }
}

export async function updateStatsAfterGame(
  won: boolean,
  playerScore: number,
  aiScore: number,
  level: number
): Promise<void> {
  const stats = await loadStats();

  stats.totalGamesPlayed += 1;
  stats.totalPointsScored += playerScore;
  stats.totalPointsAgainst += aiScore;

  if (won) {
    stats.totalWins += 1;
    stats.currentWinStreak += 1;
    stats.bestWinStreak = Math.max(stats.bestWinStreak, stats.currentWinStreak);
    stats.levelsCompleted += 1;

    // Perfect game (no points lost)
    if (aiScore === 0) {
      stats.perfectLevels += 1;
    }
  } else {
    stats.totalLosses += 1;
    stats.currentWinStreak = 0;
  }

  await saveStats(stats);
}

export async function loadSettings(): Promise<GameSettings> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (data) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    }
  } catch (error) {
    console.warn('Failed to load settings:', error);
  }
  return DEFAULT_SETTINGS;
}

export async function saveSettings(settings: Partial<GameSettings>): Promise<void> {
  try {
    const current = await loadSettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
  } catch (error) {
    console.warn('Failed to save settings:', error);
  }
}

export async function loadHighScores(): Promise<HighScoreEntry[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.HIGH_SCORES);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn('Failed to load high scores:', error);
  }
  return [];
}

export async function addHighScore(entry: HighScoreEntry): Promise<HighScoreEntry[]> {
  try {
    const scores = await loadHighScores();
    scores.push(entry);
    // Sort by level (desc), then score (desc)
    scores.sort((a, b) => {
      if (b.level !== a.level) return b.level - a.level;
      return b.score - a.score;
    });
    // Keep top 10
    const top10 = scores.slice(0, 10);
    await AsyncStorage.setItem(STORAGE_KEYS.HIGH_SCORES, JSON.stringify(top10));
    return top10;
  } catch (error) {
    console.warn('Failed to add high score:', error);
    return [];
  }
}

export async function unlockNextLevel(currentLevel: number): Promise<void> {
  const progress = await loadProgress();
  if (currentLevel >= progress.highestLevelUnlocked) {
    await saveProgress({
      highestLevelUnlocked: Math.min(currentLevel + 1, 100),
    });
  }
}

export async function setLevelStars(level: number, stars: number): Promise<void> {
  const progress = await loadProgress();
  const currentStars = progress.levelStars[level] || 0;
  // Only update if new stars are higher
  if (stars > currentStars) {
    await saveProgress({
      levelStars: {
        ...progress.levelStars,
        [level]: stars,
      },
    });
  }
}

export async function calculateStars(
  won: boolean,
  playerScore: number,
  aiScore: number,
  targetScore: number
): Promise<number> {
  if (!won) return 0;

  // 3 stars: Perfect game (no points lost)
  if (aiScore === 0) return 3;

  // 2 stars: Won with good margin
  if (playerScore - aiScore >= Math.floor(targetScore / 2)) return 2;

  // 1 star: Just won
  return 1;
}

export async function resetAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.GAME_PROGRESS,
      STORAGE_KEYS.SETTINGS,
      STORAGE_KEYS.STATS,
      STORAGE_KEYS.HIGH_SCORES,
    ]);
  } catch (error) {
    console.warn('Failed to reset data:', error);
  }
}
