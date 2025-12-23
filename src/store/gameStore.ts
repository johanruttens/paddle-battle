import { create } from 'zustand';
import {
  generateLevelConfig,
  type LevelConfig,
  type Difficulty,
} from '../config/levelConfig';
import {
  loadProgress,
  saveProgress,
  updateStatsAfterGame,
  unlockNextLevel,
  setLevelStars,
  calculateStars,
  loadSettings,
  saveSettings,
} from './storage';

export type GameStatus = 'idle' | 'playing' | 'paused' | 'gameOver';
export type Screen = 'menu' | 'levelSelect' | 'game' | 'settings' | 'stats';
export type Winner = 'player' | 'ai' | null;

interface GameState {
  // Navigation
  currentScreen: Screen;

  // Game state
  playerScore: number;
  aiScore: number;
  status: GameStatus;
  winner: Winner;

  // Level state
  currentLevel: number;
  highestLevelUnlocked: number;
  levelStars: Record<number, number>;
  levelConfig: LevelConfig | null;

  // Settings
  difficulty: Difficulty;
  musicVolume: number;
  sfxVolume: number;
  vibrationEnabled: boolean;

  // Loading state
  isLoading: boolean;
}

interface GameActions {
  // Navigation
  navigateTo: (screen: Screen) => void;

  // Game actions
  incrementPlayerScore: () => void;
  incrementAIScore: () => void;
  startGame: () => void;
  startLevel: (level: number) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  resetGame: () => void;
  endGame: (winner: Winner) => void;
  nextLevel: () => void;

  // Settings
  setDifficulty: (difficulty: Difficulty) => void;
  setMusicVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
  setVibrationEnabled: (enabled: boolean) => void;

  // Persistence
  loadSavedData: () => Promise<void>;
  getWinningScore: () => number;
}

type GameStore = GameState & GameActions;

export const useGameStore = create<GameStore>()((set, get) => ({
  // Initial state
  currentScreen: 'menu',
  playerScore: 0,
  aiScore: 0,
  status: 'idle',
  winner: null,
  currentLevel: 1,
  highestLevelUnlocked: 1,
  levelStars: {},
  levelConfig: null,
  difficulty: 'medium',
  musicVolume: 0.7,
  sfxVolume: 1.0,
  vibrationEnabled: true,
  isLoading: true,

  // Navigation
  navigateTo: (screen) => set({ currentScreen: screen }),

  // Game actions
  incrementPlayerScore: () => {
    const state = get();
    const newScore = state.playerScore + 1;
    set({ playerScore: newScore });
    if (newScore >= state.getWinningScore()) {
      get().endGame('player');
    }
  },

  incrementAIScore: () => {
    const state = get();
    const newScore = state.aiScore + 1;
    set({ aiScore: newScore });
    if (newScore >= state.getWinningScore()) {
      get().endGame('ai');
    }
  },

  startGame: () => {
    const state = get();
    const config = generateLevelConfig(state.currentLevel, state.difficulty);
    set({
      status: 'playing',
      playerScore: 0,
      aiScore: 0,
      winner: null,
      levelConfig: config,
      currentScreen: 'game',
    });
  },

  startLevel: (level) => {
    const state = get();
    const config = generateLevelConfig(level, state.difficulty);
    set({
      currentLevel: level,
      levelConfig: config,
      status: 'playing',
      playerScore: 0,
      aiScore: 0,
      winner: null,
      currentScreen: 'game',
    });
    saveProgress({ currentLevel: level });
  },

  pauseGame: () => set({ status: 'paused' }),

  resumeGame: () => set({ status: 'playing' }),

  resetGame: () =>
    set({
      playerScore: 0,
      aiScore: 0,
      status: 'idle',
      winner: null,
      currentScreen: 'menu',
    }),

  endGame: async (winner) => {
    const state = get();
    const won = winner === 'player';

    set({
      status: 'gameOver',
      winner,
    });

    // Update stats
    await updateStatsAfterGame(
      won,
      state.playerScore + (won ? 1 : 0), // Add the winning point
      state.aiScore + (won ? 0 : 1),
      state.currentLevel
    );

    // If won, unlock next level and set stars
    if (won) {
      await unlockNextLevel(state.currentLevel);
      const stars = await calculateStars(
        true,
        state.playerScore + 1,
        state.aiScore,
        state.getWinningScore()
      );
      await setLevelStars(state.currentLevel, stars);

      // Update local state
      const newHighest = Math.min(state.currentLevel + 1, 100);
      set({
        highestLevelUnlocked: Math.max(state.highestLevelUnlocked, newHighest),
        levelStars: {
          ...state.levelStars,
          [state.currentLevel]: Math.max(
            state.levelStars[state.currentLevel] || 0,
            stars
          ),
        },
      });
    }
  },

  nextLevel: () => {
    const state = get();
    const nextLevel = Math.min(state.currentLevel + 1, 100);
    get().startLevel(nextLevel);
  },

  // Settings
  setDifficulty: (difficulty) => {
    set({ difficulty });
    saveSettings({ difficulty });
    // Regenerate level config if in game
    const state = get();
    if (state.levelConfig) {
      const config = generateLevelConfig(state.currentLevel, difficulty);
      set({ levelConfig: config });
    }
  },

  setMusicVolume: (volume) => {
    set({ musicVolume: volume });
    saveSettings({ musicVolume: volume });
  },

  setSfxVolume: (volume) => {
    set({ sfxVolume: volume });
    saveSettings({ sfxVolume: volume });
  },

  setVibrationEnabled: (enabled) => {
    set({ vibrationEnabled: enabled });
    saveSettings({ vibrationEnabled: enabled });
  },

  // Persistence
  loadSavedData: async () => {
    try {
      const [progress, settings] = await Promise.all([
        loadProgress(),
        loadSettings(),
      ]);

      set({
        currentLevel: progress.currentLevel,
        highestLevelUnlocked: progress.highestLevelUnlocked,
        levelStars: progress.levelStars,
        difficulty: progress.difficulty || settings.difficulty,
        musicVolume: settings.musicVolume,
        sfxVolume: settings.sfxVolume,
        vibrationEnabled: settings.vibrationEnabled,
        isLoading: false,
      });
    } catch (error) {
      console.warn('Failed to load saved data:', error);
      set({ isLoading: false });
    }
  },

  getWinningScore: () => {
    const state = get();
    return state.levelConfig?.targetScore || 5;
  },
}));
