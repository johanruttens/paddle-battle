import { useGameStore } from '../store/gameStore';

describe('gameStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useGameStore.setState({
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
      isLoading: false,
    });
  });

  describe('navigation', () => {
    it('navigates to different screens', () => {
      const { navigateTo } = useGameStore.getState();

      navigateTo('game');
      expect(useGameStore.getState().currentScreen).toBe('game');

      navigateTo('levelSelect');
      expect(useGameStore.getState().currentScreen).toBe('levelSelect');

      navigateTo('stats');
      expect(useGameStore.getState().currentScreen).toBe('stats');

      navigateTo('settings');
      expect(useGameStore.getState().currentScreen).toBe('settings');

      navigateTo('menu');
      expect(useGameStore.getState().currentScreen).toBe('menu');
    });
  });

  describe('scoring', () => {
    it('increments player score', () => {
      const { incrementPlayerScore } = useGameStore.getState();

      // Set up game state
      useGameStore.setState({
        status: 'playing',
        levelConfig: { targetScore: 5 } as any
      });

      incrementPlayerScore();
      expect(useGameStore.getState().playerScore).toBe(1);

      incrementPlayerScore();
      expect(useGameStore.getState().playerScore).toBe(2);
    });

    it('increments AI score', () => {
      const { incrementAIScore } = useGameStore.getState();

      useGameStore.setState({
        status: 'playing',
        levelConfig: { targetScore: 5 } as any
      });

      incrementAIScore();
      expect(useGameStore.getState().aiScore).toBe(1);

      incrementAIScore();
      expect(useGameStore.getState().aiScore).toBe(2);
    });

    it('ends game when player reaches winning score', () => {
      const { incrementPlayerScore } = useGameStore.getState();

      useGameStore.setState({
        status: 'playing',
        playerScore: 4,
        levelConfig: { targetScore: 5 } as any
      });

      incrementPlayerScore();

      expect(useGameStore.getState().status).toBe('gameOver');
      expect(useGameStore.getState().winner).toBe('player');
    });

    it('ends game when AI reaches winning score', () => {
      const { incrementAIScore } = useGameStore.getState();

      useGameStore.setState({
        status: 'playing',
        aiScore: 4,
        levelConfig: { targetScore: 5 } as any
      });

      incrementAIScore();

      expect(useGameStore.getState().status).toBe('gameOver');
      expect(useGameStore.getState().winner).toBe('ai');
    });
  });

  describe('game lifecycle', () => {
    it('starts game correctly', () => {
      const { startGame } = useGameStore.getState();

      startGame();

      const state = useGameStore.getState();
      expect(state.status).toBe('playing');
      expect(state.playerScore).toBe(0);
      expect(state.aiScore).toBe(0);
      expect(state.winner).toBeNull();
      expect(state.currentScreen).toBe('game');
      expect(state.levelConfig).not.toBeNull();
    });

    it('starts specific level', () => {
      const { startLevel } = useGameStore.getState();

      startLevel(25);

      const state = useGameStore.getState();
      expect(state.currentLevel).toBe(25);
      expect(state.status).toBe('playing');
      expect(state.levelConfig).not.toBeNull();
      expect(state.levelConfig?.level).toBe(25);
    });

    it('pauses and resumes game', () => {
      const { startGame, pauseGame, resumeGame } = useGameStore.getState();

      startGame();
      expect(useGameStore.getState().status).toBe('playing');

      pauseGame();
      expect(useGameStore.getState().status).toBe('paused');

      resumeGame();
      expect(useGameStore.getState().status).toBe('playing');
    });

    it('resets game correctly', () => {
      const { startGame, resetGame } = useGameStore.getState();

      startGame();
      useGameStore.setState({ playerScore: 3, aiScore: 2 });

      resetGame();

      const state = useGameStore.getState();
      expect(state.status).toBe('idle');
      expect(state.playerScore).toBe(0);
      expect(state.aiScore).toBe(0);
      expect(state.winner).toBeNull();
      expect(state.currentScreen).toBe('menu');
    });
  });

  describe('level progression', () => {
    it('advances to next level', () => {
      const { startLevel, nextLevel } = useGameStore.getState();

      startLevel(5);
      useGameStore.setState({ status: 'gameOver', winner: 'player' });

      nextLevel();

      expect(useGameStore.getState().currentLevel).toBe(6);
      expect(useGameStore.getState().status).toBe('playing');
    });

    it('caps level at 100', () => {
      const { startLevel, nextLevel } = useGameStore.getState();

      startLevel(100);
      useGameStore.setState({ status: 'gameOver', winner: 'player' });

      nextLevel();

      expect(useGameStore.getState().currentLevel).toBe(100);
    });
  });

  describe('settings', () => {
    it('sets difficulty', () => {
      const { setDifficulty } = useGameStore.getState();

      setDifficulty('easy');
      expect(useGameStore.getState().difficulty).toBe('easy');

      setDifficulty('hard');
      expect(useGameStore.getState().difficulty).toBe('hard');
    });

    it('sets music volume', () => {
      const { setMusicVolume } = useGameStore.getState();

      setMusicVolume(0.5);
      expect(useGameStore.getState().musicVolume).toBe(0.5);

      setMusicVolume(0);
      expect(useGameStore.getState().musicVolume).toBe(0);
    });

    it('sets SFX volume', () => {
      const { setSfxVolume } = useGameStore.getState();

      setSfxVolume(0.3);
      expect(useGameStore.getState().sfxVolume).toBe(0.3);
    });

    it('sets vibration enabled', () => {
      const { setVibrationEnabled } = useGameStore.getState();

      setVibrationEnabled(false);
      expect(useGameStore.getState().vibrationEnabled).toBe(false);

      setVibrationEnabled(true);
      expect(useGameStore.getState().vibrationEnabled).toBe(true);
    });

    it('regenerates level config when difficulty changes during game', () => {
      const { startGame, setDifficulty } = useGameStore.getState();

      startGame();
      const originalConfig = useGameStore.getState().levelConfig;

      setDifficulty('hard');
      const newConfig = useGameStore.getState().levelConfig;

      expect(newConfig).not.toBe(originalConfig);
      expect(newConfig?.ballSpeed).toBeGreaterThan(originalConfig?.ballSpeed || 0);
    });
  });

  describe('getWinningScore', () => {
    it('returns target score from level config', () => {
      useGameStore.setState({
        levelConfig: { targetScore: 7 } as any
      });

      const { getWinningScore } = useGameStore.getState();
      expect(getWinningScore()).toBe(7);
    });

    it('returns default of 5 when no config', () => {
      useGameStore.setState({ levelConfig: null });

      const { getWinningScore } = useGameStore.getState();
      expect(getWinningScore()).toBe(5);
    });
  });
});
