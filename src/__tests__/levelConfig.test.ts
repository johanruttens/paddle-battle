import {
  generateLevelConfig,
  getAllLevelConfigs,
  getBossName,
  getLevelTier,
  getTierColor,
} from '../config/levelConfig';

describe('levelConfig', () => {
  describe('generateLevelConfig', () => {
    it('generates config for level 1', () => {
      const config = generateLevelConfig(1, 'medium');

      expect(config.level).toBe(1);
      expect(config.targetScore).toBe(5); // Tier 1
      expect(config.ballSpeed).toBeGreaterThan(0);
      expect(config.maxBallSpeed).toBeGreaterThan(config.ballSpeed);
      expect(config.aiReactionSpeed).toBeGreaterThan(0);
      expect(config.aiPredictionError).toBeGreaterThan(0);
      expect(config.aiMaxSpeed).toBeGreaterThan(0);
      expect(config.paddleWidthMultiplier).toBeGreaterThan(0);
    });

    it('increases difficulty with level progression', () => {
      const level1 = generateLevelConfig(1, 'medium');
      const level50 = generateLevelConfig(50, 'medium');
      const level100 = generateLevelConfig(100, 'medium');

      // Ball speed increases
      expect(level50.ballSpeed).toBeGreaterThan(level1.ballSpeed);
      expect(level100.ballSpeed).toBeGreaterThan(level50.ballSpeed);

      // AI reaction speed increases (gets better)
      expect(level100.aiReactionSpeed).toBeLessThan(level1.aiReactionSpeed);

      // AI prediction error decreases (more accurate)
      expect(level100.aiPredictionError).toBeLessThan(level1.aiPredictionError);
    });

    it('applies easy difficulty modifiers', () => {
      const easy = generateLevelConfig(50, 'easy');
      const medium = generateLevelConfig(50, 'medium');

      expect(easy.ballSpeed).toBeLessThan(medium.ballSpeed);
      expect(easy.paddleWidthMultiplier).toBeGreaterThan(medium.paddleWidthMultiplier);
    });

    it('applies hard difficulty modifiers', () => {
      const hard = generateLevelConfig(50, 'hard');
      const medium = generateLevelConfig(50, 'medium');

      expect(hard.ballSpeed).toBeGreaterThan(medium.ballSpeed);
      expect(hard.paddleWidthMultiplier).toBeLessThan(medium.paddleWidthMultiplier);
    });

    it('sets correct target scores for each tier', () => {
      expect(generateLevelConfig(1, 'medium').targetScore).toBe(5);   // Tier 1
      expect(generateLevelConfig(10, 'medium').targetScore).toBe(5);  // Tier 1
      expect(generateLevelConfig(11, 'medium').targetScore).toBe(7);  // Tier 2
      expect(generateLevelConfig(25, 'medium').targetScore).toBe(7);  // Tier 2
      expect(generateLevelConfig(26, 'medium').targetScore).toBe(10); // Tier 3
      expect(generateLevelConfig(50, 'medium').targetScore).toBe(10); // Tier 3
      expect(generateLevelConfig(51, 'medium').targetScore).toBe(12); // Tier 4
      expect(generateLevelConfig(75, 'medium').targetScore).toBe(12); // Tier 4
      expect(generateLevelConfig(76, 'medium').targetScore).toBe(15); // Tier 5
      expect(generateLevelConfig(100, 'medium').targetScore).toBe(15); // Tier 5
    });

    it('marks boss levels with modifier', () => {
      const boss25 = generateLevelConfig(25, 'medium');
      const boss50 = generateLevelConfig(50, 'medium');
      const boss75 = generateLevelConfig(75, 'medium');
      const boss100 = generateLevelConfig(100, 'medium');
      const normal = generateLevelConfig(30, 'medium');

      expect(boss25.specialModifiers).toContain('boss');
      expect(boss50.specialModifiers).toContain('boss');
      expect(boss75.specialModifiers).toContain('boss');
      expect(boss100.specialModifiers).toContain('boss');
      expect(normal.specialModifiers).not.toContain('boss');
    });

    it('handles boundary levels correctly', () => {
      // Should not throw for any level 1-100
      for (let level = 1; level <= 100; level++) {
        expect(() => generateLevelConfig(level, 'medium')).not.toThrow();
      }
    });
  });

  describe('getAllLevelConfigs', () => {
    it('returns 100 level configs', () => {
      const configs = getAllLevelConfigs('medium');
      expect(configs).toHaveLength(100);
    });

    it('returns configs for levels 1-100', () => {
      const configs = getAllLevelConfigs('medium');

      for (let i = 0; i < 100; i++) {
        expect(configs[i].level).toBe(i + 1);
      }
    });
  });

  describe('getBossName', () => {
    it('returns correct boss names', () => {
      expect(getBossName(25)).toBe('THE WALL');
      expect(getBossName(50)).toBe('THE TWINS');
      expect(getBossName(75)).toBe('THE GHOST');
      expect(getBossName(100)).toBe('THE MASTER');
    });

    it('returns null for non-boss levels', () => {
      expect(getBossName(1)).toBeNull();
      expect(getBossName(24)).toBeNull();
      expect(getBossName(26)).toBeNull();
      expect(getBossName(99)).toBeNull();
    });
  });

  describe('getLevelTier', () => {
    it('returns correct tier names', () => {
      expect(getLevelTier(1)).toBe('BEGINNER');
      expect(getLevelTier(10)).toBe('BEGINNER');
      expect(getLevelTier(11)).toBe('ROOKIE');
      expect(getLevelTier(25)).toBe('ROOKIE');
      expect(getLevelTier(26)).toBe('CHALLENGER');
      expect(getLevelTier(50)).toBe('CHALLENGER');
      expect(getLevelTier(51)).toBe('EXPERT');
      expect(getLevelTier(75)).toBe('EXPERT');
      expect(getLevelTier(76)).toBe('MASTER');
      expect(getLevelTier(100)).toBe('MASTER');
    });
  });

  describe('getTierColor', () => {
    it('returns correct tier colors', () => {
      expect(getTierColor(1)).toBe('#39ff14');   // Green
      expect(getTierColor(11)).toBe('#00ffff');  // Cyan
      expect(getTierColor(26)).toBe('#ff6b35');  // Orange
      expect(getTierColor(51)).toBe('#ff00ff');  // Magenta
      expect(getTierColor(76)).toBe('#9d00ff');  // Purple
    });

    it('returns colors for boundary levels', () => {
      expect(getTierColor(10)).toBe('#39ff14');
      expect(getTierColor(25)).toBe('#00ffff');
      expect(getTierColor(50)).toBe('#ff6b35');
      expect(getTierColor(75)).toBe('#ff00ff');
      expect(getTierColor(100)).toBe('#9d00ff');
    });
  });
});
