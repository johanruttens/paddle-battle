import { updateBallPosition, getRandomStartDirection } from '../physics/ballPhysics';

describe('ballPhysics', () => {
  describe('updateBallPosition', () => {
    it('moves ball in direction of velocity', () => {
      const result = updateBallPosition(
        100, // ballX
        100, // ballY
        1,   // velocityX (right)
        0,   // velocityY
        10,  // speed
        16.67 // deltaTime (60fps)
      );

      expect(result.x).toBeGreaterThan(100);
      expect(result.y).toBe(100);
    });

    it('moves ball upward with negative velocityY', () => {
      const result = updateBallPosition(
        100,
        100,
        0,
        -1,  // Up
        10,
        16.67
      );

      expect(result.x).toBe(100);
      expect(result.y).toBeLessThan(100);
    });

    it('moves ball at angle with both velocities', () => {
      const result = updateBallPosition(
        100,
        100,
        1,
        1,
        10,
        16.67
      );

      expect(result.x).toBeGreaterThan(100);
      expect(result.y).toBeGreaterThan(100);
    });

    it('returns same position when velocity is zero', () => {
      const result = updateBallPosition(
        100,
        100,
        0,
        0,
        10,
        16.67
      );

      expect(result.x).toBe(100);
      expect(result.y).toBe(100);
    });

    it('moves faster with larger deltaTime (slower frame rate)', () => {
      const fast = updateBallPosition(100, 100, 1, 0, 10, 16.67);
      const slow = updateBallPosition(100, 100, 1, 0, 10, 33.33); // 30fps

      expect(slow.x - 100).toBeGreaterThan(fast.x - 100);
    });

    it('moves faster with higher speed', () => {
      const slow = updateBallPosition(100, 100, 1, 0, 5, 16.67);
      const fast = updateBallPosition(100, 100, 1, 0, 15, 16.67);

      expect(fast.x - 100).toBeGreaterThan(slow.x - 100);
    });

    it('normalizes velocity vector', () => {
      // Diagonal movement with unnormalized velocity
      const diagonal = updateBallPosition(
        100,
        100,
        3,
        4, // 3-4-5 triangle, magnitude = 5
        10,
        16.67
      );

      // Distance moved should be based on speed, not velocity magnitude
      const distanceX = diagonal.x - 100;
      const distanceY = diagonal.y - 100;
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

      // Should be approximately equal to speed (adjusted for frame time)
      expect(distance).toBeCloseTo(10, 0);
    });
  });

  describe('getRandomStartDirection', () => {
    it('returns object with vx and vy properties', () => {
      const direction = getRandomStartDirection();
      expect(direction).toHaveProperty('vx');
      expect(direction).toHaveProperty('vy');
    });

    it('returns non-zero velocities', () => {
      // Run multiple times since random
      for (let i = 0; i < 10; i++) {
        const direction = getRandomStartDirection();
        expect(direction.vx).not.toBe(0);
        expect(direction.vy).not.toBe(0);
      }
    });

    it('returns velocities that produce movement', () => {
      for (let i = 0; i < 10; i++) {
        const direction = getRandomStartDirection();
        const magnitude = Math.sqrt(direction.vx ** 2 + direction.vy ** 2);
        expect(magnitude).toBeGreaterThan(0);
      }
    });
  });
});
